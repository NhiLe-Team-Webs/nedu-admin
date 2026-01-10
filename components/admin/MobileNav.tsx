'use client';

import { ChevronRight, LogOut, BookOpen, KeyRound, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';

const menuItems = [
    { view: 'courses', icon: BookOpen, label: 'Khóa Học', href: '/courses' },
    { view: 'permissions', icon: KeyRound, label: 'Phân Quyền', href: '/permissions' },
];

interface MobileNavProps {
    user: User | null;
    onMenuClick: (href: string) => void;
    onLogout: () => void;
    onClose?: () => void;
}

export function MobileNav({ user, onMenuClick, onLogout, onClose }: MobileNavProps) {
    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-left duration-200">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-11 w-11 bg-gray-100">
                        {user?.user_metadata?.avatar_url && (
                            <AvatarImage src={user.user_metadata.avatar_url} alt="Admin" />
                        )}
                        <AvatarFallback className="bg-gray-100 text-gray-600 font-medium text-base">
                            {user?.email?.charAt(0).toUpperCase() || 'A'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-gray-900 text-base">
                            {user?.user_metadata?.name || 'Admin User'}
                        </p>
                        <p className="text-sm text-gray-500">
                            {user?.email || 'admin@example.com'}
                        </p>
                    </div>
                </div>

                {/* Close Button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                )}
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-auto mt-2">
                <nav>
                    {menuItems.map(item => {
                        const IconComponent = item.icon;
                        return (
                            <button
                                key={item.view}
                                onClick={() => onMenuClick(item.href)}
                                className={cn(
                                    "w-full text-left px-5 py-4",
                                    "flex justify-between items-center",
                                    "transition-colors duration-150",
                                    "hover:bg-gray-50 active:bg-gray-100"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <IconComponent className="h-5 w-5 text-[#F7B418]" />
                                    <span className="text-base font-medium text-gray-800">
                                        {item.label}
                                    </span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Logout Button */}
            <div className="px-5 py-4 border-t border-gray-100">
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 py-2"
                >
                    <LogOut className="h-5 w-5 text-red-500" />
                    <span className="text-base font-medium text-red-500">Đăng xuất</span>
                </button>
            </div>
        </div>
    );
}
