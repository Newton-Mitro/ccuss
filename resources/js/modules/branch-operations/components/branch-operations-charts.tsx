import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
);

interface BranchOperationsChartsProps {
    dailyPostedAmounts: { date: string; label: string; amount: number }[];
    transactionTypes: { type: string; count: number }[];
}

const currency = (amount: number) => `BDT ${formatBDTCurrency(amount, false)}`;

export default function BranchOperationsCharts({
    dailyPostedAmounts,
    transactionTypes,
}: BranchOperationsChartsProps) {
    const dailyData = {
        labels: dailyPostedAmounts.map((day) => day.label),
        datasets: [
            {
                label: 'Posted cash',
                data: dailyPostedAmounts.map((day) => day.amount),
                backgroundColor: 'rgba(15, 118, 110, 0.72)',
                borderColor: '#0f766e',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const typeData = {
        labels: transactionTypes.map(({ type }) =>
            type.replaceAll('_', ' ').toLowerCase(),
        ),
        datasets: [
            {
                data: transactionTypes.map(({ count }) => count),
                backgroundColor: [
                    '#0f766e',
                    '#2563eb',
                    '#d97706',
                    '#dc2626',
                    '#7c3aed',
                    '#0891b2',
                ],
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className="grid gap-4 xl:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Posted cash by day
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Branch activity for the last seven calendar days
                    </p>
                </CardHeader>
                <CardContent>
                    {dailyPostedAmounts.some((day) => day.amount > 0) ? (
                        <div className="h-64">
                            <Bar
                                data={dailyData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) =>
                                                    currency(
                                                        Number(context.raw),
                                                    ),
                                            },
                                        },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                callback: (value) =>
                                                    currency(Number(value)),
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    ) : (
                        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                            No posted cash activity in the last seven days.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Transaction types
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Transaction count for the open branch day
                    </p>
                </CardHeader>
                <CardContent>
                    {transactionTypes.length > 0 ? (
                        <div className="h-64">
                            <Bar
                                data={typeData}
                                options={{
                                    indexAxis: 'y',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            ticks: { precision: 0 },
                                        },
                                    },
                                }}
                            />
                        </div>
                    ) : (
                        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                            No transactions recorded for the open branch day.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
