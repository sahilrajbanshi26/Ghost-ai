import { currentUser } from "@clerk/nextjs/server"

import { EditorShell } from "@/components/editor/editor-shell"
import { getProjectsForUser } from "@/lib/projects"

export default async function EditorPage() {
  const user = await currentUser()
  if (!user) return null

  const { ownedProjects, sharedProjects } = await getProjectsForUser(
    user.id,
    user.primaryEmailAddress?.emailAddress
  )

  return <EditorShell ownedProjects={ownedProjects} sharedProjects={sharedProjects} />
}
