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
      <div style={{backgroundColor: "rgb(40,40,40)", padding: "1em"}}>
        <div style={{ display: 'flex' }}>
          <span style={{ flexGrow: 1 }}></span>
          <button
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1.3em'              
            }}
            onClick={() => {
              navigator.clipboard.writeText(props.children as string)
            }}
          >
            <CopyIcon />
          </button>
        </div>

        <code className={props.className} ref={ref} style={{backgroundColor: 'inherit'}}>
          {props.children}
        </code>
      </div>
    )
  } else {
    return <code className={props.className} ref={ref} style={{
        // opacity: "60%",
        fontWeight:"bold",
        background: "rgb(220,220,220)",
        padding: "0 0.4em",
        borderRadius: "0.3em"
    }}>
      {props.children}
    </code>
  }
}
