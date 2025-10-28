import { redirect } from 'next/navigation';

export default function Page() {
    // Redirect root to the dashboard as requested
    redirect('/login');
    return null;
}
