import { useState } from "react";
import { Message } from "./MsgTypes";
import { getChat } from "@/utils/llm";
import { LLM } from "@/utils/ai_providers";

export default function TextInput({
  appendMsg,
  messages,
  context,
  llm,
}: {
  llm: LLM;
  appendMsg: (m: Message) => void;
  messages: Message[];
  context: string;
}) {
  const [msg, setMsg]: [string, any] = useState("");
  const [validMsg, setValidMsg]: [boolean, any] = useState(false);
  const clearMsg = (e: any) => {
    setMsg("");
    e.target.value = "";
    setValidMsg(false);
  };
  const send = async (e: any) => {
    if (!validMsg) {
      clearMsg(e);
      return;
    }
    let txt = msg.trim();

    let history = [...messages];
    appendMsg({
      origin: "user",
      msg: txt,
    });
    let res = await getChat(llm, context, txt, history);
    appendMsg(res);

    clearMsg(e);
  };

  const updateMsg = (e: any) => {
    let txt = e.target.value.trim();
    setValidMsg(txt.length !== 0);
    setMsg(txt);
    if (e.key === "Enter") {
      send(e).then((r) => {});
    }
  };

  return (
    <div id="msgbox" className="w-full flex py-1 space-x-1 max-w-[800px]">
      <textarea
        className="h-fit w-full border border-gray-400 rounded-full px-5 leading-4 pt-4 resize-none outline-none"
        onKeyUp={updateMsg}
        placeholder="Message ChatGPT (ish)"
      ></textarea>
      <button
        className="text-[3em] text-white bg-black rounded-full cursor-pointer  disabled:bg-gray-500 disabled:cursor-auto"
        id="send"
        disabled={!validMsg}
        onClick={send}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          fill="none"
          viewBox="0 0 32 32"
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M15.192 8.906a1.143 1.143 0 0 1 1.616 0l5.143 5.143a1.143 1.143 0 0 1-1.616 1.616l-3.192-3.192v9.813a1.143 1.143 0 0 1-2.286 0v-9.813l-3.192 3.192a1.143 1.143 0 1 1-1.616-1.616z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
    </div>
  );
}
