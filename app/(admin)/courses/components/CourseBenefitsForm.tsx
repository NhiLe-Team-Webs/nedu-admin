'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, X, Loader2, Edit, Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Course, TimelineDay } from "@/types/admin";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CourseBenefitsFormProps {
    course: Course;
    onUpdate: () => void;
}

export const CourseBenefitsForm = ({ course, onUpdate }: CourseBenefitsFormProps) => {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [benefits, setBenefits] = useState<TimelineDay[]>([]);
    const [initialBenefits, setInitialBenefits] = useState<TimelineDay[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const sortedBenefits = (course.benefits || []).slice().sort((a, b) => {
            const numA = parseInt(a.id.split('_')[1]) || 0;
            const numB = parseInt(b.id.split('_')[1]) || 0;
            return numA - numB;
        });
        setBenefits(sortedBenefits);
        setInitialBenefits(sortedBenefits);
    }, [course.benefits]);

    const handleCancel = () => {
        setBenefits(initialBenefits);
        setIsEditing(false);
    };

    const handleBenefitChange = (id: string, field: keyof TimelineDay, value: string) => {
        setBenefits(benefits.map(benefit => benefit.id === id ? { ...benefit, [field]: value } : benefit));
    };

    const handleAddBenefit = () => {
        const newId = `benefit_${Date.now()}`;
        const newBenefit: TimelineDay = {
            id: newId,
            title: `Lợi ích mới`,
            quoteText: '',
            quote: ''
        };
        setBenefits([...benefits, newBenefit]);
    };

    const handleRemoveBenefit = (id: string) => {
        setBenefits(benefits.filter(benefit => benefit.id !== id));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            // Simulate API Call
            await new Promise(resolve => setTimeout(resolve, 800));

            const updatedCourse = { ...course, benefits: benefits };

            // 1. Update individual course storage
            localStorage.setItem(`nedu_course_${course.id}`, JSON.stringify(updatedCourse));

            // 2. Update global course list
            const storedList = localStorage.getItem('nedu_courses_list');
            if (storedList) {
                const list = JSON.parse(storedList) as Course[];
                const updatedList = list.map(c => c.id === course.id ? updatedCourse : c);
                localStorage.setItem('nedu_courses_list', JSON.stringify(updatedList));
            }

            toast({ title: 'Thành công', description: 'Đã cập nhật lợi ích học viên.' });
            setInitialBenefits(benefits);
            setIsEditing(false);
            onUpdate();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể cập nhật lợi ích.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="relative overflow-hidden">
            <CardContent className="pt-6">
                {!isEditing && (
                    <div className="absolute inset-0 bg-gray-100/70 dark:bg-gray-900/70 z-10 flex items-center justify-center rounded-lg">
                        <Button size="lg" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-5 w-5" />
                            Chỉnh sửa
                        </Button>
                    </div>
                )}

                <Accordion type="multiple" className="w-full space-y-4">
                    {benefits.map((benefit, index) => (
                        <AccordionItem key={benefit.id} value={benefit.id} className="rounded-lg border bg-secondary/30 px-4">
                            <div className="flex items-center gap-2">
                                <AccordionTrigger className={cn("flex-1 text-left hover:no-underline py-4 font-semibold", "data-[state=open]:text-primary")} disabled={!isEditing}>
                                    {benefit.title || `LỢI ÍCH ${index + 1}`}
                                </AccordionTrigger>
                                {isEditing && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveBenefit(benefit.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <AccordionContent className="pb-4 pt-0 space-y-4 border-t mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`title-${benefit.id}`} className="uppercase text-xs font-bold">Tiêu đề</Label>
                                        <Input id={`title-${benefit.id}`} value={benefit.title || ''} onChange={(e) => handleBenefitChange(benefit.id, 'title', e.target.value)} readOnly={!isEditing} placeholder="Nhập tiêu đề lợi ích..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`quote-text-${benefit.id}`} className="uppercase text-xs font-bold">Quote ngắn (Phụ đề)</Label>
                                        <Input id={`quote-text-${benefit.id}`} value={benefit.quoteText || ''} onChange={(e) => handleBenefitChange(benefit.id, 'quoteText', e.target.value)} readOnly={!isEditing} placeholder="Câu trích dẫn ngắn..." />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`quote-${benefit.id}`} className="uppercase text-xs font-bold">Mô tả chi tiết</Label>
                                    <Textarea id={`quote-${benefit.id}`} value={benefit.quote || ''} onChange={(e) => handleBenefitChange(benefit.id, 'quote', e.target.value)} readOnly={!isEditing} rows={3} placeholder="Mô tả chi tiết về lợi ích..." />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {benefits.length === 0 && !isEditing && (
                    <p className="text-center text-muted-foreground py-8 font-medium italic">Chưa có lợi ích học viên. Nhấn "Chỉnh sửa" để bắt đầu.</p>
                )}

                {isEditing && (
                    <Button variant="outline" className="w-full mt-4 border-dashed py-6" onClick={handleAddBenefit}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Thêm lợi ích mới
                    </Button>
                )}
            </CardContent>

            {isEditing && (
                <CardFooter className="justify-end gap-2 border-t pt-4">
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

export default CourseBenefitsForm;
