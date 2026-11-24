import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Field & Found — Land and homes with room to grow",
  description: "Thoughtfully selected land and homes, matched to where you want life to go.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
