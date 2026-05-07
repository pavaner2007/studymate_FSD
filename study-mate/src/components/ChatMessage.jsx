import ReactMarkdown from 'react-markdown'
import { User, Bot, Sparkles } from 'lucide-react'

function ChatMessage({ message, isTyping = false }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isTyping) {
    return (
      <div className="flex gap-3 animate-fadeIn">
        <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-secondary-600" />
        </div>
        <div className="bg-white rounded-2xl px-4 py-3 shadow-card border border-slate-100">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></span>
          </div>
        </div>
      </div>
    )
  }

  if (isSystem) {
    return (
      <div className="flex gap-3 animate-fadeIn">
        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-green-600" />
        </div>
        <div className="max-w-[75%]">
          <div className="inline-block px-4 py-3 rounded-2xl bg-green-50 text-green-800 shadow-card border border-green-100">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 animate-fadeIn ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-primary-100' : 'bg-secondary-100'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-primary-600" />
        ) : (
          <Bot className="w-5 h-5 text-secondary-600" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
            : 'bg-white text-slate-800 shadow-card border border-slate-100'
        }`}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-800 prose-p:my-1 prose-strong:text-slate-900 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-li:text-slate-800 prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-code:text-slate-800 prose-pre:bg-slate-100 prose-pre:rounded-xl prose-pre:p-3 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
