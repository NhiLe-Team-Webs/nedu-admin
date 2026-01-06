'use client';

import { useState, useEffect } from 'react';
import type { Course, Mentor } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock Data for Mentors (shared with home-config/FeaturedMentorsForm.tsx)
const MOCK_MENTORS: Mentor[] = [
    {
        id: '1',
        name: 'Nguyễn Văn A',
        role: 'Senior Developer',
        bio: '10 năm kinh nghiệm trong ngành lập trình.',
        avatarUrl: 'https://github.com/shadcn.png',
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Trần Thị B',
        role: 'Product Manager',
        bio: 'Chuyên gia quản lý sản phẩm với nhiều dự án thành công.',
        avatarUrl: 'https://github.com/shadcn.png',
        createdAt: new Date().toISOString()
    },
    {
        id: '3',
        name: 'Lê Văn C',
        role: 'Data Scientist',
        bio: 'Chuyên gia về AI và Machine Learning.',
        avatarUrl: 'https://github.com/shadcn.png',
        createdAt: new Date().toISOString()
    }
];

export const CourseMentorsForm = ({ course, onUpdate }: { course: Course; onUpdate: () => void; }) => {
    const { toast } = useToast();
    const [allMentors, setAllMentors] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>(course.instructorIds || []);
    const [initialSelectedIds, setInitialSelectedIds] = useState<string[]>(course.instructorIds || []);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadMentors = async () => {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));
            setAllMentors(MOCK_MENTORS);
            setLoading(false);
        };
        loadMentors();
    }, []);

    useEffect(() => {
        const ids = course.instructorIds || [];
        setSelectedMentorIds(ids);
        setInitialSelectedIds(ids);
    }, [course.instructorIds]);

    const handleMentorSelect = (mentorId: string, isSelected: boolean) => {
        setSelectedMentorIds(prev =>
            isSelected ? [...prev, mentorId] : prev.filter(id => id !== mentorId)
        );
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            // Simulate API Call
            await new Promise(resolve => setTimeout(resolve, 800));

            // Sync with global course list and local course storage
            const updatedCourse = { ...course, instructorIds: selectedMentorIds };

            // 1. Update individual course storage
            localStorage.setItem(`nedu_course_${course.id}`, JSON.stringify(updatedCourse));

            // 2. Update global course list
            const storedList = localStorage.getItem('nedu_courses_list');
            if (storedList) {
                const list = JSON.parse(storedList) as Course[];
                const updatedList = list.map(c => c.id === course.id ? updatedCourse : c);
                localStorage.setItem('nedu_courses_list', JSON.stringify(updatedList));
            }

            toast({ title: 'Thành công', description: 'Đã cập nhật danh sách người dẫn đường.' });
            setInitialSelectedIds(selectedMentorIds);
            setIsEditing(false);
            onUpdate(); // Trigger parent refresh if needed
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể cập nhật.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setSelectedMentorIds(initialSelectedIds);
        setIsEditing(false);
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 rounded-md border p-4">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <Card>
            <CardContent className="pt-6 relative">
                {!isEditing && (
                    <div className="absolute inset-0 bg-gray-100/70 dark:bg-gray-900/70 z-10 flex items-center justify-center rounded-lg">
                        <Button size="lg" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </Button>
                    </div>
                )}
                <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", !isEditing && "pointer-events-none opacity-80")}>
                    {allMentors?.map(mentor => (
                        <div key={mentor.id} className="flex items-center space-x-3 rounded-md border p-4 has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
                            <Checkbox
                                id={`mentor-${mentor.id}`}
                                checked={selectedMentorIds.includes(mentor.id)}
                                onCheckedChange={(checked) => handleMentorSelect(mentor.id, !!checked)}
                                disabled={!isEditing || isSubmitting}
                            />
                            <label
                                htmlFor={`mentor-${mentor.id}`}
                                className={cn("flex items-center gap-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1", isEditing && "cursor-pointer")}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={mentor.avatarUrl} alt={mentor.name} />
                                    <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{mentor.name}</p>
                                    <p className="text-xs text-muted-foreground">{mentor.role}</p>
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
                {(!allMentors || allMentors.length === 0) && (
                    <p className="text-center text-muted-foreground py-8 font-medium">
                        Chưa có người dẫn đường nào được tạo. Vui lòng vào mục "Quản lý mentor" để thêm.
                    </p>
                )}
            </CardContent>
            {isEditing && (
                <CardFooter className="justify-end gap-2">
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

export default CourseMentorsForm;
