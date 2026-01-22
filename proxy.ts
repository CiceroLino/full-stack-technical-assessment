import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/server/auth";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const authPaths = ["/sign-in", "/sign-up"];
  const protectedPaths = ["/dashboard"];

  const isProtected = protectedPaths.some(p => path.startsWith(p));
  const isAuth = authPaths.some(p => path.startsWith(p));

  if (isProtected) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  if (isAuth) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (session?.user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      throw error;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
