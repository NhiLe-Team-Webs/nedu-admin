import { toast as toastify } from 'react-toastify';

interface ToastProps {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
}

export const useToast = () => ({
    toast: ({ title, description, variant }: ToastProps) => {
        if (variant === 'destructive') {
            toastify.error(`${title}${description ? `: ${description}` : ''}`);
        } else {
            toastify.success(`${title}${description ? `: ${description}` : ''}`);
        }
    }
});
