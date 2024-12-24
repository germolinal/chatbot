import { Message } from "../../types/messages";
import Markdown from "./markdown/markdown";

function UserMsg({ msg }: { msg: string }) {
  return (
    <div className="flex mx-auto w-full max-w-[800px]">
      <span className='flex flex-grow md:min-w-[100px] min-w-[3em]'></span>
      <div className="markdown bg-gray-200 w-fit px-5 py-3 rounded-2xl">
        <Markdown>{msg}</Markdown>
      </div>
    </div>
  );
}

function BotMsg({ msg }: { msg: string }) {
  return (
    <div className="flex mx-auto w-full max-w-[800px]">
      <div className="bg-white w-fit px-5 py-3 rounded-3xl border border-gray-500">
        <Markdown>{msg}</Markdown>
      </div>
      <span className='flex flex-grow min-w-[3em] md:min-w-[100px]'></span>
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
