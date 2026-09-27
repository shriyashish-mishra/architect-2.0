import Link from "next/link";
import { Logo } from "@/components/logo";
import { Card } from "@/components/ui/card";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="bp-grid flex flex-1 flex-col items-center justify-center px-5 py-16">
      <Link href="/" className="mb-8">
        <Logo />
      </Link>
      <Card className="w-full max-w-sm p-7">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </Card>
      <p className="mt-6 text-sm text-text-muted">{footer}</p>
    </div>
  );
}
