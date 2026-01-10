'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ArrowLeft, Edit } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// Sub-components
import { CourseInfoForm } from "./components/CourseInfoForm";
import { CourseInstructorForm } from "./components/CourseInstructorForm";
import { CourseBenefitsForm } from "./components/CourseBenefitsForm";
import { CourseInfoDisplay } from "./components/CourseInfoDisplay";
import { Course } from "@/types/admin";

type CourseTab = 'info' | 'timeline' | 'customer-info';

const tabConfig: Record<CourseTab, { label: string }> = {
    'info': { label: 'Thông tin khóa học' },
    'timeline': { label: 'Lợi ích học viên' },
    'customer-info': { label: 'Người dẫn đường' },
};

interface CourseDetailProps {
    course: Course;
    onBack: () => void;
    onUpdate: (updatedCourse?: Course) => void;
}

export const CourseDetail = ({ course, onBack, onUpdate }: CourseDetailProps) => {
    const [activeTab, setActiveTab] = useState<CourseTab>('info');
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [isEditingTimeline, setIsEditingTimeline] = useState(false);
    const [isEditingMentors, setIsEditingMentors] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        setIsEditingInfo(false);
        setIsEditingTimeline(false);
        setIsEditingMentors(false);
    }, [activeTab, course.id]);

    const handleUpdateSuccess = (updatedCourse?: Course) => {
        setIsEditingInfo(false);
        setIsEditingTimeline(false);
        setIsEditingMentors(false);
        onUpdate(updatedCourse);
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'info':
                return isEditingInfo ? (
                    <CourseInfoForm course={course} onUpdate={handleUpdateSuccess} onCancel={() => setIsEditingInfo(false)} />
                ) : (
                    <CourseInfoDisplay course={course} />
                );
            case 'timeline':
                return (
                    <CourseBenefitsForm
                        course={course}
                        onUpdate={handleUpdateSuccess}
                        isEditing={isEditingTimeline}
                        setIsEditing={setIsEditingTimeline}
                    />
                );
            case 'customer-info':
                return (
                    <CourseInstructorForm
                        course={course}
                        onUpdate={handleUpdateSuccess}
                        isEditing={isEditingMentors}
                        setIsEditing={setIsEditingMentors}
                    />
                );
            default:
                return null;
        }
    }


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
                {Object.entries(tabConfig).map(([key, { label }]) => (
                    <DropdownMenuItem
                        key={key}
                        onSelect={() => setActiveTab(key as CourseTab)}
                        className={cn(
                            "rounded-lg py-3 px-4 text-base cursor-pointer transition-colors",
                            activeTab === key
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-gray-100"
                        )}
                    >
                        {label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const renderDesktopNav = () => (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CourseTab)} className="w-full">
            <div className="flex justify-start">
                <TabsList>
                    {Object.entries(tabConfig).map(([key, { label }]) => (
                        <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
                    ))}
                </TabsList>
            </div>
        </Tabs>
    );


    return (
        <div className="space-y-4">
            <div className={cn("w-full", isMobile ? "mb-4" : "mb-6 md:w-auto")}>
                {isMobile ? renderMobileNav() : renderDesktopNav()}
            </div>

            <Card className={cn(
                "border shadow-sm relative overflow-hidden",
                isMobile ? "rounded-xl" : "rounded-lg"
            )}>
                <CardContent className={cn(
                    "relative",
                    isMobile ? "p-4 pt-4" : "pt-6"
                )}>
                    {activeTab === 'info' && !isEditingInfo && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-[1px] z-10 flex items-center justify-center">
                            <Button
                                size="lg"
                                onClick={() => setIsEditingInfo(true)}
                                className="bg-[#F7B418] hover:bg-[#e5a616] text-gray-900 font-medium rounded-xl shadow-md px-6 py-3 h-auto"
                            >
                                <Edit className="mr-2 h-5 w-5" />
                                Chỉnh sửa
                            </Button>
                        </div>
                    )}
                    {activeTab === 'timeline' && !isEditingTimeline && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-[1px] z-10 flex items-center justify-center">
                            <Button
                                size="lg"
                                onClick={() => setIsEditingTimeline(true)}
                                className="bg-[#F7B418] hover:bg-[#e5a616] text-gray-900 font-medium rounded-xl shadow-md px-6 py-3 h-auto"
                            >
                                <Edit className="mr-2 h-5 w-5" />
                                Chỉnh sửa
                            </Button>
                        </div>
                    )}
                    {activeTab === 'customer-info' && !isEditingMentors && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-[1px] z-10 flex items-center justify-center">
                            <Button
                                size="lg"
                                onClick={() => setIsEditingMentors(true)}
                                className="bg-[#F7B418] hover:bg-[#e5a616] text-gray-900 font-medium rounded-xl shadow-md px-6 py-3 h-auto"
                            >
                                <Edit className="mr-2 h-5 w-5" />
                                Chỉnh sửa
                            </Button>
                        </div>
                    )}
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
};