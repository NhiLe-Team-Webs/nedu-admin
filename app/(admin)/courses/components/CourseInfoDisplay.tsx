'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Copy, Edit, ImageIcon } from "lucide-react";
import type { Course } from "@/types/admin";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (value: string | number = '') => {
    const numberValue = Number(String(value).replace(/\D/g, ''));
    if (isNaN(numberValue)) return '';
    return new Intl.NumberFormat('vi-VN').format(numberValue);
};

export const CourseInfoDisplay = ({ course }: { course: Course }) => {
    const infoItems = [
        { label: 'TÊN KHÓA HỌC', value: course.title || 'Chưa cập nhật' },
        { label: course.type === 'Membership' ? 'GIÁ THÁNG' : 'HỌC PHÍ', value: course.fee ? `${formatCurrency(course.fee)} VNĐ` : 'Chưa cập nhật' },
        ...(course.type === 'Membership' && course.membershipFee ? [{ label: "GIÁ MEMBERSHIP", value: `${formatCurrency(course.membershipFee)} VNĐ` }] : []),
        { label: "CHỦ ĐỀ", value: course.topic || 'Chưa cập nhật' },
        { label: "HÌNH THỨC", value: course.format || 'Chưa cập nhật' },
        { label: "THỜI GIAN DIỄN RA", value: course.schedule || 'Chưa cập nhật' },
        { label: "ĐỊA ĐIỂM HỌC", value: course.location || 'Chưa cập nhật' },
        { label: "SỐ LƯỢNG HỌC VIÊN", value: (course.studentCount !== undefined && course.studentCount !== null) ? String(course.studentCount) : 'Chưa cập nhật' },
    ];

    return (
        <div className="space-y-8">
            {course.shortDescription && (
                <div>
                    <Label className="text-sm text-muted-foreground uppercase">Mô tả ngắn</Label>
                    <p className="font-semibold text-base mt-1">{course.shortDescription}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {infoItems.map((item, idx) => (
                    <div key={idx}>
                        <Label className="text-sm text-muted-foreground uppercase">{item.label}</Label>
                        <p className="font-semibold text-base mt-1">{item.value}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-6 items-start">
                <div>
                    <Label className="text-sm text-muted-foreground uppercase">Hình ảnh (16:9)</Label>
                    <div className="mt-2 w-48 h-32 flex items-center justify-center rounded-md border bg-muted overflow-hidden relative">
                        {course.thumbnailUrl ? (
                            <Image src={course.thumbnailUrl} alt="Thumbnail 16:9" fill className="object-cover" />
                        ) : (
                            <div className="text-center text-muted-foreground p-2">
                                <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                                <span className="text-xs">Chưa có ảnh</span>
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <Label className="text-sm text-muted-foreground uppercase">Hình ảnh (9:16)</Label>
                    <div className="mt-2 w-32 h-48 flex items-center justify-center rounded-md border bg-muted overflow-hidden relative">
                        {course.thumbnailUrl_9_16 ? (
                            <Image src={course.thumbnailUrl_9_16} alt="Thumbnail 9:16" fill className="object-cover" />
                        ) : (
                            <div className="text-center text-muted-foreground p-2">
                                <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                                <span className="text-xs">Chưa có ảnh</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
