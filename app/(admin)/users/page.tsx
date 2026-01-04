"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MOCK_USERS } from "@/lib/mock-data"
import { Edit, MoreHorizontal, Plus, Search, Trash } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { formatDate } from "@/lib/utils"

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredUsers = MOCK_USERS.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">
                        Manage your users and their roles here.
                    </p>
                </div>
                <Link href="/users/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <CardTitle>All Users</CardTitle>
                        <div className="relative flex-1 md:max-w-sm ml-auto">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search users..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Avatar</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="hidden md:table-cell">Role</TableHead>
                                <TableHead className="hidden md:table-cell">Status</TableHead>
                                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                                                <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.fullName}</span>
                                                <span className="text-xs text-muted-foreground md:hidden">{user.email}</span>
                                                <span className="hidden md:inline text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant="outline" className={user.status === 'active' ? 'text-green-600 border-green-600' : ''}>
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {formatDate(new Date(user.createdAt))}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/users/${user.id}`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
