'use client';

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Trash2, Loader2, PlusCircle, Edit, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Partner } from "@/types/admin";

// Mock Data
const MOCK_PARTNERS: Partner[] = [
    { id: '1', logoUrl: '/placeholder.jpg', createdAt: new Date().toISOString() },
    { id: '2', logoUrl: '/placeholder.jpg', createdAt: new Date().toISOString() },
    { id: '3', logoUrl: '/placeholder.jpg', createdAt: new Date().toISOString() },
];

const DeletePartnerDialog = ({ onConfirm, children }: { onConfirm: () => void, children: React.ReactNode }) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Logo này sẽ bị xóa vĩnh viễn.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        Xóa
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};


export const PartnerConfigForm = () => {
    const { toast } = useToast();

    // Mock State
    const [partners, setPartners] = useState<Partner[]>([]);
    const [partnersLoading, setPartnersLoading] = useState(true);

    const [localPartners, setLocalPartners] = useState<Partner[]>([]);
    const [partnersToDelete, setPartnersToDelete] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Load
    useEffect(() => {
        const loadPartners = async () => {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            const stored = localStorage.getItem('nedu_partners');
            if (stored) {
                try {
                    setPartners(JSON.parse(stored));
                } catch (e) {
                    setPartners(MOCK_PARTNERS);
                }
            } else {
                setPartners(MOCK_PARTNERS);
            }
            setPartnersLoading(false);
        };
        loadPartners();
    }, []);

    useEffect(() => {
        if (partners) {
            // Simple sort by date descending simulation
            const sorted = [...partners].sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            });
            setLocalPartners(sorted);
        }
    }, [partners]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        // Simulate upload
        setTimeout(() => {
            // Create a fake URL for the uploaded file in this mock environment
            // In a real app, this would be the URL from Firebase Storage
            const logoUrl = URL.createObjectURL(file); // Temporary blob URL for display

            const newPartner: Partner = {
                id: `local_${Date.now()}`,
                logoUrl: logoUrl,
                createdAt: new Date().toISOString(),
            };

            setLocalPartners(prev => [newPartner, ...prev]);

            toast({
                title: 'Đã tải lên',
                description: 'Logo đã được thêm. Nhấn "Cập nhật" để xác nhận.',
            });
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }, 1000);
    };

    const handleDelete = (partnerId: string) => {
        setLocalPartners(prev => prev.filter(p => p.id !== partnerId));
        if (!partnerId.startsWith('local_')) {
            setPartnersToDelete(prev => [...prev, partnerId]);
        }
    };

    const handleSaveChanges = async () => {
        setUploading(true);

        // Simulate API call
        setTimeout(() => {
            try {
                // Apply deletions and additions to "server" state
                const finalPartners = localPartners.filter(p => !partnersToDelete.includes(p.id));

                // In a real app the IDs would be finalized here, but we'll keep the temp ones for now or generate new ones
                const sanitizedPartners = finalPartners.map(p => ({
                    ...p,
                    id: p.id.startsWith('local_') ? crypto.randomUUID() : p.id
                }));

                setPartners(sanitizedPartners);
                localStorage.setItem('nedu_partners', JSON.stringify(sanitizedPartners));

                toast({ title: "Thành công", description: "Thay đổi đã được lưu." });
                setIsEditing(false);
                setPartnersToDelete([]);
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Lỗi',
                    description: error.message || 'Không thể lưu thay đổi.',
                });
            } finally {
                setUploading(false);
            }
        }, 1000);
    };

    const handleCancel = () => {
        // Reset local state to match "server" state
        const sorted = [...partners].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
        setLocalPartners(sorted);
        setIsEditing(false);
        setPartnersToDelete([]);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
                <CardContent className="pt-6 relative">
                    {!isEditing && (
                        <div className="absolute inset-0 bg-gray-100/70 dark:bg-gray-900/70 z-10 flex items-center justify-center rounded-lg">
                            <Button size="sm" onClick={() => setIsEditing(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                            </Button>
                        </div>
                    )}
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                            disabled={uploading || !isEditing}
                        />
                        {partnersLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {localPartners.map(partner => (
                                    <div key={partner.id} className="relative group border rounded-lg p-2 flex items-center justify-center bg-gray-50 h-24">
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={partner.logoUrl}
                                                alt="Partner Logo"
                                                fill
                                                className="object-contain p-2"
                                            />
                                        </div>
                                        {isEditing && (
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <DeletePartnerDialog onConfirm={() => handleDelete(partner.id)}>
                                                    <Button variant="destructive" size="icon">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </DeletePartnerDialog>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isEditing && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="relative group border-2 border-dashed rounded-lg p-2 flex items-center justify-center bg-gray-50 h-24 hover:bg-gray-100 hover:border-primary transition-colors cursor-pointer"
                                    >
                                        {uploading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <PlusCircle className="h-6 w-6 text-muted-foreground group-hover:text-primary" />}
                                    </button>
                                )}
                            </div>
                        )}

                    </div>
                </CardContent>
                {isEditing && (
                    <CardFooter className="justify-end">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" onClick={handleCancel} disabled={uploading}>Hủy</Button>
                            <Button onClick={handleSaveChanges} disabled={uploading}>
                                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                Cập nhật
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>

        </div>
    )
}
