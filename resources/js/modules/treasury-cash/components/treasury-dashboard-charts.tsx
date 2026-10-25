import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(
    BarElement,
    CategoryScale,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
);

interface TreasuryDashboardChartsProps {
    dailyActivity: {
        date: string;
        label: string;
        teller_cash: number;
        bank: number;
    }[];
    cashLocationBalances: {
        type: string;
        locations: number;
        balance: number;
    }[];
}

const currency = (amount: number) => `BDT ${formatBDTCurrency(amount, false)}`;

export default function TreasuryDashboardCharts({
    dailyActivity,
    cashLocationBalances,
}: TreasuryDashboardChartsProps) {
    const hasDailyActivity = dailyActivity.some(
        (day) => day.teller_cash > 0 || day.bank > 0,
    );
    return (
        <div className="grid gap-4 xl:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Posted treasury activity
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Teller cash and bank transactions over the last seven
                        days
                    </p>
                </CardHeader>
                <CardContent>
                    {hasDailyActivity ? (
                        <div className="h-64">
                            <Line
                                data={{
                                    labels: dailyActivity.map(
                                        (day) => day.label,
                                    ),
                                    datasets: [
                                        {
                                            label: 'Teller cash',
                                            data: dailyActivity.map(
                                                (day) => day.teller_cash,
                                            ),
                                            borderColor: '#0f766e',
                                            backgroundColor:
                                                'rgba(15, 118, 110, 0.12)',
                                            tension: 0.3,
                                            fill: true,
                                        },
                                        {
                                            label: 'Bank',
                                            data: dailyActivity.map(
                                                (day) => day.bank,
                                            ),
                                            borderColor: '#2563eb',
                                            backgroundColor:
                                                'rgba(37, 99, 235, 0.10)',
                                            tension: 0.3,
                                            fill: true,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        tooltip: {
                                            callbacks: {
                                                label: (context) =>
                                                    `${context.dataset.label}: ${currency(Number(context.raw))}`,
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
                            No posted teller or bank activity in the last seven
                            days.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Cash balances by location
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Current linked financial-account balances
                    </p>
                </CardHeader>
                <CardContent>
                    {cashLocationBalances.length > 0 ? (
                        <div className="h-64">
                            <Bar
                                data={{
                                    labels: cashLocationBalances.map(
                                        ({ type }) =>
                                            type
                                                .replaceAll('_', ' ')
                                                .toLowerCase(),
                                    ),
                                    datasets: [
                                        {
                                            label: 'Balance',
                                            data: cashLocationBalances.map(
                                                ({ balance }) => balance,
                                            ),
                                            backgroundColor: [
                                                '#0f766e',
                                                '#2563eb',
                                                '#d97706',
                                            ],
                                            borderRadius: 4,
                                        },
                                    ],
                                }}
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
                            No teller, vault, or petty-cash locations are
                            configured.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
