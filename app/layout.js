import { Inter, Merriweather } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import { Providers } from "./providers";
import Navbar from './components/Navbar/Navbar'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
});

export const metadata = {
  title: "PESU Placement Tales",
  description: "✨🚀 A collective and supportive repository with placement experiences at PES University",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${merriweather.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
        <Navbar/>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
