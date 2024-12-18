// "use client";

import { LLM, llms } from "@/utils/ai_providers";

export default function Topbar({ setLLM }: { setLLM: (m: LLM) => void }) {
  return (
    <nav className="p-2 bg-black text-white w-screen items-end">
      <select
        className="bg-transparent text-inherit"
        onChange={(e) => {
          setLLM(e.target.value as LLM);
        }}
      >
        {llms.map((m, i) => {
          return (
            <option className="bg-transparent text-inherit" value={m} key={i}>
              {m}
            </option>
          );
        })}
      </select>
    </nav>
  );
}
