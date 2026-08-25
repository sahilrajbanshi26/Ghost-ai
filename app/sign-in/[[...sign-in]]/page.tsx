import { SignIn } from "@clerk/nextjs"
import { BrainCircuit, FileText, Share2 } from "lucide-react"

const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up"

export default function SignInPage() {
  return (
    <main className="grid min-h-screen bg-background text-foreground md:grid-cols-2">
      <section className="hidden border-r border-border/80 bg-auth-panel px-10 py-8 md:flex md:flex-col md:justify-between">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="h-7 w-7 rounded-md bg-auth-accent" />
          <span>Ghost AI</span>
        </div>
        <div className="max-w-xl space-y-12">
          <div className="space-y-5">
            <p className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-normal">
              Design systems at the speed of thought.
            </p>
            <p className="max-w-lg text-lg leading-8 text-muted-foreground">
              Describe your architecture in plain English. Ghost AI maps it to
              a shared canvas your whole team can refine in real time.
            </p>
          </div>
          <ul className="space-y-7">
            <li className="flex items-center gap-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-auth-accent/10 text-auth-accent">
                <BrainCircuit className="h-6 w-6" />
              </span>
              <span className="space-y-1">
                <strong className="block text-base font-semibold text-foreground">
                  AI Architecture Generation
                </strong>
                <span className="block text-sm text-muted-foreground">
                  Describe your system, AI maps it to nodes and edges on a live canvas.
                </span>
              </span>
            </li>
            <li className="flex items-center gap-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-auth-accent/10 text-auth-accent">
                <Share2 className="h-6 w-6" />
              </span>
              <span className="space-y-1">
                <strong className="block text-base font-semibold text-foreground">
                  Real-time Collaboration
                </strong>
                <span className="block text-sm text-muted-foreground">
                  Live cursors, presence indicators, and shared node editing across your team.
                </span>
              </span>
            </li>
            <li className="flex items-center gap-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-auth-accent/10 text-auth-accent">
                <FileText className="h-6 w-6" />
              </span>
              <span className="space-y-1">
                <strong className="block text-base font-semibold text-foreground">
                  Instant Spec Generation
                </strong>
                <span className="block text-sm text-muted-foreground">
                  Export a complete Markdown technical spec directly from the canvas graph.
                </span>
              </span>
            </li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground/70">Ghost AI workspace</p>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
        <SignIn signUpUrl={signUpUrl} />
      </section>
    </main>
  )
}
