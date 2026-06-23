import Script from "next/script";

const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID?.trim();

export function Analytics() {
  if (!googleAnalyticsId) {
    return null;
  }

  const serializedGoogleAnalyticsId = JSON.stringify(googleAnalyticsId);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
          googleAnalyticsId,
        )}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', ${serializedGoogleAnalyticsId}, {
            anonymize_ip: true,
            send_page_view: true
          });
        `}
      </Script>
    </>
  );
}
