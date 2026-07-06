// app/providers.jsx
'use client'

import {NextUIProvider} from '@nextui-org/react'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

function PostHogInit({ children }) {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
    if (!token) return

    posthog.init(token, {
      api_host: '/ingest',
      ui_host: 'https://us.posthog.com',
      defaults: '2026-05-30',
      capture_exceptions: true,
    })
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}

export function Providers({children}) {
  return (
    <NextUIProvider>
      <PostHogInit>
        {children}
      </PostHogInit>
    </NextUIProvider>
  )
}