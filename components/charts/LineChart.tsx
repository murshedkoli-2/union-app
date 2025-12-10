'use client';

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartProps {
    data: Array<{ name: string; value: number }>;
}

export default function LineChart({ data }: LineChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                    dataKey="name"
                    stroke="var(--color-text-tertiary)"
                    style={{ fontSize: '12px' }}
                />
                <YAxis
                    stroke="var(--color-text-tertiary)"
                    style={{ fontSize: '12px' }}
                />
                <Tooltip
                    contentStyle={{
                        background: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        color: 'var(--color-text-primary)',
                        boxShadow: 'var(--shadow-lg)'
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="url(#colorGradient)"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', r: 4 }}
                    activeDot={{ r: 6 }}
                />
                <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                </defs>
            </RechartsLineChart>
        </ResponsiveContainer>
    );
}
