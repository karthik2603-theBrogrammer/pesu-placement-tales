import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import { Providers } from "./providers";
import Navbar from './components/Navbar/Navbar'

export const metadata = {
  title: "PESU Placement Tales",
  description: "✨🚀 A collective and supportive repository with placement experiences at PES University",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar/>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
