import { Customer } from '@/types/customer';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function useFindCustomer() {
    const [customer, setCustomer] = useState<Customer>(null);
    const [loading, setLoading] = useState(false);

    const fetchCustomer = async (customerId: number) => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/customer', {
                params: { customer_id: customerId },
                withCredentials: true,
            });
            setCustomer(data ?? null);
        } catch {
            toast.error('Failed to fetch addresses');
        } finally {
            setLoading(false);
        }
    };

    return {
        customer,
        loading,
        fetchCustomer,
    };
}
