'use client';

import { useState, useEffect, Suspense } from 'react'; // Suspense might not be needed here but in the parent
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Loader2, LogIn } from 'lucide-react';
import Image from 'next/image';

// This component contains the actual form and logic
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // This hook makes the component dynamic
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const callbackError = searchParams?.get('error');
    if (callbackError) {
      if (callbackError === "CredentialsSignin") {
        setError("Invalid email or password. Please try again.");
      } else if (callbackError === "AccessDenied") {
        setError("Access Denied. You might not have permission to view this page.");
      } else {
        setError("An unknown error occurred during login. Please try again.");
      }
      // Consider clearing the error from URL to prevent it from showing on refresh
      // router.replace('/login', undefined, { shallow: true });
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: callbackUrl,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
            setError("Invalid email or password. Please try again.");
        } else {
            setError(result.error);
        }
        toast({
          variant: "destructive",
          title: "Login Failed",
          // Use the error state which has a friendlier message
          description: error || "Please check your credentials.",
        });
      } else if (result?.ok && result?.url) {
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push(callbackUrl);
      } else {
         setError("An unexpected issue occurred during login. Please try again.");
         toast({ variant: "destructive", title: "Login Failed", description: "Unexpected issue." });
      }
    } catch (err: any) {
      console.error("Login submit error:", err);
      setError(err.message || "An unexpected server error occurred.");
      toast({
        variant: "destructive",
        title: "Login Error",
        description: err.message || "An unexpected server error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-2xl">
      <CardHeader className="text-center">
        <Image
          src="https://placehold.co/150x50.png?text=ExperTed"
          alt="ExperTed Logo"
          width={150}
          height={50}
          className="mx-auto mb-4"
          data-ai-hint="logo brand"
        />
        <CardTitle className="text-2xl">Welcome Back!</CardTitle>
        <CardDescription>Sign in to continue to ExperTed</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-center text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <LogIn className="mr-2" />}
            Sign In
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
