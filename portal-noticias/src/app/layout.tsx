import type { Metadata } from "next";
import { 
  Geist, 
  Geist_Mono, 
  Inter, 
  Merriweather, 
  Montserrat, 
  Playfair_Display, 
  Lora, 
  Poppins, 
  Anton, 
  Oswald 
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fontes Sans
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

// Fontes Serif
const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

// Fontes Impact
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const baseUrl = "https://nossawebtv.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Nossa Web TV | Portal de Notícias",
  description: "O seu portal de notícias de Arapongas e região.",
  facebook: {
    appId: "131682697252495",
  }
};

// export const dynamic = "force-dynamic";

import { Providers } from "../components/Providers";
import PushPrompt from "../components/PushPrompt";
import MainLayout from "../components/MainLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVariables = [
    geistSans.variable,
    geistMono.variable,
    inter.variable,
    montserrat.variable,
    poppins.variable,
    merriweather.variable,
    playfairDisplay.variable,
    lora.variable,
    anton.variable,
    oswald.variable
  ].join(" ");

  return (
    <html
      lang="pt-BR"
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#00AEE0" />
        <meta property="og:image:type" content="image/png" />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `
        }} />
      </head>
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden" suppressHydrationWarning>
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
          <PushPrompt />
        </Providers>
      </body>
    </html>
  );
}
