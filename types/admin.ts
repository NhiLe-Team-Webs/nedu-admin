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
    status?: number;
    sortOrder?: number;
    email?: string;
    phone?: string;
    socialLinks?: { platform: string; url: string }[];
    isFeatured?: boolean;
    createdAt: Date | any;
    updatedAt?: Date | any;
};

export type VideoTestimonial = {
    id: string;
    link: string;
    description: string;
};

export type TimelineDay = {
    id: string;
    title: string;
    quoteText: string;
    quote: string;
};

export type CurriculumLesson = {
    id: string;
    title: string;
    duration?: string;
    type: 'video' | 'article' | 'quiz' | string;
    link?: string;
};

export type CurriculumSection = {
    id: string;
    title: string;
    lessons: CurriculumLesson[];
};

export type CourseReview = {
    id: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    status: 'visible' | 'hidden';
    createdAt: string;
};

export type FeaturedStudent = {
    name: string;
    role: string;
    description: string;
    avatarUrl?: string;
};

export type Course = {
    id: string;
    slug?: string;
    title: string;
    shortDescription?: string;
    description?: string;
    content?: string;
    videoUrl?: string;
    highlightFeatures?: string[];
    fee?: string | number;
    membershipFee?: string | number;
    type?: 'Membership' | 'Course' | string;
    topic?: string;
    format?: string;
    schedule?: string;
    location?: string;
    studentCount?: number;
    thumbnailUrl?: string;
    thumbnailUrl_9_16?: string;
    status?: 'draft' | 'published' | 'archived';
    isFeatured?: boolean;
    instructorIds?: string[];
    timeline?: TimelineDay[];
    benefits?: TimelineDay[];
    videoTestimonials?: VideoTestimonial[];
    curriculum?: CurriculumSection[];
    reviews?: CourseReview[];
    requirements?: string[];
    outcomes?: string[];
    featuredStudent?: FeaturedStudent;
    startDate?: Date | string;
    endDate?: Date | string;
    createdAt?: string;
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
