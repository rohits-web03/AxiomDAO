"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Dao } from "@/types";

const DaoPage = () => {
    const { id } = useParams();
    const [dao, setDao] = useState<Dao>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDao = async () => {
            try {
                const res = await fetch(`/api/dao/${id}`);
                const data = await res.json();
                console.log(data)
                if (res.ok) {
                    setDao(data);
                } else {
                    console.error("Error fetching DAO:", data.error);
                }
            } catch (error) {
                console.error("Failed to fetch DAO:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDao();
    }, [id]);

    if (loading) return <p>Loading DAO details...</p>;

    return (
        <div className="p-6">
            {dao ? (
                <>
                    <h1 className="text-2xl font-bold">{dao.daoname}</h1>
                    <p>Token: {dao.tokenname} ({dao.tokensymbol})</p>
                    <p>Contract Address: {dao.contractAddress}</p>
                    {/* Add more DAO details here */}
                </>
            ) : (
                <p>DAO not found.</p>
            )}
        </div>
    );
};

export default DaoPage;
