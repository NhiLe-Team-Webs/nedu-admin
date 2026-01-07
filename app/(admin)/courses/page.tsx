"use client"

import { useState } from "react"
import { CoursesConfigContent } from "./CoursesConfigContent"
import type { Course } from "@/types/admin"

export default function CoursesPage() {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    return (
        <div className="p-4 md:p-8 pt-6">
            <CoursesConfigContent
                selectedCourse={selectedCourse}
                onSelectCourse={setSelectedCourse}
            />
        </div>
    )
}
