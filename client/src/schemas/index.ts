import * as z from "zod";

export const CreateDAOSchema = z.object({
    daoname: z.string().min(1, {
        message: "DAO name is required",
    }),
    tokenname: z.string().min(1, {
        message: "Token name is required",
    }),
    tokensymbol: z.string().min(1, {
        message: "Token symbol is required",
    }).toUpperCase()
});