import db from "../db.server";

// GDPR shop/redact — fired by Shopify 48 hours after a store uninstalls the app.
// Delete all remaining store data: sessions and cached theme scan results.
export const action = async ({ request }) => {
  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return new Response(null, { status: 400 });
  }

  const shop = payload?.shop_domain;
  if (shop) {
    await Promise.all([
      db.session.deleteMany({ where: { shop } }),
      db.themeReference.deleteMany({ where: { shop } }),
    ]);
  }

  return new Response(null, { status: 200 });
};