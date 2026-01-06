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
