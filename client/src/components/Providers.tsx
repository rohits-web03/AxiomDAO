'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { type State, WagmiProvider } from 'wagmi'
import { config } from '../config'

type Props = {
    children: ReactNode,
    initialState: State | undefined,
}

export default function Providers({ children, initialState }: Props) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <WagmiProvider config={config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}