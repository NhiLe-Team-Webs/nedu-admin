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
    }, [course]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, fee: rawValue ? Number(rawValue) : 0 }));
    };

    const handleStudentCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const numValue = rawValue ? Number(rawValue) : 0;
        console.log(`[DEBUG] studentCount change: raw="${rawValue}", num=${numValue}`);
        setFormData(prev => ({ ...prev, studentCount: numValue }));
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
            console.log(`[STUDENT_COUNT_DEBUG] Sending update for program id: ${formData.id}, studentCount: ${formData.studentCount}`);

            const { data: updatedProgram, error: programError } = await supabase
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
                .eq('id', formData.id)
                .select()
                .single();

            if (programError) {
                console.error('[STUDENT_COUNT_DEBUG] Program update error:', programError);
                throw programError;
            }

            if (updatedProgram) {
                console.log(`[STUDENT_COUNT_DEBUG] Supabase returned updated program:`, {
                    id: updatedProgram.id,
                    program_name: updatedProgram.program_name,
                    course: updatedProgram.course,
                    sent_value: Number(formData.studentCount)
                });

                if (Number(updatedProgram.course) !== Number(formData.studentCount)) {
                    console.warn(`[STUDENT_COUNT_DEBUG] DISCREPANCY DETECTED! Sent ${formData.studentCount}, but DB has ${updatedProgram.course}`);
                }
            }


            // 2. Update program_description (lang_id 1 = Vietnamese)
            const { data: descData, error: descError } = await supabase
                .from('program_description')
                .update({
                    program_name: formData.title,
                    topic: formData.topic,
                    short_description: formData.shortDescription,
                    format: formData.format,
                })
                .eq('program_id', Number(formData.id))
                .eq('lang_id', 1)
                .select();

            console.log('[DEBUG] program_description update result:', { descData, descError, formData: { shortDescription: formData.shortDescription, format: formData.format } });

            if (descError || !descData || descData.length === 0) {
                console.warn('[DEBUG] Description update failed or no rows, trying insert:', descError);
                // If update fails or no rows updated, maybe it doesn't exist yet, try insert
                const { error: insertError } = await supabase.from('program_description').insert({
                    program_id: Number(formData.id),
                    lang_id: 1,
                    program_name: formData.title,
                    topic: formData.topic,
                    short_description: formData.shortDescription,
                    format: formData.format,
                });
                if (insertError) {
                    console.error('[DEBUG] Insert also failed:', insertError);
                }
            }

            // If this is the 30-day challenge course, update the pricing table
            const THIRTY_DAY_CHALLENGE_ID = 82;
            if (Number(formData.id) === THIRTY_DAY_CHALLENGE_ID) {
                console.log(`[STUDENT_COUNT_DEBUG] Updating program_30day_challenge for id: ${formData.id}`);
                const { error: challengeError } = await supabase
                    .from('program_30day_challenge')
                    .upsert({
                        program_id: Number(formData.id),
                        monthly_price: Number(formData.fee) || 0,
                        membership_price: Number(formData.membershipFee) || 0,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'program_id' });

                if (challengeError) {
                    console.error('[STUDENT_COUNT_DEBUG] program_30day_challenge update error:', challengeError);
                }
            }

            toast({
                title: "Thành công",
                description: `Khóa học "${formData.title}" đã được cập nhật.`,
            });

            onUpdate(dataToUpdate);

        } catch (err: any) {
            console.error('[STUDENT_COUNT_DEBUG] Final catch error:', err);
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
        <div className="space-y-8">
            <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="title" className="uppercase text-xs font-bold">Tên khóa học <span className="text-destructive">*</span></Label>
                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} disabled={isUploading} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="shortDescription" className="uppercase text-xs font-bold">Mô tả ngắn <span className="text-destructive">*</span></Label>
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
                    <Label htmlFor="fee" className="uppercase text-xs font-bold">
                        {formData.type === 'Membership' ? 'GIÁ THÁNG' : 'HỌC PHÍ'} <span className="text-destructive">*</span>
                    </Label>
                    <Input id="fee" name="fee" value={formatCurrency(formData.fee)} onChange={handleFeeChange} disabled={isUploading} />
                </div>
                {formData.type === 'Membership' && (
                    <div className="space-y-2">
                        <Label htmlFor="membershipFee" className="uppercase text-xs font-bold">Giá Membership <span className="text-destructive">*</span></Label>
                        <Input id="membershipFee" name="membershipFee" value={formatCurrency(formData.membershipFee)} onChange={handleMembershipFeeChange} disabled={isUploading} />
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="topic" className="uppercase text-xs font-bold">Chủ đề <span className="text-destructive">*</span></Label>
                    <Input id="topic" name="topic" value={formData.topic || ''} onChange={handleInputChange} disabled={isUploading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="format" className="uppercase text-xs font-bold">HÌNH THỨC <span className="text-destructive">*</span></Label>
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
                    <Label htmlFor="schedule" className="uppercase text-xs font-bold">THỜI GIAN DIỄN RA <span className="text-destructive">*</span></Label>
                    <Input id="schedule" name="schedule" value={formData.schedule || ''} onChange={handleInputChange} disabled={isUploading} placeholder="VD: 30 ngày, 2/4/6 hàng tuần..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location" className="uppercase text-xs font-bold">Địa điểm học <span className="text-destructive">*</span></Label>
                    <Input id="location" name="location" value={formData.location || ''} onChange={handleInputChange} disabled={isUploading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="studentCount" className="uppercase text-xs font-bold">Số lượng học viên <span className="text-destructive">*</span></Label>
                    <Input id="studentCount" name="studentCount" type="number" value={formData.studentCount || ''} onChange={handleStudentCountChange} disabled={isUploading} />
                </div>
                <div className="space-y-3">
                    <Label className="uppercase text-xs font-bold">Hình ảnh (16:9)</Label>
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
                    <Label className="uppercase text-xs font-bold">Hình ảnh (9:16)</Label>
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

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
                <Button
                    size="lg"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isUploading}
                    className="w-full sm:w-auto rounded-xl"
                >
                    Hủy
                </Button>
                <Button
                    size="lg"
                    onClick={handleUpdateCourse}
                    disabled={isUploading}
                    className="w-full sm:w-auto bg-[#F7B418] hover:bg-[#e5a616] text-gray-900 font-medium rounded-xl"
                >
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Cập nhật'}
                </Button>
            </div>
        </div>
    );
};
