'use client';

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/types/admin";

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
                    description: "Vui lòng điền đầy đủ tất cả các trường trước khi cập nhật.",
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

        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network

            const dataToUpdate: Course = { ...formData };

            // Mock Image Upload - using the preview DataURL string as the "url"
            if (newImage && imagePreview) {
                dataToUpdate.thumbnailUrl = imagePreview;
            }

            if (newImage916 && imagePreview916) {
                dataToUpdate.thumbnailUrl_9_16 = imagePreview916;
            }

            if (formData.type !== 'Membership') {
                dataToUpdate.membershipFee = undefined; // or null
            }

            dataToUpdate.studentCount = Number(dataToUpdate.studentCount);

            // Call parent update
            onUpdate(dataToUpdate);

            toast({
                title: "Thành công",
                description: `Khóa học "${formData.title}" đã được cập nhật.`,
            });

        } catch (err: any) {
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
                    <Label htmlFor="schedule" className="uppercase">THỜI GIAN DIỄN RA <span className="text-destructive">*</span></Label>
                    <Input id="schedule" name="schedule" value={formData.schedule || ''} onChange={handleInputChange} disabled={isUploading} />
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
