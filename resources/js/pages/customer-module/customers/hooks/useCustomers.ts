import { Customer } from '@/types/customer';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export function useCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);

    /* ---------- READ ---------- */
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/customers', {
                withCredentials: true,
            });
            setCustomers(data ?? []);
        } catch {
            toast.error('Failed to fetch addresses');
        } finally {
            setLoading(false);
        }
    };

    /* ---------- CREATE ---------- */
    const createCustomer = async (payload: Omit<Customer, 'id'>) => {
        try {
            const { data } = await axios.post('/api/customers', payload);
            setCustomers((prev) => [data, ...prev]);
            toast.success('User created');
        } catch {
            toast.error('Failed to create user');
        }
    };

    /* ---------- UPDATE ---------- */
    const updateCustomer = async (id: number, payload: Partial<Customer>) => {
        try {
            const { data } = await axios.put(`/api/customers/${id}`, payload);
            setCustomers((prev) => prev.map((u) => (u.id === id ? data : u)));
            toast.success('User updated');
        } catch {
            toast.error('Failed to update user');
        }
    };

    /* ---------- DELETE ---------- */
    const deleteCustomer = async (id: number) => {
        await axios.delete(`/api/customer/${id}`, {
            withCredentials: true,
        });
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    return {
        customers,
        loading,
        fetchCustomers,
        createCustomer,
        updateCustomer,
        deleteCustomer,
    };
}
