'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
    data: Array<{ name: string; value: number }>;
}

export default function BarChart({ data }: BarChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={data}>
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
                <Bar
                    dataKey="value"
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                />
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--accent)" />
                    </linearGradient>
                </defs>
            </RechartsBarChart>
        </ResponsiveContainer>
    );
}
