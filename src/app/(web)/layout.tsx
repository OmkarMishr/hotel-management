import type { Metadata } from "next";
import {Poppins} from "next/font/google";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import ThemeProvider from "@/components/ThemeProvider/ThemeProvider";
import "./globals.css";
import NextAuth from "next-auth";
import { NextAuthProvider } from "@/components/AuthProvider/AuthProvider";
import Toast  from "@/components/Toast/Toast";

const poppins = Poppins({
  subsets: ['latin'] , 
  weight: ['400','500','700','900'] ,
  style: ['italic','normal'],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "Hotel Management App",
  description: "Discover best hotel rooms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Hotelzz</title>
        <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css' crossOrigin='anonymous'/>
      </head>
      <body >
        <NextAuthProvider>
        <ThemeProvider>
          <Toast/>
          <main className={poppins.className}>
            <Header />
            {children}
            <Footer />
          </main>
        </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
