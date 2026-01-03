import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Gym and Grub</h1>
          <p className="text-muted-foreground">Welcome back!</p>
        </div>
        <LoginForm />
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link href="/signup">
            <Button variant="link" className="p-0 h-auto">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

