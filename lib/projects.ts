import { db } from "@/lib/prisma"

export interface ProjectSummary {
  id: string
  name: string
  description: string | null
  status: "DRAFT" | "ARCHIVED"
  createdAt: string
  isShared: boolean
}

export async function getProjectsForUser(userId: string, email?: string) {
  const [ownedProjects, sharedProjects] = await Promise.all([
    db.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    }),
    email
      ? db.project.findMany({
          where: {
            collaborators: { some: { collaboratorEmail: email } },
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ])

  return {
    ownedProjects: ownedProjects.map((project) => serializeProject(project, false)),
    sharedProjects: sharedProjects.map((project) => serializeProject(project, true)),
  }
}

function serializeProject(
  project: {
    id: string
    name: string
    description: string | null
    status: "DRAFT" | "ARCHIVED"
    createdAt: Date
  },
  isShared: boolean
): ProjectSummary {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt.toISOString(),
    isShared,
  }
}