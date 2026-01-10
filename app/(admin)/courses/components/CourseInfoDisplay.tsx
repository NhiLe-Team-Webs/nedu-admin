'use client';

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { Course } from "@/types/admin";
import { Label } from "@/components/ui/label";

const formatCurrency = (value: string | number = '') => {
    const numberValue = Number(String(value).replace(/\D/g, ''));
    if (isNaN(numberValue)) return '';
    return new Intl.NumberFormat('vi-VN').format(numberValue);
};

export const CourseInfoDisplay = ({ course }: { course: Course }) => {
    return (
        <div className="space-y-8">
            {/* Title - Full Width */}
            <div className="space-y-2 lg:col-span-2">
                <Label className="uppercase text-xs font-bold text-muted-foreground">Tên khóa học</Label>
                <p className="font-semibold text-base">{course.title || 'Chưa cập nhật'}</p>
            </div>

            {/* Short Description */}
            <div className="space-y-2">
                <Label className="uppercase text-xs font-bold text-muted-foreground">Mô tả ngắn</Label>
                <p className="font-semibold text-base">{course.shortDescription || 'Chưa cập nhật'}</p>
            </div>

            {/* Grid layout matching edit form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Fee */}
                <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold text-muted-foreground">
                        {course.type === 'Membership' ? 'GIÁ THÁNG' : 'HỌC PHÍ'}
                    </Label>
                    <p className="font-semibold text-base">
                        {course.fee ? `${formatCurrency(course.fee)} VNĐ` : 'Chưa cập nhật'}
                    </p>
                </div>

                {/* Membership Fee - only show if type is Membership */}
                {course.type === 'Membership' && (
                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-bold text-muted-foreground">Giá Membership</Label>
                        <p className="font-semibold text-base">
                            {course.membershipFee ? `${formatCurrency(course.membershipFee)} VNĐ` : 'Chưa cập nhật'}
                        </p>
                    </div>
                )}

                {/* Topic */}
                <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold text-muted-foreground">Chủ đề</Label>
                    <p className="font-semibold text-base">{course.topic || 'Chưa cập nhật'}</p>
                </div>

                {/* Format */}
                <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold text-muted-foreground">Hình thức</Label>
                    <p className="font-semibold text-base">{course.format || 'Chưa cập nhật'}</p>
                </div>

                {/* Schedule */}
                <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold text-muted-foreground">Thời gian diễn ra</Label>
                    <p className="font-semibold text-base">{course.schedule || 'Chưa cập nhật'}</p>
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold text-muted-foreground">Địa điểm học</Label>
                    <p className="font-semibold text-base">{course.location || 'Chưa cập nhật'}</p>
                </div>

                {/* Student Count */}
                <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold text-muted-foreground">Số lượng học viên</Label>
                    <p className="font-semibold text-base">
                        {(course.studentCount !== undefined && course.studentCount !== null) ? String(course.studentCount) : 'Chưa cập nhật'}
                    </p>
                </div>

                {/* Image 16:9 - in grid */}
                <div className="space-y-3">
                    <Label className="uppercase text-xs font-bold text-muted-foreground">Hình ảnh (16:9)</Label>
                    <div className="relative w-48 h-32 rounded-md overflow-hidden border bg-muted">
                        {course.thumbnailUrl ? (
                            <Image src={course.thumbnailUrl} alt="Thumbnail 16:9" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Image 9:16 - in grid, aligned with other fields */}
                <div className="space-y-3">
                    <Label className="uppercase text-xs font-bold text-muted-foreground">Hình ảnh (9:16)</Label>
                    <div className="relative w-32 h-48 rounded-md overflow-hidden border bg-muted">
                        {course.thumbnailUrl_9_16 ? (
                            <Image src={course.thumbnailUrl_9_16} alt="Thumbnail 9:16" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
