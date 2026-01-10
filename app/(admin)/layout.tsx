"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AppSidebar } from "@/components/admin/AppSidebar"
import { MobileNav } from "@/components/admin/MobileNav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const isMobile = useIsMobile()
    const router = useRouter()
    const pathname = usePathname()
    const [isMobileListView, setIsMobileListView] = useState(true)
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const supabase = createClient()
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    // On desktop, always show content view
    useEffect(() => {
        if (isMobile === false) {
            setIsMobileListView(false)
        } else if (isMobile === true) {
            setIsMobileListView(true)
        }
    }, [isMobile])

    const handleMenuClick = (href: string) => {
        router.push(href)
        setIsMobileListView(false)
    }

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.refresh()
    }

    // Mobile: Show menu list or content
    if (isMobile) {
        if (isMobileListView) {
            return (
                <MobileNav
                    user={user}
                    onMenuClick={handleMenuClick}
                    onLogout={handleLogout}
                />
            )
        }

        // Mobile content view - no back button needed (device has native back)
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Mobile Header */}
                <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
                    <div className="flex items-center justify-center h-14 px-4">
                        <span className="font-semibold text-gray-900">N-EDU Admin</span>
                    </div>
                </div>
                {/* Content */}
                <div className="p-4">
                    {children}
                </div>
            </div>
        )
    }

    // Desktop: Standard sidebar layout
    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset>
                <div className="p-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
