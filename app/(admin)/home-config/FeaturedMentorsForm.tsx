'use client';

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SiteConfig, Mentor } from "@/types/admin";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Mock Data for Mentors
const MOCK_MENTORS: Mentor[] = [
    {
        id: '1',
        name: 'Nguyễn Văn A',
        role: 'Senior Developer',
        bio: '10 năm kinh nghiệm trong ngành lập trình.',
        avatarUrl: 'https://github.com/shadcn.png',
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Trần Thị B',
        role: 'Product Manager',
        bio: 'Chuyên gia quản lý sản phẩm với nhiều dự án thành công.',
        avatarUrl: 'https://github.com/shadcn.png',
        createdAt: new Date().toISOString()
    },
    {
        id: '3',
        name: 'Lê Văn C',
        role: 'Data Scientist',
        bio: 'Chuyên gia về AI và Machine Learning.',
        avatarUrl: 'https://github.com/shadcn.png',
        createdAt: new Date().toISOString()
    }
];

export const FeaturedMentorsForm = () => {
    const { toast } = useToast();

    // State management replacing Firebase hooks
    const [allMentors, setAllMentors] = useState<Mentor[]>([]);
    const [mentorsLoading, setMentorsLoading] = useState(true);
    const [siteConfigData, setSiteConfigData] = useState<SiteConfig[]>([]);
    const [configLoading, setConfigLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([]);
    const [initialSelectedIds, setInitialSelectedIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load data simulation
    useEffect(() => {
        const loadData = async () => {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            setAllMentors(MOCK_MENTORS);
            setMentorsLoading(false);

            // Mock Site Config loading
            const storedConfig = localStorage.getItem('nedu_site_config');
            let config: SiteConfig[] = [];
            if (storedConfig) {
                config = JSON.parse(storedConfig);
            } else {
                config = [{
                    id: 'default_config',
                    companyName: 'N-Edu',
                    taxCode: '',
                    address: '',
                    logoMenuUrl: '',
                    logoFooterUrl: '',
                    socialLinks: [],
                    featuredMentorIds: ['1'], // Default selected mentor
                    updatedAt: new Date().toISOString()
                }];
                // Don't save default immediately to localStorage to mimic "empty" state if desired, but here we set defaults
            }
            setSiteConfigData(config);
            setConfigLoading(false);

        };

        loadData();
    }, []);

    useEffect(() => {
        if (siteConfigData && siteConfigData.length > 0) {
            const ids = siteConfigData[0].featuredMentorIds || [];
            setSelectedMentorIds(ids);
            setInitialSelectedIds(ids);
        }
    }, [siteConfigData]);

    const handleMentorSelect = (mentorId: string, isSelected: boolean) => {
        setSelectedMentorIds(prev =>
            isSelected ? [...prev, mentorId] : prev.filter(id => id !== mentorId)
        );
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            // Simulate API Call
            await new Promise(resolve => setTimeout(resolve, 800));

            const configId = siteConfigData?.[0]?.id || 'default_config';
            const updatedConfig = siteConfigData.length > 0 ? { ...siteConfigData[0], featuredMentorIds: selectedMentorIds, updatedAt: new Date().toISOString() } : {
                id: configId,
                companyName: '',
                taxCode: '',
                address: '',
                logoMenuUrl: '',
                logoFooterUrl: '',
                socialLinks: [],
                featuredMentorIds: selectedMentorIds,
                updatedAt: new Date().toISOString()
            };

            // Create a new array with the updated object; in a real app this might be more complex
            const newConfigList = [updatedConfig];

            setSiteConfigData(newConfigList);
            localStorage.setItem('nedu_site_config', JSON.stringify(newConfigList));

            toast({ title: 'Thành công', description: 'Đã cập nhật danh sách Mentor nổi bật.' });
            setInitialSelectedIds(selectedMentorIds);
            setIsEditing(false);

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: error.message || 'Không thể cập nhật.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setSelectedMentorIds(initialSelectedIds);
        setIsEditing(false);
    }

    const loading = mentorsLoading || configLoading;

    if (loading) {
        return <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>;
    }

    return (
        <Card className="max-w-4xl mx-auto">
            <CardContent className="pt-6 relative">
                {!isEditing && (
                    <div className="absolute inset-0 bg-gray-100/70 dark:bg-gray-900/70 z-10 flex items-center justify-center rounded-lg">
                        <Button size="lg" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </Button>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allMentors?.map(mentor => (
                        <div key={mentor.id} className={cn("flex items-center space-x-3 rounded-md border p-4 has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors", !isEditing && "pointer-events-none opacity-80")}>
                            <Checkbox
                                id={`mentor-home-${mentor.id}`}
                                checked={selectedMentorIds.includes(mentor.id)}
                                onCheckedChange={(checked) => handleMentorSelect(mentor.id, !!checked)}
                                disabled={!isEditing || isSubmitting}
                            />
                            <label
                                htmlFor={`mentor-home-${mentor.id}`}
                                className={cn("flex items-center gap-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1", isEditing && "cursor-pointer")}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={mentor.avatarUrl} alt={mentor.name} />
                                    <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{mentor.name}</p>
                                    <p className="text-xs text-muted-foreground">{mentor.role}</p>
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
            </CardContent>
            {isEditing && (
                <CardFooter className="justify-end gap-2">
                    <Button variant="ghost" onClick={handleCancel} disabled={isSubmitting}>Hủy</Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Cập nhật
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
