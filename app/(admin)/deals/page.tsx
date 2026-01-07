"use client";

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, PlusCircle, Loader2, ArrowLeft, X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import type { PromoCode, Course } from '@/types/admin';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MOCK_COURSES, MOCK_PROMO_CODES } from '@/lib/mock-data';

const formatCurrency = (value: string | number = '') => {
    const numberValue = Number(String(value).replace(/\D/g, ''));
    if (isNaN(numberValue)) return '';
    return new Intl.NumberFormat('vi-VN').format(numberValue);
};

const PromoCodeForm = ({
    promoCode,
    courses,
    isSubmitting,
    onSave,
    onCancel,
}: {
    promoCode: Partial<PromoCode> | null;
    courses: Course[];
    isSubmitting: boolean;
    onSave: (formData: Partial<PromoCode>) => void;
    onCancel: () => void;
}) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<PromoCode>>(() => {
        const initialData = promoCode ? {
            ...promoCode,
            courseIds: promoCode.courseIds || [],
            // Ensure Date objects for date picker
            startDate: new Date(promoCode.startDate as any),
            endDate: new Date(promoCode.endDate as any)
        } : { code: '', courseIds: [], discountAmount: 0, quantity: 0 };
        return initialData;
    });
    const [courseSelectValue, setCourseSelectValue] = useState("");

    // Reset when promoCode changes
    useEffect(() => {
        if (promoCode) {
            setFormData({
                ...promoCode,
                courseIds: promoCode.courseIds || [],
                startDate: new Date(promoCode.startDate as any),
                endDate: new Date(promoCode.endDate as any)
            });
        } else {
            setFormData({ code: '', courseIds: [], discountAmount: 0, quantity: 0 });
        }
    }, [promoCode]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'quantity') {
            const numberValue = value.replace(/\D/g, '');
            setFormData(prev => ({ ...prev, [name]: numberValue ? parseInt(numberValue, 10) : undefined }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, discountAmount: Number(rawValue) }));
    };

    const handleCourseSelect = (courseId: string) => {
        if (courseId && !formData.courseIds?.includes(courseId)) {
            setFormData(prev => ({ ...prev, courseIds: [...(prev.courseIds || []), courseId] }));
        }
        setCourseSelectValue("");
    };

    const handleRemoveCourse = (courseId: string) => {
        setFormData(prev => ({ ...prev, courseIds: (prev.courseIds || []).filter(id => id !== courseId) }));
    };

    const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
        const otherField = field === 'startDate' ? 'endDate' : 'startDate';
        const otherDate = formData[otherField];

        if (date && otherDate) {
            if (field === 'startDate' && date > otherDate) {
                toast({
                    variant: 'destructive',
                    title: 'Ngày không hợp lệ',
                    description: 'Ngày bắt đầu phải trước ngày kết thúc.'
                });
                return;
            }
            if (field === 'endDate' && date < otherDate) {
                toast({
                    variant: 'destructive',
                    title: 'Ngày không hợp lệ',
                    description: 'Ngày kết thúc phải sau ngày bắt đầu.'
                });
                return;
            }
        }
        setFormData(prev => ({ ...prev, [field]: date }));
    };

    const handleSaveClick = () => {
        onSave(formData);
    }

    return (
        <>
            <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Mã</Label>
                        <Input id="code" name="code" value={formData.code || ''} onChange={handleInputChange} disabled={isSubmitting} placeholder="SALE2025" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Số lượng</Label>
                        <Input id="quantity" name="quantity" type="text" value={formData.quantity || ''} onChange={handleInputChange} disabled={isSubmitting} placeholder="100" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="discountAmount">Số tiền giảm (VND)</Label>
                    <Input id="discountAmount" name="discountAmount" value={formatCurrency(formData.discountAmount || 0)} onChange={handleAmountChange} disabled={isSubmitting} placeholder="500.000" />
                </div>
                <div className="space-y-2">
                    <Label>Thời gian</Label>
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !formData.startDate && "text-muted-foreground"
                                    )}
                                    disabled={isSubmitting}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.startDate ? format(new Date(formData.startDate), "dd/MM/yyyy") : <span>Ngày bắt đầu</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={formData.startDate ? new Date(formData.startDate) : undefined}
                                    onSelect={(date) => handleDateChange('startDate', date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <span className="text-muted-foreground">-</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !formData.endDate && "text-muted-foreground"
                                    )}
                                    disabled={isSubmitting}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.endDate ? format(new Date(formData.endDate), "dd/MM/yyyy") : <span>Ngày kết thúc</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={formData.endDate ? new Date(formData.endDate) : undefined}
                                    onSelect={(date) => handleDateChange('endDate', date)}
                                    disabled={(date) => formData.startDate ? date < new Date(formData.startDate) : false}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="courseIds">Chọn khóa học</Label>
                    <Select onValueChange={handleCourseSelect} disabled={isSubmitting} value={courseSelectValue}>
                        <SelectTrigger id="courseIds">
                            <SelectValue placeholder="Chọn khóa học được ưu đãi" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map(course => (
                                <SelectItem key={course.id} value={course.id} disabled={formData.courseIds?.includes(course.id)}>
                                    {course.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {formData.courseIds?.map(courseId => {
                            const course = courses.find(c => c.id === courseId);
                            return (
                                <Badge key={courseId} variant="secondary" className="flex items-center gap-1">
                                    {course?.title || 'Khóa học không xác định'}
                                    <button onClick={() => handleRemoveCourse(courseId)} className="rounded-full p-0.5 hover:bg-destructive/20" disabled={isSubmitting}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>Hủy</Button>
                <Button onClick={handleSaveClick} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Đang lưu...' : (promoCode ? 'Cập nhật' : 'Tạo')}
                </Button>
            </div>
        </>
    );
};


export default function DealsManager() {
    const { toast } = useToast();

    // Data state
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [view, setView] = useState<'list' | 'form'>('list');
    const isMobile = useIsMobile();

    // Load mock data
    useEffect(() => {
        setTimeout(() => {
            // Load Courses
            setCourses(MOCK_COURSES);

            // Load Promo Codes
            const localData = localStorage.getItem('mock_promo_codes');
            if (localData) {
                const parsed = JSON.parse(localData);
                // Restore dates
                const restored = parsed.map((p: any) => ({
                    ...p,
                    startDate: new Date(p.startDate),
                    endDate: new Date(p.endDate),
                    createdAt: new Date(p.createdAt)
                }));
                setPromoCodes(restored);
            } else {
                setPromoCodes(MOCK_PROMO_CODES);
            }

            setLoading(false);
        }, 600);
    }, []);

    // Persist to local storage
    useEffect(() => {
        if (!loading && promoCodes.length > 0) {
            localStorage.setItem('mock_promo_codes', JSON.stringify(promoCodes));
        }
    }, [promoCodes, loading]);


    const handleOpenDialog = (promoCode: PromoCode | null = null) => {
        setEditingPromoCode(promoCode);
        if (isMobile) {
            setView('form');
        } else {
            setIsDialogOpen(true);
        }
    };

    const handleCloseDialog = () => {
        setEditingPromoCode(null);
        if (isMobile) {
            setView('list');
        } else {
            setIsDialogOpen(false);
        }
    };

    const handleSave = async (formData: Partial<PromoCode>) => {
        const saveData = { ...formData };

        if (!saveData.code || !saveData.courseIds || saveData.courseIds.length === 0 || !saveData.startDate || !saveData.endDate) {
            toast({ variant: 'destructive', title: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });
            return;
        }

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate delay

        try {
            if (editingPromoCode) {
                setPromoCodes(prev => prev.map(p =>
                    p.id === editingPromoCode.id
                        ? { ...p, ...saveData } as PromoCode
                        : p
                ));
                toast({ title: 'Thành công (Mock)', description: 'Đã cập nhật mã ưu đãi.' });
            } else {
                const newPromo: PromoCode = {
                    id: Math.random().toString(36).substr(2, 9),
                    code: saveData.code!,
                    quantity: saveData.quantity || 0,
                    discountAmount: saveData.discountAmount || 0,
                    courseIds: saveData.courseIds!,
                    startDate: saveData.startDate!,
                    endDate: saveData.endDate!,
                    createdAt: new Date()
                };
                setPromoCodes(prev => [newPromo, ...prev]);
                toast({ title: 'Thành công (Mock)', description: 'Đã tạo mã ưu đãi mới.' });
            }
            handleCloseDialog();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể lưu ưu đãi.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, code: string) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        try {
            setPromoCodes(prev => prev.filter(p => p.id !== id));
            toast({ title: 'Đã xóa (Mock)', description: `Mã ưu đãi "${code}" đã được xóa.` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể xóa mã ưu đãi.' });
        }
    };

    if (isMobile && view === 'form') {
        return (
            <div className="p-4">
                <Button variant="ghost" onClick={handleCloseDialog} className="mb-4 pl-0 hover:bg-transparent">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại danh sách
                </Button>
                <Card>
                    <CardContent>
                        <PromoCodeForm
                            promoCode={editingPromoCode}
                            courses={courses}
                            isSubmitting={isSubmitting}
                            onSave={handleSave}
                            onCancel={handleCloseDialog}
                        />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-4 space-y-4 container mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">QUẢN LÝ ƯU ĐÃI</h1>
                <Dialog open={isDialogOpen && !isMobile} onOpenChange={(open) => {
                    if (!open) handleCloseDialog();
                    else setIsDialogOpen(true);
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tạo Mã
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] overflow-y-auto max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>{editingPromoCode ? 'Chỉnh sửa' : 'Tạo'} Mã Ưu Đãi</DialogTitle>
                        </DialogHeader>
                        <PromoCodeForm
                            promoCode={editingPromoCode}
                            courses={courses}
                            isSubmitting={isSubmitting}
                            onSave={handleSave}
                            onCancel={handleCloseDialog}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã</TableHead>
                                <TableHead>Giảm giá</TableHead>
                                <TableHead>Số lượng</TableHead>
                                <TableHead>Thời hạn</TableHead>
                                <TableHead className="text-right w-[140px]">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-20 inline-block" /></TableCell>
                                    </TableRow>
                                ))
                            ) : promoCodes.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Chưa có mã ưu đãi nào.</TableCell></TableRow>
                            ) : (
                                promoCodes.map((promo) => (
                                    <TableRow key={promo.id}>
                                        <TableCell className="font-medium text-amber-600">{promo.code}</TableCell>
                                        <TableCell>{formatCurrency(promo.discountAmount)} đ</TableCell>
                                        <TableCell>{promo.quantity}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {format(new Date(promo.startDate), 'dd/MM/yyyy')} - {format(new Date(promo.endDate), 'dd/MM/yyyy')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(promo)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Hành động này không thể hoàn tác. Bạn có chắc muốn xóa mã <span className="font-bold">{promo.code}</span> không?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(promo.id, promo.code)} className="bg-destructive hover:bg-destructive/90">Xóa</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
