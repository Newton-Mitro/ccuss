import { CustomerAddress } from '@/types/customer';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function useCustomerAddresses() {
    const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAddresses = async (customerId: number) => {
        try {
            setLoading(true);
            const { data } = await axios.get(
                '/api/addresses/addresses-by-customer',
                {
                    params: { customer_id: customerId },
                    withCredentials: true,
                },
            );
            setAddresses(data ?? []);
        } catch {
            toast.error('Failed to fetch addresses');
        } finally {
            setLoading(false);
        }
    };

    const deleteAddress = async (id: number) => {
        await axios.delete(`/addresses/${id}`, {
            withCredentials: true,
        });
    };

    return {
        addresses,
        loading,
        fetchAddresses,
        deleteAddress,
    };
}
