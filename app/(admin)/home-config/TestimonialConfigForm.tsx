'use client';

import { useState, useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Loader2, User, Upload, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Testimonial } from "@/types/admin";

// Mock Data
const MOCK_TESTIMONIALS: Testimonial[] = [
    {
        id: '1',
        name: 'Nguyễn Văn A',
        role: 'CEO',
        content: 'Khóa học tuyệt vời, giúp tôi thay đổi tư duy lãnh đạo.',
        location: 'Hà Nội',
        avatarUrl: '/placeholder-avatar.jpg',
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Trần Thị B',
        role: 'Marketing Manager',
        content: 'Nội dung rất thực tế và áp dụng được ngay vào công việc.',
        location: 'TP. Hồ Chí Minh',
        avatarUrl: '/placeholder-avatar.jpg',
        createdAt: new Date(Date.now() - 86400000).toISOString()
    }
];

export const TestimonialConfigForm = () => {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

    // Mock State
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [testimonialsLoading, setTestimonialsLoading] = useState(true);

    const [formData, setFormData] = useState<Partial<Omit<Testimonial, 'id' | 'createdAt'>>>({});
    const [newAvatar, setNewAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const endOfListRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        const loadToasts = async () => {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));
            const stored = localStorage.getItem('nedu_testimonials');
            if (stored) {
                try {
                    setTestimonials(JSON.parse(stored));
                } catch (e) {
                    setTestimonials(MOCK_TESTIMONIALS);
                }
            } else {
                setTestimonials(MOCK_TESTIMONIALS);
            }
            setTestimonialsLoading(false);
        };
        loadToasts();
    }, []);


    const sortedTestimonials = useMemo(() => {
        return [...testimonials].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
    }, [testimonials]);

    const resetForm = () => {
        setFormData({});
        setNewAvatar(null);
        setAvatarPreview(null);
        if (avatarInputRef.current) {
            avatarInputRef.current.value = "";
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, location: value as Testimonial['location'] }));
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setNewAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (!isCreateDialogOpen && endOfListRef.current) {
            endOfListRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isCreateDialogOpen]);


    const handleCreateTestimonial = async () => {

        if (!formData.name || !formData.role || !formData.content || !formData.location) {
            toast({
                variant: 'destructive',
                title: 'Thông tin chưa đầy đủ',
                description: 'Vui lòng điền tất cả các trường.', // Removed avatar requirement for mock
            });
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            try {
                let avatarUrl = '/placeholder-avatar.jpg';
                if (newAvatar) {
                    avatarUrl = URL.createObjectURL(newAvatar);
                }

                const testimonialData: Testimonial = {
                    id: crypto.randomUUID(),
                    name: formData.name!,
                    role: formData.role!,
                    content: formData.content!,
                    location: formData.location!,
                    avatarUrl,
                    createdAt: new Date().toISOString(),
                };

                const newTestimonials = [...testimonials, testimonialData];
                setTestimonials(newTestimonials);
                localStorage.setItem('nedu_testimonials', JSON.stringify(newTestimonials));

                toast({
                    title: 'Thành công',
                    description: 'Đã tạo đánh giá mới.',
                });
                setIsCreateDialogOpen(false);
                resetForm();

            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Lỗi',
                    description: error.message || 'Không thể tạo đánh giá. Vui lòng thử lại.',
                });
            } finally {
                setIsSubmitting(false);
            }
        }, 1000);
    };

    const handleOpenEditDialog = (testimonial: Testimonial) => {
        setEditingTestimonial(testimonial);
        setFormData({
            name: testimonial.name,
            role: testimonial.role,
            content: testimonial.content,
            location: testimonial.location,
            avatarUrl: testimonial.avatarUrl
        });
        setAvatarPreview(testimonial.avatarUrl);
        setNewAvatar(null);
        setIsEditDialogOpen(true);
    };

    const handleUpdateTestimonial = async () => {
        if (!editingTestimonial) return;

        if (!formData.name || !formData.role || !formData.content || !formData.location) {
            toast({ variant: 'destructive', title: 'Thông tin chưa đầy đủ', description: 'Vui lòng điền tất cả các trường.' });
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            try {
                let avatarUrl = formData.avatarUrl || '/placeholder-avatar.jpg';
                if (newAvatar) {
                    avatarUrl = URL.createObjectURL(newAvatar);
                }

                const updatedTestimonials = testimonials.map(t =>
                    t.id === editingTestimonial.id
                        ? { ...t, name: formData.name!, role: formData.role!, content: formData.content!, location: formData.location!, avatarUrl }
                        : t
                );

                setTestimonials(updatedTestimonials);
                localStorage.setItem('nedu_testimonials', JSON.stringify(updatedTestimonials));

                toast({ title: 'Thành công', description: 'Đã cập nhật đánh giá.' });
                setIsEditDialogOpen(false);
                resetForm();
                setEditingTestimonial(null);

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Lỗi', description: error.message || 'Không thể cập nhật đánh giá. Vui lòng thử lại.' });
            } finally {
                setIsSubmitting(false);
            }
        }, 1000);
    };

    const handleDeleteTestimonial = async (testimonialId: string) => {
        try {
            const newTestimonials = testimonials.filter(t => t.id !== testimonialId);
            setTestimonials(newTestimonials);
            localStorage.setItem('nedu_testimonials', JSON.stringify(newTestimonials));

            toast({
                title: 'Đã xóa',
                description: 'Đã xóa đánh giá.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi khi xóa',
                description: error.message || 'Không thể xóa đánh giá. Vui lòng thử lại.',
            });
        }
    };

    const renderEditDialog = () => (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
                resetForm();
                setEditingTestimonial(null);
            }
        }}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa đánh giá</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name-edit" className="uppercase">Tên khách hàng</Label>
                            <Input id="name-edit" name="name" value={formData.name || ''} onChange={handleInputChange} disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role-edit" className="uppercase">Vai trò/Nghề nghiệp</Label>
                            <Input id="role-edit" name="role" value={formData.role || ''} onChange={handleInputChange} disabled={isSubmitting} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <Label className="uppercase">Ảnh đại diện (Avatar)</Label>
                            <div className="relative w-20 h-20 group">
                                <Avatar className="h-full w-full">
                                    {avatarPreview ? (
                                        <AvatarImage src={avatarPreview} />
                                    ) : (
                                        <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
                                    )}
                                </Avatar>
                                {isEditing && !newAvatar && (
                                    <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white transition-opacity opacity-100 rounded-full cursor-pointer" disabled={isSubmitting}>
                                        <Upload className="h-6 w-6" />
                                    </button>
                                )}
                                <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" disabled={isSubmitting} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location-edit" className="uppercase">Địa điểm</Label>
                            <Select value={formData.location || ''} onValueChange={handleSelectChange} disabled={isSubmitting}>
                                <SelectTrigger id="location-edit">
                                    <SelectValue placeholder="Chọn địa điểm" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                                    <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                                    <SelectItem value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content-edit" className="uppercase">Nội dung đánh giá</Label>
                        <Textarea id="content-edit" name="content" value={formData.content || ''} onChange={handleInputChange} disabled={isSubmitting} rows={4} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleUpdateTestimonial} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    const renderAddCard = () => (
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
        }}>
            <DialogTrigger asChild>
                <Card className="flex items-center justify-center p-4 border-2 border-dashed h-full min-h-[190px] cursor-pointer hover:bg-muted/50 hover:border-primary transition-colors">
                    <div className="text-center text-muted-foreground">
                        <PlusCircle className="h-8 w-8 mx-auto" />
                        <p className="mt-2 font-medium text-sm">Tạo đánh giá mới</p>
                    </div>
                </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Tạo đánh giá mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin cho bài đánh giá của khách hàng.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="uppercase">Tên khách hàng</Label>
                            <Input id="name" name="name" onChange={handleInputChange} disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="uppercase">Vai trò/Nghề nghiệp</Label>
                            <Input id="role" name="role" onChange={handleInputChange} disabled={isSubmitting} placeholder="e.g. Startup Founder" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <Label className="uppercase">Ảnh đại diện (Avatar)</Label>
                            <div className="relative w-20 h-20 group">
                                <Avatar className="h-full w-full">
                                    {avatarPreview ? (
                                        <AvatarImage src={avatarPreview} />
                                    ) : (
                                        <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
                                    )}
                                </Avatar>
                                {!newAvatar && (
                                    <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white transition-opacity opacity-100 rounded-full cursor-pointer" disabled={isSubmitting}>
                                        <Upload className="h-6 w-6" />
                                    </button>
                                )}
                                <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" disabled={isSubmitting} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location" className="uppercase">Địa điểm</Label>
                            <Select onValueChange={handleSelectChange} disabled={isSubmitting}>
                                <SelectTrigger id="location">
                                    <SelectValue placeholder="Chọn địa điểm" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                                    <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                                    <SelectItem value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content" className="uppercase">Nội dung đánh giá</Label>
                        <Textarea id="content" name="content" onChange={handleInputChange} disabled={isSubmitting} rows={4} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreateTestimonial} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSubmitting ? 'Đang tạo...' : 'Tạo'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
                <CardContent className="pt-6 relative">
                    {!isEditing && (
                        <div className="absolute inset-0 bg-gray-100/70 dark:bg-gray-900/70 z-10 flex items-center justify-center rounded-lg">
                            <Button size="lg" onClick={() => setIsEditing(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                            </Button>
                        </div>
                    )}

                    {testimonialsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {sortedTestimonials && sortedTestimonials.map(testimonial => (
                                <Card key={testimonial.id} className="p-4">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={testimonial.avatarUrl} alt={testimonial.name} />
                                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold">{testimonial.name}</p>
                                                    <p className="text-sm text-muted-foreground">{testimonial.role} - {testimonial.location}</p>
                                                </div>
                                                {isEditing && (
                                                    <div className="flex items-center">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(testimonial)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Xóa đánh giá?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Hành động này không thể hoàn tác.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteTestimonial(testimonial.id)}>Xóa</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm mt-2 italic border-l-2 pl-3">
                                                "{testimonial.content}"
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {isEditing && renderAddCard()}
                        </div>
                    )}
                    <div ref={endOfListRef} />
                </CardContent>
                {isEditing && (
                    <CardFooter className="justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>
                            Hủy
                        </Button>
                        <Button onClick={() => setIsEditing(false)}>
                            <Check className="mr-2 h-4 w-4" />
                            Cập nhật
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {editingTestimonial && renderEditDialog()}
        </div>
    );
};
