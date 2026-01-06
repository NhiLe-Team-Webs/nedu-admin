"use client"

import { BookOpen, Building, LogOut, FileText, KeyRound, Settings, Ticket, Users } from "lucide-react"
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
    { title: "Mentor", icon: Users, href: "/mentors" },
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

    if (isMobile) return null

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
