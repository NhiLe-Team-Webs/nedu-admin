"use client"

import * as React from "react"
import { BookOpen, KeyRound, LogOut } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import Link from "next/link"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const sidebarItems = [
    { title: "Khóa Học", icon: BookOpen, href: "/courses" },
    { title: "Phân Quyền", icon: KeyRound, href: "/permissions" },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = React.useState<User | null>(null)

    React.useEffect(() => {
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

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.name || 'Admin'} />
                        <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 transition-opacity duration-200 whitespace-nowrap">
                        <span className="text-sm font-semibold text-sidebar-foreground truncate">
                            {user?.user_metadata?.name || 'Admin User'}
                        </span>
                        <span className="text-xs text-sidebar-foreground/80 truncate">
                            {user?.email || 'admin@example.com'}
                        </span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {sidebarItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={pathname.startsWith(item.href)}
                            >
                                <Link href={item.href}>
                                    <item.icon />
                                    <span className="group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 transition-opacity duration-200 whitespace-nowrap">
                                        {item.title}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            tooltip="Đăng xuất"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                            <LogOut />
                            <span className="group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 transition-opacity duration-200 whitespace-nowrap">Đăng xuất</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
