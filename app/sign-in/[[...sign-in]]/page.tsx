import { SignIn } from "@clerk/nextjs"

const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up"

export default function SignInPage() {
  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[minmax(0,0.85fr)_minmax(26rem,1fr)]">
      <section className="hidden border-r px-10 py-8 lg:flex lg:flex-col lg:justify-between">
        <div className="text-sm font-medium">Ghost AI</div>
        <div className="max-w-sm space-y-8">
          <div className="space-y-3">
            <p className="text-2xl font-semibold tracking-normal">
              Focused creative sessions, ready when you are.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Sign in to continue into your editor workspace and keep project
              tools close at hand.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>Protected editor access</li>
            <li>Built-in account settings</li>
            <li>Secure session handling</li>
          </ul>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10">
        <SignIn signUpUrl={signUpUrl} />
      </section>
    </main>
  )
}
