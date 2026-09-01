import { db } from "@/lib/prisma"

export interface ProjectSummary {
  id: string
  name: string
  description: string | null
  status: "DRAFT" | "ARCHIVED"
  createdAt: string
  isShared: boolean
}

export async function getProjectsForUser(userId: string, emails?: string | string[]) {
  const emailList = Array.isArray(emails)
    ? emails
    : typeof emails === "string"
      ? [emails]
      : []

  const normalizedEmails = new Set(
    emailList
      .map((email) => email?.trim().toLowerCase())
      .filter((email): email is string => Boolean(email))
  )

  try {
    const [ownedProjects, sharedProjects] = await Promise.all([
      db.project.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: "desc" },
      }),
      normalizedEmails.size
        ? db.project.findMany({
            where: {
              collaborators: {
                some: {
                  collaboratorEmail: { in: [...normalizedEmails] },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
    ])

    return {
      ownedProjects: ownedProjects.map((project) => serializeProject(project, false)),
      sharedProjects: sharedProjects.map((project) => serializeProject(project, true)),
    }
  } catch (error) {
    console.error("Failed to load projects for user", {
      userId,
      normalizedEmails: Array.from(new Set(emailList.map((email) => email?.trim().toLowerCase()).filter(Boolean))),
      error,
    })

    return {
      ownedProjects: [],
      sharedProjects: [],
    }
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