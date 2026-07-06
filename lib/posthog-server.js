import { PostHog } from 'posthog-node'

export function isPostHogConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
      process.env.NEXT_PUBLIC_POSTHOG_HOST
  )
}

export function getPostHogClient() {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  })
}

export async function captureServerEvent({ distinctId, event, properties }) {
  if (!isPostHogConfigured()) return

  const posthog = getPostHogClient()
  try {
    posthog.capture({ distinctId, event, properties })
    await posthog.shutdown()
  } catch (error) {
    console.error(`PostHog capture failed for ${event}:`, error)
  }
}
