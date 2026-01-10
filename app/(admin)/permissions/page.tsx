'use client'

import { useState, useEffect } from 'react'
import { PanelLeft, CirclePlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

type UserRole = 'admin' | 'owner'

interface UserPermission {
    id: string
    email: string
    full_name: string | null
    role: string
    is_active: boolean
    created_at: string
    updated_at: string
}

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

const PermissionForm = ({
    onAddUser,
    onCancel,
    isMobile,
    isSubmitting,
    submitError,
    currentUserRole,
}: {
    onAddUser: (email: string, role: UserRole) => void
    onCancel: () => void
    isMobile: boolean
    isSubmitting?: boolean
    submitError?: string | null
    currentUserRole?: string | null
}) => {
    const [newUserEmail, setNewUserEmail] = useState('')
    const [newUserRole, setNewUserRole] = useState<UserRole>('admin')

    const handleAddClick = () => {
        onAddUser(newUserEmail, newUserRole)
    }

    return (
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="user-email">Email</Label>
                <Input
                    id="user-email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="example@email.com"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="user-role">VAI TRÒ</Label>
                <Select value={newUserRole} onValueChange={(value: UserRole) => setNewUserRole(value)}>
                    <SelectTrigger id="user-role">
                        <SelectValue placeholder="Chọn quyền" />
                    </SelectTrigger>
                    <SelectContent>
                        {currentUserRole === 'owner' && (
                            <SelectItem value="owner">Owner</SelectItem>
                        )}
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {submitError && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {submitError}
                </div>
            )}
            <div className={cn('flex', isMobile ? 'flex-col-reverse gap-2' : 'justify-end gap-2')}>
                <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                    Hủy
                </Button>
                <Button
                    onClick={handleAddClick}
                    disabled={!isValidEmail(newUserEmail) || isSubmitting}
                    className="bg-[#F7B418] hover:bg-[#e5a616] text-gray-900 font-medium"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang thêm...
                        </>
                    ) : (
                        'Xác nhận'
                    )}
                </Button>

            </div>
        </div>
    )
}

export default function PermissionsPage() {
    const [users, setUsers] = useState<UserPermission[]>([])
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [userToRemove, setUserToRemove] = useState<UserPermission | null>(null)
    const [view, setView] = useState<'list' | 'form'>('list')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)

    // Pagination state
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [totalUsers, setTotalUsers] = useState(0)

    const isMobile = useIsMobile()

    // Fetch admins from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                setError(null)

                // Fetch current user role if not already loaded
                if (!currentUserRole) {
                    const meResponse = await fetch('/api/admin/me')
                    if (meResponse.ok) {
                        const meData = await meResponse.json()
                        if (meData.success) {
                            setCurrentUserRole(meData.data.role)
                        }
                    }
                }

                // Fetch admin list with pagination
                const response = await fetch(`/api/admin?page=${page}&limit=${limit}`)
                if (!response.ok) {
                    throw new Error('Không thể tải danh sách admin')
                }
                const data = await response.json()
                if (data.success) {
                    setUsers(data.data)
                    // Update pagination info
                    if (data.pagination) {
                        setTotalPages(data.pagination.totalPages)
                        setTotalUsers(data.pagination.total)
                    }
                } else {
                    throw new Error(data.error || 'Có lỗi xảy ra')
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra'
                setError(errorMessage)
                toast.error('Không thể tải danh sách admin', {
                    description: errorMessage,
                })
                console.error('Error fetching admins:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [page, limit, currentUserRole])

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage)
        }
    }

    const handleRoleChange = async (userId: string, newRole: UserRole | 'Remove') => {
        if (newRole === 'Remove') {
            const user = users.find((u) => u.id === userId)
            if (user) {
                setUserToRemove(user)
            }
            return
        }

        // Check if current user is owner
        if (currentUserRole !== 'owner') {
            toast.error('Không có quyền', {
                description: 'Chỉ owner mới có thể thay đổi vai trò',
            })
            return
        }

        try {
            const response = await fetch('/api/admin', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: userId,
                    role: newRole,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Không thể cập nhật vai trò')
            }

            // Update local state
            setUsers(users.map((user) => (user.id === userId ? data.data : user)))

            toast.success('Đã cập nhật vai trò thành công', {
                description: `Email: ${data.data.email}`,
            })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra'
            toast.error('Cập nhật vai trò thất bại', {
                description: errorMessage,
            })
            console.error('Error updating role:', err)
        }
    }

    const confirmRemoveUser = async () => {
        if (!userToRemove) return

        // Check if current user is owner
        if (currentUserRole !== 'owner') {
            toast.error('Không có quyền', {
                description: 'Chỉ owner mới có thể xóa người dùng',
            })
            setUserToRemove(null)
            return
        }

        try {
            const response = await fetch(`/api/admin?id=${userToRemove.id}`, {
                method: 'DELETE',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Không thể xóa người dùng')
            }

            // Remove from local state and update total
            setUsers(users.filter((user) => user.id !== userToRemove.id))
            setTotalUsers(prev => Math.max(0, prev - 1))
            setUserToRemove(null)

            toast.success('Đã xóa người dùng thành công', {
                description: `Email: ${userToRemove.email}`,
            })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra'
            toast.error('Xóa người dùng thất bại', {
                description: errorMessage,
            })
            console.error('Error deleting user:', err)
            setUserToRemove(null)
        }
    }

    const handleAddUser = async (newUserEmail: string, newUserRole: UserRole) => {
        if (!isValidEmail(newUserEmail)) {
            setSubmitError('Email không hợp lệ')
            return
        }

        setIsSubmitting(true)
        setSubmitError(null)

        try {
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: newUserEmail,
                    role: newUserRole,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Không thể thêm admin')
            }

            // Add new admin to the list
            // If on the first page, add to top. Otherwise just refresh logic or let user know
            if (page === 1) {
                setUsers([data.data, ...users].slice(0, limit))
            }
            setTotalUsers(prev => prev + 1)
            // Ideally we might want to re-fetch to ensure consistency, but this is a simple update

            // Close dialog/form
            if (isMobile) {
                setView('list')
            } else {
                setIsCreateDialogOpen(false)
            }

            // Show success message with toast
            toast.success(data.message || 'Đã thêm admin thành công', {
                description: `Email: ${data.data.email}`,
                duration: 3000,
            })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra'
            setSubmitError(errorMessage)
            console.error('Error adding admin:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Mobile form view
    if (isMobile && view === 'form') {
        return (
            <div className="space-y-4">
                <Card className="rounded-xl shadow-sm border">
                    <CardContent className="pt-6 pb-4">
                        <h2 className="text-xl font-bold mb-4 text-primary uppercase">Thêm quản trị viên</h2>
                        <PermissionForm
                            onAddUser={handleAddUser}
                            onCancel={() => setView('list')}
                            isMobile={true}
                            isSubmitting={isSubmitting}
                            submitError={submitError}
                            currentUserRole={currentUserRole}
                        />
                    </CardContent>
                </Card>
            </div>
        )
    }


    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <h1 className={cn(
                    "font-bold uppercase",
                    isMobile ? "text-xl" : "text-2xl"
                )}>PHÂN QUYỀN</h1>
                {isMobile ? (
                    <Button
                        onClick={() => setView('form')}
                        className="bg-[#F7B418] hover:bg-[#e5a616] text-gray-900 font-medium rounded-xl h-10 px-4"
                    >
                        <CirclePlus className="mr-2 h-4 w-4" />
                        Thêm
                    </Button>

                ) : (
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#F7B418] hover:bg-[#e5a616] text-gray-900 font-medium">
                                <CirclePlus className="mr-2 h-4 w-4" />
                                Thêm
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="rounded-xl">
                            <DialogHeader>
                                <DialogTitle className="text-primary uppercase">Thêm quản trị viên</DialogTitle>
                            </DialogHeader>
                            <PermissionForm
                                onAddUser={handleAddUser}
                                onCancel={() => setIsCreateDialogOpen(false)}
                                isMobile={false}
                                isSubmitting={isSubmitting}
                                submitError={submitError}
                                currentUserRole={currentUserRole}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Permissions Table */}
            <Card className={cn(isMobile ? "rounded-xl" : "rounded-lg")}>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-10 w-[200px]" />
                                <Skeleton className="h-10 w-[100px]" />
                            </div>
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-destructive font-medium">{error}</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => window.location.reload()}
                            >
                                Thử lại
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="uppercase">EMAIL</TableHead>
                                        <TableHead className="w-[150px] uppercase">VAI TRÒ</TableHead>
                                    </TableRow>

                                </TableHeader>
                                <TableBody>
                                    {users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                                                Chưa có admin nào
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.email}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={user.role}
                                                        onValueChange={(value: UserRole | 'Remove') =>
                                                            handleRoleChange(user.id, value)
                                                        }
                                                        disabled={currentUserRole !== 'owner'}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Chọn quyền" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="owner">Owner</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                            {currentUserRole === 'owner' && (
                                                                <SelectItem
                                                                    value="Remove"
                                                                    className="text-destructive-foreground bg-destructive hover:bg-destructive/90 focus:bg-destructive focus:text-destructive-foreground"
                                                                >
                                                                    Gỡ
                                                                </SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-end space-x-2 py-4">
                                    <div className="flex-1 text-sm text-muted-foreground">
                                        Trang {page} / {totalPages}
                                    </div>
                                    <div className="space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 1}
                                        >
                                            Trước
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page === totalPages}
                                        >
                                            Sau
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Remove User Confirmation Dialog */}
            <AlertDialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
                <AlertDialogContent className="rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận gỡ bỏ</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn gỡ quyền quản trị của người dùng{' '}
                            <span className="font-medium">{userToRemove?.email}</span>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className={cn(isMobile && "flex-col-reverse gap-2")}>
                        <AlertDialogCancel onClick={() => setUserToRemove(null)}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRemoveUser}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Xác nhận
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )


}
