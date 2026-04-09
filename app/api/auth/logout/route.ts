import { NextResponse } from 'next/server';
import { clearAuthSession } from '@/lib/server/auth/session';

export async function POST() {
    return clearAuthSession(NextResponse.json({ success: true }));
}
