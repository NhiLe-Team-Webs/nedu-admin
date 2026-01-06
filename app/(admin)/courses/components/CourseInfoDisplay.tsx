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

interface CourseInfoDisplayProps {
    course: Course;
    onEdit?: () => void;
}

export const CourseInfoDisplay = ({ course, onEdit }: CourseInfoDisplayProps) => {
    const { toast } = useToast();

    const infoItems = [
        { label: 'TÊN KHÓA HỌC', value: course.title || 'Chưa cập nhật' },
        { label: course.type === 'Membership' ? 'GIÁ THÁNG' : 'HỌC PHÍ', value: course.fee ? `${formatCurrency(course.fee)} VNĐ` : 'Chưa cập nhật' },
        { label: "MÔ HÌNH", value: course.type || 'Chưa cập nhật' },
        ...(course.type === 'Membership' && course.membershipFee ? [{ label: "GIÁ MEMBERSHIP", value: `${formatCurrency(course.membershipFee)} VNĐ` }] : []),
        { label: "CHỦ ĐỀ", value: course.topic || 'Chưa cập nhật' },
        { label: "HÌNH THỨC", value: course.format || 'Chưa cập nhật' },
        { label: "THỜI GIAN DIỄN RA", value: course.schedule || 'Chưa cập nhật' },
        { label: "ĐỊA ĐIỂM HỌC", value: course.location || 'Chưa cập nhật' },
        { label: "SỐ LƯỢNG HỌC VIÊN", value: course.studentCount ? String(course.studentCount) : 'Chưa cập nhật' },
    ];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Đã sao chép",
            description: "Đã sao chép ID vào bộ nhớ tạm",
        });
    };

    return (
        <div className="space-y-8 relative">
            {onEdit && (
                <div className="absolute top-0 right-0 z-10 hidden md:block">
                    <Button onClick={onEdit}>
                        <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                    </Button>
                </div>
            )}


            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Images Section */}
                <div className="w-full md:w-1/3 space-y-6">
                    <div>
                        <Label className="text-sm text-muted-foreground uppercase block mb-2">Hình ảnh (16:9)</Label>
                        <div className="w-full aspect-video flex items-center justify-center rounded-md border bg-muted overflow-hidden relative">
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
                        <Label className="text-sm text-muted-foreground uppercase block mb-2">Hình ảnh (9:16)</Label>
                        <div className="w-2/3 mx-auto aspect-[9/16] flex items-center justify-center rounded-md border bg-muted overflow-hidden relative">
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

                {/* Info Section */}
                <div className="w-full md:w-2/3 space-y-6">
                    <div className="bg-muted/30 p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm text-muted-foreground uppercase">ID Khóa học</Label>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(course.id)}>
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                        <code className="text-sm font-mono block break-all">{course.id}</code>
                    </div>

                    {course.shortDescription && (
                        <div>
                            <Label className="text-sm text-muted-foreground uppercase">Mô tả ngắn</Label>
                            <p className="font-medium text-base mt-1 whitespace-pre-wrap">{course.shortDescription}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                        {infoItems.map((item, idx) => (
                            <div key={idx}>
                                <Label className="text-sm text-muted-foreground uppercase">{item.label}</Label>
                                <p className="font-semibold text-base mt-1">{item.value}</p>
                            </div>
                        ))}
                    </div>
                    {onEdit && (
                        <div className="md:hidden pt-4">
                            <Button onClick={onEdit} className="w-full">
                                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
