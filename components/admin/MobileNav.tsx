'use client';

import { ChevronRight, LogOut, BookOpen, KeyRound, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';

const menuItems = [
    { view: 'courses', icon: <BookOpen className="h-5 w-5" />, label: 'Khóa Học', href: '/courses' },
    { view: 'permissions', icon: <KeyRound className="h-5 w-5" />, label: 'Phân Quyền', href: '/permissions' },
];

interface MobileNavProps {
    user: User | null;
    onMenuClick: (href: string) => void;
    onLogout: () => void;
}

export function MobileNav({ user, onMenuClick, onLogout }: MobileNavProps) {
    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="flex justify-end items-center h-16 px-4 border-b flex-shrink-0">
                <div className="w-9 h-9" /> {/* Placeholder for alignment */}
            </div>

            {/* User Info */}
            <div className="px-6 py-8 border-b">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                        {user?.user_metadata?.avatar_url && (
                            <AvatarImage src={user.user_metadata.avatar_url} alt="Admin" />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {user?.email?.charAt(0).toUpperCase() || 'A'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-gray-900 text-lg">
                            {user?.user_metadata?.name || 'Admin User'}
                        </p>
                        <p className="text-sm text-gray-500">
                            {user?.email || 'admin@example.com'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-auto px-4 py-6">
                <nav className="space-y-2">
                    {menuItems.map(item => (
                        <button
                            key={item.view}
                            onClick={() => onMenuClick(item.href)}
                            className={cn(
                                "w-full text-left p-4 rounded-xl",
                                "flex justify-between items-center",
                                "transition-all duration-200 ease-out",
                                "hover:bg-primary/5 active:bg-primary/10 active:scale-[0.98]",
                                "group"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-gray-600 group-hover:text-primary transition-colors">
                                    {item.icon}
                                </div>
                                <span className="text-lg font-medium text-gray-700 group-hover:text-gray-900">
                                    {item.label}
                                </span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </button>
                    ))}
                </nav>
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t bg-gray-50">
                <Button
                    variant="ghost"
                    onClick={onLogout}
                    className={cn(
                        "w-full justify-start p-4 h-auto",
                        "text-red-600 hover:text-red-700",
                        "hover:bg-red-50 active:bg-red-100",
                        "rounded-xl transition-all duration-200"
                    )}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    <span className="font-medium">Đăng xuất</span>
                </Button>
            </div>
        </div>
    );
}
