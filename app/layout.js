import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import { Providers } from "./providers";
import Navbar from './components/Navbar/Navbar'
import { getRepoStars } from "../utils/github";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "PESU Placement Tales",
  description: "✨🚀 A collective and supportive repository with placement experiences at PES University",
};

export default async function RootLayout({ children }) {
  const stars = await getRepoStars();

  return (
    <html lang="en">
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar stars={stars} />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
