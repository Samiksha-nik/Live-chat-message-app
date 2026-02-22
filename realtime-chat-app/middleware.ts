import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Signed-in users on auth pages → redirect to chat (don't redirect Clerk internal routes)
  const path = req.nextUrl.pathname;
  const isAuthPage = (path === "/sign-in" || path === "/sign-up" || path.startsWith("/sign-in/") || path.startsWith("/sign-up/")) && !path.includes("_clerk_");
  if (userId && isAuthPage) {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  // Unauthenticated users on protected routes → redirect to sign-in
  if (!userId && !isPublicRoute(req)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|ico|svg|woff2?|ttf|eot)).*)",
    "/(api|trpc)(.*)",
  ],
};
