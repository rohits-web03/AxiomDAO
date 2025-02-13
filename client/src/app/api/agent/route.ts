import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ethers, formatEther, parseEther } from "ethers";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createToolCallingAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

async function getBalance(address: string) {
    const rpcUrl = process.env.RPC_URL || '';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(address);
    return formatEther(balance);
}

async function sendTransaction(to: string, amount: string) {
    try {
        const rpcUrl = process.env.RPC_URL || '';
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);

        const tx = await signer.sendTransaction({
            to,
            value: parseEther(amount),
        });

        console.log(`Transaction sent: ${tx.hash}`);

        // Wait for 1 confirmation
        const receipt = await tx.wait(1).then(res => res).catch(() => null);

        if (receipt) {
            return JSON.stringify({
                success: true,
                txHash: tx.hash,
                message: `Transaction successful! Hash: ${tx.hash}`,
            });
        } else {
            return JSON.stringify({
                success: false,
                txHash: tx.hash,
                message: `Transaction sent but not confirmed yet.`,
            });
        }
    } catch (error: any) {
        return JSON.stringify({
            success: false,
            message: `Transaction failed: ${error.message}`,
        });
    }
}

export async function GET() {
    try {
        const magicTool = tool(
            async ({ input }) => `${input + 2}`,
            {
                name: "magic_function",
                description: "Applies a magic function to an input.",
                schema: z.object({
                    input: z.number(),
                }),
            }
        );

        const currentBalance = tool(
            async ({ address }) => {
                return await getBalance(address);
            },
            {
                name: "currentBalance",
                description: "Tells current balance of given wallet address",
                schema: z.object({
                    address: z.string(),
                }),
            }
        );

        const send = tool(
            async ({ address, amount }) => {
                const result = await sendTransaction(address, amount);
                console.log("Send Transaction Response:", result);
                return result;
            },
            {
                name: "sendTransaction",
                description: "Sends TFIL tokens to a given wallet address on the Filecoin Calibration testnet.",
                schema: z.object({
                    address: z.string(),
                    amount: z.string(), // String to allow flexible input like "0.1"
                }),
            }
        );

        const tools = [magicTool, currentBalance, send];

        const llm = new ChatGroq({
            model: "llama3-70b-8192",
            temperature: 0,
            apiKey: process.env.GROQ_API_KEY
        });

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", "You are an assistant with access to a crypto wallet and can tell me the balance using an appropriate tool."],
            ["placeholder", "{chat_history}"],
            ["human", "{input}"],
            ["placeholder", "{agent_scratchpad}"],
        ]);

        const agent = createToolCallingAgent({ llm, tools, prompt });

        const agentExecutor = new AgentExecutor({
            agent,
            tools,
            maxIterations: 2,
        });

        console.log("Agent executing...");
        const result = await agentExecutor.invoke({
            input: "Send 1 TFIL to 0xF3bB40f2a25494979701A20EF1991538da6b28D7 and return the transaction hash. Pass the amount as string to tool",
        });
        console.log("Agent result:", result);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message });
    }
}
