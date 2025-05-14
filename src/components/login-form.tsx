  'use client';

  import { CircleUserRound, AlertCircle, LogIn } from 'lucide-react';
  import { Input } from '@/components/ui/input';
  import { Button } from '@/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import { useActionState } from 'react';
  import { authenticate } from '@/api/actions';
  import { useSearchParams } from 'next/navigation';

  export default function LoginForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [errorMessage, formAction, isPending] = useActionState(
      authenticate,
      undefined,
    );

    return (
      <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-gray-800">
            Welcome Back!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div
                className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-md"
                role="alert"
              >
                <AlertCircle className="h-4 w-4" />
                <p className="text-xs">{errorMessage}</p>
              </div>
            )}

            {/* Username Input */}
            <div className="relative">
              <Input
                id="username"
                type="text"
                name="username"
                placeholder="Enter your username"
                required
                className="pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-primary"
              />
              <CircleUserRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 peer-focus:text-primary" />
            </div>

            {/* Hidden Redirect Input */}
            <input type="hidden" name="redirectTo" value={callbackUrl} />

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 transition-colors"
              disabled={isPending}
              aria-disabled={isPending}
            >
              {isPending ? (
                <span className="animate-pulse">Logging in...</span>
              ) : (
                <>
                  Log In <LogIn className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }