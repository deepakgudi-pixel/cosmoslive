import type { Metadata } from "next";
import { Bebas_Neue, Space_Mono, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Navigation, CustomCursor, UserSync } from "@/components/ui";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CosmosLive — Everything in Space. One Place. Live.",
  description:
    "Real-time satellite tracking, launch countdowns, ISS live feed, NASA imagery, and space news. The Bloomberg Terminal for space exploration.",
  keywords: [
    "satellite tracker",
    "ISS live",
    "space launches",
    "NASA APOD",
    "SpaceX",
    "Starlink",
    "space news",
    "astronomy",
  ],
  openGraph: {
    title: "CosmosLive",
    description: "Everything in space. One place. Live.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorBackground: '#02050a',
          colorText: '#00e5ff',
          colorTextSecondary: '#8fd8ff',
          colorPrimary: '#00e5ff',
          borderRadius: '0',
          fontFamily: 'var(--font-body)',
        },
        elements: {
          modalContent: 'cosmos-auth-modal',
          modalCloseButton: 'cosmos-auth-close',
          cardBox: 'cosmos-auth-card-box',
          card: 'cosmos-auth-card',
          headerTitle: 'cosmos-auth-title',
          headerSubtitle: 'cosmos-auth-subtitle',
          main: 'cosmos-auth-main',
          socialButtonsBlockButton: 'cosmos-auth-provider-button',
          socialButtonsBlockButtonText: 'cosmos-auth-provider-text',
          socialButtonsProviderIcon: 'cosmos-auth-provider-icon',
          dividerLine: 'cosmos-auth-divider-line',
          dividerText: 'cosmos-auth-divider-text',
          formFieldLabel: 'cosmos-auth-label',
          formFieldInput: 'cosmos-auth-input',
          formFieldInputShowPasswordButton: 'cosmos-auth-password-toggle',
          formFieldInputShowPasswordIcon: 'cosmos-auth-password-icon',
          formButtonPrimary: 'cosmos-auth-primary-button',
          footer: 'cosmos-auth-footer',
          footerActionText: 'cosmos-auth-footer-text',
          footerActionLink: 'cosmos-auth-footer-link',
          identityPreviewText: 'cosmos-auth-text',
          formFieldErrorText: 'cosmos-auth-error',
          formFieldHintText: 'cosmos-auth-hint',
          formFieldSuccessText: 'cosmos-auth-success',
          lastAuthenticationStrategyBadge: 'cosmos-auth-badge',
        },
      }}
    >
      <html lang="en" className={`${bebasNeue.variable} ${spaceMono.variable} ${inter.variable}`} suppressHydrationWarning>
        <body className="bg-black text-white antialiased">
          <QueryProvider>
            <CustomCursor />
            <Navigation />
            <UserSync />
            <ErrorBoundary>
              <main>{children}</main>
            </ErrorBoundary>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
