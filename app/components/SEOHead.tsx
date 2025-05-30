// components/SEOHead.tsx
'use client';

import Head from 'next/head';
import { useShopSettings } from '@/contexts/ShopSettingsContext';

export function SEOHead() {
    const { settings } = useShopSettings();

    if (!settings) return null;

    return (
        <Head>
            <title>{settings.seo.metaTitle || settings.shopName}</title>
            <meta name="description" content={settings.seo.metaDescription || settings.description} />
            <meta name="keywords" content={settings.seo.keywords?.join(', ') || ''} />

            {/* Favicon */}
            {settings.logo.favicon && (
                <link rel="icon" href={settings.logo.favicon} />
            )}

            {/* Google Analytics */}
            {settings.seo.googleAnalytics && (
                <>
                    <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.seo.googleAnalytics}`} />
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.seo.googleAnalytics}');
              `,
                        }}
                    />
                </>
            )}

            {/* Facebook Pixel */}
            {settings.seo.facebookPixel && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${settings.seo.facebookPixel}');
              fbq('track', 'PageView');
            `,
                    }}
                />
            )}
        </Head>
    );
}