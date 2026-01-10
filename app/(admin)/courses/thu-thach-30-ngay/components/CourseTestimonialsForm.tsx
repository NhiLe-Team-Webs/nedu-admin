'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, X, Loader2, Edit, Save, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Course, VideoTestimonial } from "@/types/admin";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const getYouTubeThumbnail = (url: string): string | null => {
    if (!url) return null;
    let videoId;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        }
    } catch (e) {
        return null;
    }

    if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/default.jpg`;
    }
    return null;
};

interface CourseTestimonialsFormProps {
    course: Course;
    onUpdate: () => void;
}

export const CourseTestimonialsForm = ({ course, onUpdate }: CourseTestimonialsFormProps) => {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [testimonials, setTestimonials] = useState<VideoTestimonial[]>([]);
    const [initialTestimonials, setInitialTestimonials] = useState<VideoTestimonial[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Partial<VideoTestimonial> | null>(null);

    useEffect(() => {
        const sortedTestimonials = (course.videoTestimonials || []).slice().sort((a, b) => a.id.localeCompare(b.id));
        setTestimonials(sortedTestimonials);
        setInitialTestimonials(sortedTestimonials);
    }, [course.videoTestimonials]);

    const handleCancel = () => {
        setTestimonials(initialTestimonials);
        setIsEditing(false);
    };

    const handleOpenDialog = (testimonial: Partial<VideoTestimonial> | null = null) => {
        if (testimonial) {
            setEditingTestimonial(testimonial);
        } else {
            setEditingTestimonial({ id: `testimonial_${Date.now()}`, link: '', description: '' });
        }
        setIsDialogOpen(true);
    };

    const handleDialogInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editingTestimonial) return;
        const { name, value } = e.target;
        setEditingTestimonial(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveTestimonial = () => {
        if (!editingTestimonial || !editingTestimonial.link || !editingTestimonial.description) {
            toast({ variant: 'destructive', title: 'Thiếu thông tin', description: 'Vui lòng điền đầy đủ thông tin.' });
            return;
        }

        let updatedList;
        if (testimonials.some(t => t.id === editingTestimonial.id)) {
            // Editing existing
            updatedList = testimonials.map(t => t.id === editingTestimonial.id ? (editingTestimonial as VideoTestimonial) : t);
        } else {
            // Adding new
            updatedList = [...testimonials, editingTestimonial as VideoTestimonial];
        }
        setTestimonials(updatedList);
        setIsDialogOpen(false);
        setEditingTestimonial(null);
    };

    const removeTestimonial = (id: string) => {
        setTestimonials(testimonials.filter(t => t.id !== id));
    };

    const handleSaveChanges = async () => {
        setIsSubmitting(true);
        try {
            // Simulate API Call
            await new Promise(resolve => setTimeout(resolve, 800));

            const updatedCourse = { ...course, videoTestimonials: testimonials };

            // 1. Update individual course storage
            localStorage.setItem(`nedu_course_${course.id}`, JSON.stringify(updatedCourse));

            // 2. Update global course list
            const storedList = localStorage.getItem('nedu_courses_list');
            if (storedList) {
                const list = JSON.parse(storedList) as Course[];
                const updatedList = list.map(c => c.id === course.id ? updatedCourse : c);
                localStorage.setItem('nedu_courses_list', JSON.stringify(updatedList));
            }

            toast({ title: 'Thành công', description: 'Đã cập nhật danh sách lời chứng thực.' });
            setInitialTestimonials(testimonials);
            setIsEditing(false);
            onUpdate();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể cập nhật.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardContent className="pt-6 relative">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingTestimonial?.id && testimonials.some(t => t.id === editingTestimonial.id) ? 'Chỉnh sửa' : 'Thêm'} Lời chứng thực</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="testimonial-link" className="uppercase text-xs font-bold">Link Video (YouTube)</Label>
                                <Input id="testimonial-link" name="link" value={editingTestimonial?.link || ''} onChange={handleDialogInputChange} placeholder="https://www.youtube.com/watch?v=..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="testimonial-description" className="uppercase text-xs font-bold">Mô tả ngắn</Label>
                                <Textarea id="testimonial-description" name="description" value={editingTestimonial?.description || ''} onChange={handleDialogInputChange} placeholder="Nhập mô tả ngắn về cảm nhận của học viên..." />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSaveTestimonial}>
                                <Save className="mr-2 h-4 w-4" />
                                Lưu
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {!isEditing && (
                    <div className="absolute inset-0 bg-gray-100/70 dark:bg-gray-900/70 z-10 flex items-center justify-center rounded-lg">
                        <Button size="lg" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </Button>
                    </div>
                )}

                <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", !isEditing && "pointer-events-none opacity-80")}>
                    {testimonials.map((item) => {
                        const thumbnailUrl = getYouTubeThumbnail(item.link);
                        return (
                            <div key={item.id} className="relative group border rounded-lg p-4 flex items-center justify-between gap-4 bg-card">
                                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                                    {thumbnailUrl && (
                                        <div className="relative w-24 aspect-video rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                            <Image src={thumbnailUrl} alt={`Thumbnail`} fill className="object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-1 overflow-hidden">
                                        <p className="text-sm font-semibold truncate">{item.description}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{item.link}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(item)} className="h-8 w-8">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeTestimonial(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                    {isEditing && (
                        <div
                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg h-full min-h-[100px] cursor-pointer hover:bg-muted/50 hover:border-primary transition-colors text-muted-foreground"
                            onClick={() => handleOpenDialog()}
                        >
                            <PlusCircle className="h-6 w-6" />
                            <p className="mt-2 text-sm font-semibold">Thêm video</p>
                        </div>
                    )}
                </div>

                {testimonials.length === 0 && !isEditing && (
                    <p className="text-center text-muted-foreground py-8">Chưa có video chứng thực nào. Nhấn "Chỉnh sửa" để bắt đầu.</p>
                )}
            </CardContent>
            {isEditing && (
                <CardFooter className="justify-end gap-2 border-t pt-4">
                    <Button variant="ghost" onClick={handleCancel} disabled={isSubmitting}>Hủy</Button>
                    <Button onClick={handleSaveChanges} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Cập nhật
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};
