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
import { HeroConfigForm } from "./HeroConfigForm";
import { PartnerConfigForm } from "./PartnerConfigForm";
import { TestimonialConfigForm } from "./TestimonialConfigForm";
import { FeaturedMentorsForm } from "./FeaturedMentorsForm";
import { FaqConfigForm } from "./FaqConfigForm";
import { SocialMediaConfigForm } from "./SocialMediaConfigForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";


type HomeConfigTab = 'hero' | 'partners' | 'testimonial-map' | 'mentors' | 'faq' | 'social-media';

const tabConfig: Record<HomeConfigTab, { label: string; component: React.ComponentType<{}> }> = {
    'hero': { label: 'Sự kiện nổi bật', component: HeroConfigForm },
    'partners': { label: 'Đối tác', component: PartnerConfigForm },
    'testimonial-map': { label: 'Đánh giá', component: TestimonialConfigForm },
    'mentors': { label: 'Mentor', component: FeaturedMentorsForm },
    'faq': { label: 'Q&A', component: FaqConfigForm },
    'social-media': { label: 'Social Media', component: SocialMediaConfigForm },
};

export const HomeConfigContent = () => {
    const activeTabState = useState<HomeConfigTab>('hero');
    const [activeTab, setActiveTab] = activeTabState;
    const isMobile = useIsMobile();

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
                    <DropdownMenuItem key={key} onSelect={() => setActiveTab(key as HomeConfigTab)}>
                        {label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const renderDesktopNav = () => (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as HomeConfigTab)} className="w-full">
            <div className="flex justify-center">
                <TabsList>
                    {Object.entries(tabConfig).map(([key, { label }]) => (
                        <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
                    ))}
                </TabsList>
            </div>
        </Tabs>
    );

    return (
        <Card>
            <div className={cn("w-full p-6", isMobile ? "w-full" : "md:w-auto")}>
                {isMobile ? renderMobileNav() : renderDesktopNav()}
            </div>
            <CardContent>
                <div>
                    <ActiveComponent />
                </div>
            </CardContent>
        </Card>
    );
};
