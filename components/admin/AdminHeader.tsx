"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/ui/sidebar"
import Link from "next/link"
import { BookOpen, Building, FileText, KeyRound, LayoutDashboard, Settings, Ticket, Users } from "lucide-react"

export function AdminHeader() {
    const isMobile = useIsMobile()

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            {isMobile && (
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r w-64">
                        <MobileSidebarContent />
                    </SheetContent>
                </Sheet>
            )}

            <div className="flex w-full items-center gap-4 md:ml-auto md:justify-end">
                <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="https://github.com/shadcn.png" alt="@admin" />
                                    <AvatarFallback>AD</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">Admin User</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        admin@nedu.com
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                Support
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/login">Log out</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}

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

function MobileSidebarContent() {
    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex h-16 items-center border-b px-6 font-semibold">
                <Building className="mr-2 h-6 w-6" />
                <span>N-edu Admin</span>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-4">
                    {sidebarItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    )
}
