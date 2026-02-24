// GDPR customers/data_request — Shopify requests a report of data held for a customer.
// This app uses read_products and read_themes scopes only and does not store
// any personal customer (shopper) data, so there is nothing to report.
export const action = async ({ request }) => {
  return new Response(null, { status: 200 });
};