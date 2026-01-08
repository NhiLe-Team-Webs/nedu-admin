'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Sub-components
import { CourseInfoForm } from "./components/CourseInfoForm";
// import { CourseCurriculumForm } from "./components/CourseCurriculumForm";
// import { CourseSettingsForm } from "./components/CourseSettingsForm";
// import { CourseStudentsForm } from "./components/CourseStudentsForm";
// import { CourseReviewsForm } from "./components/CourseReviewsForm";
import { CourseInstructorForm } from "./components/CourseInstructorForm";
// import { CourseTestimonialsForm } from "./components/CourseTestimonialsForm";
// import { CourseTimelineForm } from "./components/CourseTimelineForm";
import { CourseBenefitsForm } from "./components/CourseBenefitsForm";

type CourseTab = 'info' | 'benefits' | 'mentors';
// type CourseTab = 'info' | 'curriculum' | 'timeline' | 'mentors' | 'testimonials' | 'students' | 'reviews' | 'settings';

const tabConfig: Record<CourseTab, { label: string; component: React.ComponentType<{ course: Course, onUpdate?: () => void }> }> = {
    'info': { label: 'Thông tin khóa học', component: CourseInfoForm as any },
    'benefits': { label: 'Lợi ích học viên', component: CourseBenefitsForm as any },
    'mentors': { label: 'Người dẫn đường', component: CourseInstructorForm as any },
    // 'curriculum': { label: 'Chương trình học', component: CourseCurriculumForm as any },
    // 'timeline': { label: 'Lộ trình', component: CourseTimelineForm as any },
    // 'testimonials': { label: 'Lời chứng thực', component: CourseTestimonialsForm as any },
    // 'students': { label: 'Học viên', component: CourseStudentsForm as any },
    // 'reviews': { label: 'Đánh giá', component: CourseReviewsForm as any },
    // 'settings': { label: 'Cài đặt', component: CourseSettingsForm as any },
};

import { Course } from "@/types/admin";

interface CourseDetailProps {
    course: Course;
    onBack: () => void;
    onUpdate: (updatedCourse?: Course) => void;
}

export const CourseDetail = ({ course, onBack, onUpdate }: CourseDetailProps) => {
    const [activeTab, setActiveTab] = useState<CourseTab>('info');
    const isMobile = useIsMobile();
    // const router = useRouter(); // No longer needed for internal nav

    const ActiveComponent = tabConfig[activeTab].component;


    const renderMobileNav = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="w-full justify-between bg-primary text-primary-foreground hover:bg-primary/90">
                    {tabConfig[activeTab].label}
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                {Object.entries(tabConfig).map(([key, { label }]) => (
                    <DropdownMenuItem key={key} onSelect={() => setActiveTab(key as CourseTab)}>
                        {label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const renderDesktopNav = () => (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CourseTab)} className="w-full">
            <div className="flex justify-start border-b mb-6 overflow-x-auto">
                <TabsList className="h-auto p-0 bg-transparent gap-6">
                    {Object.entries(tabConfig).map(([key, { label }]) => (
                        <TabsTrigger
                            key={key}
                            value={key}
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-none"
                        >
                            {label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>
        </Tabs>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold">Chi tiết khóa học</h1>
                    <p className="text-sm font-semibold text-[#F8B516]">{course.title}</p>
                </div>
            </div>

            <Card className="border-none shadow-none bg-transparent">
                <div className={cn("w-full py-2", isMobile ? "w-full" : "w-auto")}>
                    {isMobile ? renderMobileNav() : renderDesktopNav()}
                </div>
                <CardContent className="p-0">
                    <ActiveComponent course={course} onUpdate={onUpdate} />
                </CardContent>
            </Card>
        </div>
    );
};
