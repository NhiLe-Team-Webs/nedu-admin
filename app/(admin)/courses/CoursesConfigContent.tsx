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
import type { Course } from "@/types/admin";
import { CourseDetail } from "./CourseDetail";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip";

// Initial MOCK DATA
const INITIAL_COURSES: Course[] = [
    {
        id: "COURSE-001",
        title: "Khóa học Fullstack Next.js 14",
        type: "Course",
        isFeatured: true,
        shortDescription: "Học lập trình web từ cơ bản đến nâng cao với Next.js 14.",
        fee: 1299000,
        topic: "Lập trình Web",
        schedule: "Thứ 3-5-7",
        location: "Online",
        studentCount: 50,
        thumbnailUrl: "",
        thumbnailUrl_9_16: "",
        instructorIds: ["INS-1"],
        createdAt: new Date().toISOString()
    },
    {
        id: "COURSE-002",
        title: "LÀ CHÍNH MÌNH",
        type: "Membership",
        isFeatured: false,
        shortDescription: "Khám phá bản thân và phát triển tư duy.",
        fee: 599000,
        topic: "Phát triển cá nhân",
        schedule: "Linh hoạt",
        location: "Online",
        studentCount: 150,
        thumbnailUrl: "",
        thumbnailUrl_9_16: "",
        instructorIds: ["INS-2"],
        createdAt: new Date().toISOString()
    },
    {
        id: "COURSE-003",
        title: "Thử Thách 30 Ngày",
        type: "Course",
        isFeatured: true,
        shortDescription: "30 ngày thay đổi tư duy và thói quen quản lý tài chính cá nhân.",
        fee: 1990000,
        topic: "Tài chính & Tư duy",
        schedule: "Hàng ngày (30 ngày)",
        location: "Online",
        studentCount: 500,
        thumbnailUrl: "",
        thumbnailUrl_9_16: "",
        instructorIds: ["INS-1"],
        benefits: [
            {
                id: "benefit_1",
                title: "Nắm rõ thu và chi mỗi tháng",
                quoteText: "Tiền không khó quản lý, khó là mình không nhìn rõ nó.",
                quote: "Sau 30 ngày, bạn sẽ biết rõ mỗi tháng tiền đi đâu, vì sao hết tiền và cách để dư ra ít nhất 10-20% thu nhập."
            },
            {
                id: "benefit_2",
                title: "Chi tiêu có kiểm soát",
                quoteText: "Xài tiền không sai, xài mà không biết vì sao mới mệt.",
                quote: "Bạn sẽ bắt đầu suy nghĩ trước khi chi, phân biệt được 'Muốn' và 'Cần', từ đó chấm dứt tình trạng mua sắm bốc đồng."
            },
            {
                id: "benefit_3",
                title: "Xây dựng thói quen bền vững",
                quoteText: "Thứ làm bạn mệt không phải tiền, mà là cách xài tiền.",
                quote: "Hình thành thói quen ghi chép và lập kế hoạch tài chính chỉ với 5 phút mỗi ngày, giúp tâm trí bình an hơn."
            }
        ],
        createdAt: new Date().toISOString()
    }
];

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
    if (!course.schedule) missing.push('Thời gian học');
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
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const [newCourseName, setNewCourseName] = useState("");
    const [newCourseType, setNewCourseType] = useState<string>("Course");

    useEffect(() => {
        const stored = localStorage.getItem('nedu_courses_list');
        if (stored) {
            setCourses(JSON.parse(stored));
        } else {
            setCourses(INITIAL_COURSES);
            localStorage.setItem('nedu_courses_list', JSON.stringify(INITIAL_COURSES));
        }
        setLoading(false);
    }, []);

    const saveCourses = (updatedCourses: Course[]) => {
        setCourses(updatedCourses);
        localStorage.setItem('nedu_courses_list', JSON.stringify(updatedCourses));
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const newCourse: Course = {
            id: `COURSE-${Date.now()}`,
            title: newCourseName,
            type: newCourseType,
            isFeatured: false,
            status: 'draft',
            createdAt: new Date().toISOString()
        };

        const updatedCourses = [newCourse, ...courses];
        saveCourses(updatedCourses);

        toast({
            title: 'Thành công',
            description: `Khóa học "${newCourseName}" đã được tạo.`,
        });

        setNewCourseName("");
        setIsCreateDialogOpen(false);
        setIsCreating(false);
    };

    const handleDeleteCourse = (courseId: string, courseTitle: string) => {
        const updatedCourses = courses.filter(c => c.id !== courseId);
        saveCourses(updatedCourses);
        toast({
            title: 'Thành công',
            description: `Khóa học "${courseTitle}" đã được xóa.`,
        });
    };

    const handleToggleFeatured = async (courseId: string, currentStatus: boolean | undefined) => {
        const updatedStatus = !currentStatus;
        const updatedCourses = courses.map(c => c.id === courseId ? { ...c, isFeatured: updatedStatus } : c);
        saveCourses(updatedCourses);

        toast({
            title: 'Thành công',
            description: `Đã ${updatedStatus ? 'đánh dấu' : 'bỏ đánh dấu'} nổi bật cho khóa học.`,
        });
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">QUẢN LÝ KHÓA HỌC</h1>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
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
                                                                    disabled={course.title === 'LÀ CHÍNH MÌNH' || course.title === 'Thử Thách 30 Ngày'}
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
