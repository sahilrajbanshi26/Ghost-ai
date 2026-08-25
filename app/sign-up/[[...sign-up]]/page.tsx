import { SignUp } from "@clerk/nextjs"

const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in"

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[minmax(0,0.85fr)_minmax(26rem,1fr)]">
      <section className="hidden border-r px-10 py-8 lg:flex lg:flex-col lg:justify-between">
        <div className="text-sm font-medium">Ghost AI</div>
        <div className="max-w-sm space-y-8">
          <div className="space-y-3">
            <p className="text-2xl font-semibold tracking-normal">
              Create a secure workspace for your next draft.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Start with an account, then move straight into the editor shell.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>Private project workspace</li>
            <li>Fast return sessions</li>
            <li>Profile and logout handled by Clerk</li>
          </ul>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10">
        <SignUp signInUrl={signInUrl} />
      </section>
    </main>
  )
}
