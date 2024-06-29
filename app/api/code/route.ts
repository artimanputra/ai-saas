
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import axios from "axios";

const MAX_RETRIES = 3;

const fetchEdenAICodeGeneration = async (prompt: string, retries: number = MAX_RETRIES): Promise<string> => {
    const options = {
        method: "POST",
        url: "https://api.edenai.run/v2/text/code_generation",
        headers: {
            authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZWU1MDJmODAtZDA2Yy00NjhhLWJjYjgtZGQwYTY4ODNmNjJkIiwidHlwZSI6ImFwaV90b2tlbiJ9.0mQCkssyqVGcXL_S7lN36wRWYeQJO8uBSuqzfOCYj1Q",  // Replace with your actual API key
        },
        data: {
            providers: "openai",
            prompt,
            instruction: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanation",
            temperature: 0.1,
            max_tokens: 500,
        },
    };

    try {
        const response = await axios.request(options);
        return response.data.openai.generated_text;
    } catch (error: any) {
        if (retries > 0 && error.code === 'ECONNRESET') {
            console.log(`Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
            await new Promise(res => setTimeout(res, 1000)); // Wait 1 second before retrying
            return fetchEdenAICodeGeneration(prompt, retries - 1);
        }
        throw error;
    }
};

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { messages } = body;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        if (!messages) {
            return new NextResponse("Messages are required", { status: 400 });
        }

        const userMessage = messages[messages.length - 1];
        const completionMessage = await fetchEdenAICodeGeneration(userMessage.content);
        return NextResponse.json(completionMessage);

    } catch (error: any) {
        console.log("[CONVERSATIONAL_ERROR]", error);
        let errorMessage = "An error occurred";
        if (error.code === 'ECONNRESET') {
            errorMessage = "Connection reset by server";
        }
        return new NextResponse(errorMessage, { status: 500 });
    }
}
