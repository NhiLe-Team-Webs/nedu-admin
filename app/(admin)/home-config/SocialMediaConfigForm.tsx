'use client';

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Loader2, Facebook, Instagram, Youtube, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { SocialPost } from "@/types/admin";
import { FaTiktok } from 'react-icons/fa';

// Mock Data
const MOCK_POSTS: SocialPost[] = [
    {
        id: '1',
        platform: 'facebook',
        embedHtml: '<iframe src="...">Facebook Post</iframe>',
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        platform: 'youtube',
        embedHtml: '<iframe src="...">YouTube Video</iframe>',
        createdAt: new Date(Date.now() - 86400000).toISOString()
    }
];

export const SocialMediaConfigForm = () => {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<SocialPost | null>(null);

    // Mock State
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        const loadToasts = async () => {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));
            const stored = localStorage.getItem('nedu_social_posts');
            if (stored) {
                try {
                    setPosts(JSON.parse(stored));
                } catch (e) {
                    setPosts(MOCK_POSTS);
                }
            } else {
                setPosts(MOCK_POSTS);
            }
            setLoading(false);
        };
        loadToasts();
    }, []);

    const sortedPosts = useMemo(() => {
        return [...posts].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
    }, [posts]);

    const [formData, setFormData] = useState<Partial<Omit<SocialPost, 'id' | 'createdAt'>>>({ platform: 'facebook' });

    const resetForm = () => {
        setFormData({ platform: 'facebook', embedHtml: '' });
        setEditingPost(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlatformChange = (value: SocialPost['platform']) => {
        setFormData(prev => ({ ...prev, platform: value }));
    };

    const handleOpenDialog = (post: SocialPost | null = null) => {
        if (post) {
            setEditingPost(post);
            setFormData({
                platform: post.platform,
                embedHtml: post.embedHtml,
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        const { platform, embedHtml } = formData;
        if (!platform || !embedHtml) {
            toast({ variant: 'destructive', title: 'Thông tin chưa đầy đủ', description: 'Vui lòng chọn nền tảng và dán mã nhúng.' });
            return;
        }

        setIsSubmitting(true);
        // Simulate API interaction
        setTimeout(() => {
            try {
                const now = new Date().toISOString();
                let newPosts = [...posts];

                if (editingPost) {
                    newPosts = newPosts.map(p => p.id === editingPost.id ? { ...p, platform, embedHtml, createdAt: now } : p);
                    toast({ title: 'Thành công', description: 'Đã cập nhật bài viết.' });
                } else {
                    const newPost: SocialPost = {
                        id: crypto.randomUUID(),
                        platform,
                        embedHtml,
                        createdAt: now
                    };
                    newPosts.push(newPost);
                    toast({ title: 'Thành công', description: 'Đã thêm bài viết mới.' });
                }

                setPosts(newPosts);
                localStorage.setItem('nedu_social_posts', JSON.stringify(newPosts));

                setIsDialogOpen(false);
                resetForm();

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Lỗi', description: error.message || 'Không thể lưu bài viết. Vui lòng thử lại.' });
            } finally {
                setIsSubmitting(false);
            }
        }, 800);
    };

    const handleDelete = async (postId: string) => {
        try {
            const newPosts = posts.filter(p => p.id !== postId);
            setPosts(newPosts);
            localStorage.setItem('nedu_social_posts', JSON.stringify(newPosts));
            toast({ title: 'Đã xóa', description: 'Đã xóa bài viết.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi khi xóa', description: error.message || 'Không thể xóa bài viết.' });
        }
    };

    const PlatformIcon = ({ platform, className }: { platform: SocialPost['platform'], className?: string }) => {
        const iconProps = { className: cn("h-5 w-5", className) };
        switch (platform) {
            case 'facebook': return <Facebook {...iconProps} />;
            case 'instagram': return <Instagram {...iconProps} />;
            case 'tiktok': return <FaTiktok className={cn("h-5 w-5", className)} />;
            case 'youtube': return <Youtube {...iconProps} />;
            default: return null;
        }
    }

    const renderAddCard = () => (
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
        }}>
            <DialogTrigger asChild>
                <Card
                    className="flex items-center justify-center p-4 border-2 border-dashed h-full min-h-[72px] cursor-pointer hover:bg-muted/50 hover:border-primary transition-colors"
                    onClick={() => handleOpenDialog()}
                >
                    <div className="text-center text-muted-foreground">
                        <PlusCircle className="h-6 w-6 mx-auto" />
                    </div>
                </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{editingPost ? 'Chỉnh sửa' : 'Thêm'} bài viết từ mã nhúng</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label className="uppercase">Nền tảng</Label>
                        <Select value={formData.platform} onValueChange={handlePlatformChange} disabled={isSubmitting}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="tiktok">TikTok</SelectItem>
                                <SelectItem value="youtube">YouTube</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="embedHtml" className="uppercase">Mã nhúng HTML</Label>
                        <Textarea
                            id="embedHtml"
                            name="embedHtml"
                            value={formData.embedHtml || ''}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            rows={10}
                            placeholder="Dán mã HTML nhúng của bài viết vào đây..."
                        />
                        <p className="text-xs text-muted-foreground">
                            Lấy mã nhúng từ tùy chọn "Embed" hoặc "Nhúng" của bài viết gốc trên mạng xã hội.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSubmitting ? 'Đang lưu...' : 'Lưu bài viết'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );


    return (
        <div className="max-w-6xl mx-auto space-y-8">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {sortedPosts.map(post => (
                                <Card key={post.id} className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <PlatformIcon platform={post.platform} className="text-muted-foreground" />
                                        <span className="font-semibold capitalize text-sm">{post.platform} Post</span>
                                    </div>
                                    {isEditing && (
                                        <div className="flex items-center gap-0">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(post)}><Edit className="h-4 w-4" /></Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
                                                        <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(post.id)}>Xóa</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    )}
                                </Card>
                            ))}
                            {isEditing && renderAddCard()}
                        </div>
                    )}
                    {!loading && sortedPosts.length === 0 && !isEditing && (
                        <p className="text-center text-muted-foreground py-12">Chưa có bài viết social media nào.</p>
                    )}
                </CardContent>
                {isEditing && (
                    <CardFooter className="justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Hủy</Button>
                        <Button onClick={() => setIsEditing(false)}>
                            <Check className="mr-2 h-4 w-4" />
                            Cập nhật
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};
