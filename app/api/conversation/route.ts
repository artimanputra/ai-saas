
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import axios from "axios";

const MAX_RETRIES = 3;

async function fetchEdenAICompletion(messages: any, retries: number = MAX_RETRIES): Promise<any> {
    const options = {
        method: "POST",
        url: "https://api.edenai.run/v2/text/chat",
        headers: {
            authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZWU1MDJmODAtZDA2Yy00NjhhLWJjYjgtZGQwYTY4ODNmNjJkIiwidHlwZSI6ImFwaV90b2tlbiJ9.0mQCkssyqVGcXL_S7lN36wRWYeQJO8uBSuqzfOCYj1Q",  // Replace with your actual API key
        },
        data: {
            providers: "openai",
            text: messages[messages.length - 1].content,
            chatbot_global_action: "Act as an assistant",
            previous_history: messages.slice(0, -1),
            temperature: 0.0,
            max_tokens: 150,
        },
    };

    try {
        const response = await axios.request(options);
        // Extract the generated text from the response
        const assistantMessage = response.data.openai.generated_text;
        return assistantMessage;
    } catch (error: any) {
        if (retries > 0 && error.code === 'ECONNRESET') {
            console.log(`Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
            await new Promise(res => setTimeout(res, 1000)); // Wait 1 second before retrying
            return fetchEdenAICompletion(messages, retries - 1);
        }
        throw error;
    }
}

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

        const completionMessage = await fetchEdenAICompletion(messages);
        return NextResponse.json(completionMessage);

    } catch (error: any) {
        console.log("[CONVERSATIONAL_ERROR]", error);
        let errorMessage = "An error occurred";
        if (error.code === 'ECONNRESET') {
            errorMessage = "Connection reset by server";
        }
        return new NextResponse(error, { status: 500 });
    }
}
