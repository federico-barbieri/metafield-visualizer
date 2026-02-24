export default function PrivacyPage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Privacy Policy</h1>
        <p style={styles.meta}>Last updated: February 24, 2026</p>

        <p style={styles.lead}>
          This Privacy Policy describes how <strong>Metafield Inspector</strong> ("the App",
          "we", "us") collects, uses, and stores information when merchants install and use
          the App through Shopify.
        </p>

        <section style={styles.section}>
          <h2 style={styles.h2}>Information We Collect</h2>
          <p>When you install the App, we access and may store the following information:</p>

          <h3 style={styles.h3}>Data accessed from Shopify</h3>
          <ul style={styles.list}>
            <li>
              <strong>Product data</strong> — product handles, titles, and metafields
              (namespaces, keys, types, and values), fetched on demand to display inside the
              App. This data is <strong>not</strong> stored on our servers.
            </li>
            <li>
              <strong>Theme files</strong> — Liquid source files from your active theme,
              scanned to detect where metafields are referenced in your storefront.
            </li>
          </ul>

          <h3 style={styles.h3}>Data we store</h3>
          <ul style={styles.list}>
            <li>
              <strong>Session and authentication data</strong> — shop domain, OAuth access
              token, refresh token, token expiry, and OAuth scopes, required to maintain your
              authenticated session with Shopify.
            </li>
            <li>
              <strong>Merchant account information</strong> — first name, last name, email
              address, and user ID of the Shopify staff account that installed or authenticated
              the App. This is provided by Shopify during the OAuth flow.
            </li>
            <li>
              <strong>Theme scan results</strong> — after a theme scan, we cache the results
              (theme ID, metafield namespace and key, and the Liquid file name and line number
              where each metafield is referenced) to avoid re-scanning on every page load.
              This data is associated with your shop domain.
            </li>
          </ul>

          <p>
            We do <strong>not</strong> access customer data, orders, or any other store data
            beyond the scopes listed above (<code>read_products</code>,{" "}
            <code>read_themes</code>).
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>How We Use Information</h2>
          <p>We use the information collected solely to:</p>
          <ul style={styles.list}>
            <li>Provide and operate the App's features (metafield inspection and theme scanning).</li>
            <li>Authenticate and maintain your session with Shopify.</li>
            <li>Improve the App's functionality and performance.</li>
            <li>Provide merchant support when requested.</li>
            <li>Comply with legal obligations, including Shopify's Partner requirements.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Data Sharing</h2>
          <p>
            We do <strong>not</strong> sell, rent, or trade merchant or store data to third
            parties.
          </p>
          <p>
            We may share data with trusted infrastructure providers solely to operate the
            App, including:
          </p>
          <ul style={styles.list}>
            <li>Cloud hosting and server providers</li>
            <li>Database providers (used to store session and authentication tokens)</li>
          </ul>
          <p>
            These providers are contractually obligated to protect data and may not use it
            for any other purpose.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Data Storage and Security</h2>
          <p>The following data is persisted in our database:</p>
          <ul style={styles.list}>
            <li>Session and authentication tokens (shop domain, access token, refresh token, expiry, scopes)</li>
            <li>Merchant account details provided during OAuth (name, email, user ID)</li>
            <li>Cached theme scan results (theme ID, metafield references with file names and line numbers)</li>
          </ul>
          <p>
            Product metafield data is fetched on demand via the Shopify Admin API and is{" "}
            <strong>not</strong> persistently stored on our servers.
          </p>
          <p>
            All data is stored on secured cloud servers. We implement industry-standard
            security measures including encrypted connections (HTTPS) and access controls
            to protect stored information.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>GDPR Compliance</h2>
          <p>
            The App implements Shopify's three mandatory GDPR webhooks:
          </p>
          <ul style={styles.list}>
            <li>
              <strong>Customer data request</strong> — the App operates with{" "}
              <code>read_products</code> and <code>read_themes</code> scopes only and does
              not store any personal shopper/customer data. There is no customer data to
              report.
            </li>
            <li>
              <strong>Customer data erasure</strong> — same as above; no customer data is
              stored and no deletion is required.
            </li>
            <li>
              <strong>Shop data erasure</strong> — fired by Shopify 48 hours after a
              merchant uninstalls the App. We permanently delete all remaining store data:
              session records (including the merchant's name, email, and access tokens) and
              all cached theme scan results associated with the shop.
            </li>
          </ul>
          <p>
            Data deletion also begins immediately upon uninstall via the{" "}
            <code>app/uninstalled</code> webhook, ahead of the 48-hour GDPR deadline.
          </p>
          <p>
            The only personal data we store is the name and email of the merchant account
            that authenticated the App, as provided by Shopify during the OAuth flow. We do
            not store personal data of shoppers or customers.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Merchant Rights</h2>
          <p>Merchants may at any time:</p>
          <ul style={styles.list}>
            <li>Request access to the data we hold about their store.</li>
            <li>Request correction or deletion of their data.</li>
            <li>
              Uninstall the App — upon uninstall, all store session data is deleted within
              30 days.
            </li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at the email address below.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be
            reflected on this page with an updated date at the top. Continued use of the App
            after changes constitutes acceptance of the revised policy.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>Contact</h2>
          <p>For questions or requests regarding this Privacy Policy or your data:</p>
          <ul style={styles.list}>
            <li>
              <strong>Email:</strong>{" "}
              <a href="mailto:federico.pedro.barbieri@gmail.com" style={styles.link}>
                federico.pedro.barbieri@gmail.com
              </a>
            </li>
            <li>
              <strong>Developer:</strong> Federico Barbieri
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

const styles = {
  page: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
    padding: "40px 16px",
    color: "#1a1a1a",
    lineHeight: "1.7",
  },
  container: {
    maxWidth: "720px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "48px 56px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  h1: {
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "4px",
  },
  meta: {
    color: "#6b7280",
    fontSize: "0.875rem",
    marginBottom: "24px",
  },
  lead: {
    fontSize: "1rem",
    marginBottom: "32px",
  },
  section: {
    marginBottom: "36px",
  },
  h2: {
    fontSize: "1.2rem",
    fontWeight: "600",
    marginBottom: "12px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "6px",
  },
  h3: {
    fontSize: "1rem",
    fontWeight: "600",
    marginTop: "16px",
    marginBottom: "8px",
  },
  list: {
    paddingLeft: "20px",
    marginBottom: "12px",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
};
