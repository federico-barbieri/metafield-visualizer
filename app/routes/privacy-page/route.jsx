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
          <p>When you install the App, we access the following information from your Shopify store:</p>
          <ul style={styles.list}>
            <li>
              <strong>Store information</strong> — shop domain and authentication tokens
              required to operate the App.
            </li>
            <li>
              <strong>Product data</strong> — product handles, titles, and metafields
              (namespaces, keys, types, and values) to display them inside the App.
            </li>
            <li>
              <strong>Theme files</strong> — theme Liquid source files to scan for metafield
              references and highlight where each metafield is used in your storefront.
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
          <p>
            Session and authentication data is stored securely on cloud servers. We implement
            industry-standard security measures, including encrypted connections (HTTPS) and
            access controls, to protect stored information.
          </p>
          <p>
            Product metafield data is fetched on demand via the Shopify Admin API and is not
            persistently stored on our servers.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>GDPR Compliance</h2>
          <p>
            The App implements Shopify's mandatory GDPR webhooks:
          </p>
          <ul style={styles.list}>
            <li>
              <strong>Customer data request</strong> — we will provide any personal data we
              hold for a customer upon request.
            </li>
            <li>
              <strong>Customer data erasure</strong> — we will delete any personal data
              associated with a customer upon request.
            </li>
            <li>
              <strong>Shop data erasure</strong> — when a merchant uninstalls the App, we
              delete all store data within 30 days.
            </li>
          </ul>
          <p>
            As the App operates with <code>read_products</code> and <code>read_themes</code>{" "}
            scopes only, we do not store personal customer data.
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
  list: {
    paddingLeft: "20px",
    marginBottom: "12px",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
};
