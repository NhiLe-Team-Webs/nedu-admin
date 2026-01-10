'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Trash2, Star, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";
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


const CourseList = ({
    courses,
    loading,
    onSelectCourse,
    onToggleFeatured,
    onRefresh
}: {
    courses: Course[];
    loading: boolean;
    onSelectCourse: (course: Course) => void;
    onToggleFeatured: (id: string, current: boolean | undefined) => void;
    onRefresh: () => void;
}) => {
    const { toast } = useToast();
    const supabase = createClient();
    const [isCreating, setIsCreating] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const [newCourseName, setNewCourseName] = useState("");
    const [newCourseType, setNewCourseType] = useState<string>("Course");

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
            const { data: programData, error: programError } = await supabase
                .from('program')
                .insert({
                    program_name: newCourseName,
                    program_type: newCourseType === 'Course' ? 1 : 2,
                    status: 0,
                    highlight_program: 0,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (programError) throw programError;

            if (programData) {
                await supabase
                    .from('program_description')
                    .insert({
                        program_id: programData.id,
                        lang_id: 1,
                        program_name: newCourseName,
                        created_at: new Date().toISOString()
                    });
            }

            toast({
                title: 'Thành công',
                description: `Khóa học "${newCourseName}" đã được tạo.`,
            });

            setNewCourseName("");
            setIsCreateDialogOpen(false);
            onRefresh();
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
                                                                onClick={() => onToggleFeatured(course.id, course.isFeatured)}
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
    const { toast } = useToast();
    const supabase = createClient();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const { data: programsData, error: programsError } = await supabase
                .from('program')
                .select('*')
                .order('created_at', { ascending: false });

            if (programsError) throw programsError;

            const { data: descriptionsData } = await supabase
                .from('program_description')
                .select('program_id, short_description, topic, is_featured, format')
                .eq('lang_id', 1);

            const { data: challengeData } = await supabase
                .from('program_30day_challenge')
                .select('*');

            if (programsData) {
                const mappedCourses: Course[] = programsData.map(item => {
                    const desc = descriptionsData?.find(d => d.program_id === item.id);
                    const challenge = challengeData?.find(c => c.program_id === item.id);

                    return {
                        id: String(item.id),
                        title: item.program_name || '',
                        type: item.program_type === 1 ? 'Course' : 'Membership',
                        isFeatured: desc?.is_featured ?? (item.highlight_program === 1),
                        fee: challenge?.monthly_price ?? (item.program_price || 0),
                        membershipFee: challenge?.membership_price,
                        topic: item.hashtag || desc?.topic || "",
                        schedule: item.total_sessions || "",
                        location: item.link_payment || "",
                        studentCount: item.course || 0,
                        thumbnailUrl: item.image || "",
                        thumbnailUrl_9_16: item.banner || "",
                        shortDescription: desc?.short_description || "",
                        format: desc?.format || "",
                        createdAt: item.created_at,
                        startDate: item.start_date,
                        endDate: item.end_date,
                        status: item.status === 1 ? 'published' : 'draft',
                    };
                });

                const filteredCourses = mappedCourses.filter(course => course.id === '82');
                const sortedCourses = filteredCourses.sort((a, b) => {
                    if (a.isFeatured === b.isFeatured) return 0;
                    return a.isFeatured ? -1 : 1;
                });

                setCourses(sortedCourses);

                // If a course is selected, update it with fresh data
                if (selectedCourse) {
                    const updated = sortedCourses.find(c => c.id === selectedCourse.id);
                    if (updated) {
                        onSelectCourse(updated);
                    }
                }
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

    useEffect(() => {
        fetchCourses();
    }, []);

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

    const handleUpdate = async (updatedCourse?: Course) => {
        // Trigger a re-fetch to ensure all state is consistent with DB
        // fetchCourses already handles updating selectedCourse at lines 305-311
        await fetchCourses();
    };

    if (selectedCourse) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => onSelectCourse(null)}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-2xl font-bold text-primary uppercase">
                        {selectedCourse.title}
                    </h1>
                </div>
                <CourseDetail
                    course={selectedCourse}
                    onBack={() => onSelectCourse(null)}
                    onUpdate={handleUpdate}
                />
            </div>
        );
    }

    return (
        <CourseList
            courses={courses}
            loading={loading}
            onSelectCourse={onSelectCourse}
            onToggleFeatured={handleToggleFeatured}
            onRefresh={fetchCourses}
        />
    )
}
