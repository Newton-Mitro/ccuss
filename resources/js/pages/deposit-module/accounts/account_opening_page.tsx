import HeadingSmall from '@/components/heading-small';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { CheckCheck, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import InputError from '../../../components/input-error';
import AppDatePicker from '../../../components/ui/app_date_picker';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { cn } from '../../../lib/utils';

const accountTypes = [
    { label: 'Savings Account', value: 'savings' },
    { label: 'Member Account', value: 'member_account' },
    { label: 'Fixed Deposit', value: 'fixed_deposit' },
    { label: 'Recurring Deposit', value: 'recurring_deposit' },
];

const emptyHolder = {
    member_no: '',
    full_name: '',
    mobile: '',
    email: '',
    dob: '',
    gender: '',
    relation_type: 'joint',
    share_percentage: 0,
};

const emptyNominee = {
    full_name: '',
    relation: '',
    mobile: '',
    nid_no: '',
    share_percentage: 0,
};

const tabs = [
    {
        key: 'account',
        title: 'Account Information',
    },
    {
        key: 'holders',
        title: 'Account Holders',
    },
    {
        key: 'nominees',
        title: 'Nominees',
    },
    {
        key: 'services',
        title: 'Services & Review',
    },
];

export default function AccountOpeningCreate() {
    const { data, setData, post, processing, errors } = useForm({
        account_type: '',
        account_number: '',
        account_name: '',
        initial_deposit: '',
        interest_rate: '',

        account_holders: [
            {
                member_no: '',
                full_name: '',
                mobile: '',
                email: '',
                dob: '',
                gender: '',
                relation_type: 'primary',
                share_percentage: 100,
            },
        ],

        nominees: [
            {
                full_name: '',
                relation: '',
                mobile: '',
                nid_no: '',
                share_percentage: 100,
            },
        ],

        sms_banking: false,
        internet_banking: false,
        debit_card: false,

        terms_accepted: false,
    });

    const [activeTab, setActiveTab] = useState('account');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/saving-accounts', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const addHolder = () => {
        setData('account_holders', [
            ...data.account_holders,
            { ...emptyHolder },
        ]);
    };

    const removeHolder = (index: number) => {
        setData(
            'account_holders',
            data.account_holders.filter((_, i) => i !== index),
        );
    };

    const addNominee = () => {
        setData('nominees', [...data.nominees, { ...emptyNominee }]);
    };

    const removeNominee = (index: number) => {
        setData(
            'nominees',
            data.nominees.filter((_, i) => i !== index),
        );
    };

    const currentIndex = tabs.findIndex((x) => x.key === activeTab);

    const nextTab = () => {
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].key);
        }
    };

    const previousTab = () => {
        if (currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1].key);
        }
    };

    return (
        <CustomAuthLayout breadcrumbs={[]}>
            <Head title="Account Opening" />

            <HeadingSmall
                title="Account Opening"
                description="Create a new savings account."
            />

            <div className="mt-6 overflow-x-auto rounded-md border-border bg-card p-4">
                <div className="flex border-b">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                'px-5 py-3 text-sm font-medium',
                                activeTab === tab.key
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {tab.title}
                        </button>
                    ))}
                </div>
                <div className="h-[calc(100vh-400px)] overflow-auto bg-muted p-6">
                    {activeTab === 'account' && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <Label>Account Type</Label>

                                <Select
                                    value={data.account_type}
                                    onChange={(v) => setData('account_type', v)}
                                    options={accountTypes}
                                />

                                <InputError message={errors.account_type} />
                            </div>

                            <div>
                                <Label>Account Number</Label>

                                <Input
                                    value={data.account_number}
                                    onChange={(e) =>
                                        setData(
                                            'account_number',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <Label>Account Type</Label>

                                <Select
                                    value={data.account_type}
                                    onChange={(v) => setData('account_type', v)}
                                    options={accountTypes}
                                />

                                <InputError message={errors.account_type} />
                            </div>

                            <div>
                                <Label>Account Name</Label>

                                <Input
                                    value={data.account_name}
                                    onChange={(e) =>
                                        setData('account_name', e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <Label>Initial Deposit</Label>

                                <Input
                                    type="number"
                                    value={data.initial_deposit}
                                    onChange={(e) =>
                                        setData(
                                            'initial_deposit',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <Label>Interest Rate (%)</Label>

                                <Input
                                    value={data.interest_rate}
                                    onChange={(e) =>
                                        setData('interest_rate', e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'holders' && (
                        <div className="space-y-4">
                            {data.account_holders.map((holder, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border border-primary/20 p-4"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="font-semibold">
                                            Holder #{index + 1}
                                        </h3>

                                        {index > 0 && (
                                            <Button
                                                variant="destructive"
                                                type="button"
                                                onClick={() =>
                                                    removeHolder(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <Input
                                            placeholder="Member No"
                                            value={holder.member_no}
                                        />

                                        <Input
                                            placeholder="Full Name"
                                            value={holder.full_name}
                                        />

                                        <Input
                                            placeholder="Mobile"
                                            value={holder.mobile}
                                        />

                                        <Input
                                            placeholder="Email"
                                            value={holder.email}
                                        />

                                        <AppDatePicker
                                            value={holder.dob}
                                            onChange={() => {}}
                                        />

                                        <Select
                                            value={holder.relation_type}
                                            options={[
                                                {
                                                    label: 'Primary',
                                                    value: 'primary',
                                                },
                                                {
                                                    label: 'Joint',
                                                    value: 'joint',
                                                },
                                            ]}
                                            onChange={() => {}}
                                        />

                                        <Input
                                            type="number"
                                            placeholder="Share %"
                                            value={holder.share_percentage}
                                        />
                                    </div>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={addHolder}
                            >
                                Add Joint Holder
                            </Button>
                        </div>
                    )}

                    {activeTab === 'nominees' && (
                        <div className="space-y-4">
                            {data.nominees.map((nominee, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border p-4"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <h4 className="font-medium">
                                            Nominee #{index + 1}
                                        </h4>

                                        {index > 0 && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    removeNominee(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                                        <Input
                                            placeholder="Nominee Name"
                                            value={nominee.full_name}
                                            onChange={(e) => {
                                                const nominees = [
                                                    ...data.nominees,
                                                ];
                                                nominees[index].full_name =
                                                    e.target.value;
                                                setData('nominees', nominees);
                                            }}
                                        />

                                        <Input
                                            placeholder="Relationship"
                                            value={nominee.relation}
                                            onChange={(e) => {
                                                const nominees = [
                                                    ...data.nominees,
                                                ];
                                                nominees[index].relation =
                                                    e.target.value;
                                                setData('nominees', nominees);
                                            }}
                                        />

                                        <Input
                                            placeholder="Mobile"
                                            value={nominee.mobile}
                                            onChange={(e) => {
                                                const nominees = [
                                                    ...data.nominees,
                                                ];
                                                nominees[index].mobile =
                                                    e.target.value;
                                                setData('nominees', nominees);
                                            }}
                                        />

                                        <Input
                                            placeholder="NID No"
                                            value={nominee.nid_no}
                                            onChange={(e) => {
                                                const nominees = [
                                                    ...data.nominees,
                                                ];
                                                nominees[index].nid_no =
                                                    e.target.value;
                                                setData('nominees', nominees);
                                            }}
                                        />

                                        <Input
                                            type="number"
                                            placeholder="Share %"
                                            value={nominee.share_percentage}
                                            onChange={(e) => {
                                                const nominees = [
                                                    ...data.nominees,
                                                ];
                                                nominees[
                                                    index
                                                ].share_percentage = Number(
                                                    e.target.value,
                                                );
                                                setData('nominees', nominees);
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={addNominee}
                            >
                                + Add Nominee
                            </Button>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={data.sms_banking}
                                        onChange={(e) =>
                                            setData(
                                                'sms_banking',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    SMS Banking
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={data.internet_banking}
                                        onChange={(e) =>
                                            setData(
                                                'internet_banking',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    Internet Banking
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={data.debit_card}
                                        onChange={(e) =>
                                            setData(
                                                'debit_card',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    Debit Card
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.terms_accepted}
                                    onChange={(e) =>
                                        setData(
                                            'terms_accepted',
                                            e.target.checked,
                                        )
                                    }
                                />

                                <span>
                                    I confirm the information provided is
                                    correct.
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between border-t pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={currentIndex === 0}
                        onClick={previousTab}
                    >
                        Previous
                    </Button>

                    {currentIndex < tabs.length - 1 ? (
                        <Button type="button" onClick={nextTab}>
                            Next
                        </Button>
                    ) : (
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCheck className="mr-2 h-4 w-4" />
                                    Open Account
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </CustomAuthLayout>
    );
}
