import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface Props {
    data: { month: string; revenue: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="glass-card px-3 py-2 text-sm">
                <p className="text-white/60 mb-1">{label}</p>
                <p className="text-brand-400 font-semibold">${payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

export const RevenueChart = ({ data }: Props) => {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5b5fff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#5b5fff" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                    dataKey="month"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#5b5fff"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};
