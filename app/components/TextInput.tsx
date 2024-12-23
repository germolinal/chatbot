import { useState } from 'react'
import { Message } from '../../types/messages'

import { LLM } from '@/types/ai_providers'
import SendIcon from './icons/send_icon'

import AudioInput from './AudioInput'

export default function TextInput ({
  appendMsg,
  messages,
  context,
  llm
}: {
  llm: LLM
  appendMsg: (m: Message) => void
  messages: Message[]
  context: string
}) {
  const [msg, setMsg]: [string, any] = useState('')
  const [validMsg, setValidMsg]: [boolean, any] = useState(false)

  const clearMsg = (e: any) => {
    setMsg('')
    e.target.value = ''
    setValidMsg(false)
  }
  const send = async (e: any) => {
    if (!validMsg) {
      clearMsg(e)
      return
    }
    let txt = msg.trim()

    let history = [...messages]
    appendMsg({
      origin: 'user',
      msg: txt
    })
    clearMsg(e)

    let res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        llm,
        context,
        txt,
        history
      })
    })
    if (!res.ok) {
      throw new Error(JSON.stringify(res))
    }
    let response: Message = await res.json()
    console.log(response)
    appendMsg(response)
  }

  const updateMsg = (e: any) => {
    let txt = e.target.value.trim()
    setValidMsg(txt.length !== 0)
    setMsg(txt)
    if (e.key === 'Enter') {
      send(e).then(r => {})
    }
  }

  return (
    <div id='msgbox' className='w-full flex py-1 space-x-1 max-w-[800px]'>
      <div className='w-full flex flex-grow border border-gray-400 rounded-full px-5'>
        <textarea
          className='h-fit w-full  leading-4 pt-4 resize-none outline-none'
          onKeyUp={updateMsg}
          placeholder='Message ChatGPT (ish)'
        ></textarea>
        <AudioInput appendMsg={appendMsg} />
      </div>
      <button
        className='text-[3em] text-white bg-black rounded-full cursor-pointer  disabled:bg-gray-500 disabled:cursor-auto'
        id='send'
        disabled={!validMsg}
        onClick={send}
      >
        <SendIcon />
      </button>
    </div>
  )
}
