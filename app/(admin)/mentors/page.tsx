"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Loader2, User, Upload, ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Mentor } from "@/types/admin";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { createClient } from "@/lib/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MOCK_MENTORS } from "@/lib/mock-data";

const MentorForm = ({
    mentor,
    isSubmitting,
    onSave,
    onCancel,
}: {
    mentor: Partial<Mentor> | null;
    isSubmitting: boolean;
    onSave: (formData: Partial<Omit<Mentor, 'id' | 'createdAt'>>, newAvatar: File | null) => void;
    onCancel: () => void;
}) => {
    const [formData, setFormData] = useState<Partial<Omit<Mentor, 'id' | 'createdAt'>>>(
        mentor ? {
            name: mentor.name,
            role: mentor.role,
            bio: mentor.bio,
            cvUrl: mentor.cvUrl,
            avatarUrl: mentor.avatarUrl,
            quote: mentor.quote || ''
        } : { name: '', role: '', bio: '', cvUrl: '', quote: '' }
    );
    const [newAvatar, setNewAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(mentor?.avatarUrl || null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Reset form when mentor prop changes (e.g. switching between edit/create)
    useEffect(() => {
        if (mentor) {
            setFormData({
                name: mentor.name,
                role: mentor.role,
                bio: mentor.bio,
                cvUrl: mentor.cvUrl,
                avatarUrl: mentor.avatarUrl,
                quote: mentor.quote || ''
            });
            setAvatarPreview(mentor.avatarUrl || null);
            setNewAvatar(null);
        } else {
            setFormData({ name: '', role: '', bio: '', cvUrl: '', quote: '' });
            setAvatarPreview(null);
            setNewAvatar(null);
        }
    }, [mentor]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

    const handleSaveClick = () => {
        onSave(formData, newAvatar);
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                <div className="space-y-2 md:col-span-1">
                    <Label className="uppercase">Ảnh đại diện</Label>
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group w-40 h-40 rounded-full overflow-hidden border bg-muted">
                            <Avatar className="h-full w-full">
                                {avatarPreview ? (
                                    <AvatarImage src={avatarPreview} className="object-cover" />
                                ) : (
                                    <AvatarFallback className="text-muted-foreground"><User className="h-16 w-16" /></AvatarFallback>
                                )}
                            </Avatar>
                            <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer" disabled={isSubmitting}>
                                <Upload className="h-8 w-8" />
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={avatarInputRef}
                            onChange={handleAvatarChange}
                            accept="image/*"
                            className="hidden"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
                <div className="space-y-4 md:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="uppercase">Tên</Label>
                            <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="uppercase">Lĩnh vực</Label>
                            <Input id="role" name="role" value={formData.role || ''} onChange={handleInputChange} disabled={isSubmitting} placeholder="e.g. FOUNDER & CEO" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quote" className="uppercase">Quote</Label>
                        <Input id="quote" name="quote" value={formData.quote || ''} onChange={handleInputChange} disabled={isSubmitting} placeholder="e.g. Life is a journey..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cvUrl" className="uppercase">Link thông tin</Label>
                        <Input id="cvUrl" name="cvUrl" value={formData.cvUrl || ''} onChange={handleInputChange} disabled={isSubmitting} placeholder="https://example.com/cv.pdf" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio" className="uppercase">Tiểu sử / Mô tả</Label>
                        <Textarea id="bio" name="bio" value={formData.bio || ''} onChange={handleInputChange} disabled={isSubmitting} rows={5} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>Hủy</Button>
                        <Button onClick={handleSaveClick} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Đang lưu...' : (mentor ? 'Cập nhật' : 'Tạo')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const MentorConfigForm = () => {
    const supabase = createClient();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
    const [view, setView] = useState<'list' | 'form'>('list');
    const isMobile = useIsMobile();

    // Data state
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [mentorsLoading, setMentorsLoading] = useState(true);

    // Initial load from mock data
    useEffect(() => {
        // Simulate API delay
        setTimeout(() => {
            // Check if we have data in localStorage to persist changes during session
            const localData = localStorage.getItem('mock_mentors');
            if (localData) {
                // Convert date strings back to Date objects if needed, 
                // but MOCK_MENTORS uses Date objects. JSON.parse will give strings.
                setMentors(JSON.parse(localData));
            } else {
                setMentors(MOCK_MENTORS);
            }
            setMentorsLoading(false);
        }, 800);
    }, []);

    // Save changes to localStorage to simulate persistence
    useEffect(() => {
        if (!mentorsLoading && mentors.length > 0) {
            localStorage.setItem('mock_mentors', JSON.stringify(mentors));
        }
    }, [mentors, mentorsLoading]);

    const handleOpenDialog = (mentor: Mentor | null = null) => {
        setEditingMentor(mentor);
        if (isMobile) {
            setView('form');
        } else {
            setIsDialogOpen(true);
        }
    };

    const handleCloseForm = () => {
        setEditingMentor(null);
        if (isMobile) {
            setView('list');
        } else {
            setIsDialogOpen(false);
        }
    };

    const handleSave = async (formData: Partial<Omit<Mentor, 'id' | 'createdAt'>>, newAvatar: File | null) => {
        const { name, role, bio, quote } = formData;

        // Basic validation
        if (!name || !role || !bio) {
            toast({
                variant: 'destructive',
                title: 'Thông tin chưa đầy đủ',
                description: 'Vui lòng điền tên, lĩnh vực và tiểu sử.',
            });
            return;
        }

        setIsSubmitting(true);

        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            let avatarUrl = formData.avatarUrl;
            if (newAvatar) {
                // Mock image upload by reading file to data URL
                avatarUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(newAvatar);
                });
            }

            const newMentorData = {
                name,
                role,
                bio,
                cvUrl: formData.cvUrl,
                avatarUrl: avatarUrl || "https://github.com/shadcn.png", // Default mock avatar
                quote,
            };

            if (editingMentor) {
                setMentors(prev => prev.map(m =>
                    m.id === editingMentor.id
                        ? { ...m, ...newMentorData }
                        : m
                ));
                toast({ title: 'Thành công (Mock)', description: 'Đã cập nhật thông tin Mentor.' });
            } else {
                const newId = Math.random().toString(36).substr(2, 9);
                const newMentor: Mentor = {
                    id: newId,
                    ...newMentorData,
                    name: newMentorData.name!, // asserted because validation passed
                    role: newMentorData.role!,
                    bio: newMentorData.bio!,
                    createdAt: new Date(),
                };
                setMentors(prev => [newMentor, ...prev]);
                toast({ title: 'Thành công (Mock)', description: 'Đã thêm Mentor mới.' });
            }

            handleCloseForm();
        } catch (error: any) {
            console.error("Save error:", error);
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể lưu thông tin.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMentor = async (mentorId: string) => {
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            setMentors(prev => prev.filter(m => m.id !== mentorId));
            toast({
                title: 'Đã xóa (Mock)',
                description: 'Đã xóa Mentor.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể xóa.',
            });
        }
    };

    if (isMobile && view === 'form') {
        return (
            <div>
                <Button variant="ghost" onClick={handleCloseForm} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại danh sách
                </Button>
                <Card>
                    <CardContent className="pt-6">
                        <MentorForm
                            mentor={editingMentor}
                            isSubmitting={isSubmitting}
                            onSave={handleSave}
                            onCancel={handleCloseForm}
                        />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">QUẢN LÝ MENTOR</h1>
                <Dialog open={isDialogOpen && !isMobile} onOpenChange={(open) => {
                    if (!open) handleCloseForm();
                    else setIsDialogOpen(true);
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Thêm
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
                        <DialogHeader className="px-6 py-4 border-b">
                            <DialogTitle>{editingMentor ? 'Chỉnh sửa' : 'Tạo'} Mentor</DialogTitle>
                        </DialogHeader>
                        <div className="flex-grow overflow-auto p-6">
                            <MentorForm
                                mentor={editingMentor}
                                isSubmitting={isSubmitting}
                                onSave={handleSave}
                                onCancel={handleCloseForm}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardContent className="pt-6">
                    {mentorsLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : mentors && mentors.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="uppercase">Mentor</TableHead>
                                    <TableHead className="text-right uppercase">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mentors.map((mentor) => (
                                    <TableRow key={mentor.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={mentor.avatarUrl} alt={mentor.name} className="object-cover" />
                                                    <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{mentor.name}</span>
                                                    <span className="text-xs text-muted-foreground">{mentor.role}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(mentor)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Xóa Mentor?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Hành động này không thể hoàn tác. Bạn có chắc muốn xóa <span className="font-bold">{mentor.name}</span>?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteMentor(mentor.id)}
                                                            className={cn(buttonVariants({ variant: "destructive" }))}
                                                        >
                                                            Xóa
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">Chưa có Mentor nào.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default function MentorsPage() {
    return (
        <div className="p-4 container mx-auto">
            <MentorConfigForm />
        </div>
    );
};
