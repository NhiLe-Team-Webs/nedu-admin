import { createClient } from "@/lib/supabase/client";

export async function uploadImage(file: File, path: string) {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
        .from('nedu')
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('nedu')
        .getPublicUrl(filePath);

    return publicUrl;
}
