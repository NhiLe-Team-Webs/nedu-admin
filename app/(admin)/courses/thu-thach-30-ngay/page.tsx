'use client';

import { redirect } from 'next/navigation';

export default function ThirtyDayChallengePage() {
    // Redirect to information tab by default
    redirect('/courses/thu-thach-30-ngay/information');
}
