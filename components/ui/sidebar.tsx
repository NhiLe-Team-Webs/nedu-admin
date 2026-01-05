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
    { title: "Dashboard", icon: Building, href: "/dashboard" },
    { title: "Users", icon: Users, href: "/users" },
    { title: "Courses", icon: BookOpen, href: "/courses" },
    { title: "Mentors", icon: Users, href: "/mentors" },
    { title: "Deals", icon: Ticket, href: "/deals" },
    { title: "Home Config", icon: Settings, href: "/home-config" },
    { title: "About", icon: FileText, href: "/about" },
    { title: "Permissions", icon: KeyRound, href: "/permissions" },
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
                "relative flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
                isCollapsed ? "w-16" : "w-64",
                className
            )}
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
        >
            <div className="flex h-16 items-center border-b px-4 justify-between overflow-hidden">
                <div className={cn("flex items-center gap-2 font-semibold transition-opacity duration-200", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                    <Building className="h-6 w-6" />
                    <span className="whitespace-nowrap">N-edu Admin</span>
                </div>
                {isCollapsed && <Building className="h-6 w-6 mx-auto" />}
            </div>

            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-2">
                    {sidebarItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                                pathname.startsWith(item.href) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent",
                                isCollapsed ? "justify-center px-0" : ""
                            )}
                            title={isCollapsed ? item.title : undefined}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className={cn("transition-opacity duration-200 whitespace-nowrap", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                                {item.title}
                            </span>
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="border-t p-4">
                <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback>{user?.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className={cn("flex flex-col overflow-hidden transition-all duration-200", isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
                        <span className="truncate text-sm font-medium">{user?.user_metadata?.name || user?.email?.split('@')[0]}</span>
                        <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-9 w-9 ml-auto shrink-0", isCollapsed && "hidden")}
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
