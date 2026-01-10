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
import { createClient } from "@/lib/supabase/client";

interface CourseBenefitsFormProps {
    course: Course;
    onUpdate: () => void;
}

export const CourseBenefitsForm = ({ course, onUpdate }: CourseBenefitsFormProps) => {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Generic
    const [benefits, setBenefits] = useState<TimelineDay[]>([]);
    const [initialBenefits, setInitialBenefits] = useState<TimelineDay[]>([]);

    // 30 Days
    const [thirtyDayConfig, setThirtyDayConfig] = useState<any>({});
    const [initialThirtyDayConfig, setInitialThirtyDayConfig] = useState<any>({});

    const isThirtyDay = course.id === '82' || (course.title && course.title.toLowerCase().includes('30 ngày'));

    useEffect(() => {
        if (isThirtyDay) {
            fetchThirtyDayBenefits();
        } else {
            fetchBenefits();
        }
    }, [course.id, isThirtyDay]);

    const fetchBenefits = async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from('program_description')
            .select('privilege')
            .eq('program_id', course.id)
            .eq('lang_id', 1)
            .single();

        if (data?.privilege) {
            const storedBenefits = data.privilege as TimelineDay[];
            const sortedBenefits = storedBenefits.slice().sort((a, b) => {
                const numA = parseInt(a.id.split('_')[1]) || 0;
                const numB = parseInt(b.id.split('_')[1]) || 0;
                return numA - numB;
            });
            setBenefits(sortedBenefits);
            setInitialBenefits(sortedBenefits);
        } else {
            setBenefits([]);
            setInitialBenefits([]);
        }
    };

    const fetchThirtyDayBenefits = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('thirty_day_config').select('*').eq('program_id', course.id).single();
        if (data) {
            setThirtyDayConfig(data);
            setInitialThirtyDayConfig(data);
        } else {
            // Initialize empty structure
            const empty = {
                benefit_1_title: '', benefit_1_quote: '', benefit_1_description: '',
                benefit_2_title: '', benefit_2_quote: '', benefit_2_description: '',
                benefit_3_title: '', benefit_3_quote: '', benefit_3_description: ''
            };
            setThirtyDayConfig(empty);
            setInitialThirtyDayConfig(empty);
        }
    };

    const handleCancel = () => {
        if (isThirtyDay) {
            setThirtyDayConfig(initialThirtyDayConfig);
        } else {
            setBenefits(initialBenefits);
        }
        setIsEditing(false);
    };

    // Generic Handlers
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

    // 30 day handler
    const handleThirtyDayChange = (field: string, value: string) => {
        setThirtyDayConfig((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        const supabase = createClient();
        try {
            if (isThirtyDay) {
                const { error } = await supabase
                    .from('thirty_day_config')
                    .upsert({
                        ...thirtyDayConfig,
                        program_id: Number(course.id)
                    }, { onConflict: 'program_id' });
                if (error) throw error;
                setInitialThirtyDayConfig(thirtyDayConfig);
            } else {
                const { error } = await supabase
                    .from('program_description')
                    .update({ privilege: benefits })
                    .eq('program_id', course.id)
                    .eq('lang_id', 1);
                if (error) throw error;
                setInitialBenefits(benefits);
            }

            toast({ title: 'Thành công', description: 'Đã cập nhật lợi ích học viên.' });
            setIsEditing(false);
            onUpdate();
        } catch (error: any) {
            console.error('Error saving benefits:', error);
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

                {isThirtyDay ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(num => (
                            <Card key={num} className="p-4 border bg-secondary/10">
                                <Label className="text-lg font-bold text-primary block mb-4">Lợi ích {num}</Label>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase">Tiêu đề</Label>
                                        <Input
                                            value={thirtyDayConfig[`benefit_${num}_title`] || ''}
                                            onChange={(e) => handleThirtyDayChange(`benefit_${num}_title`, e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Tiêu đề lợi ích"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase">Quote ngắn</Label>
                                        <Input
                                            value={thirtyDayConfig[`benefit_${num}_quote`] || ''}
                                            onChange={(e) => handleThirtyDayChange(`benefit_${num}_quote`, e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Mô tả ngắn"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase">Mô tả chi tiết</Label>
                                        <Textarea
                                            value={thirtyDayConfig[`benefit_${num}_description`] || ''}
                                            onChange={(e) => handleThirtyDayChange(`benefit_${num}_description`, e.target.value)}
                                            disabled={!isEditing}
                                            rows={4}
                                            placeholder="Nội dung chi tiết..."
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
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
                )}

                {!isThirtyDay && benefits.length === 0 && !isEditing && (
                    <p className="text-center text-muted-foreground py-8 font-medium italic">Chưa có lợi ích học viên. Nhấn "Chỉnh sửa" để bắt đầu.</p>
                )}

                {!isThirtyDay && isEditing && (
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
