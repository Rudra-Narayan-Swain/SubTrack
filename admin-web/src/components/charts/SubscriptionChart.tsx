import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
    data: Record<string, number>;
}

const COLORS = ['#5b5fff', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
        return (
            <div className="glass-card px-3 py-2 text-sm">
                <p className="text-white font-medium">{payload[0].name}</p>
                <p className="text-white/60">{payload[0].value} subscriptions</p>
            </div>
        );
    }
    return null;
};

export const SubscriptionChart = ({ data }: Props) => {
    const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-[220px] text-white/30 text-sm">
                No subscription data yet
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={220}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                >
                    {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    formatter={(value) => (
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, textTransform: 'capitalize' }}>
                            {value}
                        </span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};
