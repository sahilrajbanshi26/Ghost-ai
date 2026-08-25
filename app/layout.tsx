import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost AI",
  description: "AI editor workspace",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full">
        <ClerkProvider
          appearance={{
            theme: dark,
            variables: {
              colorBackground: "var(--background)",
              colorForeground: "var(--foreground)",
              colorPrimary: "var(--primary)",
              borderRadius: "var(--radius)",
            },
            elements: {
              cardBox: "shadow-none",
              card: "border border-border bg-card text-card-foreground",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton:
                "border-border bg-secondary text-secondary-foreground hover:bg-accent",
              formButtonPrimary:
                "bg-primary text-primary-foreground hover:bg-primary/90",
              footerActionLink: "text-foreground hover:text-muted-foreground",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
