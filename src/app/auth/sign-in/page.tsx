import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { SignInForm } from "./sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to keep building where you left off."
      footer={
        <>
          New here?{" "}
          <Link href="/auth/sign-up" className="text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <SignInForm next={next ?? "/app"} />
    </AuthCard>
  );
}
