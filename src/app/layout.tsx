"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { UserProvider } from "@/components/UserContext";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <MantineProvider>
        <Notifications position="top-right" />
        <UserProvider>
          <body className={inter.className}>{children}</body>
        </UserProvider>
      </MantineProvider>
    </html>
  );
}
