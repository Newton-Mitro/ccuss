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

// 🧩 DnD imports
import {
    DndContext,
    closestCenter,
    useDraggable,
    useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { route } from 'ziggy-js';

const TYPE_COLORS = {
    ASSET: 'bg-green-100 text-green-800',
    LIABILITY: 'bg-red-100 text-red-800',
    EQUITY: 'bg-blue-100 text-blue-800',
    INCOME: 'bg-purple-100 text-purple-800',
    EXPENSE: 'bg-yellow-100 text-yellow-800',
};

/* ----------------- DND COMPONENTS ----------------- */
function DraggableItem({ id, children }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div ref={setNodeRef} style={style}>
            {children({ listeners, attributes })}
        </div>
    );
}

function DroppableGroup({ id, children }) {
    const { setNodeRef, isOver } = useDroppable({ id });

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

/* ----------------- MAIN PAGE ----------------- */
export default function GlAccountsIndex({ glAccounts, groupAccounts, flash }) {
    const [expandedIds, setExpandedIds] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        code: '',
        name: '',
        type: '',
        parent_id: '',
        category: 'GL',
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    /* ----------------- MODAL LOGIC ----------------- */
    const openModal = (account = null) => {
        setEditingAccount(account);
        if (account) {
            setData({
                code: account.code,
                name: account.name,
                type: account.type,
                parent_id: account.parent_id || '',
                category: account.category || 'GL',
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingAccount) {
            put(route('gl-accounts.update', editingAccount.id), {
                data, // your form data
                preserveScroll: true,
                onSuccess: closeModal,
                onError: (err) => {
                    console.log('Update error:', err);
                    toast.error('Failed to update GL account.');
                },
            });
        } else {
            post(route('gl-accounts.store'), {
                data,
                preserveScroll: true,
                onSuccess: closeModal,
                onError: (err) => toast.error('Failed to create GL account.'),
            });
        }
    };

    /* ----------------- TREE CONTROLS ----------------- */
    const toggleExpand = (id) => {
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const expandAll = () => {
        const allIds = [];
        const collect = (accounts) => {
            for (const acc of accounts) {
                if (acc.category === 'GROUP') {
                    allIds.push(acc.id);
                    if (acc.children?.length) collect(acc.children);
                }
            }
        };
        collect(glAccounts);
        setExpandedIds(allIds);
    };

    const collapseAll = () => setExpandedIds([]);

    /* ----------------- DELETE HANDLER ----------------- */
    const handleDelete = (id, name) => {
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({
            title: 'Are you sure?',
            text: `GL Account "${name}" will be permanently deleted!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isDark ? '#ef4444' : '#d33',
            cancelButtonColor: isDark ? '#3b82f6' : '#3085d6',
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#f9fafb' : '#111827',
            confirmButtonText: `Yes, delete it!`,
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('gl-accounts.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () =>
                        toast.success('GL Account deleted successfully!'),
                    onError: () => toast.error('Failed to delete account.'),
                });
            }
        });
    };

    /* ----------------- DRAG & DROP HANDLER ----------------- */
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const draggedId = active.id.replace('gl-', '');
        const targetGroupId = over.id.replace('group-', '');

        if (active.id.startsWith('gl-') && over.id.startsWith('group-')) {
            router.post(
                route('gl-accounts.move'),
                { gl_id: draggedId, parent_id: targetGroupId },
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        toast.success('GL account moved successfully!'),
                    onError: () => toast.error('Failed to move GL account.'),
                },
            );
        }
    };

    /* ----------------- RENDER TREE ----------------- */
    const renderTree = (accounts, level = 0) => (
        <ul className="list-none">
            {accounts.map((acc) => {
                const content = (
                    <div
                        className={`flex items-center justify-between rounded-lg px-3 py-1 transition hover:bg-accent/10 ${
                            acc.category === 'GROUP'
                                ? 'cursor-pointer font-medium'
                                : ''
                        }`}
                        style={{ marginLeft: `${level * 1.5}rem` }}
                        onClick={() =>
                            acc.category === 'GROUP' && toggleExpand(acc.id)
                        }
                    >
                        <div className="flex items-center gap-2">
                            {acc.category === 'GROUP' ? (
                                expandedIds.includes(acc.id) ? (
                                    <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                                )
                            ) : (
                                <FileIcon className="h-4 w-4 text-muted-foreground" />
                            )}

                            <span className="text-sm text-foreground">
                                {acc.code} — {acc.name}
                            </span>

                            <span
                                className={`ml-2 rounded px-2 py-0.5 text-xs font-medium ${
                                    TYPE_COLORS[acc.type] ||
                                    'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {acc.type}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                className="flex items-center gap-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(acc);
                                }}
                            >
                                <Edit2Icon className="h-3 w-3" />
                            </Button>

                            {acc.category === 'GL' && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDelete(acc.id, acc.name)
                                    }
                                    className="text-destructive hover:text-destructive/80"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                );

                return (
                    <li key={acc.id}>
                        {acc.category === 'GROUP' ? (
                            <DroppableGroup id={`group-${acc.id}`}>
                                {content}
                                {acc.children?.length > 0 &&
                                    expandedIds.includes(acc.id) &&
                                    renderTree(acc.children, level + 1)}
                            </DroppableGroup>
                        ) : (
                            <DraggableItem id={`gl-${acc.id}`}>
                                {({ listeners, attributes }) => (
                                    <div
                                        className={`flex items-center justify-between rounded-lg px-3 py-1 hover:bg-accent/10`}
                                        style={{
                                            marginLeft: `${level * 1.5}rem`,
                                        }}
                                    >
                                        {/* Left: drag handle + account info */}
                                        <div className="flex items-center gap-2">
                                            {/* Drag handle */}
                                            <div
                                                {...listeners}
                                                {...attributes}
                                                className="cursor-grab p-1 active:cursor-grabbing"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <FileIcon className="h-4 w-4 text-muted-foreground" />
                                            </div>

                                            {/* Account code & name */}
                                            <span className="text-sm text-foreground">
                                                {acc.code} — {acc.name}
                                            </span>

                                            {/* Type badge */}
                                            <span
                                                className={`ml-2 rounded px-2 py-0.5 text-xs font-medium ${
                                                    TYPE_COLORS[acc.type] ||
                                                    'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {acc.type}
                                            </span>
                                        </div>

                                        {/* Right: Edit / Delete buttons */}
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="flex items-center gap-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openModal(acc);
                                                }}
                                            >
                                                <Edit2Icon className="h-3 w-3" />
                                            </Button>

                                            {acc.category === 'GL' && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            acc.id,
                                                            acc.name,
                                                        )
                                                    }
                                                    className="text-destructive hover:text-destructive/80"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </DraggableItem>
                        )}
                    </li>
                );
            })}
        </ul>
    );

    /* ----------------- PAGE LAYOUT ----------------- */
    return (
        <CustomAuthLayout
            breadcrumbs={[
                { title: 'General Ledger', href: '/gl-accounts' },
                { title: 'Chart of Accounts', href: '' },
            ]}
        >
            <Head title="Chart of Accounts" />

            <div className="animate-in space-y-6 text-foreground fade-in">
                <HeadingSmall
                    title="Chart of Accounts"
                    description="Manage your ledger accounts hierarchy"
                />

                <div className="flex items-center justify-between">
                    <Button
                        onClick={() => openModal()}
                        className="flex w-44 items-center gap-2"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Ledger Account
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={expandAll}>
                            <ChevronDownIcon className="h-4 w-4" />
                            Expand All
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={collapseAll}
                        >
                            <ChevronUpIcon className="h-4 w-4" />
                            Collapse All
                        </Button>
                    </div>
                </div>

                <Card className="h-[calc(100vh-240px)] overflow-y-auto rounded-xl border border-border p-6 shadow-lg">
                    <DndContext
                        onDragEnd={handleDragEnd}
                        collisionDetection={closestCenter}
                    >
                        {glAccounts.length > 0 ? (
                            renderTree(glAccounts)
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No ledger accounts yet.
                            </p>
                        )}
                    </DndContext>
                </Card>

                {/* Modal */}
                {modalOpen && (
                    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <Card className="relative w-full max-w-md rounded-xl p-6 shadow-lg">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="absolute top-3 right-3"
                                onClick={closeModal}
                            >
                                <XIcon className="h-4 w-4" />
                            </Button>

                            <h2 className="mb-4 text-lg font-semibold text-primary">
                                {editingAccount
                                    ? 'Edit Ledger Account'
                                    : 'Add Ledger Account'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label>Code</Label>
                                    <Input
                                        value={data.code}
                                        onChange={(e) =>
                                            setData('code', e.target.value)
                                        }
                                        placeholder="e.g. 1010"
                                        className="mt-1"
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
                                        placeholder="Cash Account"
                                        className="mt-1"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <Label>Type</Label>
                                    <select
                                        className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                                        value={data.type}
                                        onChange={(e) =>
                                            setData('type', e.target.value)
                                        }
                                    >
                                        <option value="">Select Type</option>
                                        {Object.keys(TYPE_COLORS).map(
                                            (type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <InputError message={errors.type} />
                                </div>

                                <div>
                                    <Label>Category</Label>
                                    <select
                                        className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                                        value={data.category}
                                        onChange={(e) =>
                                            setData('category', e.target.value)
                                        }
                                    >
                                        <option value="GL">GL</option>
                                        <option value="GROUP">GROUP</option>
                                    </select>
                                    <InputError message={errors.category} />
                                </div>

                                <div>
                                    <Label>Parent Account</Label>
                                    <select
                                        className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                                        value={data.parent_id}
                                        onChange={(e) =>
                                            setData('parent_id', e.target.value)
                                        }
                                    >
                                        <option value="">No Parent</option>
                                        {groupAccounts
                                            .filter(
                                                (acc) =>
                                                    acc.id !==
                                                    editingAccount?.id,
                                            )
                                            .map((acc) => (
                                                <option
                                                    key={acc.id}
                                                    value={acc.id}
                                                >
                                                    {acc.code} — {acc.name}
                                                </option>
                                            ))}
                                    </select>
                                    <InputError message={errors.parent_id} />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-40 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                                    >
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
            </div>
        </CustomAuthLayout>
    );
}
