"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Loader2, Facebook, Youtube, Instagram, Link as LinkIcon, Edit, Check, Linkedin, PanelLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { SiteConfig, SocialLink } from "@/types/admin";
import { FaTiktok } from 'react-icons/fa';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/lib/supabase/client";

const SocialLinksForm = ({ isEditing, onUpdate, initialLinks }: { isEditing: boolean, onUpdate: (links: SocialLink[]) => void, initialLinks: SocialLink[] }) => {
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialLinks);

    useEffect(() => {
        setSocialLinks(initialLinks);
    }, [initialLinks]);

    // Update local state and notify parent
    const handleChange = (newLinks: SocialLink[]) => {
        setSocialLinks(newLinks);
        onUpdate(newLinks);
    }

    const getPlatformIcon = (platform: SocialLink['platform']) => {
        switch (platform) {
            case 'facebook': return <Facebook className="h-6 w-6 text-blue-600" />;
            case 'instagram': return <Instagram className="h-6 w-6 text-pink-600" />;
            case 'linkedin': return <Linkedin className="h-6 w-6 text-sky-700" />;
            case 'youtube': return <Youtube className="h-6 w-6 text-red-600" />;
            case 'tiktok': return <FaTiktok className="h-6 w-6 text-black" />;
            default: return <LinkIcon className="h-6 w-6" />;
        }
    }

    const allPlatforms: SocialLink['platform'][] = ['facebook', 'instagram', 'linkedin', 'youtube', 'tiktok'];

    const getLinkForPlatform = (platform: SocialLink['platform']): SocialLink => {
        return socialLinks.find(link => link.platform === platform) || { platform, url: '' };
    }

    return (
        <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allPlatforms.map((platform) => {
                    const link = getLinkForPlatform(platform);

                    return (
                        <div key={platform} className="flex items-center gap-4">
                            <div className="p-2 bg-muted rounded-md">
                                {getPlatformIcon(platform)}
                            </div>
                            <Input
                                value={link.url}
                                onChange={(e) => {
                                    const newLinks = [...socialLinks];
                                    const existingIndex = newLinks.findIndex(l => l.platform === platform);
                                    if (existingIndex >= 0) {
                                        newLinks[existingIndex] = { ...newLinks[existingIndex], url: e.target.value };
                                    } else {
                                        newLinks.push({ platform, url: e.target.value });
                                    }
                                    handleChange(newLinks);
                                }}
                                placeholder={`https://${platform}.com/your-profile`}
                                disabled={!isEditing}
                                readOnly={!isEditing}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export const BusinessInfoContent = () => {
    const supabase = createClient();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Data states
    const [configId, setConfigId] = useState<string | null>(null); // To store ID of the row
    const [formData, setFormData] = useState<Partial<Omit<SiteConfig, 'socialLinks' | 'id' | 'updatedAt'>>>({});
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

    // Initial states for comparison/revert
    const [initialFormData, setInitialFormData] = useState<Partial<Omit<SiteConfig, 'socialLinks' | 'id' | 'updatedAt'>>>({});
    const [initialSocialLinks, setInitialSocialLinks] = useState<SocialLink[]>([]);

    // File uploads
    const [newMenuLogo, setNewMenuLogo] = useState<File | null>(null);
    const [menuLogoPreview, setMenuLogoPreview] = useState<string | null>(null);
    const menuLogoInputRef = useRef<HTMLInputElement>(null);

    const [newFooterLogo, setNewFooterLogo] = useState<File | null>(null);
    const [footerLogoPreview, setFooterLogoPreview] = useState<string | null>(null);
    const footerLogoInputRef = useRef<HTMLInputElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data, error } = await supabase.from('site_config').select('*').limit(1).single();

                if (error && error.code !== 'PGRST116') { // PGRST116 is "Relation not found" or "No rows found" depending on context, assuming no rows for new setup
                    console.error("Error fetching site config:", error);
                    // toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải thông tin doanh nghiệp." });
                }

                if (data) {
                    const mappedData: SiteConfig = {
                        id: data.id,
                        companyName: data.company_name,
                        taxCode: data.tax_code,
                        address: data.address,
                        logoMenuUrl: data.logo_menu_url,
                        logoFooterUrl: data.logo_footer_url,
                        socialLinks: data.social_links || [],
                        updatedAt: data.updated_at
                    };

                    setConfigId(mappedData.id);
                    const { socialLinks, id, updatedAt, ...rest } = mappedData;
                    setFormData(rest);
                    setInitialFormData(rest);
                    setSocialLinks(socialLinks);
                    setInitialSocialLinks(socialLinks);
                    setMenuLogoPreview(rest.logoMenuUrl || null);
                    setFooterLogoPreview(rest.logoFooterUrl || null);
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, [supabase]);

    useEffect(() => {
        if (!isEditing) {
            setHasChanges(false);
            return;
        }
        const isDataChanged = JSON.stringify(formData) !== JSON.stringify(initialFormData);
        // Compare sorted social links to account for potential order changes or simplified structure
        const areLinksChanged = JSON.stringify(socialLinks) !== JSON.stringify(initialSocialLinks);
        const areImagesChanged = newMenuLogo !== null || newFooterLogo !== null;

        setHasChanges(isDataChanged || areLinksChanged || areImagesChanged);
    }, [formData, socialLinks, newMenuLogo, newFooterLogo, initialFormData, initialSocialLinks, isEditing]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        setFormData(initialFormData);
        setSocialLinks(initialSocialLinks);
        setMenuLogoPreview(initialFormData.logoMenuUrl || null);
        setFooterLogoPreview(initialFormData.logoFooterUrl || null);
        setNewMenuLogo(null);
        setNewFooterLogo(null);
        setIsEditing(false);
    };

    const handleMenuLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setNewMenuLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => setMenuLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleFooterLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setNewFooterLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => setFooterLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (file: File, pathPrefix: string) => {
        const fileName = `${pathPrefix}_${Date.now()}_${file.name.replace(/\s+/g, '-')}`;
        const { data, error } = await supabase.storage.from('site_assets').upload(fileName, file);
        if (error) throw error;

        const { data: publicUrlData } = supabase.storage.from('site_assets').getPublicUrl(data.path);
        return publicUrlData.publicUrl;
    };

    const handleUpdate = async () => {
        setIsSubmitting(true);
        let updatedData = { ...formData };

        try {
            if (newMenuLogo) {
                updatedData.logoMenuUrl = await uploadImage(newMenuLogo, 'menu_logo');
            }
            if (newFooterLogo) {
                updatedData.logoFooterUrl = await uploadImage(newFooterLogo, 'footer_logo');
            }

            const dbData = {
                company_name: updatedData.companyName,
                tax_code: updatedData.taxCode,
                address: updatedData.address,
                logo_menu_url: updatedData.logoMenuUrl,
                logo_footer_url: updatedData.logoFooterUrl,
                social_links: socialLinks,
                updated_at: new Date().toISOString()
            };

            let error;
            if (configId) {
                const result = await supabase.from('site_config').update(dbData).eq('id', configId);
                error = result.error;
            } else {
                const result = await supabase.from('site_config').insert([dbData]).select();
                if (result.data && result.data[0]) {
                    setConfigId(result.data[0].id);
                }
                error = result.error;
            }

            if (error) throw error;

            toast({ title: "Thành công", description: "Thông tin doanh nghiệp đã được cập nhật." });

            // Commit changes to initial state
            setInitialFormData(updatedData);
            setInitialSocialLinks(socialLinks);
            setNewMenuLogo(null);
            setNewFooterLogo(null);
            setIsEditing(false);

        } catch (error: any) {
            console.error("Update error:", error);
            toast({ variant: "destructive", title: "Lỗi", description: error.message || "Không thể cập nhật thông tin." });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-48" />
        </div>
    }

    return (
        <Card>
            <CardContent className="pt-6 relative">
                {!isEditing && (
                    <div className="absolute inset-0 bg-gray-100/70 dark:bg-gray-900/70 z-10 flex items-center justify-center rounded-lg">
                        <Button size="lg" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-5 w-5" />
                            Chỉnh sửa
                        </Button>
                    </div>
                )}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="companyName" className="uppercase">Tên công ty</Label>
                            <Input id="companyName" name="companyName" value={formData.companyName || ''} onChange={handleInputChange} placeholder="CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ NHILE" disabled={!isEditing || isSubmitting} readOnly={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="taxCode" className="uppercase">Mã số thuế</Label>
                            <Input id="taxCode" name="taxCode" value={formData.taxCode || ''} onChange={handleInputChange} placeholder="0317268736" disabled={!isEditing || isSubmitting} readOnly={!isEditing} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address" className="uppercase">Địa chỉ</Label>
                        <Input id="address" name="address" value={formData.address || ''} onChange={handleInputChange} placeholder="25 Lê Bá Trinh, Phường Hoà Cường Bắc, Quận Hải Châu, Đà Nẵng" disabled={!isEditing || isSubmitting} readOnly={!isEditing} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="uppercase">Logo menu</Label>
                            <div className="relative group w-48 h-24 rounded-md overflow-hidden border bg-muted p-2">
                                {menuLogoPreview ? (
                                    <Image src={menuLogoPreview} alt="Xem trước logo menu" fill className="object-contain" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                {isEditing && !newMenuLogo && (
                                    <button onClick={() => menuLogoInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white transition-opacity opacity-100 cursor-pointer" disabled={isSubmitting}>
                                        <Upload className="h-8 w-8" />
                                    </button>
                                )}
                            </div>
                            <input type="file" ref={menuLogoInputRef} onChange={handleMenuLogoChange} accept="image/*" className="hidden" disabled={isSubmitting} />
                        </div>
                        <div className="space-y-3">
                            <Label className="uppercase">Logo Footer</Label>
                            <div className="relative group w-48 h-24 rounded-md overflow-hidden border bg-muted p-2">
                                {footerLogoPreview ? (
                                    <Image src={footerLogoPreview} alt="Xem trước logo footer" fill className="object-contain" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                {isEditing && !newFooterLogo && (
                                    <button onClick={() => footerLogoInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white transition-opacity opacity-100 cursor-pointer" disabled={isSubmitting}>
                                        <Upload className="h-8 w-8" />
                                    </button>
                                )}
                            </div>
                            <input type="file" ref={footerLogoInputRef} onChange={handleFooterLogoChange} accept="image/*" className="hidden" disabled={isSubmitting} />
                        </div>
                    </div>

                    <SocialLinksForm isEditing={isEditing} onUpdate={setSocialLinks} initialLinks={socialLinks} />
                </div>
            </CardContent>
            {isEditing && (
                <CardFooter className="justify-end gap-2">
                    <Button variant="ghost" onClick={handleCancel} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button disabled={isSubmitting || !hasChanges}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                Cập nhật
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận cập nhật?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bạn có chắc chắn muốn lưu những thay đổi này không? Hành động này sẽ cập nhật thông tin doanh nghiệp trên toàn trang web.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={handleUpdate}>Xác nhận</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            )}
        </Card>
    );
};

export default function DashboardPage() {
    return (
        <div className="p-4">
            {/* Mobile Sidebar Trigger */}
            <div className="md:hidden mb-4">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                    <PanelLeft />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold uppercase">Thông tin doanh nghiệp</h1>
            </div>
            <BusinessInfoContent />
        </div>
    );
}
