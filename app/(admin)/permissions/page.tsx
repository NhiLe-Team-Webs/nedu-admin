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
    const isMobile = useIsMobile()

    // Fetch admins from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                setError(null)

                // Fetch current user role
                const meResponse = await fetch('/api/admin/me')
                if (meResponse.ok) {
                    const meData = await meResponse.json()
                    if (meData.success) {
                        setCurrentUserRole(meData.data.role)
                    }
                }

                // Fetch admin list
                const response = await fetch('/api/admin')
                if (!response.ok) {
                    throw new Error('Không thể tải danh sách admin')
                }
                const data = await response.json()
                if (data.success) {
                    setUsers(data.data)
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
    }, [])

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

            // Remove from local state
            setUsers(users.filter((user) => user.id !== userToRemove.id))
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
            setUsers([data.data, ...users])

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
            <div className="p-4">
                <Card>
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-bold mb-4 text-primary">THÊM QUẢN TRỊ VIÊN</h2>
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
        <div className="p-4">
            {/* Mobile Sidebar Trigger */}
            <div className="md:hidden mb-4">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                    <PanelLeft />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
            </div>

            <div className="space-y-4">
                {/* Page Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">PHÂN QUYỀN</h1>
                    {isMobile ? (
                        <Button onClick={() => setView('form')}>
                            <CirclePlus className="mr-2 h-4 w-4" />
                            Thêm
                        </Button>
                    ) : (
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <CirclePlus className="mr-2 h-4 w-4" />
                                    Thêm
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="text-primary">THÊM QUẢN TRỊ VIÊN</DialogTitle>
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
                <Card>
                    <CardContent className="pt-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="ml-2 text-muted-foreground">Đang tải danh sách admin...</span>
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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>EMAIL</TableHead>
                                        <TableHead className="w-[150px]">VAI TRÒ</TableHead>
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
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Remove User Confirmation Dialog */}
            <AlertDialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận gỡ bỏ</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn gỡ quyền quản trị của người dùng{' '}
                            <span className="font-medium">{userToRemove?.email}</span>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToRemove(null)}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRemoveUser}>Xác nhận</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
