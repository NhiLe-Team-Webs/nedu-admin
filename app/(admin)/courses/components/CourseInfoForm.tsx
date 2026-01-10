'use client';

import { CourseEditForm } from "./CourseEditForm";
import type { Course } from "@/types/admin";

export const CourseInfoForm = ({
    course,
    onUpdate,
    onCancel
}: {
    course: Course;
    onUpdate: (data?: Course) => void;
    onCancel: () => void
}) => {
    return (
        <CourseEditForm
            course={course}
            onUpdate={(updatedData) => onUpdate(updatedData)}
            onCancel={onCancel}
        />
    );
};
