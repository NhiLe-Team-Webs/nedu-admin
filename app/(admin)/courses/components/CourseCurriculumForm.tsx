'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, Check, Loader2, GripVertical, FileText, Video, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Course, CurriculumSection, CurriculumLesson } from "@/types/admin";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const LESSON_TYPES = [
    { value: 'video', label: 'Video', icon: Video },
    { value: 'article', label: 'Bài viết', icon: FileText },
    { value: 'quiz', label: 'Trắc nghiệm', icon: HelpCircle },
];

export const CourseCurriculumForm = ({ course, onUpdate }: { course: Course; onUpdate: () => void; }) => {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [curriculum, setCurriculum] = useState<CurriculumSection[]>([]);
    const [initialCurriculum, setInitialCurriculum] = useState<CurriculumSection[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lesson Edit Dialog State
    const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [editingLesson, setEditingLesson] = useState<Partial<CurriculumLesson> | null>(null);

    useEffect(() => {
        const data = course.curriculum || [];
        setCurriculum(data);
        setInitialCurriculum(data);
    }, [course.curriculum]);

    const handleCancel = () => {
        setCurriculum(initialCurriculum);
        setIsEditing(false);
    };

    const handleAddSection = () => {
        const newSection: CurriculumSection = {
            id: `section_${Date.now()}`,
            title: `Chương ${curriculum.length + 1}`,
            lessons: []
        };
        setCurriculum([...curriculum, newSection]);
    };

    const handleRemoveSection = (id: string) => {
        setCurriculum(curriculum.filter(s => s.id !== id));
    };

    const handleSectionTitleChange = (id: string, title: string) => {
        setCurriculum(curriculum.map(s => s.id === id ? { ...s, title } : s));
    };

    const handleOpenLessonDialog = (sectionId: string, lesson: Partial<CurriculumLesson> | null = null) => {
        setActiveSectionId(sectionId);
        if (lesson) {
            setEditingLesson(lesson);
        } else {
            setEditingLesson({ id: `lesson_${Date.now()}`, title: '', type: 'video', duration: '' });
        }
        setIsLessonDialogOpen(true);
    };

    const handleSaveLesson = () => {
        if (!editingLesson || !editingLesson.title || !activeSectionId) return;

        setCurriculum(prev => prev.map(section => {
            if (section.id === activeSectionId) {
                const lessonExists = section.lessons.some(l => l.id === editingLesson.id);
                if (lessonExists) {
                    return {
                        ...section,
                        lessons: section.lessons.map(l => l.id === editingLesson.id ? editingLesson as CurriculumLesson : l)
                    };
                } else {
                    return {
                        ...section,
                        lessons: [...section.lessons, editingLesson as CurriculumLesson]
                    };
                }
            }
            return section;
        }));

        setIsLessonDialogOpen(false);
        setEditingLesson(null);
        setActiveSectionId(null);
    };

    const handleRemoveLesson = (sectionId: string, lessonId: string) => {
        setCurriculum(prev => prev.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    lessons: section.lessons.filter(l => l.id !== lessonId)
                };
            }
            return section;
        }));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const updatedCourse = { ...course, curriculum: curriculum };

            localStorage.setItem(`nedu_course_${course.id}`, JSON.stringify(updatedCourse));

            const storedList = localStorage.getItem('nedu_courses_list');
            if (storedList) {
                const list = JSON.parse(storedList) as Course[];
                const updatedList = list.map(c => c.id === course.id ? updatedCourse : c);
                localStorage.setItem('nedu_courses_list', JSON.stringify(updatedList));
            }

            toast({ title: 'Thành công', description: 'Đã cập nhật chương trình học.' });
            setInitialCurriculum(curriculum);
            setIsEditing(false);
            onUpdate();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể cập nhật.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Chương trình học</CardTitle>
                {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                    </Button>
                )}
            </CardHeader>
            <CardContent className="pt-4">
                <div className={cn("space-y-4", !isEditing && "pointer-events-none")}>
                    <Accordion type="multiple" className="w-full space-y-4">
                        {curriculum.map((section, index) => (
                            <AccordionItem key={section.id} value={section.id} className="border rounded-lg bg-card overflow-hidden">
                                <div className="flex items-center px-4 bg-muted/30">
                                    <AccordionTrigger className="hover:no-underline py-4 flex-1 font-semibold">
                                        <div className="flex items-center gap-3">
                                            <span className="text-muted-foreground w-6">#{index + 1}</span>
                                            <span>{section.title}</span>
                                        </div>
                                    </AccordionTrigger>
                                    {isEditing && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive ml-2" onClick={() => handleRemoveSection(section.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <AccordionContent className="p-4 pt-6 space-y-4 border-t">
                                    {isEditing && (
                                        <div className="space-y-2 mb-6">
                                            <Label className="text-xs font-bold uppercase">Tên chương/phần</Label>
                                            <Input
                                                value={section.title}
                                                onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
                                                placeholder="Nhập tên chương..."
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <Label className="text-xs font-bold uppercase">Danh sách bài học ({section.lessons.length})</Label>
                                            {isEditing && (
                                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleOpenLessonDialog(section.id)}>
                                                    <PlusCircle className="h-3 w-3" /> Thêm bài học
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            {section.lessons.map((lesson) => {
                                                const TypeIcon = LESSON_TYPES.find(t => t.value === lesson.type)?.icon || Video;
                                                return (
                                                    <div key={lesson.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/20 group">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <p className="text-sm font-medium">{lesson.title}</p>
                                                                <p className="text-[10px] text-muted-foreground">{lesson.duration || '00:00'}</p>
                                                            </div>
                                                        </div>
                                                        {isEditing && (
                                                            <div className="flex gap-1">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenLessonDialog(section.id, lesson)}>
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveLesson(section.id, lesson.id)}>
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {section.lessons.length === 0 && (
                                                <p className="text-xs text-center py-4 text-muted-foreground italic border border-dashed rounded-md">Chưa có bài học nào trong chương này.</p>
                                            )}
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    {curriculum.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/30">
                            Chưa có chương trình học. {isEditing ? 'Nhấn nút phía dưới để bắt đầu thêm.' : 'Nhấn Chỉnh sửa để bắt đầu.'}
                        </div>
                    )}

                    {isEditing && (
                        <Button variant="outline" className="w-full border-dashed" onClick={handleAddSection}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Thêm chương mới
                        </Button>
                    )}
                </div>
            </CardContent>

            {isEditing && (
                <CardFooter className="justify-end gap-2 border-t pt-4">
                    <Button variant="ghost" onClick={handleCancel} disabled={isSubmitting}>Hủy</Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Cập nhật
                    </Button>
                </CardFooter>
            )}

            {/* Lesson Edit Dialog */}
            <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingLesson?.id && curriculum.some(s => s.lessons.some(l => l.id === editingLesson.id)) ? 'Chỉnh sửa' : 'Thêm'} bài học</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="uppercase text-xs font-bold">Tiêu đề bài học</Label>
                            <Input
                                value={editingLesson?.title || ''}
                                onChange={(e) => setEditingLesson(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="VD: Giới thiệu khóa học"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="uppercase text-xs font-bold">Loại nội dung</Label>
                                <div className="flex gap-2">
                                    {LESSON_TYPES.map(type => {
                                        const Icon = type.icon;
                                        return (
                                            <Button
                                                key={type.value}
                                                type="button"
                                                variant={editingLesson?.type === type.value ? 'default' : 'outline'}
                                                className="flex-1 gap-1 px-2"
                                                onClick={() => setEditingLesson(prev => ({ ...prev, type: type.value }))}
                                            >
                                                <Icon className="h-3 w-3" />
                                                <span className="text-[10px]">{type.label}</span>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase text-xs font-bold">Thời lượng (VD: 10:20)</Label>
                                <Input
                                    value={editingLesson?.duration || ''}
                                    onChange={(e) => setEditingLesson(prev => ({ ...prev, duration: e.target.value }))}
                                    placeholder="00:00"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase text-xs font-bold">Linh tải lên / Nội dung</Label>
                            <Input
                                value={editingLesson?.link || ''}
                                onChange={(e) => setEditingLesson(prev => ({ ...prev, link: e.target.value }))}
                                placeholder="Link video hoặc nội dung..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveLesson} disabled={!editingLesson?.title}>
                            Xác nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};
