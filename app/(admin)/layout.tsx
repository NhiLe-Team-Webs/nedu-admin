"use client"

import { Sidebar } from "@/components/ui/sidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar className="hidden md:flex" />
            <div className="flex flex-1 flex-col overflow-hidden">
                <AdminHeader />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
