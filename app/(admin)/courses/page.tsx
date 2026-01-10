"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Course } from "@/types/admin"

// Only show course 82 (Thử thách 30 ngày)
const COURSE_ID = 82;

export default function CoursesPage() {
    const router = useRouter();
    const isMobile = useIsMobile();
    const supabase = createClient();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourse();
    }, []);

    const fetchCourse = async () => {
        setLoading(true);
        try {
            const { data: programData, error } = await supabase
                .from('program')
                .select('id, program_name, highlight_program')
                .eq('id', COURSE_ID)
                .single();

            if (error) {
                console.error('Error fetching program:', error);
            }

            if (programData) {
                setCourse({
                    id: String(programData.id),
                    title: programData.program_name || 'Thử thách 30 ngày',
                    isFeatured: programData.highlight_program === 1,
                } as Course);
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCourse = () => {
        router.push('/courses/thu-thach-30-ngay/information');
    };

    const handleToggleFeatured = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!course) return;

        const newValue = !course.isFeatured;
        const { error } = await supabase
            .from('program')
            .update({ highlight_program: newValue ? 1 : 0 })
            .eq('id', COURSE_ID);

        if (!error) {
            setCourse(prev => prev ? { ...prev, isFeatured: newValue } : null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <h1 className={cn(
                "font-bold uppercase text-[#F7B418]",
                isMobile ? "text-xl" : "text-2xl"
            )}>
                KHÓA HỌC
            </h1>

            {/* Course Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_auto] items-center px-5 py-3 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Tên khóa học
                    </span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Hành động
                    </span>
                </div>

                {/* Course Row */}
                {loading ? (
                    <div className="px-5 py-5">
                        <Skeleton className="h-6 w-48" />
                    </div>
                ) : course ? (
                    <button
                        onClick={handleSelectCourse}
                        className="w-full grid grid-cols-[1fr_auto] items-center px-5 py-5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                    >
                        <span className="text-base font-medium text-gray-900">
                            {course.title}
                        </span>
                        <button
                            onClick={handleToggleFeatured}
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
                ) : (
                    <div className="px-5 py-8 text-center text-gray-500">
                        Không tìm thấy khóa học
                    </div>
                )}
            </div>
        </div>
    )
}
