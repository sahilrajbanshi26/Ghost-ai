"use client"

import { useRef, useState } from "react"
import { Bot, Download, FileText, SendHorizonal, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

type ChatMessage = {
  id: string
  sender: "user" | "assistant"
  text: string
}

const starterPrompts = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

export function AISidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("architect")
  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-message",
      sender: "assistant",
      text: "I can help shape the system architecture, spec details, and technical flow for this workspace.",
    },
  ])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function resizeTextarea() {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 72), 160)}px`
  }

  function handleSubmit(nextValue?: string) {
    const trimmed = (nextValue ?? draft).trim()
    if (!trimmed) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
    }

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      sender: "assistant",
      text: "I’ve captured that direction. I’ll turn it into a structured architecture plan and spec outline next.",
    }

    setMessages((current) => [...current, userMessage, assistantMessage])
    setDraft("")

    requestAnimationFrame(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      textarea.style.height = "72px"
    })
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
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
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
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={message.sender === "user" ? "flex justify-end" : "flex justify-start"}
                  >
                    <div
                      className={[
                        "max-w-[84%] rounded-2xl border px-3 py-2 text-sm leading-6",
                        message.sender === "user"
                          ? "border-brand/50 bg-accent/15 text-foreground"
                          : "border-border bg-background/60 text-foreground",
                      ].join(" ")}
                    >
                      {message.text}
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
                className="min-h-[72px] max-h-[160px] resize-none border-0 bg-transparent p-0 shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                placeholder="Describe your architecture..."
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value)
                  resizeTextarea()
                }}
                onInput={resizeTextarea}
                onKeyDown={handleTextareaKeyDown}
              />
              <Button
                className="h-9 w-9 shrink-0 rounded-full bg-accent p-0 text-white hover:bg-accent/90"
                type="button"
                onClick={() => handleSubmit()}
              >
                <SendHorizonal className="h-4 w-4" />
              </Button>
            </div>
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
