// GDPR customers/redact — Shopify requests erasure of a customer's data.
// This app uses read_products and read_themes scopes only and does not store
// any personal customer (shopper) data, so no deletion is required.
export const action = async ({ request }) => {
  return new Response(null, { status: 200 });
};