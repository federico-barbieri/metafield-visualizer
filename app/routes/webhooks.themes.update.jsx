/**
 * Webhook: themes/update
 * Re-scans theme files when the published theme changes.
 */
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const { shop, session, topic, admin } = await authenticate.webhook(request);

  console.log(`[MF Inspector] Received ${topic} webhook for ${shop}`);

  if (!session || !admin) {
    console.log("[MF Inspector] No session/admin for theme update webhook");
    return new Response();
  }

  try {
    // Re-scan the main theme
    const themesResponse = await admin.graphql(
      `#graphql
      query {
        themes(first: 10, roles: MAIN) {
          nodes {
            id
            name
          }
        }
      }`,
    );

    const themesData = await themesResponse.json();
    const theme = themesData.data?.themes?.nodes?.[0];

    if (!theme) {
      console.log("[MF Inspector] No main theme found during webhook scan");
      return new Response();
    }

    const themeId = theme.id;
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

    // Metafield regex patterns
    const patterns = [
      /(?:product|variant|collection|page|shop|order|customer|article|blog)\.metafields\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)/g,
      /(?:product|variant|collection|page|shop|order|customer|article|blog)\.metafields\[['"]([a-zA-Z0-9_-]+)['"]\]\[['"]([a-zA-Z0-9_-]+)['"]\]/g,
    ];

    let allReferences = [];

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
          const lines = file.body.content.split("\n");

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const seen = new Set();

            for (const p of patterns) {
              const regex = new RegExp(p.source, p.flags);
              let match;
              while ((match = regex.exec(line)) !== null) {
                const key = `${match[1]}.${match[2]}`;
                if (!seen.has(key)) {
                  seen.add(key);
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
          `[MF Inspector] Webhook scan error for ${pattern}:`,
          fileErr.message,
        );
      }
    }

    // Update database
    await prisma.themeReference.deleteMany({ where: { shop } });

    if (allReferences.length > 0) {
      await prisma.themeReference.createMany({
        data: allReferences.map((ref) => ({
          shop,
          themeId,
          namespace: ref.namespace,
          key: ref.key,
          file: ref.file,
          line: ref.line,
        })),
      });
    }

    console.log(
      `[MF Inspector] Theme scan complete: ${allReferences.length} references found`,
    );
  } catch (err) {
    console.error("[MF Inspector] Webhook theme scan failed:", err);
  }

  return new Response();
};
