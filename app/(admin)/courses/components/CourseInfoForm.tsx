'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CourseInfoDisplay } from "./CourseInfoDisplay";
import { CourseEditForm } from "./CourseEditForm";
import type { Course } from "@/types/admin";

const MOCK_COURSE_DATA: Course = {
    id: "COURSE-001",
    title: "Khóa học Fullstack Next.js 14",
    shortDescription: "Học lập trình web từ cơ bản đến nâng cao với Next.js 14, TailwindCSS, và Supabase. Khóa học thực chiến với nhiều dự án hấp dẫn.",
    description: "Chi tiết khóa học sẽ được cập nhật sau...",
    fee: 1299000,
    membershipFee: 0,
    type: "Course",
    topic: "Lập trình Web",
    format: "Online",
    schedule: "Thứ 3-5-7 (19:30 - 21:30)",
    location: "Online",
    studentCount: 150,
    thumbnailUrl: "",
    thumbnailUrl_9_16: "",
    status: "published"
};

export const CourseInfoForm = ({ course: initialCourse, onUpdate }: { course: Course; onUpdate?: () => void }) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Course>(initialCourse);

    useEffect(() => {
        setFormData(initialCourse);
        setIsLoading(false);
    }, [initialCourse]);

    const handleUpdate = (updatedCourse: Course) => {
        setFormData(updatedCourse);
        setIsEditing(false);
        if (onUpdate) onUpdate();
    };

    const handleCancel = () => {
        setFormData(initialCourse);
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <Card className="relative overflow-hidden">
                <CardContent className="pt-6 space-y-6">
                    {/* ID skeleton */}
                    <div className="bg-muted/30 p-4 rounded-lg border">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2"></div>
                        <div className="h-5 w-48 bg-muted animate-pulse rounded"></div>
                    </div>

                    {/* Description skeleton */}
                    <div className="space-y-2">
                        <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                        <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                        <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
                    </div>

                    {/* Info items skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                        {[...Array(8)].map((_, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                                <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
                            </div>
                        ))}
                    </div>

                    {/* Images skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        <div className="space-y-2">
                            <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                            <div className="w-full aspect-video bg-muted animate-pulse rounded-md"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                            <div className="w-1/2 aspect-[9/16] bg-muted animate-pulse rounded-md"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden">
            <CardContent className="pt-6">
                {!isEditing && (
                    <div className="absolute inset-0 bg-gray-100/70 dark:bg-gray-900/70 z-10 flex items-center justify-center rounded-lg">
                        <Button
                            size="lg"
                            onClick={() => setIsEditing(true)}
                            className="bg-[#F7B418] hover:bg-[#e5a616] text-gray-900 font-medium"
                        >
                            <Edit className="mr-2 h-5 w-5" />
                            Chỉnh sửa
                        </Button>
                    </div>
                )}

                {isEditing ? (
                    <CourseEditForm course={formData} onUpdate={handleUpdate} onCancel={handleCancel} />
                ) : (
                    <CourseInfoDisplay course={formData} />
                )}
            </CardContent>
        </Card>
    );
};
