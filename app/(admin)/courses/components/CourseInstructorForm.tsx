'use client';

import { useState, useEffect } from 'react';
import type { Course, Mentor } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, Check } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export const CourseInstructorForm = ({ course, onUpdate }: { course: Course; onUpdate: () => void; }) => {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [allMentors, setAllMentors] = useState<Mentor[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [initialSelectedIds, setInitialSelectedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [course.id]);

    const fetchData = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            // 1. Fetch all mentors
            const { data: mentorsData, error: mentorsError } = await supabase.from('mentor').select('*').order('created_at', { ascending: false });
            if (mentorsError) throw mentorsError;

            const mappedMentors: Mentor[] = (mentorsData || []).map((m: any) => ({
                id: String(m.id),
                name: m.name,
                role: m.role,
                bio: m.bio,
                avatarUrl: m.avatar_url,
                createdAt: m.created_at
            }));
            setAllMentors(mappedMentors);

            // 2. Fetch selected mentors
            const { data: relations, error: relError } = await supabase.from('program_mentor').select('mentor_id').eq('program_id', course.id);
            if (relError) throw relError;

            const currentIds = (relations || []).map((r: any) => String(r.mentor_id));

            setSelectedIds(currentIds);
            setInitialSelectedIds(currentIds);
        } catch (error) {
            console.error('Error fetching mentors:', error);
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải danh sách mentor.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = (id: string, checked: boolean) => {
        if (!isEditing) return;
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        const supabase = createClient();

        try {
            // Delete old relations
            await supabase.from('program_mentor').delete().eq('program_id', course.id);

            // Insert new relations
            if (selectedIds.length > 0) {
                const toInsert = selectedIds.map(mid => ({
                    program_id: Number(course.id),
                    mentor_id: Number(mid)
                }));
                const { error } = await supabase.from('program_mentor').insert(toInsert);
                if (error) throw error;
            }

            toast({ title: 'Thành công', description: 'Đã cập nhật danh sách người dẫn đường.' });
            setInitialSelectedIds(selectedIds);
            setIsEditing(false);
            onUpdate();
        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể cập nhật.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setSelectedIds(initialSelectedIds);
        setIsEditing(false);
    };

    if (isLoading) {
        return <div className="p-6"><Skeleton className="h-40 w-full" /></div>;
    }

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

                <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", !isEditing && "opacity-50 pointer-events-none")}>
                    {allMentors.length === 0 && <p className="text-muted-foreground border p-4 rounded text-center col-span-full">Chưa có mentor nào.</p>}
                    {allMentors.map(mentor => (
                        <div
                            key={mentor.id}
                            onClick={() => handleToggle(mentor.id, !selectedIds.includes(mentor.id))}
                            className={cn(
                                "flex items-center space-x-3 rounded-md border p-4 transition-colors cursor-pointer hover:bg-muted/50",
                                selectedIds.includes(mentor.id) ? "bg-primary/10 border-primary" : "bg-card"
                            )}
                        >
                            <Checkbox
                                id={`mentor-${mentor.id}`}
                                checked={selectedIds.includes(mentor.id)}
                                onCheckedChange={(checked) => handleToggle(mentor.id, !!checked)}
                                disabled={!isEditing}
                                className="pointer-events-none" // handled by parent div
                            />
                            <div className="flex-1 flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={mentor.avatarUrl} alt={mentor.name} />
                                    <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm leading-none">{mentor.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{mentor.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
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
