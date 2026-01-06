'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Course } from "@/types/admin";
import { CustomerInfoPlaceholder } from "./CustomerInfoPlaceholder";

export const CourseStudentsForm = ({ course, onUpdate }: { course: Course; onUpdate: () => void }) => {
    return (
        <div className="space-y-6">
            {/* Featured Student / Highlighted Student Section */}
            <CustomerInfoPlaceholder course={course} onUpdate={onUpdate} />

            {/* General student list (placeholder for now) */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách học viên đăng ký</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/30">
                        <p className="font-medium">Chưa có danh sách học viên cho "{course.title}"</p>
                        <p className="text-sm">Hệ thống đồng bộ học viên từ hệ thống đăng ký sẽ được cập nhật trong phiên bản tới.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
