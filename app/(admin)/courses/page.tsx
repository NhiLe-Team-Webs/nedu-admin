"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Course } from "@/types/admin"


// Danh sách các COURSE_ID cần hiển thị
const COURSE_IDS = [82, 57, 54]; // 82: Thử Thách 30 Ngày, 57: Là Chính Mình, 54: Cuộc Sống Của Bạn


export default function CoursesPage() {
    const router = useRouter();
    const isMobile = useIsMobile();
    const supabase = createClient();

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const { data: programData, error } = await supabase
                .from('program')
                .select('id, program_name, highlight_program')
                .in('id', COURSE_IDS);

            if (error) {
                console.error('Error fetching programs:', error);
            }

            if (programData) {
                setCourses(programData.map((item: any) => ({
                    id: String(item.id),
                    title: item.program_name,
                    isFeatured: item.highlight_program === 1,
                })));
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCourse = (id: string) => {
        let slug = '';
        if (id === '82') slug = 'thu-thach-30-ngay';
        else if (id === '57') slug = 'la-chinh-minh';
        else if (id === '54') slug = 'cuoc-song-cua-ban';
        else slug = id;
        router.push(`/courses/${slug}/information`);
    };

    const handleToggleFeatured = async (e: React.MouseEvent, id: string, isFeatured: boolean) => {
        e.stopPropagation();
        const newValue = !isFeatured;
        const { error } = await supabase
            .from('program')
            .update({ highlight_program: newValue ? 1 : 0 })
            .eq('id', id);

        if (!error) {
            setCourses(prev => prev.map(c => c.id === id ? { ...c, isFeatured: newValue } : c));
        }
    };

    return (
        <div className="space-y-6">
            {/* Course Rows */}
            {loading ? (
                <div className="px-5 py-5">
                    <Skeleton className="h-6 w-48" />
                </div>
            ) : courses.length > 0 ? (
                courses.map((course) => (
                    <button
                        key={course.id}
                        onClick={() => handleSelectCourse(course.id)}
                        className="w-full grid grid-cols-[1fr_auto] items-center px-5 py-5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                    >
                        <span className="text-base font-medium text-gray-900">
                            {course.title}
                        </span>
                        <button
                            onClick={e => handleToggleFeatured(e, course.id, course.isFeatured ?? false)}
                            className="p-1"
                        >
                            <Star className={cn(
                                "h-5 w-5 transition-colors",
                                course.isFeatured
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                            )} />
                        </button>
                    </button>
                ))
            ) : (
                <div className="px-5 py-5 text-gray-400">Không có khóa học nào</div>
            )}
        </div>
    );
}
