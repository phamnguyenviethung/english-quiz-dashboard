import type { QuizTypeDiff } from "../types.ts"

export function diffQuizTypes(remote: string[], local: string[]): QuizTypeDiff {
  const remoteSet = new Set(remote)
  const localSet = new Set(local)

  const missingLocally = remote.filter((entry) => !localSet.has(entry))
  const missingRemotely = local.filter((entry) => !remoteSet.has(entry))

  return {
    inSync: missingLocally.length === 0 && missingRemotely.length === 0,
    missingLocally,
    missingRemotely,
  }
}
