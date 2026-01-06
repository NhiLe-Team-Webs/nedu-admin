'use client';

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Loader2, Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Faq } from "@/types/admin";



const MOCK_FAQS: Faq[] = [
    {
        id: '1',
        question: 'Làm thế nào để đăng ký khóa học?',
        answer: 'Bạn có thể đăng ký khóa học bằng cách click vào nút "Đăng ký" trên trang chi tiết khóa học và làm theo hướng dẫn thanh toán.',
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        question: 'Tôi có thể hoàn tiền nếu không hài lòng không?',
        answer: 'Chúng tôi có chính sách hoàn tiền trong vòng 7 ngày nếu bạn không hài lòng với nội dung khóa học, miễn là bạn chưa hoàn thành quá 30% nội dung.',
        createdAt: new Date(Date.now() - 86400000).toISOString()
    }
];

export const FaqConfigForm = () => {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<Faq | null>(null);

    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Load from LocalStorage
    useEffect(() => {
        const loadFaqs = () => {
            const stored = localStorage.getItem('nedu_faqs');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    // Convert date strings back to objects if necessary, but string comparison is fine for sorting usually if ISO
                    setFaqs(parsed);
                } catch (e) {
                    console.error("Failed to parse FAQs", e);
                    setFaqs(MOCK_FAQS);
                }
            } else {
                setFaqs(MOCK_FAQS);
                localStorage.setItem('nedu_faqs', JSON.stringify(MOCK_FAQS));
            }
            setLoading(false);
        };

        // Simulate network delay
        setTimeout(loadFaqs, 1000);
    }, []);

    const [formData, setFormData] = useState<Partial<Omit<Faq, 'id' | 'createdAt'>>>({});

    const sortedFaqs = useMemo(() => {
        return [...faqs].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
    }, [faqs]);

    const resetForm = () => {
        setFormData({});
        setEditingFaq(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenDialog = (faq: Faq | null = null) => {
        if (faq) {
            setEditingFaq(faq);
            setFormData({
                question: faq.question,
                answer: faq.answer,
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        const { question, answer } = formData;

        if (!question || !answer) {
            toast({
                variant: 'destructive',
                title: 'Thông tin chưa đầy đủ',
                description: 'Vui lòng điền đầy đủ câu hỏi và câu trả lời.',
            });
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            let newFaqs = [...faqs];
            const now = new Date().toISOString();

            if (editingFaq) {
                newFaqs = newFaqs.map(f => f.id === editingFaq.id ? { ...f, question, answer, createdAt: now } : f);
                toast({ title: 'Thành công', description: 'Đã cập nhật câu hỏi.' });
            } else {
                const newFaq: Faq = {
                    id: crypto.randomUUID(),
                    question,
                    answer,
                    createdAt: now
                };
                newFaqs.push(newFaq);
                toast({ title: 'Thành công', description: 'Đã thêm câu hỏi mới.' });
            }

            setFaqs(newFaqs);
            localStorage.setItem('nedu_faqs', JSON.stringify(newFaqs));

            setIsDialogOpen(false);
            resetForm();

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.message || 'Không thể lưu. Vui lòng thử lại.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteFaq = async (faqId: string) => {
        // Simulate API call
        // setLoading(true); // Don't set full loading, maybe just optimistic UI or small processing
        try {
            const newFaqs = faqs.filter(f => f.id !== faqId);
            setFaqs(newFaqs);
            localStorage.setItem('nedu_faqs', JSON.stringify(newFaqs));

            toast({
                title: 'Đã xóa',
                description: 'Đã xóa câu hỏi.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi khi xóa',
                description: error.message || 'Không thể xóa. Vui lòng thử lại.',
            });
        }
    };

    const renderAddCard = () => (
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
        }}>
            <DialogTrigger asChild>
                <div className="rounded-xl border-2 border-dashed bg-muted/30 px-4 md:px-6 shadow-sm transition-all hover:bg-muted/80 flex items-center justify-center min-h-[74px] cursor-pointer" onClick={() => handleOpenDialog()}>
                    <div className="flex items-center gap-3 text-muted-foreground font-medium">
                        <PlusCircle className="h-5 w-5" />
                        <span>Thêm câu hỏi mới</span>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{editingFaq ? 'Chỉnh sửa' : 'Thêm'} câu hỏi</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="question" className="uppercase">Câu hỏi</Label>
                        <Input id="question" name="question" value={formData.question || ''} onChange={handleInputChange} disabled={isSubmitting} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="answer" className="uppercase">Câu trả lời</Label>
                        <Textarea id="answer" name="answer" value={formData.answer || ''} onChange={handleInputChange} disabled={isSubmitting} rows={5} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSubmitting ? 'Đang lưu...' : (editingFaq ? 'Cập nhật' : 'Tạo')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
                <CardContent className="pt-6 relative">
                    {!isEditing && (
                        <div className="absolute inset-0 bg-gray-100/70 dark:bg-gray-900/70 z-10 flex items-center justify-center rounded-lg">
                            <Button size="lg" onClick={() => setIsEditing(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                            </Button>
                        </div>
                    )}

                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full space-y-2">
                            {sortedFaqs.map((faq) => (
                                <AccordionItem key={faq.id} value={faq.id} className={cn("rounded-xl border bg-secondary/30 px-4 md:px-6 shadow-sm transition-all hover:bg-secondary/80", !isEditing && "pointer-events-none")}>
                                    <div className="flex items-center justify-between">
                                        <AccordionTrigger className="flex-1 text-left hover:no-underline py-5 font-semibold text-sm md:text-base">
                                            {faq.question}
                                        </AccordionTrigger>
                                        {isEditing && (
                                            <div className="flex items-center gap-1 pl-4">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleOpenDialog(faq); }}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => e.stopPropagation()}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Xóa câu hỏi?</AlertDialogTitle>
                                                            <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteFaq(faq.id)}>Xóa</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}
                                    </div>
                                    <AccordionContent className="pb-5 pt-0 text-muted-foreground text-sm">{faq.answer}</AccordionContent>
                                </AccordionItem>
                            ))}
                            {isEditing && renderAddCard()}
                        </Accordion>
                    )}

                    {!loading && sortedFaqs.length === 0 && !isEditing && (
                        <p className="text-center text-muted-foreground py-8">Chưa có câu hỏi nào.</p>
                    )}
                </CardContent>
                {isEditing && (
                    <CardFooter className="justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>
                            Hủy
                        </Button>
                        <Button onClick={() => setIsEditing(false)}>
                            <Check className="mr-2 h-4 w-4" />
                            Xong
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};
