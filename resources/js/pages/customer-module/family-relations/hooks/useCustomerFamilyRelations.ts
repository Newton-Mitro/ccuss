import { CustomerFamilyRelation } from '@/types/customer';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function useCustomerFamilyRelations() {
    const [relations, setRelations] = useState<CustomerFamilyRelation[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchRelations = async (customerId: number) => {
        try {
            setLoading(true);

            const { data } = await axios.get(
                '/api/family-relations/by-customer',
                {
                    params: { customer_id: customerId },
                    withCredentials: true,
                },
            );

            setRelations(data ?? []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch family relations');
        } finally {
            setLoading(false);
        }
    };

    const deleteRelation = async (relationId: number) => {
        try {
            await axios.delete(`/family-relations/${relationId}`, {
                withCredentials: true,
            });

            setRelations((prev) => prev.filter((r) => r.id !== relationId));

            toast.success('Family relation deleted');
        } catch {
            toast.error('Failed to delete family relation');
        }
    };

    return {
        relations,
        loading,
        fetchRelations,
        deleteRelation,
    };
}
