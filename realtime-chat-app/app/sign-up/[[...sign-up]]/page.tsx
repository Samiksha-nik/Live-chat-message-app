import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) redirect("/chat");
  return (
    <AuthShell
      title="Create your ConvoFlow workspace"
      subtitle="Sign up to start collaborating with your team in realtime."
    >
      <SignUp
        afterSignUpUrl="/chat"
        signInUrl="/sign-in"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none border-0 bg-transparent p-0",
            headerTitle: "text-base font-semibold tracking-tight",
            headerSubtitle: "text-xs text-muted-foreground",
            formFieldLabel: "text-xs text-muted-foreground",
            formFieldInput:
              "h-9 rounded-lg border-border/80 bg-background/80 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
            footer: "hidden",
            formButtonPrimary:
              "mt-2 h-9 rounded-lg bg-primary text-xs font-medium tracking-tight text-primary-foreground shadow-soft transition-colors hover:bg-primary/90",
          },
        }}
      />
    </AuthShell>
  );
}

