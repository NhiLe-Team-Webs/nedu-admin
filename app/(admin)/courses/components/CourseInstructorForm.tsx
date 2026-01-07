'use client';

import { useState, useEffect, useRef } from 'react';
import type { Course, Mentor } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, Check, Upload, Camera } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export const CourseInstructorForm = ({ course, onUpdate }: { course: Course; onUpdate: () => void; }) => {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // For demo, we'll manage the first instructor or a new one
    const [instructor, setInstructor] = useState<Partial<Mentor>>({
        name: '',
        role: '',
        bio: '',
        avatarUrl: ''
    });

    const [initialInstructor, setInitialInstructor] = useState<Partial<Mentor>>({});
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        // Mock loading instructor data
        const loadInstructor = () => {
            const mockInstructor = {
                id: 'ins-1',
                name: 'Nhi Le',
                role: 'Cố vấn tâm lý & Doanh nhân',
                bio: 'Nhi Le đồng hành cùng nhiều người Việt trong hành trình hiểu bản thân, xây dựng nội lực và tạo ra thay đổi bền vững.',
                avatarUrl: 'https://github.com/shadcn.png'
            };
            setInstructor(mockInstructor);
            setInitialInstructor(mockInstructor);
            setAvatarPreview(mockInstructor.avatarUrl);
        };
        loadInstructor();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInstructor(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setAvatarPreview(result);
                setInstructor(prev => ({ ...prev, avatarUrl: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            // Simulate API Call
            await new Promise(resolve => setTimeout(resolve, 800));

            toast({ title: 'Thành công', description: 'Đã cập nhật thông tin người dẫn đường.' });
            setInitialInstructor(instructor);
            setIsEditing(false);
            onUpdate();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể cập nhật.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setInstructor(initialInstructor);
        setAvatarPreview(initialInstructor.avatarUrl || null);
        setIsEditing(false);
    };

    return (
        <Card className="relative overflow-hidden">
            <CardContent className="pt-8">
                {!isEditing && (
                    <div className="absolute inset-0 bg-gray-100/70 dark:bg-gray-900/70 z-10 flex items-center justify-center rounded-lg">
                        <Button size="lg" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </Button>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar Section */}
                    <div className="w-full md:w-auto flex flex-col items-center gap-4">
                        <div className="relative group">
                            <Avatar className="h-40 w-40 border-4 border-background shadow-xl">
                                <AvatarImage src={avatarPreview || ''} alt={instructor.name} className="object-cover" />
                                <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                    {instructor.name?.charAt(0) || 'I'}
                                </AvatarFallback>
                            </Avatar>

                            {isEditing && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                                >
                                    <Camera className="h-8 w-8 mb-1" />
                                    <span className="text-xs font-medium">Thay đổi ảnh</span>
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Ảnh đại diện</p>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 space-y-6 w-full">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="uppercase text-xs font-bold">Họ và tên</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={instructor.name || ''}
                                        onChange={handleInputChange}
                                        readOnly={!isEditing}
                                        placeholder="Nhập họ tên người dẫn đường..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role" className="uppercase text-xs font-bold">Lĩnh vực hoạt động</Label>
                                    <Input
                                        id="role"
                                        name="role"
                                        value={instructor.role || ''}
                                        onChange={handleInputChange}
                                        readOnly={!isEditing}
                                        placeholder="VD: Doanh nhân, Chuyên gia tâm lý..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio" className="uppercase text-xs font-bold">Tiểu sử / Giới thiệu</Label>
                                <Textarea
                                    id="bio"
                                    name="bio"
                                    value={instructor.bio || ''}
                                    onChange={handleInputChange}
                                    readOnly={!isEditing}
                                    rows={5}
                                    placeholder="Nhập thông tin giới thiệu chi tiết..."
                                    className="resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>

            {isEditing && (
                <CardFooter className="justify-end gap-2 border-t pt-4">
                    <Button variant="ghost" onClick={handleCancel} disabled={isSubmitting}>Hủy</Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Cập nhật
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};

export default CourseInstructorForm;
