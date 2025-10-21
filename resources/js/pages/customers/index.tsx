import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, Link, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import HeadingSmall from '../../components/heading-small';
import CustomAuthLayout from '../../layouts/custom-auth-layout';

// Define TypeScript types for pages
interface Page {
    id: number;
    title: string;
    slug: string;
    meta_title: string;
    predefined: boolean;
}

interface PagesProps {
    pages: {
        data: Page[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
}

export default function Index() {
    const { pages } = usePage<PagesProps>().props;

    return (
        <CustomAuthLayout>
            <Head title="Pages" />

            <div className="space-y-4 p-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                    <HeadingSmall
                        title="Pages"
                        description="Manage your website's pages"
                    />
                    <Link
                        href="/pages/create"
                        className="inline-block rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Create Page
                    </Link>
                </div>

                {/* Table */}
                <div className="h-[calc(100vh-250px)] overflow-auto rounded border border-gray-200 dark:border-gray-700">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 hidden bg-gray-50 md:table-header-group dark:bg-gray-800">
                            <tr>
                                <th className="border-b p-2 text-left dark:border-gray-700">
                                    Title
                                </th>
                                <th className="border-b p-2 text-left dark:border-gray-700">
                                    Slug
                                </th>
                                <th className="border-b p-2 text-left dark:border-gray-700">
                                    Meta Title
                                </th>
                                <th className="border-b p-2 text-left dark:border-gray-700">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="flex flex-col md:table-row-group">
                            {pages.data.map((page) => (
                                <tr
                                    key={page.id}
                                    className="flex flex-col border-b even:bg-gray-50 md:table-row md:flex-row dark:border-gray-700 dark:even:bg-gray-900"
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
                                                            href="/"
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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
                                                            href="/"
                                                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
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
                                                                href="/"
                                                                className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
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

                {/* Pagination */}
                <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {pages.data.length} results
                    </span>
                    <div className="flex gap-1">
                        {pages.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`rounded-full px-3 py-1 text-sm ${
                                    link.active
                                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
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
