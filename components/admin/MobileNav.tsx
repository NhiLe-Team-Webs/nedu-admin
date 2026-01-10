'use client';

import { ChevronRight, LogOut, BookOpen, KeyRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';

const menuItems = [
    { view: 'courses', icon: <BookOpen />, label: 'Khóa Học', href: '/courses' },
    { view: 'permissions', icon: <KeyRound />, label: 'Phân Quyền', href: '/permissions' },
];

interface MobileNavProps {
    user: User | null;
    onMenuClick: (href: string) => void;
    onLogout: () => void;
}

export function MobileNav({ user, onMenuClick, onLogout }: MobileNavProps) {
    return (
        <div className="bg-background min-h-screen flex flex-col">
            <div className="p-4 pt-6 flex-grow">
                <div className="flex items-center gap-4 mb-8">
                    <Avatar className="h-10 w-10">
                        {user?.user_metadata?.avatar_url && (
                            <AvatarImage src={user.user_metadata.avatar_url} alt="Admin" />
                        )}
                        <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{user?.user_metadata?.name || 'Admin User'}</p>
                        <p className="text-sm text-muted-foreground">{user?.email || 'admin@example.com'}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    {menuItems.map(item => (
                        <button
                            key={item.view}
                            onClick={() => onMenuClick(item.href)}
                            className="w-full text-left p-4 rounded-lg hover:bg-accent flex justify-between items-center transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-primary">{item.icon}</div>
                                <span className="font-medium">{item.label}</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-4">
                <Button
                    variant="ghost"
                    onClick={onLogout}
                    className="w-full justify-start p-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    <LogOut className="mr-4" />
                    Đăng xuất
                </Button>
            </div>
        </div>
    );
}
