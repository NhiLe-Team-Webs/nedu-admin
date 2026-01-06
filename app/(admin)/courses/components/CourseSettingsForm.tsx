'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, Check, Loader2, Settings2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/types/admin";
import { cn } from "@/lib/utils";

export const CourseSettingsForm = ({ course, onUpdate }: { course: Course; onUpdate: () => void; }) => {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [requirements, setRequirements] = useState<string[]>([]);
    const [outcomes, setOutcomes] = useState<string[]>([]);
    const [initialRequirements, setInitialRequirements] = useState<string[]>([]);
    const [initialOutcomes, setInitialOutcomes] = useState<string[]>([]);

    useEffect(() => {
        const req = course.requirements || [];
        const out = course.outcomes || [];
        setRequirements(req);
        setInitialRequirements(req);
        setOutcomes(out);
        setInitialOutcomes(out);
    }, [course]);

    const handleCancel = () => {
        setRequirements(initialRequirements);
        setOutcomes(initialOutcomes);
        setIsEditing(false);
    };

    const handleAddItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => [...prev, ""]);
    };

    const handleUpdateItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
        setter(prev => prev.map((item, i) => i === index ? value : item));
    };

    const handleRemoveItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
        setter(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const updatedCourse = {
                ...course,
                requirements: requirements.filter(r => r.trim() !== ""),
                outcomes: outcomes.filter(o => o.trim() !== "")
            };

            localStorage.setItem(`nedu_course_${course.id}`, JSON.stringify(updatedCourse));

            const storedList = localStorage.getItem('nedu_courses_list');
            if (storedList) {
                const list = JSON.parse(storedList) as Course[];
                const updatedList = list.map(c => c.id === course.id ? updatedCourse : c);
                localStorage.setItem('nedu_courses_list', JSON.stringify(updatedList));
            }

            toast({ title: 'Thành công', description: 'Đã cập nhật thiết lập hành trình học.' });
            setInitialRequirements(requirements);
            setInitialOutcomes(outcomes);
            setIsEditing(false);
            onUpdate();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể cập nhật.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-primary" />
                        Thiết lập khóa học
                    </CardTitle>
                    {!isEditing && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="pt-6 space-y-8">
                    {!isEditing && (
                        <div className="absolute inset-0 bg-gray-100/70 dark:bg-gray-900/70 z-10 flex items-center justify-center rounded-lg">
                            <Button size="lg" onClick={() => setIsEditing(true)}>
                                <Edit className="mr-2 h-5 w-5" />
                                Chỉnh sửa
                            </Button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Requirements */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase flex items-center gap-2">
                                    <Info className="h-3 w-3" /> Yêu cầu tham gia
                                </Label>
                                {isEditing && (
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleAddItem(setRequirements)}>
                                        <PlusCircle className="mr-1 h-3 w-3" /> Thêm
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {requirements.map((req, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input
                                            value={req}
                                            onChange={(e) => handleUpdateItem(setRequirements, idx, e.target.value)}
                                            placeholder="VD: Có kiến thức cơ bản về JS..."
                                            disabled={!isEditing}
                                        />
                                        {isEditing && (
                                            <Button variant="ghost" size="icon" className="shrink-0 text-destructive" onClick={() => handleRemoveItem(setRequirements, idx)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {requirements.length === 0 && (
                                    <p className="text-sm text-muted-foreground italic p-4 border border-dashed rounded-md text-center">Chưa thiết lập yêu cầu.</p>
                                )}
                            </div>
                        </div>

                        {/* Outcomes */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase flex items-center gap-2">
                                    <Check className="h-3 w-3" /> Kết quả đạt được
                                </Label>
                                {isEditing && (
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleAddItem(setOutcomes)}>
                                        <PlusCircle className="mr-1 h-3 w-3" /> Thêm
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {outcomes.map((out, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input
                                            value={out}
                                            onChange={(e) => handleUpdateItem(setOutcomes, idx, e.target.value)}
                                            placeholder="VD: Xây dựng được ứng dụng thực tế..."
                                            disabled={!isEditing}
                                        />
                                        {isEditing && (
                                            <Button variant="ghost" size="icon" className="shrink-0 text-destructive" onClick={() => handleRemoveItem(setOutcomes, idx)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {outcomes.length === 0 && (
                                    <p className="text-sm text-muted-foreground italic p-4 border border-dashed rounded-md text-center">Chưa thiết lập kết quả đạt được.</p>
                                )}
                            </div>
                        </div>
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
            </Card>
        </div>
    );
};
