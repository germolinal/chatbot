import { Message } from "../../types/messages";
import Markdown from "./markdown/markdown";

function UserMsg({ msg }: { msg: string }) {
  return (
    <div className="flex">
      <span style={{ flexGrow: 1 }}></span>
      <div className="markdown bg-gray-200 w-fit max-w-[80%] px-5 py-3 rounded-2xl">
        <Markdown>{msg}</Markdown>
      </div>
    </div>
  );
}

function BotMsg({ msg }: { msg: string }) {
  return (
    <div className="flex">
      <div className="bg-white w-fit max-w-[80%] px-5 py-3 rounded-3xl border border-gray-500">
        <Markdown>{msg}</Markdown>
      </div>
      <span style={{ flexGrow: 1 }}></span>
    </div>
  );
}

export default function MessagesBox({ msgs }: { msgs: Message[] }) {
  return (
    <div id="msgs" className="w-full flex flex-col space-y-4 h-full py-4">
      {msgs.map((m: Message, i: number) => {
        if (m.origin === "user") {
          return <UserMsg key={i} msg={m.msg} />;
        } else {
          return <BotMsg key={i} msg={m.msg} />;
        }
      })}
    </div>
  );
}
