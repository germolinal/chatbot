import { useEffect, useState } from "react";
import { Message } from "../../types/messages";
import { LLM } from "@/types/ai_providers";
const prompts = [
  "What colour is the sun?",
  "42 is the answer to life, the universe and everything. Why?",
  "What can you help me with?",
  "What are the Big 4 companies?",
  "What is the currency of Japan?",
  "What is the fastest land animal?",
];

// get random prompts
function getPrompts(n: number): string[] {
  if (n > prompts.length) {
    n = prompts.length;
  }
  let selected: string[] = [];
  while (selected.length < n) {
    const i = Math.round(Math.random() * (prompts.length - 1));
    const p = prompts[i];
    if (!selected.includes(p)) {
      selected.push(p);
    }
  }
  return selected;
}

export default function NoMessages({
  appendMsg,
  context,
  llm,
}: {
  appendMsg: any;
  context: string;
  llm: LLM;
}) {
  const [randomPrompts, setPrompts] = useState<string[]>([]);
  useEffect(() => {
    setPrompts(getPrompts(4));
  }, []);

  return (
    <div className="w-full h-full flex content-center justify-center items-center">
      <ul className="flex space-x-3 flex-wrap">
        {randomPrompts.map((p: string, i: number) => {
          return (
            <li
              className="flex w-[130px] justify-center p-2 border border-gray-200 rounded-lg cursor-pointer text-gray-500 hover:text-black hover:bg-gray-50"
              key={i}
              onClick={() => {
                appendMsg({
                  origin: "user",
                  msg: p,
                });
                fetch("/api/chat",{
                  method: "POST",
                  body: JSON.stringify({llm, context, txt: p, history: []})
                }).then(async (res: any) => {
                  if(!res.ok){
                    throw new Error(JSON.stringify(res))
                  }
                  let response: Message = await res.json();
                  appendMsg(response)                  
                });
              }}
            >
              <span className="text-center flex justify-center items-center">
                {p}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
