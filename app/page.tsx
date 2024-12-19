'use client'
import MessagesBox from './components/MessageBox'
import TextInput from './components/TextInput'
import { useState } from 'react'
import Topbar from './components/Topbar'
import { Message } from './components/MsgTypes'
import { LLM, llms } from '@/utils/ai_providers'
import NoMessages from './components/NoMessages'

const DEFAULT_CONTEXT = 'You are a helpful assistant'

const INITIAL_MSGS: Message[] = [  
]

export default function Home () {
  const [msgs, setMsgs] = useState<Message[]>(INITIAL_MSGS)
  const [context, setContext] = useState<string>('You are a helpful assistant')
  const [llm, setLLM] = useState<LLM>(llms[0])

  const appendMsg = (m: Message) => {
    setMsgs(prevMsgs => [...prevMsgs, m])
  }

  return (
    <main className='h-full max-h-full flex flex-col items-center w-full bg-white px-2'>
      <Topbar setLLM={setLLM} />
      {/* CONTEXT should be at the top of the screen*/}
      <textarea
        className='w-full resize-none p-4 outline-none'
        id='context'
        placeholder={DEFAULT_CONTEXT}
        onChange={e => {
          let v = e.target.value.trim()
          setContext(v)
        }}
      ></textarea>
      {/* These two  objects should occupy all the vertical screen left...
          but they grow too much vertically.
          They are supposed to allow scrolling inside them*/}
      <div className='flex-grow overflow-y-scroll w-full max-w-[800px]'>
        {msgs.length > 0 && <MessagesBox msgs={msgs} />}
        {msgs.length === 0 && (
          <NoMessages llm={llm} context={context} appendMsg={appendMsg} />
        )}
      </div>
      {/* This should be at the bottom of the screen */}
      <TextInput
        llm={llm}
        context={context && context.length > 0 ? context : DEFAULT_CONTEXT}
        appendMsg={appendMsg}
        messages={msgs}
      />
    </main>
  )
}
