import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import HeadingSmall from '../../components/heading-small';
import CustomAuthLayout from '../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../types';

export default function Index() {
    // ✅ Mock Customers
    const allCustomers = [
        {
            id: 1,
            title: 'Home',
            slug: 'home',
            meta_title: 'Welcome to Our Site',
            predefined: true,
        },
        {
            id: 2,
            title: 'About Us',
            slug: 'about-us',
            meta_title: 'Learn More About Us',
            predefined: false,
        },
        {
            id: 3,
            title: 'Contact',
            slug: 'contact',
            meta_title: 'Get in Touch',
            predefined: false,
        },
        {
            id: 4,
            title: 'Blog',
            slug: 'blog',
            meta_title: 'Our Latest News',
            predefined: false,
        },
        {
            id: 5,
            title: 'Services',
            slug: 'services',
            meta_title: 'What We Offer',
            predefined: false,
        },
        {
            id: 6,
            title: 'FAQ',
            slug: 'faq',
            meta_title: 'Frequently Asked Questions',
            predefined: true,
        },
    ];

    const paginationLinks = [
        { label: '1', url: '#', active: true },
        { label: '2', url: '#', active: false },
        { label: 'Next', url: '#', active: false },
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const [filterPredefined, setFilterPredefined] = useState<
        'all' | 'yes' | 'no'
    >('all');
    const [recordsPerCustomer, setRecordsPerCustomer] = useState(5);

    const filteredCustomers = allCustomers.filter((page) => {
        const matchesSearch =
            page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            page.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
            page.meta_title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filterPredefined === 'all' ||
            (filterPredefined === 'yes' && page.predefined) ||
            (filterPredefined === 'no' && !page.predefined);
        return matchesSearch && matchesFilter;
    });

    const paginatedCustomers = filteredCustomers.slice(0, recordsPerCustomer);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/auth/customers' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="space-y-4 p-2 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Customers"
                        description="Manage your website's pages"
                    />
                    <Link
                        href="/auth/customers/create"
                        className="inline-block rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Create Customer
                    </Link>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search pages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 w-full max-w-sm rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                    <select
                        value={filterPredefined}
                        onChange={(e) =>
                            setFilterPredefined(
                                e.target.value as 'all' | 'yes' | 'no',
                            )
                        }
                        className="h-9 w-full max-w-xs rounded-md border border-border bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    >
                        <option value="all">All Customers</option>
                        <option value="yes">Predefined</option>
                        <option value="no">Custom</option>
                    </select>
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-360px)] overflow-auto rounded-md border border-border md:h-[calc(100vh-300px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 hidden bg-muted md:table-header-group">
                            <tr>
                                {['Title', 'Slug', 'Meta Title', 'Actions'].map(
                                    (header) => (
                                        <th
                                            key={header}
                                            className="border-b border-border p-2 text-left text-sm font-medium text-muted-foreground"
                                        >
                                            {header}
                                        </th>
                                    ),
                                )}
                            </tr>
                        </thead>
                        <tbody className="flex flex-col md:table-row-group">
                            {paginatedCustomers.map((page) => (
                                <tr
                                    key={page.id}
                                    className="flex flex-col border-b border-border even:bg-muted/30 md:table-row md:flex-row"
                                >
                                    <td className="px-2 py-1">{page.title}</td>
                                    <td className="px-2 py-1">{page.slug}</td>
                                    <td className="px-2 py-1">
                                        {page.meta_title}
                                    </td>
                                    <td className="px-2 py-1">
                                        <TooltipProvider>
                                            <div className="flex space-x-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href="/pages/view"
                                                            className="text-primary hover:text-primary/80"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        View
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href="/pages/edit"
                                                            className="text-green-600 hover:text-green-500 dark:text-green-400"
                                                        >
                                                            <Pencil className="h-5 w-5" />
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Edit
                                                    </TooltipContent>
                                                </Tooltip>
                                                {!page.predefined && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href="/pages/delete"
                                                                className="text-destructive hover:text-destructive/80"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Delete
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </TooltipProvider>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination & Show Records */}
                <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Show
                        </span>
                        <select
                            value={recordsPerCustomer}
                            onChange={(e) =>
                                setRecordsPerCustomer(Number(e.target.value))
                            }
                            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                        <span className="text-sm text-muted-foreground">
                            records
                        </span>
                    </div>

                    <div className="flex gap-1">
                        {paginationLinks.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
