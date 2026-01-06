'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        // Use prop as initial, but try to load from localStorage for persistence of edits
        const stored = localStorage.getItem(`nedu_course_${initialCourse.id}`);
        if (stored) {
            try {
                const parsedData = JSON.parse(stored);
                setFormData(parsedData);
            } catch (e) {
                setFormData(initialCourse);
            }
        } else {
            setFormData(initialCourse);
        }
        setIsLoading(false);
    }, [initialCourse]);

    const handleUpdate = (updatedCourse: Course) => {
        setFormData(updatedCourse);
        localStorage.setItem(`nedu_course_${initialCourse.id}`, JSON.stringify(updatedCourse));

        // Sync with global list
        const storedList = localStorage.getItem('nedu_courses_list');
        if (storedList) {
            const list = JSON.parse(storedList) as Course[];
            const updatedList = list.map(c => c.id === updatedCourse.id ? { ...c, title: updatedCourse.title, type: updatedCourse.type, status: updatedCourse.status, isFeatured: updatedCourse.isFeatured } : c);
            localStorage.setItem('nedu_courses_list', JSON.stringify(updatedList));
        }

        setIsEditing(false);
        if (onUpdate) onUpdate();
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-64 w-full bg-muted/40 animate-pulse rounded-lg"></div>
            </div>
        );
    }

    if (isEditing) {
        return <CourseEditForm course={formData} onUpdate={handleUpdate} onCancel={handleCancel} />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent>
                <CourseInfoDisplay course={formData} onEdit={() => setIsEditing(true)} />
            </CardContent>
        </Card>
    );
};
