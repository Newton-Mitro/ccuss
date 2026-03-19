import { CustomerIntroducer } from '@/types/customer';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function useCustomerIntroducers() {
    const [introducers, setIntroducers] = useState<CustomerIntroducer[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchIntroducers = async (customerId: number) => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/introducers/by-customer', {
                params: { customer_id: customerId },
                withCredentials: true,
            });
            setIntroducers(data ?? []);
        } catch {
            toast.error('Failed to fetch introducers');
        } finally {
            setLoading(false);
        }
    };

    const deleteIntroducer = async (id: number) => {
        try {
            await axios.delete(`/introducers/${id}`, {
                withCredentials: true,
            });
        } catch {
            toast.error('Failed to delete introducer');
        }
    };

    return {
        introducers,
        loading,
        fetchIntroducers,
        deleteIntroducer,
    };
}
