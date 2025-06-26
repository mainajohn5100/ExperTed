'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProtectedExamplePage() {
  const { session, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated and loading is finished, redirect to sign-in
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/protected-example');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading session...</p>;
  }

  if (status === 'unauthenticated') {
    // This might be shown briefly before redirect effect runs
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>You are not authenticated. Redirecting to sign in...</p>
        <Link href="/auth/signin?callbackUrl=/protected-example">Go to Sign In</Link>
      </div>
    );
  }

  // If authenticated
  return (
    <div style={{ padding: '20px' }}>
      <h1>Protected Page Example</h1>
      <p>Welcome, <strong>{session?.user?.name || session?.user?.email || 'User'}</strong>!</p>
      <p>This page is protected. You can only see this content if you are signed in.</p>
      <p>Your session status is: <strong>{status}</strong></p>
      {session?.user && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
          <h2>Session User Data:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(session.user, null, 2)}
          </pre>
        </div>
      )}
      <div style={{marginTop: '20px'}}>
        <Link href="/">Go to Home Page</Link>
      </div>
    </div>
  );
}
