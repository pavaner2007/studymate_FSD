import { useState, useRef, useEffect } from 'react'
import { Send, Plus, MessageSquare, Trash2, Upload, FileText, X, Loader2, Bot, Sparkles } from 'lucide-react'
import ChatMessage from '../components/ChatMessage'
import {
  fetchChats, fetchChatById, createChat, deleteChat,
  sendMessage, uploadPdfToChat, removePdfFromChat,
} from '../api/chatService'

function Chatbot() {
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [uploadedPdf, setUploadedPdf] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchChats()
      .then((res) => setChats(res.data))
      .catch(console.error)
      .finally(() => setLoadingChats(false))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat?.messages, isTyping])

  const handleSelectChat = async (chat) => {
    setLoadingMessages(true)
    try {
      const res = await fetchChatById(chat._id)
      setActiveChat(res.data)
      setUploadedPdf(res.data.pdfName ? { name: res.data.pdfName } : null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleCreateNewChat = async () => {
    try {
      const res = await createChat()
      const newChat = res.data
      setChats((prev) => [newChat, ...prev])
      setActiveChat({ ...newChat, messages: [] })
      setUploadedPdf(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation()
    try {
      await deleteChat(chatId)
      const updated = chats.filter((c) => c._id !== chatId)
      setChats(updated)
      if (activeChat?._id === chatId) {
        setActiveChat(null)
        setUploadedPdf(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !activeChat) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('pdf', file)
      const res = await uploadPdfToChat(activeChat._id, formData)
      setUploadedPdf({ name: res.data.pdfName, pages: res.data.pages })
      setActiveChat((prev) => ({
        ...prev,
        pdfName: res.data.pdfName,
        messages: [...(prev.messages || []), res.data.systemMessage],
      }))
    } catch (err) {
      alert(err.response?.data?.message || 'PDF upload failed')
    } finally {
      setIsUploading(false)
      fileInputRef.current.value = ''
    }
  }

  const handleRemovePdf = async () => {
    if (!activeChat) return
    try {
      await removePdfFromChat(activeChat._id)
      setUploadedPdf(null)
      setActiveChat((prev) => ({
        ...prev,
        pdfName: null,
        messages: (prev.messages || []).filter((m) => m.role !== 'system'),
      }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeChat || isTyping) return
    const content = inputMessage.trim()
    setInputMessage('')
    setIsTyping(true)

    const tempUserMsg = { _id: Date.now(), role: 'user', content }
    setActiveChat((prev) => ({ ...prev, messages: [...(prev.messages || []), tempUserMsg] }))

    try {
      const res = await sendMessage(activeChat._id, content)
      setActiveChat((prev) => {
        const withoutTemp = prev.messages.filter((m) => m._id !== tempUserMsg._id)
        return {
          ...prev,
          title: prev.title === 'New Chat' ? content.slice(0, 50) : prev.title,
          messages: [...withoutTemp, res.data.userMessage, res.data.assistantMessage],
        }
      })
      setChats((prev) =>
        prev.map((c) =>
          c._id === activeChat._id
            ? { ...c, title: c.title === 'New Chat' ? content.slice(0, 50) : c.title }
            : c
        )
      )
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message')
      setActiveChat((prev) => ({
        ...prev,
        messages: prev.messages.filter((m) => m._id !== tempUserMsg._id),
      }))
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startNewChatWithPdf = async () => {
    await handleCreateNewChat()
    setTimeout(() => fileInputRef.current?.click(), 100)
  }

  return (
    <div className="flex h-[calc(100vh-180px)] lg:h-[calc(100vh-140px)] bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
      <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />

      {/* Sidebar */}
      <div className="w-64 lg:w-72 bg-slate-50 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <button
            onClick={handleCreateNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loadingChats ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">No chats yet. Start a new conversation!</div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleSelectChat(chat)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors mb-1 ${
                  activeChat?._id === chat._id ? 'bg-primary-100 text-primary-800' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <MessageSquare size={18} className="flex-shrink-0" />
                <span className="flex-1 truncate text-sm font-medium">{chat.title || 'New Chat'}</span>
                {chat.pdfName && <FileText size={14} className="text-primary-500 flex-shrink-0" />}
                <button
                  onClick={(e) => handleDeleteChat(chat._id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded-lg transition-all flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeChat ? (
          <>
            {/* PDF Banner */}
            {uploadedPdf && (
              <div className="px-4 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary-800 truncate max-w-[200px] lg:max-w-[300px]">{uploadedPdf.name}</p>
                    {uploadedPdf.pages && <p className="text-xs text-primary-600">{uploadedPdf.pages} pages</p>}
                  </div>
                </div>
                <button onClick={handleRemovePdf} className="p-1.5 hover:bg-primary-100 rounded-lg transition-colors">
                  <X size={16} className="text-primary-600" />
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              ) : activeChat.messages?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-full max-w-md mb-8">
                    {isUploading ? (
                      <div className="bg-primary-50 rounded-2xl p-6">
                        <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-3" />
                        <p className="text-primary-800 font-medium">Processing PDF...</p>
                        <p className="text-primary-600 text-sm">Extracting text and building knowledge base</p>
                      </div>
                    ) : uploadedPdf ? (
                      <div className="bg-green-50 rounded-2xl p-6 border-2 border-dashed border-green-200">
                        <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Sparkles className="w-7 h-7 text-green-600" />
                        </div>
                        <p className="text-green-800 font-semibold mb-1">PDF Ready!</p>
                        <p className="text-green-600 text-sm">Ask me anything about {uploadedPdf.name}</p>
                      </div>
                    ) : (
                      <div
                        onClick={startNewChatWithPdf}
                        className="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-300 hover:border-primary-400 hover:bg-primary-50/50 cursor-pointer transition-all"
                      >
                        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Upload className="w-7 h-7 text-slate-500" />
                        </div>
                        <p className="text-slate-800 font-semibold mb-1">Upload a PDF Document</p>
                        <p className="text-slate-500 text-sm">Click to upload or drag and drop</p>
                        <p className="text-slate-400 text-xs mt-2">PDF files only • Max 10MB</p>
                      </div>
                    )}
                  </div>
                  <div className="w-20 h-20 bg-secondary-100 rounded-2xl flex items-center justify-center mb-4">
                    <Bot className="w-10 h-10 text-secondary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">PDF Q&A Assistant</h3>
                  <p className="text-slate-500 max-w-md">
                    {uploadedPdf ? `Ask me questions about "${uploadedPdf.name}"` : 'Upload a PDF and ask me anything about it, or just start chatting!'}
                  </p>
                </div>
              ) : (
                activeChat.messages.map((message) => (
                  <ChatMessage key={message._id} message={message} />
                ))
              )}
              {isTyping && <ChatMessage message={{ role: 'assistant' }} isTyping />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-end gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-colors disabled:opacity-50 flex-shrink-0"
                  title="Upload PDF"
                >
                  {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                </button>
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={uploadedPdf ? `Ask anything about ${uploadedPdf.name}...` : 'Ask me anything...'}
                    rows={1}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 resize-none max-h-32"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="p-3 bg-secondary-600 text-white rounded-2xl hover:bg-secondary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send size={20} />
                </button>
              </div>
              {!uploadedPdf && activeChat.messages?.length > 0 && (
                <p className="text-xs text-slate-400 mt-2 text-center">
                  💡 Tip: Upload a PDF to get more accurate answers about your document
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-secondary-100 rounded-3xl flex items-center justify-center mb-4">
              <Bot className="w-12 h-12 text-secondary-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Welcome to PDF Q&A</h3>
            <p className="text-slate-500 max-w-md mb-6">
              Upload a PDF document and ask questions about it. Get instant answers powered by Groq AI.
            </p>
            <button
              onClick={startNewChatWithPdf}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary-600 text-white font-medium rounded-xl hover:bg-secondary-700 transition-colors"
            >
              <Upload size={18} />
              Upload PDF & Start Chat
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chatbot
