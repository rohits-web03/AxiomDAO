"use client";
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Button } from "@/components/ui/button";
import { type ReactNode } from 'react'
import { ModeToggle } from './theme-toggle';

export default function ConnectionProviderLayout({ children }: { children: ReactNode }) {
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();
    const { address } = useAccount();

    return (
        <div>
            <div className="absolute top-4 right-6 flex items-center space-x-4">
                {address ? (
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-mono bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-md">
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </span>
                        <Button onClick={() => disconnect()} variant="destructive">
                            Disconnect
                        </Button>
                    </div>
                ) : (
                    <Button onClick={() => connect({ connector: injected() })}>
                        Connect Wallet
                    </Button>
                )}
                <ModeToggle />
            </div>
            {children}
        </div>
    );
}
