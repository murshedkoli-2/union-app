'use client';

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartProps {
    data: Array<{ name: string; value: number }>;
}

export default function LineChart({ data }: LineChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                    dataKey="name"
                    stroke="var(--muted-foreground)"
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="var(--muted-foreground)"
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--foreground)',
                        boxShadow: '0 10px 28px -18px rgba(0, 0, 0, 0.45)'
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="url(#colorGradient)"
                    strokeWidth={2.5}
                    dot={{ fill: 'var(--primary)', r: 4 }}
                    activeDot={{ r: 6 }}
                />
                <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--accent)" />
                    </linearGradient>
                </defs>
            </RechartsLineChart>
        </ResponsiveContainer>
    );
}
