'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/types/admin";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// Type for the fixed 3 benefits structure from program_30day_challenge table
interface Benefit30Day {
    title: string;
    quote: string;
    description: string;
}

interface CourseBenefitsFormProps {
    course: Course;
    onUpdate: () => void;
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
}

// ID for 30-day challenge course
const THIRTY_DAY_CHALLENGE_PROGRAM_ID = 82;

export const CourseBenefitsForm = ({ course, onUpdate, isEditing, setIsEditing }: CourseBenefitsFormProps) => {
    const { toast } = useToast();
    const [benefits, setBenefits] = useState<Benefit30Day[]>([
        { title: '', quote: '', description: '' },
        { title: '', quote: '', description: '' },
        { title: '', quote: '', description: '' }
    ]);
    const [initialBenefits, setInitialBenefits] = useState<Benefit30Day[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [is30DayChallenge, setIs30DayChallenge] = useState(false);

    useEffect(() => {
        // Check if this is the 30-day challenge course
        const isChallengeProgram = Number(course.id) === THIRTY_DAY_CHALLENGE_PROGRAM_ID;
        setIs30DayChallenge(isChallengeProgram);

        if (isChallengeProgram) {
            fetch30DayBenefits();
        } else {
            fetchLegacyBenefits();
        }
    }, [course.id]);

    // Fetch from new program_30day_challenge table
    const fetch30DayBenefits = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('program_30day_challenge')
            .select('*')
            .eq('program_id', course.id)
            .single();

        if (data) {
            const loadedBenefits: Benefit30Day[] = [
                { title: data.benefit_1_title || '', quote: data.benefit_1_quote || '', description: data.benefit_1_description || '' },
                { title: data.benefit_2_title || '', quote: data.benefit_2_quote || '', description: data.benefit_2_description || '' },
                { title: data.benefit_3_title || '', quote: data.benefit_3_quote || '', description: data.benefit_3_description || '' }
            ];
            setBenefits(loadedBenefits);
            setInitialBenefits(loadedBenefits);
        } else {
            // Initialize with empty benefits
            const emptyBenefits: Benefit30Day[] = [
                { title: '', quote: '', description: '' },
                { title: '', quote: '', description: '' },
                { title: '', quote: '', description: '' }
            ];
            setBenefits(emptyBenefits);
            setInitialBenefits(emptyBenefits);
        }
    };

    // Legacy: Fetch from program_description.privilege (for non-30-day courses)
    const fetchLegacyBenefits = async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from('program_description')
            .select('privilege')
            .eq('program_id', course.id)
            .eq('lang_id', 1)
            .single();

        if (data?.privilege && Array.isArray(data.privilege)) {
            const storedBenefits = data.privilege.slice(0, 3).map((b: any) => ({
                title: b.title || '',
                quote: b.quoteText || '',
                description: b.quote || ''
            }));
            // Pad to 3 if less
            while (storedBenefits.length < 3) {
                storedBenefits.push({ title: '', quote: '', description: '' });
            }
            setBenefits(storedBenefits);
            setInitialBenefits(storedBenefits);
        } else {
            const emptyBenefits: Benefit30Day[] = [
                { title: '', quote: '', description: '' },
                { title: '', quote: '', description: '' },
                { title: '', quote: '', description: '' }
            ];
            setBenefits(emptyBenefits);
            setInitialBenefits(emptyBenefits);
        }
    };

    const handleCancel = () => {
        setBenefits(initialBenefits);
        setIsEditing(false);
    };

    const handleBenefitChange = (index: number, field: keyof Benefit30Day, value: string) => {
        setBenefits(benefits.map((benefit, i) => i === index ? { ...benefit, [field]: value } : benefit));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        const supabase = createClient();
        try {
            if (is30DayChallenge) {
                // Save to program_30day_challenge table
                const { error } = await supabase
                    .from('program_30day_challenge')
                    .upsert({
                        program_id: Number(course.id),
                        benefit_1_title: benefits[0].title,
                        benefit_1_quote: benefits[0].quote,
                        benefit_1_description: benefits[0].description,
                        benefit_2_title: benefits[1].title,
                        benefit_2_quote: benefits[1].quote,
                        benefit_2_description: benefits[1].description,
                        benefit_3_title: benefits[2].title,
                        benefit_3_quote: benefits[2].quote,
                        benefit_3_description: benefits[2].description,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'program_id' });

                if (error) throw error;
            } else {
                // Legacy: Save to program_description.privilege
                const privilegeData = benefits.map((b, i) => ({
                    id: `benefit_${i + 1}`,
                    title: b.title,
                    quoteText: b.quote,
                    quote: b.description
                }));

                const { error } = await supabase
                    .from('program_description')
                    .update({ privilege: privilegeData })
                    .eq('program_id', course.id)
                    .eq('lang_id', 1);

                if (error) throw error;
            }

            toast({ title: 'Thành công', description: 'Đã cập nhật lợi ích học viên.' });
            setInitialBenefits(benefits);
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
        <div className="space-y-6">
            <Accordion type="multiple" className="w-full space-y-4">
                {benefits.map((benefit, index) => (
                    <AccordionItem key={`benefit-${index}`} value={`benefit-${index}`} className="rounded-lg border bg-card px-4">
                        <AccordionTrigger className={cn("flex-1 text-left hover:no-underline py-4 font-semibold uppercase", "data-[state=open]:text-primary")} disabled={!isEditing}>
                            LỢI ÍCH {index + 1}
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pt-0 space-y-4 border-t mt-0">
                            <div className="space-y-4 pt-4">
                                <div className="space-y-1">
                                    <Label htmlFor={`title-${index}`} className="uppercase text-xs font-bold text-foreground/70">TIÊU ĐỀ</Label>
                                    <Input id={`title-${index}`} value={benefit.title} onChange={(e) => handleBenefitChange(index, 'title', e.target.value)} readOnly={!isEditing} placeholder="Nhập tiêu đề lợi ích..." />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={`quote-${index}`} className="uppercase text-xs font-bold text-foreground/70">QUOTE</Label>
                                    <Input id={`quote-${index}`} value={benefit.quote} onChange={(e) => handleBenefitChange(index, 'quote', e.target.value)} readOnly={!isEditing} placeholder="Câu trích dẫn ngắn..." />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={`description-${index}`} className="uppercase text-xs font-bold text-foreground/70">MÔ TẢ</Label>
                                    <Textarea id={`description-${index}`} value={benefit.description} onChange={(e) => handleBenefitChange(index, 'description', e.target.value)} readOnly={!isEditing} rows={4} placeholder="Mô tả chi tiết về lợi ích..." className="resize-none" />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {isEditing && (
                <div className="space-y-4">
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t pt-4">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto rounded-xl"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto bg-[#F7B418] hover:bg-[#e5a616] text-gray-900 font-medium rounded-xl"
                        >
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            Cập nhật
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseBenefitsForm;