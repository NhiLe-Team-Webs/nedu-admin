'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User, Loader2, Edit, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Course, FeaturedStudent } from '@/types/admin';

export const CustomerInfoPlaceholder = ({ course, onUpdate }: { course: Course; onUpdate: () => void }) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [description, setDescription] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (course.featuredStudent) {
            setName(course.featuredStudent.name);
            setRole(course.featuredStudent.role);
            setDescription(course.featuredStudent.description);
            setAvatarPreview(course.featuredStudent.avatarUrl || null);
        }
    }, [course.featuredStudent]);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const featuredStudent: FeaturedStudent = {
                name,
                role,
                description,
                avatarUrl: avatarPreview || undefined
            };

            const updatedCourse = { ...course, featuredStudent };

            localStorage.setItem(`nedu_course_${course.id}`, JSON.stringify(updatedCourse));

            const storedList = localStorage.getItem('nedu_courses_list');
            if (storedList) {
                const list = JSON.parse(storedList) as Course[];
                const updatedList = list.map(c => c.id === course.id ? updatedCourse : c);
                localStorage.setItem('nedu_courses_list', JSON.stringify(updatedList));
            }

            toast({ title: 'Thành công', description: 'Đã cập nhật thông tin học viên tiêu biểu.' });
            setIsEditing(false);
            onUpdate();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể cập nhật.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (course.featuredStudent) {
            setName(course.featuredStudent.name);
            setRole(course.featuredStudent.role);
            setDescription(course.featuredStudent.description);
            setAvatarPreview(course.featuredStudent.avatarUrl || null);
        } else {
            setName('');
            setRole('');
            setDescription('');
            setAvatarPreview(null);
        }
        setIsEditing(false);
    }

    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Thông tin học viên tiêu biểu</CardTitle>
                {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
                {!isEditing && !course.featuredStudent && (
                    <div className="absolute inset-0 bg-gray-100/70 dark:bg-gray-900/70 z-10 flex items-center justify-center rounded-lg">
                        <Button size="lg" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-5 w-5" />
                            Chỉnh sửa
                        </Button>
                    </div>
                )}
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-dashed bg-muted">
                        <Avatar className="h-full w-full">
                            {avatarPreview ? (
                                <AvatarImage src={avatarPreview} alt="Avatar Preview" />
                            ) : (
                                <AvatarFallback className="bg-transparent"><User className="h-10 w-10 text-muted-foreground" /></AvatarFallback>
                            )}
                        </Avatar>
                        {isEditing && (
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                                disabled={isSubmitting}
                            >
                                <Upload className="h-8 w-8" />
                            </button>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={avatarInputRef}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        className="hidden"
                        disabled={isSubmitting || !isEditing}
                    />
                    {!isEditing && !name && (
                        <p className="text-sm text-muted-foreground italic">Chưa có thông tin học viên tiêu biểu</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="space-y-2">
                        <Label htmlFor="featured-name" className="uppercase text-xs font-bold">Tên học viên</Label>
                        <Input
                            id="featured-name"
                            placeholder="Nhập tên học viên..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isSubmitting || !isEditing}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="featured-role" className="uppercase text-xs font-bold">Lĩnh vực / Nghề nghiệp</Label>
                        <Input
                            id="featured-role"
                            placeholder="Nhập lĩnh vực..."
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={isSubmitting || !isEditing}
                        />
                    </div>
                </div>

                <div className="space-y-2 text-left">
                    <Label htmlFor="featured-description" className="uppercase text-xs font-bold">Cảm nghĩ tiêu biểu</Label>
                    <Textarea
                        id="featured-description"
                        placeholder="Nhập mô tả hoặc ghi chú về khách hàng..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting || !isEditing}
                        rows={4}
                    />
                </div>

                {isEditing && (
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="ghost" onClick={handleCancel} disabled={isSubmitting}>
                            Hủy
                        </Button>
                        <Button onClick={handleSave} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            Cập nhật
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
