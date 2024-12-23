"server-only";
import OpenAI from "openai";
import { Message } from "../../../types/messages";
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { LLM, AI_platform, llm_providers } from "../../../types/ai_providers";
import { NextResponse } from "next/server";
import { HTTP_METHODS } from "next/dist/server/web/http";


function getPlatform(llm: LLM): AI_platform {
    const platform = llm_providers[llm];
    if (!platform) {
        throw new Error(`model '${llm}' has not been assigned any platform`);
    }
    return platform;
}

async function googleChat(
    llm: LLM,
    context: string,
    txt: string,
    history: Message[],
): Promise<NextResponse> {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
        model: llm,
        systemInstruction: context,
    });
    const chat = model.startChat({
        history: history.map((msg: Message) => {
            return {
                role: msg.origin === "user" ? msg.origin : "model",
                parts: [{ text: msg.msg }],
            };
        }),
    });

    let result = await chat.sendMessage(txt);
    return NextResponse.json({
        origin: "bot",
        msg: result.response.text(),
    }, { status: 200 });
}

async function openAIChat(
    llm: LLM,
    context: string,
    txt: string,
    history: Message[],
): Promise<NextResponse> {
    const openai = new OpenAI();
    let messages: any[] = [{ role: "system", content: context }];
    history.forEach((m: Message) => {
        messages.push({
            role: m.origin === "user" ? m.origin : "assistant",
            content: m.msg,
        });
    });
    messages.push({
        role: "user",
        content: txt,
    });

    const completion = await openai.chat.completions.create({
        model: llm,
        messages,
    });

    const msg = completion.choices[0].message;
    return NextResponse.json({
        origin: "bot",
        msg: msg.content || "the bot returned nothing!",
    }, { status: 200 });
}

async function getChat(
    llm: LLM,
    context: string,
    txt: string,
    history: Message[],
): Promise<NextResponse> {
    const p = getPlatform(llm);
    switch (p) {
        case "google":
            return await googleChat(llm, context, txt, history);
        case "openai":
            return await openAIChat(llm, context, txt, history);
    }
    return NextResponse.json({ msg: `llm ${llm} of '${p}' is not yet supported`, origin: "bot" }, { status: 400 })
}

export async function GET() {
    return NextResponse.json({ msg: 'success' })
}

export async function POST(req: Request) {
    const { llm, context, txt, history } = await req.json()
    return await getChat(llm, context, txt, history)
}



// async function googleCompletion(
//   llm: LLM,
//   context: string,
//   txt: string,
// ): Promise<string> {
//   const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
//   const model = genAI.getGenerativeModel({
//     model: llm,
//     systemInstruction: context,
//   });
//   const res = await model.generateContent(txt);
//   return res.response.text();
// }

// async function openAiCompletion(
//   llm: LLM,
//   context: string,
//   txt: string,
// ): Promise<string> {
//   let msg = await openAIChat(llm, context, txt, []);
//   return msg.msg;
// }

// export async function getCompletion(
//   llm: LLM,
//   context: string,
//   txt: string,
// ): Promise<string> {
//   const p = getPlatform(llm);
//   switch (p) {
//     case "google":
//       return googleCompletion(llm, context, txt);
//     case "openai":
//       return openAiCompletion(llm, context, txt);
//   }
//   return `llm ${llm} of '${p}' is not yet supported`;
// }
