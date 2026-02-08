import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { CustomerSignature } from '../../../../types/customer';

/* =========================================================
 * Hook
 * =======================================================*/
export function useCustomerSignature() {
    const [signature, setSignature] = useState<CustomerSignature | null>(null);
    const [loading, setLoading] = useState(false);

    /* ---------------- Fetch single signature ---------------- */
    const fetchSignature = async (customerId: number) => {
        try {
            setLoading(true);

            const { data: response } = await axios.get(
                '/auth/api/customer/signature',
                {
                    params: { customer_id: customerId },
                    withCredentials: true,
                },
            );

            setSignature(response.data);
        } catch (error: any) {
            setSignature(null);

            if (error?.response?.status !== 404) {
                toast.error('Failed to fetch customer signature');
            }
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- Delete signature ---------------- */
    const deleteSignature = async (id: number) => {
        try {
            await axios.delete(`/api/customer/signature/${id}`, {
                withCredentials: true,
            });

            setSignature(null);
            toast.success('Signature deleted');
        } catch {
            toast.error('Failed to delete signature');
        }
    };

    return {
        signature,
        loading,
        fetchSignature,
        deleteSignature,
    };
}
