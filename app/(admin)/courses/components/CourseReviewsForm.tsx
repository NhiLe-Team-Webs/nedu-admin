'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Eye, EyeOff, Loader2, Check, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Course, CourseReview } from "@/types/admin";
import { cn } from "@/lib/utils";

export const CourseReviewsForm = ({ course, onUpdate }: { course: Course; onUpdate: () => void; }) => {
    const { toast } = useToast();
    const [reviews, setReviews] = useState<CourseReview[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setReviews(course.reviews || []);
    }, [course.reviews]);

    const handleToggleStatus = (reviewId: string) => {
        setReviews(prev => prev.map(r =>
            r.id === reviewId ? { ...r, status: r.status === 'visible' ? 'hidden' : 'visible' } : r
        ));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const updatedCourse = { ...course, reviews: reviews };

            localStorage.setItem(`nedu_course_${course.id}`, JSON.stringify(updatedCourse));

            const storedList = localStorage.getItem('nedu_courses_list');
            if (storedList) {
                const list = JSON.parse(storedList) as Course[];
                const updatedList = list.map(c => c.id === course.id ? updatedCourse : c);
                localStorage.setItem('nedu_courses_list', JSON.stringify(updatedList));
            }

            toast({ title: 'Thành công', description: 'Đã cập nhật trạng thái đánh giá.' });
            onUpdate();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể cập nhật.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-sm font-medium text-muted-foreground uppercase">Đánh giá trung bình</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-4xl font-bold">{averageRating}</span>
                            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-sm font-medium text-muted-foreground uppercase">Tổng số đánh giá</p>
                        <p className="text-4xl font-bold mt-2">{reviews.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-sm font-medium text-muted-foreground uppercase">Đang hiển thị</p>
                        <p className="text-4xl font-bold mt-2 text-green-600">{reviews.filter(r => r.status === 'visible').length}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Chi tiết các đánh giá</CardTitle>
                    {reviews.length > 0 && (
                        <Button onClick={handleSave} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            Lưu thay đổi
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.id} className={cn("p-4 rounded-lg border flex flex-col md:flex-row gap-4 transition-opacity", review.status === 'hidden' && "opacity-60 bg-muted/50")}>
                                <div className="flex items-center gap-3 shrink-0 self-start md:w-48">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={review.userAvatar} />
                                        <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                                    </Avatar>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold truncate">{review.userName}</p>
                                        <p className="text-[10px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn("h-3 w-3", i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300")} />
                                        ))}
                                        <Badge variant={review.status === 'visible' ? 'outline' : 'secondary'} className="ml-2 text-[10px] scale-90 origin-left">
                                            {review.status === 'visible' ? 'Đang hiển thị' : 'Đã ẩn'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm italic text-muted-foreground">"{review.comment}"</p>
                                </div>
                                <div className="flex items-center shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn("gap-2", review.status === 'visible' ? "text-muted-foreground" : "text-primary border-primary")}
                                        onClick={() => handleToggleStatus(review.id)}
                                    >
                                        {review.status === 'visible' ? (
                                            <><EyeOff className="h-4 w-4" /> Ẩn đánh giá</>
                                        ) : (
                                            <><Eye className="h-4 w-4" /> Hiển thị</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {reviews.length === 0 && (
                            <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/30">
                                Chưa có đánh giá nào cho khóa học này.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
