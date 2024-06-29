import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { FetchError } from "node-fetch"; // Import FetchError for type checking
import Replicate from "replicate"

const replicate= new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
})


export async function POST(req: Request){
    try {
        const { userId } = auth();
        const body = await req.json();
        const { prompt } = body;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        if (!prompt) {
            return new NextResponse("Prompt are required", { status: 400 });
        }

        const input = {
            prompt_b: prompt
        };
        
        const response = await replicate.run("riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05", { input });
        console.log(response)
        


        return NextResponse.json(response);

    } catch (error: any) {
        console.log("[MUSIC_ERROR]", error);
        let errorMessage = "An error occurred";
        if (error instanceof FetchError && error.code === 'ECONNRESET') {
            errorMessage = "Connection reset by server";
        }
        return new NextResponse(errorMessage, { status: 500 });
    }
}
