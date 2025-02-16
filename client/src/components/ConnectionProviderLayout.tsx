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
    const { address, isConnected } = useAccount();
    const router = useRouter();
    const pathname = usePathname();

    const handleConnect = async () => {
        console.log("Connecting wallet...");
        try {
            connect({ connector: injected() });
        } catch (error) {
            console.error("Error connecting wallet:", error);
        }
    };

    useEffect(() => {
        if (isConnected && address) {
            console.log("Wallet connected:", address);
            fetch("/api/create-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ publicKey: address }),
            }).catch((err) => console.error("Error storing user:", err));
        }
    }, [isConnected, address]);

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
                    <Button onClick={handleConnect}>
                        Connect Wallet
                    </Button>
                )}
                <ModeToggle />
            </div>
            {children}
        </div>
    );
}
