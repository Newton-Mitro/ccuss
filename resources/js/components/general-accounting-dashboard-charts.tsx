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
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    Legend,
    LinearScale,
    Tooltip,
);

interface GeneralAccountingDashboardChartsProps {
    dailyVoucherActivity: { date: string; label: string; posted: number }[];
    voucherStatusBreakdown: { status: string; count: number }[];
}

const colors = ['#d97706', '#0f766e', '#7c3aed', '#64748b'];

export default function GeneralAccountingDashboardCharts({
    dailyVoucherActivity,
    voucherStatusBreakdown,
}: GeneralAccountingDashboardChartsProps) {
    const hasPostedActivity = dailyVoucherActivity.some(
        (day) => day.posted > 0,
    );
    const hasVouchers = voucherStatusBreakdown.some(
        (status) => status.count > 0,
    );

    return (
        <div className="grid gap-4 xl:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Posted vouchers by day
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Posted voucher count over the last seven days
                    </p>
                </CardHeader>
                <CardContent>
                    {hasPostedActivity ? (
                        <div className="h-64">
                            <Bar
                                data={{
                                    labels: dailyVoucherActivity.map(
                                        (day) => day.label,
                                    ),
                                    datasets: [
                                        {
                                            label: 'Posted vouchers',
                                            data: dailyVoucherActivity.map(
                                                (day) => day.posted,
                                            ),
                                            backgroundColor:
                                                'rgba(15, 118, 110, 0.72)',
                                            borderColor: '#0f766e',
                                            borderWidth: 1,
                                            borderRadius: 4,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: { precision: 0 },
                                        },
                                    },
                                }}
                            />
                        </div>
                    ) : (
                        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                            No vouchers were posted in the last seven days.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Voucher status</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Distribution of vouchers in this organization
                    </p>
                </CardHeader>
                <CardContent>
                    {hasVouchers ? (
                        <div className="h-64">
                            <Doughnut
                                data={{
                                    labels: voucherStatusBreakdown.map(
                                        ({ status }) => status,
                                    ),
                                    datasets: [
                                        {
                                            data: voucherStatusBreakdown.map(
                                                ({ count }) => count,
                                            ),
                                            backgroundColor: colors,
                                            borderWidth: 0,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'bottom',
                                        },
                                    },
                                }}
                            />
                        </div>
                    ) : (
                        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                            No vouchers have been created yet.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
