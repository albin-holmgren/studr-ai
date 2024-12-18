'use client'


import 'iframe-resizer/js/iframeResizer.contentWindow'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Doc as YDoc } from 'yjs'

import { createPortal } from 'react-dom'
import { useCollaboration } from '~/new-hooks/useCollaboration'
import { Surface } from '~/components/new-ui/Surface'
import { Toolbar } from '~/components/new-ui/Toolbar'
import { Icon } from '~/components/new-ui/Icon'
import { BlockEditor } from '~/components/BlockEditor'
import { redirect } from '@remix-run/react'
import { customAlphabet } from 'nanoid'
import { LoaderFunctionArgs } from '@remix-run/node'

const getNanoId = (): string => {
  const nanoid = customAlphabet("6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz", 10);
  return nanoid();
};

const useDarkmode = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => setIsDarkMode(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  const toggleDarkMode = useCallback(() => setIsDarkMode(isDark => !isDark), [])
  const lightMode = useCallback(() => setIsDarkMode(false), [])
  const darkMode = useCallback(() => setIsDarkMode(true), [])

  return {
    isDarkMode,
    toggleDarkMode,
    lightMode,
    darkMode,
  }
}

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   const response = new Response();

//   // Initialize Supabase
  
//   // Generate the dynamic path using getNanoId
//   const dynamicPath = `/${getNanoId()}`;

//   // Redirect to the dynamic path
//   return redirect(dynamicPath, {
//     headers: {
//       ...response.headers,
//       "Cache-Control": "no-store, max-age=0",
//     },
//   });
// };

export default function Document({ params }: { params: { room: string } }) {
  const { isDarkMode, darkMode, lightMode } = useDarkmode()
  const [aiToken, setAiToken] = useState<string | null | undefined>()
  const searchParams = useSearchParams()
  const providerState = useCollaboration({
    docId: params.room,
    enabled: parseInt(searchParams?.get('noCollab') as string) !== 1,
  })

  useEffect(() => {
    // fetch data
    const dataFetch = async () => {
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('No AI token provided, please set TIPTAP_AI_SECRET in your environment')
        }
        const data = await response.json()

        const { token } = data

        // set state when the data received
        setAiToken(token)
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message)
        }
        setAiToken(null)
        return
      }
    }

    dataFetch()
  }, [])

  if (providerState.state === 'loading' || aiToken === undefined) return

  const DarkModeSwitcher = createPortal(
    <Surface className="flex items-center gap-1 fixed bottom-6 right-6 z-[99999] p-1">
      <Toolbar.Button onClick={lightMode} active={!isDarkMode}>
        <Icon name="Sun" />
      </Toolbar.Button>
      <Toolbar.Button onClick={darkMode} active={isDarkMode}>
        <Icon name="Moon" />
      </Toolbar.Button>
    </Surface>,
    document.body,
  )

  return (
    <>
      {DarkModeSwitcher}
      <BlockEditor aiToken={aiToken ?? undefined} ydoc={providerState.yDoc} provider={providerState.provider} />
    </>
  )
}
