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

                // Filter to only show specific courses (ID 82 or others as needed)
                const filteredCourses = mappedCourses.filter(course => course.id === '82');

                // Sort: prioritize featured (starred) courses
                const sortedCourses = filteredCourses.sort((a, b) => {
                    if (a.isFeatured === b.isFeatured) return 0;
                    return a.isFeatured ? -1 : 1;
                });

                setCourses(sortedCourses);
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
                <h1 className="text-2xl font-bold uppercase">KHÓA HỌC</h1>
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
