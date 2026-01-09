"use client"

import { BookOpen, Building, LogOut, FileText, KeyRound, Settings, Ticket, Users, ChevronRight, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { useIsMobile } from "@/hooks/use-mobile"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const sidebarItems = [
    { title: "Thông tin doanh nghiệp", icon: Building, href: "/dashboard" },
    { title: "Trang chủ", icon: Settings, href: "/home-config" },
    { title: "Quản lý mentor", icon: Users, href: "/mentors" },
    { title: "Khóa Học", icon: BookOpen, href: "/courses" },
    { title: "Ưu đãi", icon: Ticket, href: "/deals" },
    { title: "Về Chúng Tôi", icon: FileText, href: "/about" },
    { title: "Phân Quyền", icon: KeyRound, href: "/permissions" },
]

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const isMobile = useIsMobile()
    const [isCollapsed, setIsCollapsed] = useState(true)
    const [isMobileOpen, setIsMobileOpen] = useState(true) // Default open on mobile
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const supabase = createClient()
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.refresh()
    }

    const handleNavClick = () => {
        if (isMobile) {
            setIsMobileOpen(false)
        }
    }

    // Mobile Sidebar - Full Screen
    if (isMobile) {
        return (
            <>
                {/* Mobile Sidebar - Full Screen when open */}
                <div
                    className={cn(
                        "fixed inset-0 z-50 bg-white transition-transform duration-300 ease-in-out flex flex-col",
                        isMobileOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    {/* User Profile Section */}
                    <div className="flex items-center gap-3 p-4 border-b">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-blue-500 text-white">
                                {user?.email?.[0]?.toUpperCase() || 'A'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-sm font-semibold text-gray-900">
                                {user?.user_metadata?.name || 'Admin User'}
                            </span>
                            <span className="truncate text-xs text-gray-500">
                                {user?.email || 'admin@example.com'}
                            </span>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex-1 overflow-auto py-4">
                        <nav className="grid gap-1 px-4">
                            {sidebarItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    onClick={handleNavClick}
                                    className={cn(
                                        "flex items-center justify-between rounded-lg px-3 py-4 text-sm font-medium transition-all border-b border-gray-100",
                                        pathname.startsWith(item.href)
                                            ? "bg-amber-50 text-amber-600"
                                            : "text-gray-700 hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={cn(
                                            "h-5 w-5 shrink-0",
                                            pathname.startsWith(item.href) ? "text-amber-500" : "text-amber-400"
                                        )} />
                                        <span>{item.title}</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Logout Button */}
                    <div className="p-4 border-t">
                        <Button
                            variant="ghost"
                            className="w-full gap-3 justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Đăng xuất</span>
                        </Button>
                    </div>

                    {/* Bottom indicator bar */}
                    <div className="flex justify-center pb-2">
                        <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                </div>

                {/* Toggle button when sidebar is closed */}
                {!isMobileOpen && (
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="fixed bottom-4 left-4 z-40 w-12 h-12 bg-[#F7B418] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-amber-500 transition-colors"
                        aria-label="Open sidebar"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                )}
            </>
        )
    }

    // Desktop Sidebar - Collapsible on hover
    return (
        <div
            className={cn(
                "fixed left-0 top-0 flex h-screen flex-col border-r bg-white transition-all duration-300 overflow-hidden z-50",
                isCollapsed ? "w-16" : "w-64",
                className
            )}
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
        >
            {/* User Profile Section */}
            <div className={cn("flex items-center gap-3 p-4 border-b", isCollapsed && "justify-center")}>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-blue-500 text-white">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className={cn("flex flex-col overflow-hidden transition-all duration-200", isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
                    <span className="truncate text-sm font-semibold text-gray-900">
                        {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="truncate text-xs text-gray-500">{user?.email}</span>
                </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid gap-1 px-3">
                    {sidebarItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all",
                                pathname.startsWith(item.href)
                                    ? "bg-amber-400 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100",
                                isCollapsed ? "justify-center px-0" : ""
                            )}
                            title={isCollapsed ? item.title : undefined}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span className={cn("whitespace-nowrap transition-opacity duration-200", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>{item.title}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Logout Button */}
            <div className="p-3 border-t">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full gap-3 text-red-500 hover:text-red-600 hover:bg-red-50",
                        isCollapsed ? "justify-center px-0" : "justify-start"
                    )}
                    onClick={handleLogout}
                    title={isCollapsed ? "Đăng xuất" : undefined}
                >
                    <LogOut className="h-5 w-5" />
                    <span className={cn("transition-opacity duration-200", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>Đăng xuất</span>
                </Button>
            </div>
        </div>
    )
}
