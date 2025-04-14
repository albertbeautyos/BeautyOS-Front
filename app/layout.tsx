import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Dynamic imports for optimization
import dynamic from "next/dynamic";

const DynamicThemeProvider = dynamic(() => import("@/components/theme-provider").then(mod => mod.ThemeProvider));
const DynamicReduxProvider = dynamic(() => import("@/store/Provider").then(mod => mod.ReduxProvider));

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BeautyOS",
  description: "BeautyOS is a platform for managing beauty salons and their clients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DynamicThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DynamicReduxProvider>{children}</DynamicReduxProvider>
        </DynamicThemeProvider>
      </body>
    </html>
  );
}
