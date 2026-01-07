"use client"

import { Sidebar } from "@/components/ui/sidebar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar className="hidden md:flex" />
            <main className="relative flex min-h-svh flex-1 flex-col bg-background pl-16 transition-[margin-left] duration-200 ease-in-out overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
