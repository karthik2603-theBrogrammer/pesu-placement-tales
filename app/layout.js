import localFont from "next/font/local";
import "./globals.css";

import { Providers } from "./providers";
import Navbar from './components/Navbar/Navbar'

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar/>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
