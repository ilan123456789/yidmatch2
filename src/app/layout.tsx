import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YidMatch - Every Yid Needs a Job",
  description: "A modern community job platform connecting job seekers and employers.",
  icons: {
    icon: "/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="bsd-tag" aria-hidden="true">בס&quot;ד</div>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
