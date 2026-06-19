import { createLegalMetadata, LegalPage } from "@/features/legal/components/legal-page";

export const metadata = createLegalMetadata(
  "Privacy Policy",
  "How Explorer's Journal handles visitor information, admin access, and uploaded media.",
  "/privacy",
);

export default function PrivacyPage() {
  return (
    <LegalPage
      description="This policy explains what information may be processed when someone visits the site, reads public entries, or uses the protected editorial admin area."
      eyebrow="Privacy policy"
      sections={[
        {
          title: "Information we collect",
          body: [
            "The public site is designed primarily as a reading experience, so most visitors can browse without creating an account. Basic technical information such as browser type, IP address, request timing, and pages visited may still be processed by the hosting platform, server logs, analytics tooling, or security systems in order to deliver the site safely and reliably.",
            "If an authorized editor uses the admin area, the application may process authentication session data, uploaded images, entry text, slugs, excerpts, and related editorial metadata needed to create and manage publications.",
          ],
        },
        {
          title: "How we use information",
          body: [
            "Information is used to operate the website, secure the admin area, publish content, maintain performance, troubleshoot issues, and prevent unauthorized access or abuse.",
            "We do not collect more personal data than is reasonably necessary for site operations and editorial publishing workflows.",
          ],
        },
        {
          title: "Cookies and sessions",
          body: [
            "The public site does not require a visitor login. The protected admin area uses a secure server-managed session cookie so authorized editors can remain signed in during a working session.",
            "That session cookie is configured for security, including httpOnly handling and same-site protections, and is used only to verify editorial access.",
          ],
        },
        {
          title: "Uploads and stored content",
          body: [
            "Images uploaded by authorized editors are stored so they can appear in article headers, cards, and gallery carousels. Editorial content submitted through the admin area is stored in the site database together with publication metadata such as section, status, and update timestamps.",
            "Uploaded assets should be limited to materials the editorial team has the right to publish.",
          ],
        },
        {
          title: "Third-party infrastructure",
          body: [
            "The site may rely on third-party hosting and database providers, including deployment, storage, and infrastructure vendors, to deliver the application. Those providers may process technical data necessary to host, secure, and transport the service.",
            "If analytics, monitoring, email, or media services are added later, this policy should be updated to reflect those integrations clearly.",
          ],
        },
        {
          title: "Retention and updates",
          body: [
            "Editorial records, uploaded media, and related admin metadata may be retained as long as they are needed to operate the archive or maintain publication history. Technical logs may be retained for shorter periods according to hosting or security requirements.",
            "This policy should be reviewed whenever the project adds new tracking, account systems, contact forms, marketing tools, or external integrations that affect personal data handling.",
          ],
        },
      ]}
      title="Privacy Policy"
      updatedLabel="Last updated: June 19, 2026"
    />
  );
}
