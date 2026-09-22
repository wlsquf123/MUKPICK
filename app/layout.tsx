import type { Metadata } from "next";
import "./globals.css";

import AuthProvider from "../components/AuthProvider";

export const metadata: Metadata = {
  title: "MUKPICK",
  description: "취향 기반 음식 추천 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}