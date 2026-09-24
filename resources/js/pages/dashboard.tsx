import { Head, router, usePage } from '@inertiajs/react';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    DoughnutController,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    RadarController,
    RadialLinearScale,
    Title,
    Tooltip,
} from 'chart.js';
import { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import { ResourcePageHeader } from '../components/resource-page-shell';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../components/ui/card';
import CustomAuthLayout from '../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../types';

// Register Chart.js modules
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    RadialLinearScale,
    DoughnutController,
    RadarController,
    Title,
    Tooltip,
    Legend,
);

export default function DashboardPage() {
    const { stats, monthlyVisitors, routeVisits, auditLogs }: any =
        usePage().props;

    // 🎨 Theme Colors
    const [themeColors, setThemeColors] = useState({
        background: '',
        card: '',
        border: '',
        foreground: '',
        chart1: '',
        chart2: '',
        chart3: '',
        chart4: '',
        chart5: '',
    });

    // Update theme colors dynamically
    useEffect(() => {
        const root = getComputedStyle(document.documentElement);
        const getVar = (v: string) => root.getPropertyValue(v).trim();

        const updateTheme = () => {
            setThemeColors({
                background: getVar('--color-background'),
                card: getVar('--color-card'),
                border: getVar('--color-border'),
                foreground: getVar('--color-foreground'),
                chart1: getVar('--color-chart-1'),
                chart2: getVar('--color-chart-2'),
                chart3: getVar('--color-chart-3'),
                chart4: getVar('--color-chart-4'),
                chart5: getVar('--color-chart-5'),
            });
        };

        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    // 💻 KPI Cards
    const kpiCards = [
        {
            label: 'Branches',
            value: stats.branches,
            icon: 'fa-code-branch',
            route: '/branches',
            color: themeColors.chart1,
        },
        {
            label: 'Customers',
            value: stats.customers,
            icon: 'fa-users',
            route: '/customers',
            color: themeColors.chart2,
        },
        {
            label: 'Savings',
            value: stats.savingsAccounts,
            icon: 'fa-piggy-bank',
            route: '/savings',
            color: themeColors.chart3,
        },
        {
            label: 'Shares',
            value: stats.shares,
            icon: 'fa-chart-pie',
            route: '/shares',
            color: themeColors.chart4,
        },
        {
            label: 'Loans',
            value: stats.loans,
            icon: 'fa-money-check-dollar',
            route: '/loans',
            color: themeColors.chart5,
        },
        {
            label: 'Vendors',
            value: stats.vendors,
            icon: 'fa-store',
            route: '/vendors',
            color: themeColors.chart1,
        },
        {
            label: 'Assets',
            value: stats.assets,
            icon: 'fa-boxes-stacked',
            route: '/assets',
            color: themeColors.chart2,
        },
        {
            label: 'Employees',
            value: stats.employees,
            icon: 'fa-user-tie',
            route: '/hr/employees',
            color: themeColors.chart3,
        },
        {
            label: 'Audit Logs',
            value: stats.auditLogs,
            icon: 'fa-list-check',
            route: '/audit-logs',
            color: themeColors.chart4,
        },
        {
            label: 'Users',
            value: stats.users,
            icon: 'fa-user-gear',
            route: '/users',
            color: themeColors.chart5,
        },
        {
            label: 'Visitors',
            value: stats.totalVisitors,
            icon: 'fa-chart-line',
            route: '/visitors',
            color: themeColors.chart1,
        },
    ];

    // 📊 Chart Options
    const chartOptions = useMemo(
        () => ({
            responsive: true,
            plugins: {
                legend: { labels: { color: themeColors.foreground } },
                title: { display: false, color: themeColors.foreground },
            },
            scales: {
                x: {
                    ticks: { color: themeColors.foreground },
                    grid: { color: themeColors.border },
                },
                y: {
                    ticks: { color: themeColors.foreground },
                    grid: { color: themeColors.border },
                },
            },
        }),
        [themeColors],
    );

    // Monthly Visitors (Line)
    const monthlyVisitorsData = useMemo(
        () => ({
            labels: Object.keys(monthlyVisitors),
            datasets: [
                {
                    label: 'Visitors',
                    data: Object.values(monthlyVisitors),
                    fill: true,
                    backgroundColor: themeColors.chart1 + '33',
                    borderColor: themeColors.chart1,
                    tension: 0.3,
                },
            ],
        }),
        [monthlyVisitors, themeColors],
    );

    // Route Visits (Bar)
    const routeVisitedData = useMemo(
        () => ({
            labels: Object.keys(routeVisits),
            datasets: [
                {
                    label: 'Visits',
                    data: Object.values(routeVisits),
                    backgroundColor: [
                        themeColors.chart1,
                        themeColors.chart2,
                        themeColors.chart3,
                        themeColors.chart4,
                        themeColors.chart5,
                    ],
                },
            ],
        }),
        [routeVisits, themeColors],
    );

    // Doughnut Chart
    const doughnutData = useMemo(
        () => ({
            labels: ['Branches', 'Customers', 'Loans', 'Assets', 'Employees'],
            datasets: [
                {
                    data: [
                        stats.branches,
                        stats.customers,
                        stats.loans,
                        stats.assets,
                        stats.employees,
                    ],
                    backgroundColor: [
                        themeColors.chart1,
                        themeColors.chart2,
                        themeColors.chart3,
                        themeColors.chart4,
                        themeColors.chart5,
                    ],
                },
            ],
        }),
        [stats, themeColors],
    );

    // Radar Chart
    const radarData = useMemo(
        () => ({
            labels: ['Savings', 'Shares', 'Loans', 'Vendors', 'Users'],
            datasets: [
                {
                    label: 'KPI Radar',
                    data: [
                        stats.savingsAccounts,
                        stats.shares,
                        stats.loans,
                        stats.vendors,
                        stats.users,
                    ],
                    backgroundColor: themeColors.chart1 + '33',
                    borderColor: themeColors.chart1,
                    borderWidth: 2,
                },
            ],
        }),
        [stats, themeColors],
    );

    // 🧮 Audit Log Chart
    const groupedAuditLogs = auditLogs.reduce((acc: any, log: any) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
    }, {});

    const auditChartData = {
        labels: Object.keys(groupedAuditLogs),
        datasets: [
            {
                label: 'Action Count',
                data: Object.values(groupedAuditLogs),
                backgroundColor: [
                    themeColors.chart1,
                    themeColors.chart2,
                    themeColors.chart3,
                    themeColors.chart4,
                    themeColors.chart5,
                ],
                borderRadius: 6,
            },
        ],
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6 p-2 transition-colors duration-300 md:p-4">
                <ResourcePageHeader
                    title="Dashboard"
                    description="A live overview of activity across your organization."
                />

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
                    {kpiCards.map((card, idx) => (
                        <div
                            key={idx}
                            onClick={() => router.visit(card.route)}
                            className="group flex cursor-pointer items-center gap-3 rounded-2xl border bg-card/90 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                            style={{
                                backgroundColor: `${card.color}15`,
                                borderColor: `${card.color}40`,
                            }}
                        >
                            <i
                                className={`fa-solid ${card.icon} rounded-xl p-3 text-xl transition-transform duration-200 group-hover:scale-110 sm:text-2xl`}
                                style={{ color: card.color }}
                            />
                            <div>
                                <div className="text-xl font-bold tracking-tight sm:text-2xl">
                                    {card.value}
                                </div>
                                <div className="text-xs font-medium text-muted-foreground">
                                    {card.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card className="bg-card/90">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-base">
                                Top Visited Routes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Bar
                                data={routeVisitedData}
                                options={chartOptions}
                            />
                        </CardContent>
                    </Card>

                    <Card className="bg-card/90">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-base">
                                Monthly Visitors
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Line
                                data={monthlyVisitorsData}
                                options={chartOptions}
                            />
                        </CardContent>
                    </Card>

                    <Card className="bg-card/90">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-base">
                                Branches vs Customers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Doughnut
                                data={doughnutData}
                                options={chartOptions}
                            />
                        </CardContent>
                    </Card>

                    <Card className="bg-card/90">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-base">
                                KPI Radar
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Radar data={radarData} options={chartOptions} />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* 🧾 Audit Logs Section */}
                    <Card className="bg-card/90">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Audit Log Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Bar data={auditChartData} options={chartOptions} />
                        </CardContent>
                    </Card>

                    {/* Audit Logs */}
                    <Card className="bg-card/90">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Recent Audit Logs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                {auditLogs.map((log: any) => (
                                    <li
                                        key={log.id}
                                        className="flex flex-wrap justify-between border-b border-dashed border-muted-foreground/20 py-1"
                                    >
                                        <span className="truncate">
                                            {log.action}
                                        </span>
                                        <span className="ml-2 opacity-70">
                                            {new Date(
                                                log.created_at,
                                            ).toLocaleTimeString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
