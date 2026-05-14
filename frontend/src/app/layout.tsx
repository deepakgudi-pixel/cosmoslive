import type { Metadata } from "next";
import { Bebas_Neue, Space_Mono, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Navigation } from "@/components/ui/Navigation";
import { CustomCursor } from "@/components/ui/CustomCursor";
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
    <ClerkProvider>
      <html lang="en" className={`${bebasNeue.variable} ${spaceMono.variable} ${inter.variable}`}>
        <body className="bg-cosmos-black text-white antialiased">
          <QueryProvider>
            <CustomCursor />
            <Navigation />
            <main>{children}</main>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
