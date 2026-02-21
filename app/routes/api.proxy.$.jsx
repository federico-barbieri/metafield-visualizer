/**
 * App Proxy Route — handles storefront requests forwarded by Shopify
 *
 * Endpoints:
 *   GET /api/proxy/metafields?handle=<product-handle>
 *   GET /api/proxy/references
 */
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export async function loader({ request, params }) {
  const { admin, session } = await authenticate.public.appProxy(request);
  const subPath = params["*"];
  const url = new URL(request.url);

  // ===== /metafields?handle=xxx =====
  if (subPath === "metafields") {
    const handle = url.searchParams.get("handle");

    if (!handle) {
      return new Response(
        JSON.stringify({ error: "handle parameter required", metafields: [] }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!admin) {
      return new Response(
        JSON.stringify({ error: "App not installed or session expired", metafields: [] }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    try {
      const response = await admin.graphql(
        `#graphql
        query ProductMetafields($query: String!) {
          products(first: 1, query: $query) {
            nodes {
              id
              title
              handle
              metafields(first: 250) {
                nodes {
                  namespace
                  key
                  type
                  value
                  description
                }
              }
            }
          }
        }`,
        { variables: { query: `handle:${handle}` } },
      );

      const data = await response.json();
      const product = data.data?.products?.nodes?.[0];

      if (!product) {
        return new Response(
          JSON.stringify({ metafields: [], error: "Product not found" }),
          { headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({
          product: {
            id: product.id,
            title: product.title,
            handle: product.handle,
          },
          metafields: product.metafields.nodes,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    } catch (err) {
      console.error("[MF Inspector] Proxy metafields error:", err);
      return new Response(
        JSON.stringify({ error: err.message, metafields: [] }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // ===== /references =====
  if (subPath === "references") {
    try {
      const shop = session?.shop;
      if (!shop) {
        return new Response(
          JSON.stringify({ references: {} }),
          { headers: { "Content-Type": "application/json" } },
        );
      }

      const refs = await prisma.themeReference.findMany({
        where: { shop },
      });

      // Group by namespace.key
      const grouped = {};
      for (const ref of refs) {
        const key = `${ref.namespace}.${ref.key}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({ file: ref.file, line: ref.line });
      }

      return new Response(
        JSON.stringify({ references: grouped }),
        { headers: { "Content-Type": "application/json" } },
      );
    } catch (err) {
      console.error("[MF Inspector] Proxy references error:", err);
      return new Response(
        JSON.stringify({ references: {} }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  return new Response(
    JSON.stringify({ error: "Unknown endpoint" }),
    { status: 404, headers: { "Content-Type": "application/json" } },
  );
}
