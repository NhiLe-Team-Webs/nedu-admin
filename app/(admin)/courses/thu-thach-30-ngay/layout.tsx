'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { Course } from '@/types/admin';

// Course ID for "Thử thách 30 ngày"
const COURSE_ID = 82;

// Tab configuration
const tabConfig = {
    information: { label: 'THÔNG TIN KHÓA HỌC', path: 'information' },
    benefit: { label: 'LỢI ÍCH HỌC VIÊN', path: 'benefit' },
    mentor: { label: 'NGƯỜI DẪN ĐƯỜNG', path: 'mentor' },
} as const;

type TabKey = keyof typeof tabConfig;

export default function ThirtyDayChallengeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const isMobile = useIsMobile();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    // Determine active tab from pathname
    const getActiveTab = (): TabKey => {
        if (pathname.includes('/benefit')) return 'benefit';
        if (pathname.includes('/mentor')) return 'mentor';
        return 'information';
    };

    const activeTab = getActiveTab();

    // Fetch course data
    const fetchCourse = useCallback(async () => {
        const supabase = createClient();

        const { data: programData, error } = await supabase
            .from('program')
            .select(`
                id,
                program_name,
                program_price,
                program_type,
                image,
                banner,
                hashtag,
                total_sessions,
                start_date,
                end_date,
                link_payment,
                course,
                status,
                highlight_program
            `)
            .eq('id', COURSE_ID)
            .single();

        if (error) {
            console.error('Error fetching course:', error);
        }

        if (programData) {
            // Fetch description
            const { data: descData } = await supabase
                .from('program_description')
                .select('short_description, topic, format')
                .eq('program_id', programData.id)
                .eq('lang_id', 1)
                .single();

            // Fetch membership price
            const { data: challengeData } = await supabase
                .from('program_30day_challenge')
                .select('membership_price')
                .eq('program_id', programData.id)
                .single();

            setCourse({
                id: String(programData.id),
                title: programData.program_name || '',
                shortDescription: descData?.short_description || '',
                fee: programData.program_price || 0,
                membershipFee: challengeData?.membership_price,
                thumbnailUrl: programData.image || '',
                thumbnailUrl_9_16: programData.banner || '',
                topic: programData.hashtag || descData?.topic || '',
                format: descData?.format || '',
                schedule: programData.total_sessions || '',
                startDate: programData.start_date ? new Date(programData.start_date) : undefined,
                endDate: programData.end_date ? new Date(programData.end_date) : undefined,
                location: programData.link_payment || '',
                studentCount: programData.course || 0,
                type: 'Membership',
                status: programData.status === 1 ? 'published' : 'draft',
                isFeatured: programData.highlight_program === 1,
            });
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    const handleTabChange = (tab: TabKey) => {
        router.push(`/courses/thu-thach-30-ngay/${tabConfig[tab].path}`);
    };

    const handleBack = () => {
        router.push('/courses');
    };

    // Mobile Nav
    const renderMobileNav = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    className="w-full justify-between bg-[#F7B418] hover:bg-[#e5a616] text-gray-900 font-medium h-12 rounded-xl shadow-sm"
                >
                    <span className="text-base">{tabConfig[activeTab].label}</span>
                    <ChevronDown className="ml-2 h-5 w-5 transition-transform duration-200" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl shadow-lg border-0 p-2"
            >
                {(Object.keys(tabConfig) as TabKey[]).map((key) => (
                    <DropdownMenuItem
                        key={key}
                        onSelect={() => handleTabChange(key)}
                        className={cn(
                            "rounded-lg py-3 px-4 text-base cursor-pointer transition-colors",
                            activeTab === key
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-gray-100"
                        )}
                    >
                        {tabConfig[key].label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    // Desktop Nav
    const renderDesktopNav = () => (
        <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as TabKey)}>
            <TabsList className="bg-muted/50 p-1 rounded-lg">
                {(Object.keys(tabConfig) as TabKey[]).map((key) => (
                    <TabsTrigger
                        key={key}
                        value={key}
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
                    >
                        {tabConfig[key].label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Không tìm thấy khóa học</p>
                <Button variant="link" onClick={handleBack}>Quay lại danh sách</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                {!isMobile && (
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                )}
                <h1 className={cn(
                    "font-bold text-primary uppercase",
                    isMobile ? "text-xl" : "text-2xl"
                )}>
                    {course.title}
                </h1>
            </div>

            {/* Tab Navigation */}
            <div className={cn("w-full", isMobile ? "mb-4" : "mb-6 md:w-auto")}>
                {isMobile ? renderMobileNav() : renderDesktopNav()}
            </div>

            {/* Content */}
            {children}
        </div>
    );
}
