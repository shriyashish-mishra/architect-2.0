import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-text-muted">Account, model providers, and integrations.</p>
      <SettingsForm email={user.email ?? "Guest"} isAnonymous={user.is_anonymous ?? false} />
    </div>
  );
}
