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
    featuredMentorIds?: string[];
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

export type Faq = {
    id: string;
    question: string;
    answer: string;
    createdAt: Date | string | any;
};

export type FeaturedEvent = {
    id: string;
    title: string;
    description: string;
    quote?: string;
    registrations?: number;
    courseId: string;
    courseName?: string;
    schedule?: string;
    type?: 'online' | 'offline' | string;
    imageUrl?: string;
    updatedAt: Date | string | any;
};

export type Partner = {
    id: string;
    logoUrl: string;
    createdAt: Date | string | any;
};

export type SocialPost = {
    id: string;
    platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube';
    embedHtml: string;
    createdAt: Date | string | any;
};

export type Testimonial = {
    id: string;
    name: string;
    role: string;
    content: string;
    location: string;
    avatarUrl: string;
    createdAt: Date | string | any;
};
