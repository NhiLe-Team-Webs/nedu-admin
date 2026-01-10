'use client';

import { useState, useEffect, useRef } from 'react';
import type { Course, Mentor } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, User } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { uploadImage } from '@/lib/supabase/storage';
import { createClient } from '@/lib/supabase/client';

interface CourseInstructorFormProps {
    course: Course;
    onUpdate: () => void;
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
}

export const CourseInstructorForm = ({ course, onUpdate, isEditing, setIsEditing }: CourseInstructorFormProps) => {
    const { toast } = useToast();
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
        fetchInstructor();
    }, [course.id]);

    const fetchInstructor = async () => {
        const supabase = createClient();

        // Reset state
        const empty = { id: undefined, name: '', role: '', bio: '', avatarUrl: '' };
        setInstructor(empty);
        setInitialInstructor(empty);
        setAvatarPreview(null);

        // 1. Get mentor ID from program_mentor junction table
        const { data: junctionData } = await supabase
            .from('program_mentor')
            .select('mentor_id')
            .eq('program_id', course.id);

        if (junctionData && junctionData.length > 0) {
            const mentorId = junctionData[0].mentor_id;

            // 2. Fetch mentor details from single mentor table
            const { data: mentorData } = await supabase
                .from('mentor')
                .select('*')
                .eq('id', mentorId)
                .single();

            if (mentorData) {
                const mappedInstructor = {
                    id: String(mentorData.id),
                    name: mentorData.name || '',
                    role: mentorData.role || '',
                    bio: mentorData.bio || '',
                    avatarUrl: mentorData.avatar_url || ''
                };
                setInstructor(mappedInstructor);
                setInitialInstructor(mappedInstructor);
                setAvatarPreview(mappedInstructor.avatarUrl);
            }
        }
    };

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
                // Store the file to upload later during handleSave
                (instructor as any)._pendingAvatarFile = file;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        const supabase = createClient();
        try {
            let avatarUrl = instructor.avatarUrl;

            // 1. Upload avatar if there's a pending file
            if ((instructor as any)._pendingAvatarFile) {
                avatarUrl = await uploadImage((instructor as any)._pendingAvatarFile, 'mentors/avatars');
            }

            let mentorId = instructor.id;

            // Simple CREATE or UPDATE logic
            if (mentorId && !mentorId.startsWith('ins-')) {
                // UPDATE
                const { error: mentorError } = await supabase
                    .from('mentor')
                    .update({
                        name: instructor.name,
                        role: instructor.role,
                        bio: instructor.bio,
                        avatar_url: avatarUrl,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', mentorId);

                if (mentorError) throw mentorError;
            } else {
                // CREATE
                const { data: newMentor, error: mentorError } = await supabase
                    .from('mentor')
                    .insert({
                        name: instructor.name,
                        role: instructor.role,
                        bio: instructor.bio,
                        avatar_url: avatarUrl,
                        status: 1
                    })
                    .select()
                    .single();

                if (mentorError) throw mentorError;
                mentorId = String(newMentor.id);

                // Link to course
                await supabase
                    .from('program_mentor')
                    .insert({
                        program_id: Number(course.id),
                        mentor_id: Number(mentorId)
                    });
            }

            const updatedInstructor = { ...instructor, id: mentorId, avatarUrl };
            delete (updatedInstructor as any)._pendingAvatarFile;

            toast({ title: 'Thành công', description: 'Đã cập nhật thông tin người dẫn đường.' });
            setInstructor(updatedInstructor);
            setInitialInstructor(updatedInstructor);
            setIsEditing(false);
            onUpdate();
        } catch (error: any) {
            console.error('Error saving mentor:', error);
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể cập nhật thông tin người dẫn đường.' });
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
        <div className="space-y-6">
            <div className="flex flex-col items-center gap-8">
                {/* Avatar Section - Centered */}
                <div className="relative group">
                    <Avatar className="h-24 w-24 border-2 border-dashed border-primary/30 bg-muted overflow-hidden">
                        {avatarPreview ? (
                            <AvatarImage src={avatarPreview} alt={instructor.name} className="object-cover" />
                        ) : (
                            <AvatarFallback className="bg-transparent">
                                <User className="h-10 w-10 text-muted-foreground" />
                            </AvatarFallback>
                        )}
                    </Avatar>

                    {isEditing && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                        >
                            <Upload className="h-8 w-8" />
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

                {/* Info Section - Full Width */}
                <div className="w-full space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="name" className="uppercase text-xs font-bold text-foreground/70">TÊN</Label>
                        <Input
                            id="name"
                            name="name"
                            value={instructor.name || ''}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            disabled={isSubmitting}
                            placeholder="Nhập tên khách hàng..."
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="role" className="uppercase text-xs font-bold text-foreground/70">LĨNH VỰC</Label>
                        <Input
                            id="role"
                            name="role"
                            value={instructor.role || ''}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            disabled={isSubmitting}
                            placeholder="Nhập lĩnh vực..."
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="bio" className="uppercase text-xs font-bold text-foreground/70">MÔ TẢ</Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            value={instructor.bio || ''}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            disabled={isSubmitting}
                            rows={5}
                            placeholder="Nhập mô tả hoặc ghi chú về khách hàng..."
                            className="resize-none"
                        />
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t pt-4">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto rounded-xl"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-[#F7B418] hover:bg-[#e5a616] text-gray-900 font-medium rounded-xl"
                    >
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Cập nhật
                    </Button>
                </div>
            )}
        </div>
    );
};

