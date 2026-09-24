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

interface DashboardMetricChartsProps {
    metrics: Record<string, number>;
}

const chartColors = [
    '#0f766e',
    '#2563eb',
    '#d97706',
    '#dc2626',
    '#7c3aed',
    '#0891b2',
    '#65a30d',
];

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
    },
    scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
    },
};

export default function DashboardMetricCharts({
    metrics,
}: DashboardMetricChartsProps) {
    const entries = Object.entries(metrics);
    const labels = entries.map(([label]) => label);
    const values = entries.map(([, value]) => value);
    const colors = values.map(
        (_, index) => chartColors[index % chartColors.length],
    );

    const data = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    return (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Activity overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <Bar data={data} options={chartOptions} />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Metric distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <Doughnut
                            data={data}
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
                </CardContent>
            </Card>
        </div>
    );
}
