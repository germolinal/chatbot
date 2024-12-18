"use server";
import OpenAI from "openai";
import { Message } from "../app/components/MsgTypes";
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { LLM, AI_platform, llm_providers } from "./ai_providers";

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
): Promise<Message> {
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
  return {
    origin: "bot",
    msg: result.response.text(),
  };
}

async function openAIChat(
  llm: LLM,
  context: string,
  txt: string,
  history: Message[],
): Promise<Message> {
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
  return {
    origin: "bot",
    msg: msg.content || "the bot returned nothing!",
  };
}

export async function getChat(
  llm: LLM,
  context: string,
  txt: string,
  history: Message[],
): Promise<Message> {
  const p = getPlatform(llm);
  switch (p) {
    case "google":
      return googleChat(llm, context, txt, history);
    case "openai":
      return openAIChat(llm, context, txt, history);
  }
  return { msg: `llm ${llm} of '${p}' is not yet supported`, origin: "bot" };
}

async function googleCompletion(
  llm: LLM,
  context: string,
  txt: string,
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({
    model: llm,
    systemInstruction: context,
  });
  const res = await model.generateContent(txt);
  return res.response.text();
}

async function openAiCompletion(
  llm: LLM,
  context: string,
  txt: string,
): Promise<string> {
  let msg = await openAIChat(llm, context, txt, []);
  return msg.msg;
}

export async function getCompletion(
  llm: LLM,
  context: string,
  txt: string,
): Promise<string> {
  const p = getPlatform(llm);
  switch (p) {
    case "google":
      return googleCompletion(llm, context, txt);
    case "openai":
      return openAiCompletion(llm, context, txt);
  }
  return `llm ${llm} of '${p}' is not yet supported`;
}
