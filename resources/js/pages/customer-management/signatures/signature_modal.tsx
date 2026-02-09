import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
    open: boolean;
    customerId: number;
    onClose: () => void;
    onUploaded: () => void;
}

export default function UploadSignatureModal({
    open,
    customerId,
    onClose,
    onUploaded,
}: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setFile(null);
            setPreview(null);
            setProcessing(false);
        }
    }, [open]);

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        setFile(selected);
        setPreview(URL.createObjectURL(selected));
    };

    const submit = async () => {
        if (!file) {
            toast.error('Please select a signature image');
            return;
        }

        setProcessing(true);

        try {
            const formData = new FormData();
            formData.append('signature', file);
            formData.append('customer_id', customerId.toString());

            await axios.post(`/auth/api/customer/signature`, formData);

            toast.success('Signature uploaded successfully');
            onUploaded();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Upload failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!value) onClose();
            }}
        >
            <DialogContent className="w-full max-w-md space-y-4">
                <DialogHeader>
                    <DialogTitle>Upload Signature</DialogTitle>
                </DialogHeader>

                {/* PREVIEW */}

                <div className="min-h-60 w-full overflow-hidden rounded-md border bg-muted">
                    {preview && (
                        <img
                            src={preview}
                            alt="Signature preview"
                            className="h-60 w-full object-contain"
                        />
                    )}
                </div>

                {/* FILE INPUT */}
                <div className="space-y-1">
                    <Label className="text-xs">
                        Upload Signature
                        <span className="ml-1 text-muted-foreground">
                            (PNG/JPG)
                        </span>
                    </Label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={processing}
                    />
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col justify-end gap-2 pt-4 sm:flex-row">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button onClick={submit} disabled={processing}>
                        {processing ? 'Uploading…' : 'Upload'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
