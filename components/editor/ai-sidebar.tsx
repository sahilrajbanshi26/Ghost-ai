"use client"

import { useUser } from "@clerk/nextjs"
import { useCreateFeed, useCreateFeedMessage, useFeedMessages } from "@liveblocks/react"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import { useEffect, useRef, useState } from "react"
import { Bot, Download, FileText, Loader2, SendHorizonal, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { getAiChatMessages, getLatestAiStatusMessage } from "@/types/tasks"

const starterPrompts = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

export function AISidebar({
  isOpen,
  onClose,
  projectId,
  roomId,
}: {
  isOpen: boolean
  onClose: () => void
  projectId?: string
  roomId?: string
}) {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState("architect")
  const [draft, setDraft] = useState("")
  const [sendError, setSendError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [activeRunId, setActiveRunId] = useState<string | null>(null)
  const [publicToken, setPublicToken] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const handledRunIdsRef = useRef<Set<string>>(new Set())
  const createFeed = useCreateFeed()
  const createFeedMessage = useCreateFeedMessage()
  const { messages: aiStatusMessages, isLoading: isFeedLoading } = useFeedMessages("ai-status-feed", {
    limit: 20,
  })
  const { messages: aiChatMessages } = useFeedMessages("ai-chat", {
    limit: 50,
  })
  const chatMessages = getAiChatMessages(aiChatMessages)
  const latestAiStatus = getLatestAiStatusMessage(aiStatusMessages)
  const { run, error: runError } = useRealtimeRun(activeRunId ?? undefined, {
    accessToken: publicToken ?? undefined,
    enabled: Boolean(activeRunId && publicToken),
    skipColumns: ["payload", "output"],
  })
  const isAiActive = Boolean(latestAiStatus && (latestAiStatus.phase === "start" || latestAiStatus.phase === "processing"))
  const runStatusesInFlight = new Set([
    "WAITING_FOR_DEPLOY",
    "QUEUED",
    "EXECUTING",
    "REATTEMPTING",
    "FROZEN",
    "DELAYED",
    "INTERRUPTED",
  ])
  const isRunActive = Boolean(activeRunId) && (!run || runStatusesInFlight.has(run.status))
  const terminalStatuses = new Set(["COMPLETED", "FAILED", "CANCELED", "CRASHED", "EXPIRED", "TIMED_OUT", "SYSTEM_FAILURE"])
  const statusText = latestAiStatus?.text ?? latestAiStatus?.message ?? (isFeedLoading ? "Syncing AI status..." : isRunActive ? "AI is generating your design..." : runError ? "Unable to sync the active AI run." : "Waiting for the next AI update")

  useEffect(() => {
    void createFeed("ai-chat", {
      metadata: {
        name: "AI Chat",
        type: "ai-chat",
      },
    }).catch(() => undefined)
  }, [createFeed])

  useEffect(() => {
    if (!activeRunId || !run || !terminalStatuses.has(run.status) || handledRunIdsRef.current.has(activeRunId)) {
      return
    }

    handledRunIdsRef.current.add(activeRunId)

    const output = (run.output ?? {}) as { summary?: string; error?: string; ok?: boolean }
    const finalContent =
      run.status === "COMPLETED"
        ? output.summary || "The design update is complete and the canvas has been refreshed."
        : output.error || "The AI design run ended with an error."

    void createFeedMessage("ai-chat", {
      type: "ai-chat",
      sender: "Ghost AI",
      role: "assistant",
      content: finalContent,
      timestamp: new Date().toISOString(),
    })
      .catch(() => undefined)
      .finally(() => {
        setActiveRunId(null)
        setPublicToken(null)
        setIsSending(false)
      })
  }, [activeRunId, createFeedMessage, run])

  function resizeTextarea() {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 72), 160)}px`
  }

  async function handleSubmit(nextValue?: string) {
    const trimmed = (nextValue ?? draft).trim()
    if (!trimmed || isAiActive || isRunActive || isSending || !projectId || !roomId) return

    setIsSending(true)
    setSendError(null)

    const displayName = user?.fullName || user?.firstName || "You"
    const payload = {
      type: "ai-chat",
      sender: displayName,
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    }

    try {
      await createFeedMessage("ai-chat", payload)
      setDraft("")
      requestAnimationFrame(() => {
        const textarea = textareaRef.current
        if (!textarea) return
        textarea.style.height = "72px"
      })

      const response = await fetch("/api/ai/design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmed,
          roomId,
          projectId,
        }),
      })

      const data = (await response.json().catch(() => ({}))) as { runId?: string; publicToken?: string; error?: string }
      if (!response.ok || !data.runId || !data.publicToken) {
        throw new Error(data.error || "Could not start the AI design task.")
      }

      handledRunIdsRef.current.delete(data.runId)
      setActiveRunId(data.runId)
      setPublicToken(data.publicToken)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Message could not be sent. Please try again."
      setSendError(message)
    } finally {
      setIsSending(false)
    }
  }

  function handleTextareaKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <aside
      aria-hidden={!isOpen}
      className={[
        "fixed bottom-4 right-4 top-[4.5rem] z-30 hidden w-[320px] flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur transition-all duration-300 ease-out lg:flex",
        isOpen ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-8 opacity-0",
      ].join(" ")}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">AI Workspace</h2>
            <p className="text-[11px] text-muted-foreground">Collaborate with Ghost AI</p>
          </div>
        </div>
        <button
          aria-label="Close AI sidebar"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          type="button"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Tabs className="flex h-[calc(100%-72px)] flex-col" value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b border-border px-3 py-2">
          <TabsList className="grid w-full grid-cols-2 bg-transparent p-0">
            <TabsTrigger
              className="rounded-full px-3 py-2 text-sm text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              value="architect"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              className="rounded-full px-3 py-2 text-sm text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              value="specs"
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="mt-0 flex flex-1 flex-col" value="architect">
          <div className="border-b border-border px-3 py-2">
            <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-2.5 py-2">
              <div className="flex items-center gap-2">
                <div className={[
                  "flex h-2.5 w-2.5 rounded-full",
                  isAiActive ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.85)]" : "bg-emerald-400",
                ].join(" ")} />
                <span className="text-[11px] font-medium text-foreground">
                  {isAiActive ? "AI is working" : "AI ready"}
                </span>
              </div>
              {isAiActive && <Loader2 aria-label="AI is generating" className="h-3.5 w-3.5 animate-spin text-amber-400" />}
            </div>
            {statusText && (
              <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{statusText}</p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {chatMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/40 p-6 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-medium text-foreground">Design your next architecture</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Start with a workflow, system idea, product requirement, or delivery goal.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      className="rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs text-foreground/90 transition-colors hover:bg-accent/10"
                      type="button"
                      onClick={() => handleSubmit(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {chatMessages.map((message, index) => (
                  <div
                    key={`${message.timestamp ?? index}-${message.sender ?? "user"}`}
                    className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
                  >
                    <div className={[
                      "max-w-[84%] rounded-2xl border px-3 py-2 text-sm leading-6",
                      message.role === "user"
                        ? "border-brand/50 bg-accent/15 text-foreground"
                        : "border-border bg-background/60 text-foreground",
                    ].join(" ")}>
                      <div className="mb-1 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        <span>{message.sender ?? "Guest"}</span>
                        <span>{message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Now"}</span>
                      </div>
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
                  type="button"
                  onClick={() => handleSubmit(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2 rounded-xl border border-border bg-background/50 p-2">
              <Textarea
                ref={textareaRef}
                className="min-h-[72px] max-h-[160px] resize-none border-0 bg-transparent p-0 shadow-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isAiActive || isRunActive || isSending}
                placeholder={isAiActive || isRunActive ? "AI is working on your prompt..." : "Describe your architecture..."}
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value)
                  resizeTextarea()
                }}
                onInput={resizeTextarea}
                onKeyDown={handleTextareaKeyDown}
              />
              <Button
                className="h-9 w-9 shrink-0 rounded-full bg-accent p-0 text-white hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isAiActive || isRunActive || isSending || !draft.trim()}
                type="button"
                onClick={() => handleSubmit()}
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
              </Button>
            </div>
            {sendError && (
              <p className="mt-2 text-[11px] text-rose-300">{sendError}</p>
            )}
          </div>
        </TabsContent>

        <TabsContent className="mt-0 flex flex-1 flex-col p-4" value="specs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Specification</p>
              <h3 className="mt-1 text-base font-semibold text-foreground">Workspace brief</h3>
            </div>
            <Button className="h-9 bg-accent text-white hover:bg-accent/90" type="button">
              Generate Spec
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-background/50 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent-foreground">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Product Architecture Spec</h4>
                  <p className="text-[11px] text-muted-foreground">ghost-ai-architecture.md</p>
                </div>
              </div>
              <button
                aria-label="Download spec"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-50"
                disabled
                title="Download disabled in this preview"
                type="button"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Overview of the live collaborative workspace, architecture flow, authentication model, and diagram generation pipeline.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  )
}
