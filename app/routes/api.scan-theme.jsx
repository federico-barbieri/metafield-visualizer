/**
 * Theme Scanner — scans the active theme's Liquid files for metafield references
 *
 * POST /api/scan-theme
 * Called from the admin dashboard to build the reference map.
 */
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// Regex patterns for metafield references in Liquid
const METAFIELD_PATTERNS = [
  // Dot notation: product.metafields.namespace.key
  /(?:product|variant|collection|page|shop|order|customer|article|blog)\.metafields\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)/g,
  // Bracket notation: product.metafields['namespace']['key']
  /(?:product|variant|collection|page|shop|order|customer|article|blog)\.metafields\[['"]([a-zA-Z0-9_-]+)['"]\]\[['"]([a-zA-Z0-9_-]+)['"]\]/g,
  // Liquid filter: product | metafield: 'namespace', 'key'
  /\|\s*metafield:\s*['"]([a-zA-Z0-9_-]+)['"]\s*,\s*['"]([a-zA-Z0-9_-]+)['"]/g,
  // resource.metafields.namespace.key.value (with .value suffix)
  /(?:product|variant|collection|page|shop|order|customer|article|blog)\.metafields\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\.value/g,
];

function scanFileForMetafields(content, filename) {
  const results = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const seen = new Set(); // deduplicate within same line

    for (const pattern of METAFIELD_PATTERNS) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(line)) !== null) {
        const namespace = match[1];
        const key = match[2];
        const dedupKey = `${namespace}.${key}`;

        if (!seen.has(dedupKey)) {
          seen.add(dedupKey);
          results.push({
            namespace,
            key,
            file: filename,
            line: i + 1,
          });
        }
      }
    }
  }

  return results;
}

export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    // Step 1: Get the main/published theme
    // Using the themes query — adjust based on your API version
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
      return Response.json({
        success: false,
        error: "No main theme found. Make sure you have a published theme.",
      });
    }

    const theme = themes[0];
    const themeId = theme.id;

    // Step 2: Get theme files (Liquid files)
    // We fetch files in batches using the theme files API
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
          const refs = scanFileForMetafields(file.body.content, file.filename);
          allReferences = allReferences.concat(refs);
        }
      } catch (fileErr) {
        console.error(
          `[MF Inspector] Error fetching ${pattern}:`,
          fileErr.message,
        );
        // Continue with other patterns
      }
    }

    // Step 3: Store references — clear old ones first
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

    return Response.json({
      success: true,
      theme: theme.name,
      themeId: theme.id,
      filesScanned: totalFilesScanned,
      referencesFound: allReferences.length,
    });
  } catch (err) {
    console.error("[MF Inspector] Theme scan error:", err);
    return Response.json({
      success: false,
      error: err.message,
    });
  }
}
