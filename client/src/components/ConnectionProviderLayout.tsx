"use client";
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Button } from "@/components/ui/button";
import { ModeToggle } from './theme-toggle';
import { useRouter, usePathname } from "next/navigation";
import { type ReactNode, useEffect } from 'react';

export default function ConnectionProviderLayout({ children }: { children: ReactNode }) {
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();
    const { address } = useAccount();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (pathname !== '/' && !address) {
            router.push('/');
        }
    }, [address, router]);

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
