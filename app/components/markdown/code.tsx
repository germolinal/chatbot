import React, { useEffect, useRef } from 'react'
import CopyIcon from './copy-icon'
// SYNTAX HIGHLIGHTING COMPONENT.
// SOME IMPORTS IN THE LAYOUT
// ARE REQUIRED AS WELL

type CodeProps = React.HTMLAttributes<HTMLElement>

export default function Code (props: CodeProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    // @ts-ignore
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      // @ts-ignore
      window.hljs.highlightElement(ref.current)

      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute('data-highlighted')
    }
  }, [props.className, props.children])

  if (props.className) {
    return (
      <div className='bg-[#2e3440] p-4 my-3 text-white'>
        <div className='flex'>
          <span style={{ flexGrow: 1 }}></span>
          <button
            className='border-none bg-transparent  cursor-pointer text-xl'
            onClick={() => {
              navigator.clipboard.writeText(props.children as string)
            }}
          >
            <CopyIcon />
          </button>
        </div>

        <code className={`${props.className} p-2  block w-full overflow-x-scroll`} ref={ref}>
          {props.children}
        </code>
      </div>
    )
  } else {
    return (
      <code
        className="font-bold bg-gray-200 px-1 rounded-sm max-w-full overflow-x-scroll"
        ref={ref}        
      >
        {props.children}
      </code>
    )
  }
}
