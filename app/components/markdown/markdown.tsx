import ReactMarkdown, { sanitizer } from 'markdown-to-jsx'
import './markdown.css'
import xss from 'xss';
import Code from './code'

const sanitize = (html: string) => {
  return xss(html, {
     whiteList: { // Allow basic HTML and code elements 
        h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
        p: [],
        ul: [], ol: [], li: [],
        strong: [], em: [],
        blockquote: [],
        a: ['href', 'target'],
        code: ['class'], // Allow class attribute for syntax highlighting
        pre: []
    }
  });
  // return html
};

const options = {
  overrides: {
    a: {
      props: {
        rel: 'noreferrer',
        target: '_blank' // Links open in new tab
      }
    },
    code: Code
  }
}

// an element with children
export default function Markdown ({ children }: { children: any }) {
  return (
    <div className='markdown-render'>
      <ReactMarkdown options={options}>{sanitize(children)}</ReactMarkdown>
    </div>
  )
}
