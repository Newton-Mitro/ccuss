import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import type {
    CustomerDashboardChartsProps,
} from '@/modules/customers-kyc/types/components/customer-dashboard-charts.interfaces';


ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    Legend,
    LinearScale,
    Tooltip,
);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom' as const },
    },
    scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
    },
};

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom' as const },
    },
};

export default function CustomerDashboardCharts({
    charts,
}: CustomerDashboardChartsProps) {
    const demographics = {
        labels: ['Male', 'Female', 'Other', 'Organization'],
        datasets: [
            {
                data: [
                    charts.demographics.male,
                    charts.demographics.female,
                    charts.demographics.other,
                    charts.demographics.organization,
                ],
                backgroundColor: ['#2563eb', '#db2777', '#7c3aed', '#0f766e'],
                borderWidth: 0,
            },
        ],
    };
    const statuses = {
        labels: ['Active', 'Pending', 'Inactive', 'Suspended', 'Closed'],
        datasets: [
            {
                label: 'Customers',
                data: [
                    charts.statuses.active,
                    charts.statuses.pending,
                    charts.statuses.inactive,
                    charts.statuses.suspended,
                    charts.statuses.closed,
                ],
                backgroundColor: [
                    '#16a34a',
                    '#d97706',
                    '#64748b',
                    '#dc2626',
                    '#475569',
                ],
                borderRadius: 6,
            },
        ],
    };
    const pendingApprovals = {
        labels: [
            'Customers',
            'Addresses',
            'Family relations',
            'Introducers',
            'KYC documents',
        ],
        datasets: [
            {
                label: 'Pending approvals',
                data: [
                    charts.pendingApprovals.customers,
                    charts.pendingApprovals.addresses,
                    charts.pendingApprovals.familyRelations,
                    charts.pendingApprovals.introducers,
                    charts.pendingApprovals.documents,
                ],
                backgroundColor: '#d97706',
                borderRadius: 6,
            },
        ],
    };

    return (
        <section className="grid gap-4 xl:grid-cols-3">
            <Card className="min-w-0">
                <CardHeader>
                    <CardTitle className="text-base">
                        Customer demographics
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Individual customers by gender and organization
                        customers.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <Doughnut
                            data={demographics}
                            options={doughnutOptions}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="min-w-0">
                <CardHeader>
                    <CardTitle className="text-base">Customer status</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Customer records grouped by their current status.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <Bar data={statuses} options={chartOptions} />
                    </div>
                </CardContent>
            </Card>

            <Card className="min-w-0">
                <CardHeader>
                    <CardTitle className="text-base">
                        Pending approvals
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Items awaiting customer or KYC review.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <Bar data={pendingApprovals} options={chartOptions} />
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
