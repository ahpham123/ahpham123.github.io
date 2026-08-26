import type { Metadata } from "next";
import { Cormorant_Garamond, Nunito, Caveat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ahpham123.github.io"),
  title: "Anna Pham — a cozy corner of the internet",
  description:
    "Portfolio of Anna Pham — projects, tinkering, and things lovingly grown.",
  openGraph: {
    title: "Anna Pham — a cozy corner of the internet",
    description:
      "Portfolio of Anna Pham — projects, tinkering, and things lovingly grown.",
    url: "https://ahpham123.github.io",
    siteName: "Anna Pham",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Anna Pham — a cozy corner of the internet",
    description:
      "Portfolio of Anna Pham — projects, tinkering, and things lovingly grown.",
  },
};

export const viewport = {
  themeColor: "#fbf6ec",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${nunito.variable} ${caveat.variable}`}
    >
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("theme")==="night")document.documentElement.dataset.theme="night"}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
