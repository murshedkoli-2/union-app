'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
    data: Array<{ name: string; value: number }>;
}

export default function BarChart({ data }: BarChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={data}>
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
                <Bar
                    dataKey="value"
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                />
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                </defs>
            </RechartsBarChart>
        </ResponsiveContainer>
    );
}
