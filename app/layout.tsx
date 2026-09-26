import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "My Gurukul MasterAdmin Portal",
  description: "Master SaaS Governance Platform for Educational Trusts, Schools & Universities",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My Gurukul Master",
  },
  icons: {
    icon: "/my-gurukul.png",
    shortcut: "/my-gurukul.png",
    apple: "/my-gurukul.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} font-sans h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/my-gurukul.png" type="image/png" />
        <link rel="shortcut icon" href="/my-gurukul.png" type="image/png" />
        <link rel="apple-touch-icon" href="/my-gurukul.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#020637" />
        <meta name="color-scheme" content="light" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
