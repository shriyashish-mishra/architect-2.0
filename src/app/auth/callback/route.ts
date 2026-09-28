import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Landing point for OAuth (GitHub) sign-in: Supabase redirects here with a
// `code` after the provider round-trip, and we exchange it for a session.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      // Supabase only ever hands back the GitHub provider token here, right
      // after the OAuth round-trip — it isn't retrievable from the session
      // on later requests, so capture it now (httpOnly cookie) for the real
      // "Import repo" list to call the GitHub API with.
      if (data.session?.provider_token) {
        response.cookies.set("gh_token", data.session.provider_token, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
      }
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/auth/sign-in?error=oauth_failed`);
}
