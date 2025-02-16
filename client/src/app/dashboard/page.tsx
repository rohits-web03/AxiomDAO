"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import type { Dao } from "@/types";

const Dashboard = () => {
    const { address } = useAccount();
    const [daos, setDaos] = useState<Dao[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchDaos = async () => {
            if (!address) return;

            try {
                const res = await fetch(`/api/user-daos?publicKey=${address}`);
                const data = await res.json();
                if (res.ok) {
                    setDaos(data.daos);
                } else {
                    console.error("Error fetching DAOs:", data.error);
                }
            } catch (error) {
                console.error("Failed to fetch DAOs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDaos();
    }, [address]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Your DAOs</h1>
            </div>

            {loading ? (
                <p>Loading DAOs...</p>
            ) : daos.length === 0 ? (
                <p className="text-gray-500">No DAOs found. Create one now!</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {daos.map((dao) => (
                            <button onClick={() => router.push(`/dashboard/dao/${dao.id}`)} key={dao.id} className="border flex flex-col items-start rounded-lg p-4 shadow-md bg-white dark:bg-gray-800">
                                <h2 className="text-lg font-semibold">{dao.daoname}</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Token: {dao.tokenname} ({dao.tokensymbol})
                                </p>
                                <p className="text-xs text-gray-500 truncate">Contract: {dao.contractAddress}</p>
                            </button>
                        ))}
                    </div>
                </>
            )}
            <div className="mt-6 flex justify-center">
                <Button asChild>
                    <Link href="/dashboard/create-dao">
                        <Plus className="mr-2" /> Add DAO
                    </Link>
                </Button>
            </div>
        </div>

    );
};

export default Dashboard;
