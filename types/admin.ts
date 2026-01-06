export type SocialLink = {
    platform: 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | string;
    url: string;
};

export type SiteConfig = {
    id: string;
    companyName: string;
    taxCode: string;
    address: string;
    logoMenuUrl: string;
    logoFooterUrl: string;
    socialLinks: SocialLink[];
    updatedAt: Date | string;
};

export type Mentor = {
    id: string;
    name: string;
    role: string;
    bio: string;
    cvUrl?: string;
    avatarUrl?: string;
    quote?: string;
    createdAt: Date | any;
};

export type Course = {
    id: string;
    title: string;
};

export type PromoCode = {
    id: string;
    code: string;
    discountAmount: number;
    quantity: number;
    startDate: Date;
    endDate: Date;
    courseIds: string[];
    createdAt: Date | any;
};
