'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Trash2, Star, AlertTriangle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip";
import { createClient } from "@/lib/supabase/client";
import type { Course } from "@/types/admin";
import { CourseDetail } from "./CourseDetail";

// Initial MOCK DATA
const INITIAL_COURSES: Course[] = [];

const DeleteCourseDialog = ({ course, onConfirm, children }: { course: Course, onConfirm: () => void, children: React.ReactNode }) => {
    const [confirmationInput, setConfirmationInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const isConfirmationMatching = confirmationInput === course.title;

    const handleConfirm = () => {
        if (isConfirmationMatching) {
            onConfirm();
            setIsOpen(false);
            setConfirmationInput('');
        }
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setConfirmationInput('');
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-primary">Xác nhận xóa khóa học</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Để xác nhận, vui lòng nhập <span className="font-bold text-foreground">{course.title}</span> vào ô bên dưới.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2">
                    <Label htmlFor="delete-confirm-input" className="sr-only uppercase">Tên khóa học</Label>
                    <Input
                        id="delete-confirm-input"
                        value={confirmationInput}
                        onChange={(e) => setConfirmationInput(e.target.value)}
                        placeholder="Nhập tên khóa học để xác nhận"
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={!isConfirmationMatching}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        Xóa vĩnh viễn
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

const getMissingCourseFields = (course: Course): string[] => {
    const missing = [];
    if (!course.shortDescription) missing.push('Mô tả ngắn');
    if (course.fee === undefined || course.fee === null || course.fee === '') missing.push('Giá/Học phí');
    if (!course.topic) missing.push('Chủ đề');
    if (!course.startDate || !course.endDate) missing.push('Ngày bắt đầu & kết thúc');
    if (!course.location) missing.push('Địa điểm học');
    if (course.studentCount === undefined || course.studentCount === null) missing.push('Số lượng học viên');
    if (!course.thumbnailUrl) missing.push('Hình ảnh (16:9)');
    if (!course.thumbnailUrl_9_16) missing.push('Hình ảnh (9:16)');
    if (!course.instructorIds || course.instructorIds.length === 0) missing.push('Mentor');
    if (!course.timeline || course.timeline.length === 0) missing.push('Lộ trình');

    return missing;
}


const CourseList = ({ onSelectCourse }: { onSelectCourse: (course: Course) => void; }) => {
    const { toast } = useToast();
    const supabase = createClient();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const [newCourseName, setNewCourseName] = useState("");
    const [newCourseType, setNewCourseType] = useState<string>("Course");

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            // 1. Fetch programs
            const { data: programsData, error: programsError } = await supabase
                .from('program')
                .select('*')
                .order('created_at', { ascending: false });

            if (programsError) throw programsError;

            // 2. Fetch descriptions separately for Vietnamese (lang_id 1)
            const { data: descriptionsData, error: descriptionsError } = await supabase
                .from('program_description')
                .select('program_id, short_description, topic')
                .eq('lang_id', 1);

            if (descriptionsError) {
                console.warn('Could not fetch descriptions:', descriptionsError);
            }

            if (programsData) {
                const mappedCourses: Course[] = programsData.map(item => {
                    const desc = descriptionsData?.find(d => d.program_id === item.id);

                    return {
                        id: String(item.id),
                        title: item.program_name || '',
                        type: item.program_type === 1 ? 'Course' : 'Membership',
                        isFeatured: item.highlight_program === 1,
                        fee: item.program_price || 0,
                        topic: item.hashtag || desc?.topic || "",
                        schedule: item.total_sessions || "",
                        location: item.link_payment || "",
                        studentCount: item.course || 0,
                        thumbnailUrl: item.image || "",
                        thumbnailUrl_9_16: item.banner || "",
                        shortDescription: desc?.short_description || "",
                        createdAt: item.created_at,
                        startDate: item.start_date,
                        endDate: item.end_date,
                        status: item.status === 1 ? 'published' : 'draft',
                    };
                });
                setCourses(mappedCourses);
            }
        } catch (error: any) {
            console.error('Error fetching courses:', error);
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể lấy danh sách khóa học từ máy chủ.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async () => {
        if (!newCourseName.trim()) {
            toast({
                variant: "destructive",
                title: "Thông tin chưa đầy đủ",
                description: "Vui lòng nhập tên khóa học.",
            });
            return;
        }

        setIsCreating(true);
        try {
            // 1. Insert into program table
            const { data: programData, error: programError } = await supabase
                .from('program')
                .insert({
                    program_name: newCourseName,
                    program_type: newCourseType === 'Course' ? 1 : 2,
                    status: 0, // Draft
                    highlight_program: 0,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (programError) throw programError;

            // 2. Insert into program_description for default language (assume lang_id: 1 is Vietnamese)
            if (programData) {
                const { error: descError } = await supabase
                    .from('program_description')
                    .insert({
                        program_id: programData.id,
                        lang_id: 1, // Vietnamese by default
                        program_name: newCourseName,
                        created_at: new Date().toISOString()
                    });

                if (descError) {
                    console.error('Error creating description:', descError);
                    // We don't throw here to avoid failing the whole process, 
                    // but in real app we should handle this.
                }
            }

            toast({
                title: 'Thành công',
                description: `Khóa học "${newCourseName}" đã được tạo.`,
            });

            setNewCourseName("");
            setIsCreateDialogOpen(false);
            fetchCourses(); // Refresh list
        } catch (error: any) {
            console.error('Error creating course:', error);
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.message || 'Không thể tạo khóa học mới.'
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
        try {
            const { error } = await supabase
                .from('program')
                .delete()
                .eq('id', courseId);

            if (error) throw error;

            toast({
                title: 'Thành công',
                description: `Khóa học "${courseTitle}" đã được xóa.`,
            });
            fetchCourses();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể xóa khóa học.'
            });
        }
    };

    const handleToggleFeatured = async (courseId: string, currentStatus: boolean | undefined) => {
        const updatedStatus = !currentStatus;
        try {
            const { error } = await supabase
                .from('program')
                .update({ highlight_program: updatedStatus ? 1 : 0 })
                .eq('id', courseId);

            if (error) throw error;

            toast({
                title: 'Thành công',
                description: `Đã ${updatedStatus ? 'đánh dấu' : 'bỏ đánh dấu'} nổi bật cho khóa học.`,
            });
            fetchCourses();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể cập nhật trạng thái nổi bật.'
            });
        }
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">QUẢN LÝ KHÓA HỌC</h1>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-[#F7B418] hover:bg-[#e5a616] text-gray-900 font-medium">
                            <PlusCircle className="h-4 w-4" />
                            Thêm khóa học
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tạo khóa học mới</DialogTitle>
                            <DialogDescription>Nhập tên và mô hình để bắt đầu khởi tạo khóa học.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-course-name">Tên khóa học</Label>
                                <Input id="new-course-name" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} placeholder="VD: Khóa học Digital Marketing" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-course-type">Mô hình</Label>
                                <Select value={newCourseType} onValueChange={setNewCourseType}>
                                    <SelectTrigger id="new-course-type">
                                        <SelectValue placeholder="Chọn mô hình" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Course">Khóa học (Course)</SelectItem>
                                        <SelectItem value="Membership">Membership</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>Hủy</Button>
                            <Button onClick={handleCreateCourse} disabled={isCreating}>
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Tạo khóa học
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <TooltipProvider delayDuration={0}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="uppercase">Tên khóa học</TableHead>
                                    <TableHead className="text-right uppercase">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <>
                                        <TableRow><TableCell colSpan={2}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                                        <TableRow><TableCell colSpan={2}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                                        <TableRow><TableCell colSpan={2}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                                    </>
                                ) : (
                                    <>
                                        {courses.length === 0 && <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-8">Chưa có khóa học nào.</TableCell></TableRow>}

                                        {courses.map((course) => {
                                            const missingFields = getMissingCourseFields(course);
                                            return (
                                                <TableRow key={course.id} className="group">
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => onSelectCourse(course)}
                                                                className="font-medium hover:underline text-primary text-left"
                                                            >
                                                                {course.title}
                                                            </button>
                                                            {missingFields.length > 0 && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <AlertTriangle className="h-4 w-4 text-amber-500 cursor-help" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="right">
                                                                        <p className="font-semibold text-foreground mb-1">Thông tin còn thiếu:</p>
                                                                        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                                                                            {missingFields.map(field => <li key={field}>{field}</li>)}
                                                                        </ul>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground mt-0.5 uppercase flex gap-2">
                                                            <span>{course.type}</span>
                                                            {course.status && <span>• {course.status}</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleToggleFeatured(course.id, course.isFeatured)}
                                                                title={course.isFeatured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
                                                            >
                                                                <Star className={cn("h-4 w-4", course.isFeatured ? "text-yellow-500 fill-yellow-400" : "text-gray-400")} />
                                                            </Button>
                                                            <DeleteCourseDialog course={course} onConfirm={() => handleDeleteCourse(course.id, course.title)}>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-muted-foreground hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </DeleteCourseDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </TooltipProvider>
                </CardContent>
            </Card>
        </div>
    )
}

interface CoursesConfigContentProps {
    selectedCourse: Course | null;
    onSelectCourse: (course: Course | null) => void;
}

export const CoursesConfigContent = ({ selectedCourse, onSelectCourse }: CoursesConfigContentProps) => {
    const handleUpdate = () => {
        if (!selectedCourse) return;
        const stored = localStorage.getItem(`nedu_course_${selectedCourse.id}`);
        if (stored) {
            onSelectCourse(JSON.parse(stored));
        }
    };

    if (selectedCourse) {
        return <CourseDetail course={selectedCourse} onBack={() => onSelectCourse(null)} onUpdate={handleUpdate} />
    }

    return <CourseList onSelectCourse={onSelectCourse} />
}
