'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { Course } from '@/types/admin';
import { CourseInfoDisplay } from '../components/CourseInfoDisplay';
import { CourseEditForm } from '../components/CourseEditForm';

// Fixed course ID for "Thử thách 30 ngày"
const COURSE_ID = 82;

export default function CourseInformationPage() {
    const isMobile = useIsMobile();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const fetchCourse = useCallback(async () => {
        const supabase = createClient();

        const { data: programData, error } = await supabase
            .from('program')
            .select(`
                id,
                program_name,
                program_price,
                program_type,
                image,
                banner,
                hashtag,
                total_sessions,
                start_date,
                end_date,
                link_payment,
                course,
                status,
                highlight_program
            `)
            .eq('id', COURSE_ID)
            .single();

        if (error) {
            console.error('Error fetching course:', error);
        }

        if (programData) {
            const { data: descData } = await supabase
                .from('program_description')
                .select('short_description, topic, format')
                .eq('program_id', programData.id)
                .eq('lang_id', 1)
                .single();

            const { data: challengeData } = await supabase
                .from('program_30day_challenge')
                .select('membership_price')
                .eq('program_id', programData.id)
                .single();

            setCourse({
                id: String(programData.id),
                title: programData.program_name || '',
                shortDescription: descData?.short_description || '',
                fee: programData.program_price || 0,
                membershipFee: challengeData?.membership_price,
                thumbnailUrl: programData.image || '',
                thumbnailUrl_9_16: programData.banner || '',
                topic: programData.hashtag || descData?.topic || '',
                format: descData?.format || '',
                schedule: programData.total_sessions || '',
                startDate: programData.start_date ? new Date(programData.start_date) : undefined,
                endDate: programData.end_date ? new Date(programData.end_date) : undefined,
                location: programData.link_payment || '',
                studentCount: programData.course || 0,
                type: 'Membership',
                status: programData.status === 1 ? 'published' : 'draft',
                isFeatured: programData.highlight_program === 1,
            });
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    const handleUpdate = async (updatedCourse: Course) => {
        setCourse(updatedCourse);
        setIsEditing(false);
        await fetchCourse();
    };

    if (loading) {
        return (
            <Card className={cn(isMobile ? "rounded-xl" : "rounded-lg")}>
                <CardContent className="pt-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="h-16 bg-gray-200 rounded"></div>
                            <div className="h-16 bg-gray-200 rounded"></div>
                            <div className="h-16 bg-gray-200 rounded"></div>
                        </div>
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
                {isEditing ? (
                    <CourseEditForm
                        course={course}
                        onUpdate={handleUpdate}
                        onCancel={() => setIsEditing(false)}
                    />
                ) : (
                    <CourseInfoDisplay course={course} />
                )}
            </CardContent>
        </Card>
    );
}
