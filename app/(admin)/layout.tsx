"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AppSidebar } from "@/components/admin/AppSidebar"
import { MobileNav } from "@/components/admin/MobileNav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { ChevronRight } from "lucide-react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const isMobile = useIsMobile()
    const router = useRouter()
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const supabase = createClient()
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    const handleMenuClick = (href: string) => {
        router.push(href)
        setIsMobileMenuOpen(false)
    }

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.refresh()
    }

    const handleOpenMenu = () => {
        setIsMobileMenuOpen(true)
    }

    const handleCloseMenu = () => {
        setIsMobileMenuOpen(false)
    }

    // Mobile layout
    if (isMobile) {
        return (
            <>
                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <MobileNav
                        user={user}
                        onMenuClick={handleMenuClick}
                        onLogout={handleLogout}
                        onClose={handleCloseMenu}
                    />
                )}

                {/* Mobile Content View */}
                <div className="min-h-screen bg-white">
                    {/* Floating Menu Button - hidden when menu is open */}
                    {!isMobileMenuOpen && (
                        <button
                            onClick={handleOpenMenu}
                            className="fixed bottom-6 left-6 z-30 p-3 bg-white rounded-full shadow-2xl border border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 active:scale-90"
                            aria-label="Open menu"
                        >
                            <ChevronRight className="h-6 w-6 text-[#F7B418]" />
                        </button>
                    )}

                    {/* Content */}
                    <div className="pt-5 px-5 pb-24">
                        {children}
                    </div>
                </div>
            </>
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
