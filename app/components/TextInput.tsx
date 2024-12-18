import { useRef, useState } from "react";
import { Message } from "./MsgTypes";
import { getChat } from "@/utils/llm";
import { LLM } from "@/utils/ai_providers";
import SendIcon from "./icons/send_icon";
import MicIcon from "./icons/mic_icon";
import SoundWavesIcon from "./icons/soundwave_icon";

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
  const [recording, setRecording] = useState<boolean>(false);
  const [playing, setPlaying] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

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
    clearMsg(e);

    let res = await getChat(llm, context, txt, history);
    appendMsg(res);

  };

  const updateMsg = (e: any) => {
    let txt = e.target.value.trim();
    setValidMsg(txt.length !== 0);
    setMsg(txt);
    if (e.key === "Enter") {
      send(e).then((r) => {});
    }
  };

  const startRecording = async () => {
    try {
      // Connect to WebSocket server
      //
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      console.log(host);
      // The port has to be different from the standard one...
      const url = `${protocol}//${"localhost:3001"}/api/audio`;
      socketRef.current = new WebSocket(url);

      // Wait for WebSocket to open
      socketRef.current.onopen = () => {
        console.log("WebSocket connected");
      };

      // Get user's audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      // Send audio chunks to server as soon as they're available
      mediaRecorder.ondataavailable = (event) => {
        if (
          event.data.size > 0 &&
          socketRef.current?.readyState === WebSocket.OPEN
        ) {
          socketRef.current.send(event.data);
        }
      };
      // Start recording
      mediaRecorder.start(100); // Send chunks every 100ms
      setRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (socketRef.current) {
      socketRef.current.close();
    }
    setRecording(false);
  };

  return (
    <div id="msgbox" className="w-full flex py-1 space-x-1 max-w-[800px]">
      <div className="w-full flex flex-grow border border-gray-400 rounded-full px-5">
        <textarea
          className="h-fit w-full  leading-4 pt-4 resize-none outline-none"
          onKeyUp={updateMsg}
          placeholder="Message ChatGPT (ish)"
        ></textarea>
        <button
          className={`text-xl ${recording ? "text-red-700" : ""}`}
          onClick={recording ? stopRecording : startRecording}
        >
          {!playing && <MicIcon />}
          {playing && <SoundWavesIcon />}
        </button>
      </div>
      <button
        className="text-[3em] text-white bg-black rounded-full cursor-pointer  disabled:bg-gray-500 disabled:cursor-auto"
        id="send"
        disabled={!validMsg}
        onClick={send}
      >
        <SendIcon />
      </button>
    </div>
  );
}
