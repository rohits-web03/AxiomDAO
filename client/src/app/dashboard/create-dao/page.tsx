'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAccount } from 'wagmi';
import { getWalletClient, getPublicClient } from '@wagmi/core'
import { config } from '@/config';
import { ABI, byteCode } from "@/DAOContractInfo";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { CreateDAOSchema } from '@/schemas/index';
import { useState } from 'react';
import { Loader2 } from "lucide-react"

export default function CreateDAOForm() {
    const [deploying, setDeploying] = useState(false);
    const router = useRouter();
    const { address } = useAccount();
    const form = useForm<z.infer<typeof CreateDAOSchema>>({
        resolver: zodResolver(CreateDAOSchema),
        defaultValues: {
            daoname: '',
            tokenname: '',
            tokensymbol: ''
        },
    });

    const { toast } = useToast();
    const onSubmit = async (data: z.infer<typeof CreateDAOSchema>) => {
        const client = await getWalletClient(config);
        const publicClient = getPublicClient(config);

        if (!address) {
            console.log("Wallet not connected");
            toast({
                description: "Wallet not connected",
                variant: "destructive",
            });
            return;
        }

        try {
            setDeploying(true);

            // Deploy Contract
            const txHash = await client.deployContract({
                abi: ABI,
                account: address,
                args: [data.daoname, data.tokenname, data.tokensymbol],
                bytecode: byteCode,
            });

            console.log("Deployment Transaction Hash:", txHash);

            // Wait for transaction receipt
            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

            console.log("Contract deployed at:", receipt.contractAddress);

            toast({
                title: "Contract Deployed",
                description: `Contract Address: ${receipt.contractAddress}`,
            });

            const response = await fetch("/api/create-dao", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    daoname: data.daoname,
                    tokenname: data.tokenname,
                    tokensymbol: data.tokensymbol,
                    contractAddress: receipt.contractAddress,
                    address,
                    memberAddresses: [],
                }),
            });
            const result = await response.json();
            setDeploying(false);

            if (response.ok) {
                console.log("DAO stored in DB:", result);
                toast({
                    title: "DAO Created",
                    description: "Your DAO has been successfully created.",
                });

                router.push("/dashboard");
            } else {
                console.error("Failed to store DAO:", result.error);
                toast({
                    title: "Failed to Store DAO",
                    description: result.error,
                    variant: "destructive",
                });
            }
        } catch (error) {
            setDeploying(false);
            console.error("Deployment failed:", error);
            toast({
                title: "Deployment Failed",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-neutral-950">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-neutral-800 rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-gray-900 dark:text-gray-100">
                        Create Your DAO
                    </h1>
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                        Launch a decentralized community effortlessly
                    </p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="daoname"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-900 dark:text-gray-200">DAO Name</FormLabel>
                                    <Input {...field} className="bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-gray-100" />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="tokenname"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-900 dark:text-gray-200">Token Name</FormLabel>
                                    <Input {...field} className="bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-gray-100" />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="tokensymbol"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-900 dark:text-gray-200">Token Symbol</FormLabel>
                                    <Input {...field} className="bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-gray-100" />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button disabled={deploying} className='w-full' type="submit">
                            {deploying && <Loader2 className="animate-spin" />}
                            {deploying ? 'Creating DAO' : 'Create DAO'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
