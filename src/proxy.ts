import { type NextRequest, NextResponse } from "next/server";

// Contrôle optimiste uniquement (présence du cookie) : la vérification
// réelle de session et de rôle se fait côté serveur dans src/lib/auth.ts.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("vg_session");

  if (!hasSession) {
    const loginUrl = new URL("/connexion", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/compte/:path*",
    "/commander/:path*",
    "/employe/:path*",
    "/admin/:path*",
  ],
};
