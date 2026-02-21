import { useEffect } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const referenceCount = await prisma.themeReference.count({
    where: { shop: session.shop },
  });

  const uniqueMetafields = await prisma.themeReference.findMany({
    where: { shop: session.shop },
    distinct: ["namespace", "key"],
    select: { namespace: true, key: true },
  });

  const uniqueFiles = await prisma.themeReference.findMany({
    where: { shop: session.shop },
    distinct: ["file"],
    select: { file: true },
  });

  return {
    shop: session.shop,
    referenceCount,
    uniqueMetafieldCount: uniqueMetafields.length,
    uniqueFileCount: uniqueFiles.length,
    references: uniqueMetafields,
  };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("action");

  if (actionType === "scan-theme") {
    try {
      const themesResponse = await admin.graphql(
        `#graphql
        query {
          themes(first: 10, roles: MAIN) {
            nodes {
              id
              name
              role
            }
          }
        }`,
      );

      const themesData = await themesResponse.json();
      const themes = themesData.data?.themes?.nodes;

      if (!themes || themes.length === 0) {
        return {
          scanResult: {
            success: false,
            error: "No published theme found.",
          },
        };
      }

      const theme = themes[0];
      const themeId = theme.id;

      const metafieldPatterns = [
        /(?:product|variant|collection|page|shop|order|customer|article|blog)\.metafields\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)/g,
        /(?:product|variant|collection|page|shop|order|customer|article|blog)\.metafields\[['"]([a-zA-Z0-9_-]+)['"]\]\[['"]([a-zA-Z0-9_-]+)['"]\]/g,
        /\|\s*metafield:\s*['"]([a-zA-Z0-9_-]+)['"]\s*,\s*['"]([a-zA-Z0-9_-]+)['"]/g,
      ];

      const filePatterns = [
        "layout/*.liquid",
        "templates/*.liquid",
        "templates/**/*.liquid",
        "sections/*.liquid",
        "sections/**/*.liquid",
        "snippets/*.liquid",
        "blocks/*.liquid",
        "blocks/**/*.liquid",
      ];

      let allReferences = [];
      let totalFilesScanned = 0;

      for (const pattern of filePatterns) {
        try {
          const filesResponse = await admin.graphql(
            `#graphql
            query GetThemeFiles($themeId: ID!, $filenames: [String!]!) {
              theme: node(id: $themeId) {
                ... on OnlineStoreTheme {
                  files(first: 250, filenames: $filenames) {
                    nodes {
                      filename
                      body {
                        ... on OnlineStoreThemeFileBodyText {
                          content
                        }
                      }
                    }
                  }
                }
              }
            }`,
            { variables: { themeId, filenames: [pattern] } },
          );

          const filesData = await filesResponse.json();
          const files = filesData.data?.theme?.files?.nodes || [];

          for (const file of files) {
            if (!file.body?.content) continue;
            totalFilesScanned++;
            const lines = file.body.content.split("\n");

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              const seen = new Set();

              for (const p of metafieldPatterns) {
                const regex = new RegExp(p.source, p.flags);
                let match;
                while ((match = regex.exec(line)) !== null) {
                  const dedupKey = `${match[1]}.${match[2]}`;
                  if (!seen.has(dedupKey)) {
                    seen.add(dedupKey);
                    allReferences.push({
                      namespace: match[1],
                      key: match[2],
                      file: file.filename,
                      line: i + 1,
                    });
                  }
                }
              }
            }
          }
        } catch (fileErr) {
          console.error(
            `[MF Inspector] Error scanning ${pattern}:`,
            fileErr.message,
          );
        }
      }

      await prisma.themeReference.deleteMany({
        where: { shop: session.shop },
      });

      if (allReferences.length > 0) {
        await prisma.themeReference.createMany({
          data: allReferences.map((ref) => ({
            shop: session.shop,
            themeId,
            namespace: ref.namespace,
            key: ref.key,
            file: ref.file,
            line: ref.line,
          })),
        });
      }

      return {
        scanResult: {
          success: true,
          theme: theme.name,
          filesScanned: totalFilesScanned,
          referencesFound: allReferences.length,
        },
      };
    } catch (err) {
      console.error("[MF Inspector] Scan error:", err);
      return {
        scanResult: {
          success: false,
          error: err.message,
        },
      };
    }
  }

  return null;
};

export default function Index() {
  const {
    shop,
    referenceCount,
    uniqueMetafieldCount,
    uniqueFileCount,
    references,
  } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const isScanning =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const scanResult = fetcher.data?.scanResult;

  useEffect(() => {
    if (scanResult?.success) {
      shopify.toast.show(
        `Theme scanned! Found ${scanResult.referencesFound} metafield references.`,
      );
    } else if (scanResult && !scanResult.success) {
      shopify.toast.show("Scan failed: " + scanResult.error);
    }
  }, [scanResult, shopify]);

  return (
    <s-page heading="Metafield Inspector">
      <s-section heading="Overview">
        <s-paragraph>
          Inspect any product's metafields directly on your storefront. No admin
          jumping, no GraphQL, no guessing.
        </s-paragraph>
      </s-section>

      <s-section heading="How to use">
        <s-unordered-list>
          <s-list-item>
            Enable the <s-text fontWeight="bold">Metafield Inspector</s-text>{" "}
            app embed in your theme editor (Online Store &rarr; Customize &rarr;
            App embeds)
          </s-list-item>
          <s-list-item>
            Visit your storefront with{" "}
            <s-text fontWeight="bold">?mf_debug=1</s-text> in the URL, or use
            the theme editor preview
          </s-list-item>
          <s-list-item>
            Hover over any product card to see its metafields in a floating
            panel
          </s-list-item>
          <s-list-item>
            On product pages, click the &ldquo;Inspect Metafields&rdquo; button
            at the bottom right
          </s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section heading="Theme Scanner">
        <s-paragraph>
          Scan your published theme to find which Liquid files reference
          metafields. Results appear as inline tags in the inspector panel.
        </s-paragraph>

        <s-stack direction="block" gap="base">
          <s-stack direction="inline" gap="base">
            <fetcher.Form method="POST">
              <input type="hidden" name="action" value="scan-theme" />
              <s-button
                type="submit"
                variant="primary"
                {...(isScanning ? { loading: true } : {})}
              >
                {referenceCount > 0 ? "Re-scan Theme" : "Scan Theme"}
              </s-button>
            </fetcher.Form>
          </s-stack>

          {scanResult?.success && (
            <s-box
              padding="base"
              borderWidth="base"
              borderRadius="base"
              background="subdued"
            >
              <s-stack direction="block" gap="tight">
                <s-text fontWeight="bold">
                  Scan complete: {scanResult.theme}
                </s-text>
                <s-text>
                  {scanResult.filesScanned} files scanned &bull;{" "}
                  {scanResult.referencesFound} metafield references found
                </s-text>
              </s-stack>
            </s-box>
          )}

          {scanResult && !scanResult.success && (
            <s-box
              padding="base"
              borderWidth="base"
              borderRadius="base"
              background="subdued"
            >
              <s-text color="critical">Error: {scanResult.error}</s-text>
            </s-box>
          )}
        </s-stack>
      </s-section>

      {referenceCount > 0 && (
        <s-section heading="Current Reference Map">
          <s-paragraph>
            {uniqueMetafieldCount} unique metafield
            {uniqueMetafieldCount !== 1 ? "s" : ""} referenced across{" "}
            {uniqueFileCount} file{uniqueFileCount !== 1 ? "s" : ""} (
            {referenceCount} total references).
          </s-paragraph>
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
          >
            <pre style={{ margin: 0, fontSize: "12px", lineHeight: "1.6" }}>
              <code>
                {references
                  .map((r) => `${r.namespace}.${r.key}`)
                  .join("\n")}
              </code>
            </pre>
          </s-box>
        </s-section>
      )}

      <s-section slot="aside" heading="Status">
        <s-stack direction="block" gap="tight">
          <s-paragraph>
            <s-text fontWeight="bold">Shop: </s-text>
            <s-text>{shop}</s-text>
          </s-paragraph>
          <s-paragraph>
            <s-text fontWeight="bold">Theme references: </s-text>
            <s-text>{referenceCount}</s-text>
          </s-paragraph>
          <s-paragraph>
            <s-text fontWeight="bold">Unique metafields: </s-text>
            <s-text>{uniqueMetafieldCount}</s-text>
          </s-paragraph>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Activation">
        <s-paragraph>The inspector activates when:</s-paragraph>
        <s-unordered-list>
          <s-list-item>Shopify theme editor (design mode)</s-list-item>
          <s-list-item>
            URL contains <s-text fontWeight="bold">?mf_debug=1</s-text>
          </s-list-item>
          <s-list-item>
            &ldquo;Always show&rdquo; setting enabled in app embed
          </s-list-item>
        </s-unordered-list>
        <s-paragraph>
          <s-text color="subdued">
            Zero production footprint when inactive.
          </s-text>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
