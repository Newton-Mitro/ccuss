import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    Edit2Icon,
    FileIcon,
    PlusIcon,
    Trash2,
    XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import {
    DndContext,
    closestCenter,
    useDraggable,
    useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { route } from 'ziggy-js';
import { Select } from '../../../components/ui/select';

/* ---------------------------------------------
 | Constants
 --------------------------------------------- */
const TYPE_COLORS: Record<string, string> = {
    ASSET: 'bg-green-100 text-green-800',
    LIABILITY: 'bg-red-100 text-red-800',
    EQUITY: 'bg-blue-100 text-blue-800',
    INCOME: 'bg-purple-100 text-purple-800',
    EXPENSE: 'bg-yellow-100 text-yellow-800',
};

/* ---------------------------------------------
 | Drag helpers
 --------------------------------------------- */
function DraggableItem({ id, children }: any) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: String(id),
    });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform) }}
        >
            {children({ attributes, listeners })}
        </div>
    );
}

function DroppableGroup({ id, children }: any) {
    const { setNodeRef, isOver } = useDroppable({ id: String(id) });

    return (
        <div
            ref={setNodeRef}
            className={`rounded-lg transition ${
                isOver ? 'border border-primary bg-primary/10' : ''
            }`}
        >
            {children}
        </div>
    );
}

/* ---------------------------------------------
 | Page
 --------------------------------------------- */
export default function GlAccountsIndex({
    glAccounts,
    groupAccounts,
    flash,
}: any) {
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<any>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        code: '',
        name: '',
        type: '',
        parent_id: '',
        is_control_account: false,
    });

    /* ---------------------------------------------
     | Flash
     --------------------------------------------- */
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    /* ---------------------------------------------
     | Auto-expand root control accounts
     --------------------------------------------- */
    useEffect(() => {
        if (!glAccounts?.length) return;
        setExpandedIds(
            glAccounts
                .filter((a: any) => a.is_control_account)
                .map((a: any) => a.id),
        );
    }, [glAccounts]);

    /* ---------------------------------------------
     | Modal
     --------------------------------------------- */
    const openModal = (account: any = null) => {
        setEditingAccount(account);

        if (account) {
            setData({
                code: account.code,
                name: account.name,
                type: account.type,
                parent_id: account.parent_id || '',
                is_control_account: account.is_control_account,
            });
        } else {
            reset();
        }

        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingAccount(null);
        reset();
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();

        const action = editingAccount
            ? put(route('ledger_accounts.update', editingAccount.id))
            : post(route('ledger_accounts.store'));

        action({
            preserveScroll: true,
            onSuccess: closeModal,
            onError: () => toast.error('Operation failed'),
        });
    };

    /* ---------------------------------------------
     | Tree controls
     --------------------------------------------- */
    const toggleExpand = (id: number) => {
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const expandAll = () => {
        const ids: number[] = [];

        const collect = (nodes: any[]) => {
            nodes.forEach((n) => {
                if (n.is_control_account) {
                    ids.push(n.id);
                    if (n.children_recursive?.length) {
                        collect(n.children_recursive);
                    }
                }
            });
        };

        collect(glAccounts);
        setExpandedIds(ids);
    };

    const collapseAll = () => setExpandedIds([]);

    /* ---------------------------------------------
     | Delete
     --------------------------------------------- */
    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `"${name}" will be permanently deleted`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
        }).then((res) => {
            if (!res.isConfirmed) return;

            router.delete(route('ledger_accounts.destroy', id), {
                preserveScroll: true,
                onSuccess: () => toast.success('Account deleted'),
                onError: () => toast.error('Delete failed'),
            });
        });
    };

    /* ---------------------------------------------
     | Drag & Drop
     --------------------------------------------- */
    const handleDragEnd = ({ active, over }: any) => {
        if (!over) return;

        router.post(
            route('ledger_accounts.move'),
            {
                ledger_account_id: Number(active.id),
                parent_id: Number(over.id),
            },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Account moved'),
            },
        );
    };

    /* ---------------------------------------------
     | Recursive render
     --------------------------------------------- */
    const renderTree = (nodes: any[], level = 0) => (
        <ul className="space-y-1">
            {nodes.map((acc) => {
                const children = acc.children_recursive || [];
                const expanded = expandedIds.includes(acc.id);

                const row = (
                    <div
                        className="flex items-center justify-between rounded-lg px-3 py-1 hover:bg-accent/10"
                        style={{ marginLeft: `${level * 1.5}rem` }}
                        onClick={() =>
                            acc.is_control_account && toggleExpand(acc.id)
                        }
                    >
                        <div className="flex items-center gap-2">
                            {acc.is_control_account ? (
                                expanded ? (
                                    <ChevronDownIcon className="h-4 w-4" />
                                ) : (
                                    <ChevronRightIcon className="h-4 w-4" />
                                )
                            ) : (
                                <FileIcon className="h-4 w-4" />
                            )}

                            <span className="text-sm">
                                {acc.code} — {acc.name}
                            </span>

                            <span
                                className={`ml-2 rounded px-2 py-0.5 text-xs ${
                                    TYPE_COLORS[acc.type]
                                }`}
                            >
                                {acc.type}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(acc);
                                }}
                            >
                                <Edit2Icon className="h-3 w-3" />
                            </Button>

                            {!acc.is_control_account && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(acc.id, acc.name);
                                    }}
                                    className="text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                );

                return (
                    <li key={acc.id}>
                        {acc.is_control_account ? (
                            <DroppableGroup id={acc.id}>
                                {row}
                                {expanded &&
                                    children.length > 0 &&
                                    renderTree(children, level + 1)}
                            </DroppableGroup>
                        ) : (
                            <DraggableItem id={acc.id}>
                                {() => row}
                            </DraggableItem>
                        )}
                    </li>
                );
            })}
        </ul>
    );

    /* ---------------------------------------------
     | Render
     --------------------------------------------- */
    return (
        <CustomAuthLayout
            breadcrumbs={[
                { title: 'General Ledger', href: '/ledger_accounts' },
                { title: 'Chart of Accounts' },
            ]}
        >
            <Head title="Chart of Accounts" />

            <div className="space-y-6">
                <HeadingSmall
                    title="Chart of Accounts"
                    description="Manage your ledger hierarchy"
                />

                <div className="flex justify-between">
                    <Button onClick={() => openModal()}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Account
                    </Button>

                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={expandAll}>
                            <ChevronDownIcon className="mr-1 h-4 w-4" />
                            Expand All
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={collapseAll}
                        >
                            <ChevronUpIcon className="mr-1 h-4 w-4" />
                            Collapse All
                        </Button>
                    </div>
                </div>

                <Card className="h-[calc(100vh-240px)] overflow-y-auto p-6">
                    <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        {renderTree(glAccounts)}
                    </DndContext>
                </Card>
            </div>

            {/* -----------------------------------------
             | Modal
             ----------------------------------------- */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <Card className="relative w-full max-w-md p-6">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-3 right-3"
                            onClick={closeModal}
                        >
                            <XIcon className="h-4 w-4" />
                        </Button>

                        <h2 className="mb-4 text-lg font-semibold">
                            {editingAccount ? 'Edit Account' : 'Add Account'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Code</Label>
                                <Input
                                    value={data.code}
                                    onChange={(e) =>
                                        setData('code', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.code} />
                            </div>

                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={data.type}
                                    onChange={(e) =>
                                        setData('type', e.target.value)
                                    }
                                    options={Object.keys(TYPE_COLORS).map(
                                        (t) => ({
                                            value: t,
                                            label: t,
                                        }),
                                    )}
                                    includeNone={true}
                                />
                                <InputError message={errors.type} />
                            </div>

                            <div>
                                <Label>Control Account</Label>
                                <Select
                                    value={data.is_control_account ? '1' : '0'}
                                    onChange={(e) =>
                                        setData(
                                            'is_control_account',
                                            e.target.value === '1',
                                        )
                                    }
                                    options={[
                                        { value: '0', label: 'No' },
                                        { value: '1', label: 'Yes' },
                                    ]}
                                    includeNone={false}
                                />
                            </div>

                            <div>
                                <Label>Parent Account</Label>
                                <Select
                                    value={data.parent_id}
                                    onChange={(e) =>
                                        setData('parent_id', e.target.value)
                                    }
                                    options={groupAccounts
                                        .filter(
                                            (a: any) =>
                                                a.id !== editingAccount?.id,
                                        )
                                        .map((a: any) => ({
                                            value: a.id.toString(), // value must be string
                                            label: `${a.code} — ${a.name}`, // label for display
                                        }))}
                                    includeNone={true} // allows "--None--" option
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Saving...'
                                        : editingAccount
                                          ? 'Update'
                                          : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </CustomAuthLayout>
    );
}
