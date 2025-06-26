import { Suspense } from 'react';
import LoginForm from './login-form'; // Import the new client component

// This is the Server Component page
export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      {/* Wrap the client component that uses useSearchParams in Suspense */}
      <Suspense fallback={<LoadingLoginCard />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

// Optional: A simple loading skeleton for the card
function LoadingLoginCard() {
  return (
    <div className="w-full max-w-lg animate-pulse rounded-lg bg-card p-8 shadow-2xl">
      <div className="mx-auto mb-4 h-[50px] w-[150px] rounded bg-muted"></div>
      <div className="mb-2 h-8 w-3/4 rounded bg-muted text-center"></div>
      <div className="mb-6 h-5 w-1/2 rounded bg-muted text-center"></div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-1/4 rounded bg-muted"></div>
          <div className="h-10 w-full rounded bg-muted"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-1/4 rounded bg-muted"></div>
          <div className="h-10 w-full rounded bg-muted"></div>
        </div>
        <div className="h-10 w-full rounded bg-primary/50"></div>
      </div>
      <div className="mt-6 h-5 w-3/4 rounded bg-muted text-center"></div>
    </div>
  );
}
