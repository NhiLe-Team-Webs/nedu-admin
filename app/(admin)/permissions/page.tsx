"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type UserRole = 'Owner' | 'Admin';

interface UserPermission {
    id: string;
    email: string;
    role: UserRole;
}

const mockUsers: UserPermission[] = [
    { id: '1', email: 'duyphan.nlt@gmail.com', role: 'Owner' },
    { id: '2', email: 'admin.user@example.com', role: 'Admin' },
    { id: '3', email: 'another.admin@example.com', role: 'Admin' },
];

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const PermissionForm = ({ onAddUser, onCancel, isMobile }: { onAddUser: (email: string, role: UserRole) => void, onCancel: () => void, isMobile: boolean }) => {
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserRole, setNewUserRole] = useState<UserRole>('Admin');

    const handleAddClick = () => {
        onAddUser(newUserEmail, newUserRole);
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
                        <SelectItem value="Owner">Owner</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className={cn("flex", isMobile ? "flex-col-reverse gap-2" : "justify-end gap-2")}>
                <Button variant="ghost" onClick={onCancel}>Hủy</Button>
                <Button onClick={handleAddClick} disabled={!isValidEmail(newUserEmail)}>Xác nhận</Button>
            </div>
        </div>
    )
}

export function PermissionsManager() {
    const [users, setUsers] = useState<UserPermission[]>(mockUsers);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [userToRemove, setUserToRemove] = useState<UserPermission | null>(null);
    const [view, setView] = useState<'list' | 'form'>('list');
    const isMobile = useIsMobile();


    const handleRoleChange = (userId: string, newRole: UserRole | 'Remove') => {
        if (newRole === 'Remove') {
            const user = users.find(u => u.id === userId);
            if (user) {
                setUserToRemove(user);
            }
        } else if (newRole === 'Owner') {
            setUsers(users.map(user => {
                if (user.id === userId) return { ...user, role: 'Owner' };
                if (user.role === 'Owner') return { ...user, role: 'Admin' };
                return user;
            }));
        } else {
            setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
        }
    };

    const confirmRemoveUser = () => {
        if (userToRemove) {
            setUsers(users.filter(user => user.id !== userToRemove.id));
            setUserToRemove(null);
        }
    };

    const handleAddUser = (newUserEmail: string, newUserRole: UserRole) => {
        if (!isValidEmail(newUserEmail)) return;

        let newUsersList = [...users];
        const newUser: UserPermission = {
            id: (Math.random() * 1000).toString(),
            email: newUserEmail,
            role: newUserRole
        }

        if (newUserRole === 'Owner') {
            newUsersList = newUsersList.map(user =>
                user.role === 'Owner' ? { ...user, role: 'Admin' } : user
            );
        }

        newUsersList.push(newUser);
        setUsers(newUsersList);

        if (isMobile) {
            setView('list');
        } else {
            setIsCreateDialogOpen(false);
        }
    }

    if (isMobile && view === 'form') {
        return (
            <div className="p-4">
                <Button variant="ghost" onClick={() => setView('list')} className="mb-4 pl-0 hover:bg-transparent">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại danh sách
                </Button>
                <Card>
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-bold mb-4 text-primary">THÊM QUẢN TRỊ VIÊN</h2>
                        <PermissionForm onAddUser={handleAddUser} onCancel={() => setView('list')} isMobile={true} />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-4 space-y-4 container mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">PHÂN QUYỀN</h1>
                {isMobile ? (
                    <Button onClick={() => setView('form')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Thêm
                    </Button>
                ) : (
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Thêm
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="text-primary">THÊM QUẢN TRỊ VIÊN</DialogTitle>
                            </DialogHeader>
                            <PermissionForm onAddUser={handleAddUser} onCancel={() => setIsCreateDialogOpen(false)} isMobile={false} />
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>EMAIL</TableHead>
                                <TableHead className="w-[150px]">VAI TRÒ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={user.role}
                                            onValueChange={(value: UserRole | 'Remove') => handleRoleChange(user.id, value)}
                                            disabled={user.role === 'Owner'}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn quyền" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Owner">Owner</SelectItem>
                                                <SelectItem value="Admin">Admin</SelectItem>
                                                <SelectItem
                                                    value="Remove"
                                                    className="text-destructive-foreground bg-destructive hover:bg-destructive/90 focus:bg-destructive focus:text-destructive-foreground"
                                                >
                                                    Gỡ
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận gỡ bỏ</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn gỡ quyền quản trị của người dùng <span className="font-medium">{userToRemove?.email}</span>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToRemove(null)}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRemoveUser}>Xác nhận</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function PermissionsPage() {
    return <PermissionsManager />
}
