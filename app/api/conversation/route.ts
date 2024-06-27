// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import Configuration from "openai";
// import OpenAIApi from "openai"

// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(configuration);


// export async function POST(
//     req:Request
// ) {
//     try{
//         const {userId}= auth();
//         const body= await req.json();
//         const {messages}= body;

//         if(!userId){
//             return new NextResponse("Unauthorized",{status:401});
//         }
//         if(!configuration.apiKey){
//             return new NextResponse("OpenAI API key not configured",{status:500});
//         }
//         if(!messages){
//             return new NextResponse("Messages are required",{status:400});
//         }

//         const response= await openai.createChatCompletion({
//             model:"gpt-3.5-turbo",
//             messages
//         })

//         return NextResponse.json(response.data.choices[0].messages)

//     }catch(error){
//         console.log("[CONVERSATIONAL_ERROR]", error)
//         return new NextResponse("Internal error",{status:500})
//     }
    
// }
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { messages } = body;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        if (!openai.apiKey) {
            return new NextResponse("OpenAI API key not configured", { status: 500 });
        }
        if (!messages) {
            return new NextResponse("Messages are required", { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
        });

        // Assuming response.choices[0].message is the correct structure of OpenAI response
        return NextResponse.json(response.choices[0].message);

    } catch (error:any) {
        console.log("[CONVERSATIONAL_ERROR]", error);
        return new NextResponse(error, { status: 500 });
    }
}

