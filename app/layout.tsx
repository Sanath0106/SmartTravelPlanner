import type {Metadata} from "next";
import {Montserrat_Alternates} from "next/font/google";
import {Analytics} from "@vercel/analytics/react";
import ConvexClientProvider from "@/app/ConvexClientProvider";
import {ThemeProvider} from "@/contexts/ThemeProvider";

import Progress from "@/components/Progress";
import {Toaster} from "@/components/ui/toaster";

import "./globals.css";
import Script from "next/script";

const inter = Montserrat_Alternates({weight: "500", subsets: ["cyrillic"]});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.travelplannerai.online"),
  title: {
    default: "Travel Planner AI - Your Smart Travel Planner",
    template: "%s | Travel Planner AI - Your Smart Travel Planner",
  },
  description:
    "Travel Planner AI provides intelligent travel suggestions, personalized itineraries, and seamless trip planning. Plan your perfect trip with ease.",
  keywords:
    "travel planner, AI travel planner, smart travel, travel suggestions, destination insights, personalized itineraries, trip planning, travel tips, vacation planning",
  openGraph: {
    title: "Travel Planner AI - Your Smart Travel Planner",
    description:
      "Travel Planner AI provides intelligent travel suggestions, personalized itineraries, and seamless trip planning. Plan your perfect trip with ease.",
    url: "https://www.travelplannerai.online",
    type: "website",
    siteName: "TravelPlannerAI",
    images: [
      {
        url: "opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Travel Planner AI",
      },
    ],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900`}>
        <ConvexClientProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Progress />
            {children}
            <Toaster />
          </ThemeProvider>
        </ConvexClientProvider>
        <Analytics />
        <Script
          id="chatbase-widget-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.embeddedChatbotConfig = {
                chatbotId: "YZf3y3oqKUc9V_NOjL0rv",
                domain: "www.chatbase.co"
              }
            `,
          }}
        />
        <Script
          id="chatbase-widget"
          src="https://www.chatbase.co/embed.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
