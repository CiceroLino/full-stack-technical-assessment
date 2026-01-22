import { betterAuth } from "better-auth";
import { NextResponse, type NextRequest } from "next/server";

const authPaths = ["/sign-in", "/sign-up"];
const protectedPaths = ["/dashboard", "/tasks"];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if path is protected
  const isProtected = protectedPaths.some(p => path.startsWith(p));
  const isAuth = authPaths.some(p => path.startsWith(p));

  // Get session from cookies
  const sessionToken = request.cookies.get("better-auth.session_token");
  const hasSession = !!sessionToken;

  // Redirect logic
  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isAuth && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
