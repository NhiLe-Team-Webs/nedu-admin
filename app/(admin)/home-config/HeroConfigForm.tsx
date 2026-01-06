'use client';

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Check, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Course, FeaturedEvent } from "@/types/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Mock Data
const MOCK_COURSES: Course[] = [
    { id: '1', title: 'LÀ CHÍNH MÌNH' },
    { id: '2', title: 'Khám phá bản thân' },
    { id: '3', title: 'Kỹ năng lãnh đạo' }
];

const MOCK_FEATURED_EVENT: FeaturedEvent = {
    id: '1',
    title: 'Đánh thức Phiên bản tốt nhất',
    description: 'Chương trình đặc biệt giúp bạn khám phá tiềm năng vô hạn của bản thân.',
    quote: '"Hành trình vạn dặm bắt đầu từ một bước chân"',
    registrations: 200,
    courseId: '1',
    courseName: 'LÀ CHÍNH MÌNH',
    schedule: 'Thứ 7, CN hàng tuần',
    type: 'offline',
    updatedAt: new Date().toISOString()
};

export const HeroConfigForm = () => {
    const { toast } = useToast();

    // Mock State
    const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([]);
    const [eventLoading, setEventLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'uploading' | 'saving' | 'success'>('idle');
    const [formData, setFormData] = useState<Partial<FeaturedEvent>>({ registrations: 200 });
    const [initialFormData, setInitialFormData] = useState<Partial<FeaturedEvent>>({});

    // Initial Load
    useEffect(() => {
        const loadData = async () => {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            setAvailableCourses(MOCK_COURSES);
            setCoursesLoading(false);

            const storedEvent = localStorage.getItem('nedu_featured_event');
            if (storedEvent) {
                const parsed = JSON.parse(storedEvent);
                setFeaturedEvents([parsed]);
            } else {
                setFeaturedEvents([MOCK_FEATURED_EVENT]);
            }
            setEventLoading(false);
        };
        loadData();
    }, []);

    useEffect(() => {
        if (featuredEvents && featuredEvents.length > 0) {
            const currentEvent = featuredEvents[0];
            setFormData(currentEvent);
            setInitialFormData(currentEvent);
        } else {
            const defaultState = { registrations: 200 };
            setFormData(defaultState);
            setInitialFormData(defaultState);
        }
    }, [featuredEvents]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCourseSelectChange = (courseId: string) => {
        const selectedCourse = availableCourses?.find(c => c.id === courseId);

        if (selectedCourse) {
            setFormData(prev => ({
                ...prev,
                courseId: selectedCourse.id,
                courseName: selectedCourse.title,
                // Adding mock properties that might exist on a real course object but not in our minimal type yet
                schedule: 'Updated Schedule',
                type: 'online',
                imageUrl: '/placeholder.jpg'
            }));
        }
    };

    const handleSave = async () => {
        if (!availableCourses) return;

        if (!formData.title || !formData.description || !formData.courseId) {
            toast({
                variant: "destructive",
                title: "Thông tin chưa đầy đủ",
                description: "Vui lòng điền tất cả các trường bắt buộc (*).",
            });
            return;
        }

        setSubmitStatus('saving');

        const selectedCourse = availableCourses.find(c => c.id === formData.courseId);

        if (!selectedCourse) {
            toast({
                variant: "destructive",
                title: "Không tìm thấy khóa học",
                description: "Khóa học đã chọn không hợp lệ. Vui lòng chọn lại.",
            });
            setSubmitStatus('idle');
            return;
        }

        // Simulate Saving
        setTimeout(() => {
            try {
                const dataToSave: FeaturedEvent = {
                    id: formData.id || 'new-id',
                    title: formData.title!,
                    description: formData.description!,
                    quote: formData.quote,
                    registrations: Number(formData.registrations) || 0,
                    courseId: selectedCourse.id,
                    courseName: selectedCourse.title,
                    // mock props
                    schedule: formData.schedule,
                    type: formData.type as any,
                    imageUrl: formData.imageUrl,
                    updatedAt: new Date().toISOString(),
                };

                setFeaturedEvents([dataToSave]);
                localStorage.setItem('nedu_featured_event', JSON.stringify(dataToSave));

                toast({
                    title: "Đã cập nhật thành công!",
                    description: "Các thay đổi cho sự kiện nổi bật đã được lưu.",
                });
                setIsEditing(false);
                setSubmitStatus('idle');
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Lỗi không xác định",
                    description: error.message || "Đã xảy ra lỗi trong quá trình lưu.",
                });
                setSubmitStatus('idle');
            }
        }, 1000);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(initialFormData);
    }

    const isSubmitting = submitStatus === 'uploading' || submitStatus === 'saving';

    if (eventLoading || coursesLoading) {
        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 relative">
                {!isEditing && (
                    <div className="absolute inset-0 bg-gray-100/70 dark:bg-gray-900/70 z-10 flex items-center justify-center rounded-lg">
                        <Button size="lg" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </Button>
                    </div>
                )}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="course-select" className="uppercase">Khóa học liên quan <span className="text-destructive">*</span></Label>
                        <Select
                            value={formData.courseId || ''}
                            onValueChange={handleCourseSelectChange}
                            disabled={!isEditing || coursesLoading || isSubmitting}
                        >
                            <SelectTrigger id="course-select">
                                <SelectValue placeholder="Chọn một khóa học để hiển thị" />
                            </SelectTrigger>
                            <SelectContent>
                                {coursesLoading ? (
                                    <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                                ) : (
                                    availableCourses?.map(course => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.title}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hero-title" className="uppercase">Tiêu đề <span className="text-destructive">*</span></Label>
                        <Input id="hero-title" name="title" value={formData.title || ''} onChange={handleInputChange} placeholder="e.g. Đánh thức Phiên bản tốt nhất" disabled={!isEditing || isSubmitting} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hero-description" className="uppercase">Mô tả <span className="text-destructive">*</span></Label>
                        <Textarea id="hero-description" name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Nhập mô tả ngắn gọn về sự kiện..." disabled={!isEditing || isSubmitting} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hero-quote" className="uppercase">Quote</Label>
                        <Input id="hero-quote" name="quote" value={formData.quote || ''} onChange={handleInputChange} placeholder="e.g. Hành trình vạn dặm bắt đầu từ một bước chân" disabled={!isEditing || isSubmitting} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hero-registrations" className="uppercase">Số lượng đăng ký</Label>
                        <Input id="hero-registrations" name="registrations" type="number" value={formData.registrations || ''} onChange={handleInputChange} placeholder="e.g. 500" disabled={!isEditing || isSubmitting} />
                    </div>
                </div>
            </CardContent>
            {isEditing && (
                <CardFooter className="justify-end gap-2">
                    <Button variant="ghost" onClick={handleCancel} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Cập nhật
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};
