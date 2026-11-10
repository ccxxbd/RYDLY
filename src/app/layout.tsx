import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RYDLY — Ride together. Go further.",
  description: "The home for motorcycle culture. Find your people, plan rides, share the journey and discover your next upgrade.",
  applicationName: "RYDLY",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
