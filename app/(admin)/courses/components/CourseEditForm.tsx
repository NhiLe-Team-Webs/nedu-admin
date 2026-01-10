'use client';

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/types/admin";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/supabase/storage";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

const formatCurrency = (value: string | number = '') => {
    const numberValue = Number(String(value).replace(/\D/g, ''));
    if (isNaN(numberValue)) return '';
    return new Intl.NumberFormat('vi-VN').format(numberValue);
};

export const CourseEditForm = ({ course, onUpdate, onCancel }: { course: Course, onUpdate: (data: Course) => void, onCancel: () => void }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState<Course>(course);

    // Image states
    const [newImage, setNewImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(course.thumbnailUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [newImage916, setNewImage916] = useState<File | null>(null);
    const [imagePreview916, setImagePreview916] = useState<string | null>(course.thumbnailUrl_9_16 || null);
    const fileInput916Ref = useRef<HTMLInputElement>(null);

    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        setFormData(course);
        setImagePreview(course.thumbnailUrl || null);
        setNewImage(null);
        setImagePreview916(course.thumbnailUrl_9_16 || null);
        setNewImage916(null);

        const fetchThirtyDayConfig = async () => {
            if (course.id === '82' || (course.title && course.title.toLowerCase().includes('30 ngày'))) {
                const supabase = createClient();
                const { data } = await supabase.from('thirty_day_config').select('*').eq('program_id', course.id).single();
                if (data) {
                    setFormData(prev => ({
                        ...prev,
                        fee: data.monthly_fee,
                        membershipFee: data.membership_fee
                    }));
                }
            }
        };
        fetchThirtyDayConfig();
    }, [course]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        // Store as number if possible, or keep as clean string if empty
        setFormData(prev => ({ ...prev, fee: rawValue ? Number(rawValue) : '' }));
    };

    const handleMembershipFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, membershipFee: rawValue ? Number(rawValue) : '' }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setFormData(prev => ({
            ...prev,
            startDate: range?.from,
            endDate: range?.to,
            schedule: range?.from && range?.to
                ? `${format(range.from, 'dd/MM/yyyy')} - ${format(range.to, 'dd/MM/yyyy')}`
                : range?.from
                    ? format(range.from, 'dd/MM/yyyy')
                    : ''
        }));
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setNewImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImage916Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setNewImage916(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview916(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateCourse = async () => {
        const fieldLabels: Record<string, string> = {
            title: 'Tên khóa học',
            shortDescription: 'Mô tả ngắn',
            fee: 'Học phí/Giá',
            topic: 'Chủ đề',
            schedule: 'Thời gian',
            location: 'Địa điểm',
            studentCount: 'Số lượng học viên'
        };

        const requiredFields: (keyof Omit<Course, 'id' | 'createdAt' | 'thumbnailUrl' | 'thumbnailUrl_9_16' | 'instructorIds' | 'timeline' | 'isFeatured' | 'membershipFee' | 'duration' | 'format' | 'type' | 'videoTestimonials' | 'status'>)[] = [
            'title', 'shortDescription', 'fee', 'topic', 'schedule', 'location', 'studentCount'
        ];

        for (const field of requiredFields) {
            // @ts-ignore
            const value = formData[field];
            if (value === null || value === undefined || String(value).trim() === '') {
                // allow studentCount to be 0
                if (field === 'studentCount' && Number(value) === 0) continue;

                toast({
                    variant: "destructive",
                    title: "Thông tin chưa đầy đủ",
                    description: `Vui lòng điền trường: ${fieldLabels[field] || field}`,
                });
                return;
            }
        }

        if (formData.type === 'Membership' && (formData.membershipFee === null || formData.membershipFee === undefined || String(formData.membershipFee).trim() === '')) {
            toast({
                variant: "destructive",
                title: "Thông tin chưa đầy đủ",
                description: "Vui lòng nhập giá Membership.",
            });
            return;
        }

        setIsUploading(true);
        const supabase = createClient();

        try {
            const dataToUpdate: Course = { ...formData };

            // 1. Upload horizontal image (16:9) if new
            if (newImage) {
                const url = await uploadImage(newImage, 'courses/horizontal');
                dataToUpdate.thumbnailUrl = url;
            }

            // 2. Upload vertical image (9:16) if new
            if (newImage916) {
                const url = await uploadImage(newImage916, 'courses/vertical');
                dataToUpdate.thumbnailUrl_9_16 = url;
            }

            // 3. Update program table
            const { error: programError } = await supabase
                .from('program')
                .update({
                    program_name: formData.title,
                    program_price: Number(formData.fee),
                    program_type: formData.type === 'Course' ? 1 : 2,
                    image: dataToUpdate.thumbnailUrl, // Horizontal
                    banner: dataToUpdate.thumbnailUrl_9_16, // Vertical (mapped to banner column for now)
                    hashtag: formData.topic,
                    total_sessions: formData.schedule,
                    start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                    end_date: formData.endDate ? new Date(formData.endDate).toISOString() : null,
                    link_payment: formData.location,
                    course: Number(formData.studentCount),
                    status: formData.status === 'published' ? 1 : 0,
                    highlight_program: formData.isFeatured ? 1 : 0
                })
                .eq('id', formData.id);

            if (programError) throw programError;

            // NEW: Update thirty_day_config for 30-day challenge
            if (formData.id === '82' || (formData.title && formData.title.toLowerCase().includes('30 ngày'))) {
                const { error: configError } = await supabase
                    .from('thirty_day_config')
                    .upsert({
                        program_id: Number(formData.id),
                        monthly_fee: Number(formData.fee),
                        membership_fee: Number(formData.membershipFee)
                    }, { onConflict: 'program_id' });

                if (configError) throw configError;
            }


            // 2. Update program_description (lang_id 1 = Vietnamese)
            const { error: descError } = await supabase
                .from('program_description')
                .update({
                    program_name: formData.title,
                    topic: formData.topic,
                    short_description: formData.shortDescription,
                    // If you have 'content' field in UI, map it here
                })
                .eq('program_id', formData.id)
                .eq('lang_id', 1);

            if (descError) {
                // If update fails, maybe it doesn't exist yet, try insert
                await supabase.from('program_description').insert({
                    program_id: Number(formData.id),
                    lang_id: 1,
                    program_name: formData.title,
                    topic: formData.topic,
                    short_description: formData.shortDescription
                });
            }

            toast({
                title: "Thành công",
                description: `Khóa học "${formData.title}" đã được cập nhật.`,
            });

            onUpdate(dataToUpdate);

        } catch (err: any) {
            console.error('Error updating course:', err);
            toast({
                variant: "destructive",
                title: "Đã có lỗi xảy ra",
                description: err.message || "Không thể cập nhật khóa học.",
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-8 bg-card p-6 rounded-lg border shadow-sm">
            <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="title" className="uppercase">Tên khóa học <span className="text-destructive">*</span></Label>
                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} disabled={isUploading} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="shortDescription" className="uppercase">Mô tả ngắn <span className="text-destructive">*</span></Label>
                <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription || ''}
                    onChange={handleInputChange}
                    disabled={isUploading}
                    maxLength={80}
                    placeholder="Nhập mô tả ngắn gọn (tối đa 80 ký tự)"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="fee" className="uppercase">
                        {formData.type === 'Membership' ? 'GIÁ THÁNG' : 'HỌC PHÍ'} <span className="text-destructive">*</span>
                    </Label>
                    <Input id="fee" name="fee" value={formatCurrency(formData.fee)} onChange={handleFeeChange} disabled={isUploading} />
                </div>
                {formData.type === 'Membership' && (
                    <div className="space-y-2">
                        <Label htmlFor="membershipFee" className="uppercase">Giá Membership <span className="text-destructive">*</span></Label>
                        <Input id="membershipFee" name="membershipFee" value={formatCurrency(formData.membershipFee)} onChange={handleMembershipFeeChange} disabled={isUploading} />
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="topic" className="uppercase">Chủ đề <span className="text-destructive">*</span></Label>
                    <Input id="topic" name="topic" value={formData.topic || ''} onChange={handleInputChange} disabled={isUploading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="format" className="uppercase">HÌNH THỨC <span className="text-destructive">*</span></Label>
                    <Select name="format" value={formData.format || ''} onValueChange={(value) => handleSelectChange('format', value)} disabled={isUploading}>
                        <SelectTrigger id="format">
                            <SelectValue placeholder="Chọn hình thức" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="Offline">Offline</SelectItem>
                            <SelectItem value="Doanh nghiệp">Doanh nghiệp</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="uppercase">THỜI GIAN DIỄN RA <span className="text-destructive">*</span></Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    (!formData.startDate || !formData.endDate) && "text-muted-foreground"
                                )}
                                disabled={isUploading}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.startDate && formData.endDate ? (
                                    <>
                                        {format(new Date(formData.startDate), "dd/MM/yyyy")} - {format(new Date(formData.endDate), "dd/MM/yyyy")}
                                    </>
                                ) : formData.startDate ? (
                                    format(new Date(formData.startDate), "dd/MM/yyyy")
                                ) : (
                                    <span>Chọn ngày bắt đầu - kết thúc</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={formData.startDate ? new Date(formData.startDate) : undefined}
                                selected={{
                                    from: formData.startDate ? new Date(formData.startDate) : undefined,
                                    to: formData.endDate ? new Date(formData.endDate) : undefined
                                }}
                                onSelect={handleDateRangeChange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location" className="uppercase">Địa điểm học <span className="text-destructive">*</span></Label>
                    <Input id="location" name="location" value={formData.location || ''} onChange={handleInputChange} disabled={isUploading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="studentCount" className="uppercase">Số lượng học viên <span className="text-destructive">*</span></Label>
                    <Input id="studentCount" name="studentCount" type="number" value={formData.studentCount || ''} onChange={handleInputChange} disabled={isUploading} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                    <Label className="uppercase">Hình ảnh (16:9)</Label>
                    <div className="relative group w-48 h-32 rounded-md overflow-hidden border bg-muted">
                        {imagePreview ? (
                            <Image src={imagePreview} alt="Xem trước" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                        )}
                        {!newImage && (
                            <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white transition-opacity opacity-100 cursor-pointer" disabled={isUploading}>
                                <Upload className="h-8 w-8" />
                            </button>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" disabled={isUploading} />
                </div>
                <div className="space-y-3">
                    <Label className="uppercase">Hình ảnh (9:16)</Label>
                    <div className="relative group w-32 h-48 rounded-md overflow-hidden border bg-muted">
                        {imagePreview916 ? (
                            <Image src={imagePreview916} alt="Xem trước 9:16" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                        )}
                        {!newImage916 && (
                            <button onClick={() => fileInput916Ref.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white transition-opacity opacity-100 cursor-pointer" disabled={isUploading}>
                                <Upload className="h-8 w-8" />
                            </button>
                        )}
                    </div>
                    <input type="file" ref={fileInput916Ref} onChange={handleImage916Change} accept="image/*" className="hidden" disabled={isUploading} />
                </div>
            </div>
            <div className="flex space-x-4">
                <Button size="lg" onClick={handleUpdateCourse} disabled={isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Cập nhật'}
                </Button>
                <Button size="lg" variant="outline" onClick={onCancel} disabled={isUploading}>
                    Hủy
                </Button>
            </div>
        </div>
    );
};
