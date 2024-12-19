import ReactMarkdown from 'markdown-to-jsx'
import './markdown.css'
import Code from './code'


const options = {
  overrides: {
    a: {
      props: {
        rel: 'noreferrer',
        target: '_blank' // Links open in new tab
      }
    },
    script: Script,
    code: Code
  }
}

function Script ({ children }: { children: any }) {
  return <Code className='html'>{`<script>${children}</script>`}</Code>
}

// an element with children
export default function Markdown ({ children }: { children: any }) {  
  return (
    <div className='markdown-render'>
      <ReactMarkdown options={options}>        
        {children}
      </ReactMarkdown>
    </div>
  )
}

