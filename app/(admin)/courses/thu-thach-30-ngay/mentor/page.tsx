'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { Course } from '@/types/admin';
import { CourseInstructorForm } from '../components/CourseInstructorForm';

// Fixed course ID for "Thử thách 30 ngày"
const COURSE_ID = 82;

export default function CourseMentorPage() {
    const isMobile = useIsMobile();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const fetchCourse = useCallback(async () => {
        const supabase = createClient();

        const { data: programData, error } = await supabase
            .from('program')
            .select('id, program_name, program_type')
            .eq('id', COURSE_ID)
            .single();

        if (error) {
            console.error('Error fetching course:', error);
        }

        if (programData) {
            setCourse({
                id: String(programData.id),
                title: programData.program_name || '',
                shortDescription: '',
                fee: 0,
                thumbnailUrl: '',
                topic: '',
                schedule: '',
                location: '',
                studentCount: 0,
                type: 'Membership',
                status: 'draft',
            });
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    const handleUpdate = () => {
        setIsEditing(false);
    };

    if (loading) {
        return (
            <Card className={cn(isMobile ? "rounded-xl" : "rounded-lg")}>
                <CardContent className="pt-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!course) {
        return (
            <Card className={cn(isMobile ? "rounded-xl" : "rounded-lg")}>
                <CardContent className="pt-6 text-center py-12">
                    <p className="text-muted-foreground">Không tìm thấy thông tin khóa học</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn(
            "border shadow-sm relative overflow-hidden",
            isMobile ? "rounded-xl" : "rounded-lg"
        )}>
            <CardContent className={cn(
                "relative",
                isMobile ? "p-4 pt-4" : "pt-6"
            )}>
                {/* Edit overlay */}
                {!isEditing && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <Button
                            size="lg"
                            onClick={() => setIsEditing(true)}
                            className="bg-[#F7B418] hover:bg-[#e5a616] text-gray-900 font-medium rounded-xl shadow-md px-6 py-3 h-auto"
                        >
                            <Edit className="mr-2 h-5 w-5" />
                            Chỉnh sửa
                        </Button>
                    </div>
                )}

                {/* Content */}
                <CourseInstructorForm
                    course={course}
                    onUpdate={handleUpdate}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                />
            </CardContent>
        </Card>
    );
}
