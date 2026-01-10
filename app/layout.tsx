import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const beVietnamPro = Be_Vietnam_Pro({
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    subsets: ["vietnamese"],
    variable: '--font-sans',
    display: "swap",
});

export const metadata: Metadata = {
    title: "Nedu Admin",
    description: "Nedu Admin Dashboard",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={cn("font-sans antialiased", beVietnamPro.variable, beVietnamPro.className)}>
                {children}
                <ToastContainer />

            </body>
        </html>
    );
}
