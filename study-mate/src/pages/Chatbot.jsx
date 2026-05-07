import { useState, useRef, useEffect } from 'react'
import {
  Send, Plus, MessageSquare, Trash2, Upload,
  FileText, X, Loader2, Bot, Sparkles, Globe, Link, Youtube,
} from 'lucide-react'
import ChatMessage from '../components/ChatMessage'
import {
  fetchChats, fetchChatById, createChat, deleteChat,
  sendMessage, uploadPdfToChat, removePdfFromChat,
  scrapeWebPage, removeWebFromChat,
  summarizeYoutube, removeYoutubeFromChat,
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

  // Web scraping state
  const [showWebModal, setShowWebModal] = useState(false)
  const [webUrl, setWebUrl] = useState('')
  const [webLoading, setWebLoading] = useState(false)
  const [webError, setWebError] = useState('')
  const [scrapedWeb, setScrapedWeb] = useState(null)

  // YouTube state
  const [showYoutubeModal, setShowYoutubeModal] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [youtubeLoading, setYoutubeLoading] = useState(false)
  const [youtubeError, setYoutubeError] = useState('')
  const [linkedVideo, setLinkedVideo] = useState(null)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchChats().then(res => setChats(res.data)).catch(console.error).finally(() => setLoadingChats(false))
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
      setScrapedWeb(res.data.webUrl ? { url: res.data.webUrl, title: res.data.webTitle } : null)
      setLinkedVideo(res.data.youtubeUrl ? { url: res.data.youtubeUrl, title: res.data.youtubeTitle } : null)
    } catch (err) { console.error(err) }
    finally { setLoadingMessages(false) }
  }

  const handleCreateNewChat = async () => {
    try {
      const res = await createChat()
      setChats(prev => [res.data, ...prev])
      setActiveChat({ ...res.data, messages: [] })
      setUploadedPdf(null)
      setScrapedWeb(null)
      setLinkedVideo(null)
    } catch (err) { console.error(err) }
  }

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation()
    try {
      await deleteChat(chatId)
      const updated = chats.filter(c => c._id !== chatId)
      setChats(updated)
      if (activeChat?._id === chatId) {
        setActiveChat(null)
        setUploadedPdf(null)
        setScrapedWeb(null)
        setLinkedVideo(null)
      }
    } catch (err) { console.error(err) }
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
      setScrapedWeb(null)
      setActiveChat(prev => ({ ...prev, pdfName: res.data.pdfName, messages: [...(prev.messages || []), res.data.systemMessage] }))
    } catch (err) { alert(err.response?.data?.message || 'PDF upload failed') }
    finally { setIsUploading(false); fileInputRef.current.value = '' }
  }

  const handleRemovePdf = async () => {
    if (!activeChat) return
    try {
      await removePdfFromChat(activeChat._id)
      setUploadedPdf(null)
      setActiveChat(prev => ({ ...prev, pdfName: null, messages: (prev.messages || []).filter(m => m.role !== 'system') }))
    } catch (err) { console.error(err) }
  }

  // Web scraping handlers
  const handleWebScrape = async () => {
    if (!webUrl.trim() || !activeChat) return
    setWebLoading(true)
    setWebError('')
    try {
      const res = await scrapeWebPage(activeChat._id, webUrl.trim())
      setScrapedWeb({ url: webUrl.trim(), title: res.data.webTitle })
      setUploadedPdf(null)
      setActiveChat(prev => ({
        ...prev,
        webUrl: webUrl.trim(),
        webTitle: res.data.webTitle,
        title: prev.title === 'New Chat' ? res.data.webTitle.slice(0, 50) : prev.title,
        messages: [...(prev.messages || []).filter(m => m.role !== 'system'), res.data.systemMessage],
      }))
      setChats(prev => prev.map(c => c._id === activeChat._id
        ? { ...c, webUrl: webUrl.trim(), title: c.title === 'New Chat' ? res.data.webTitle.slice(0, 50) : c.title }
        : c
      ))
      setShowWebModal(false)
      setWebUrl('')
    } catch (err) {
      setWebError(err.response?.data?.message || 'Failed to scrape the web page')
    } finally {
      setWebLoading(false)
    }
  }

  const handleRemoveWeb = async () => {
    if (!activeChat) return
    try {
      await removeWebFromChat(activeChat._id)
      setScrapedWeb(null)
      setActiveChat(prev => ({ ...prev, webUrl: null, webTitle: null, messages: (prev.messages || []).filter(m => m.role !== 'system') }))
    } catch (err) { console.error(err) }
  }

  const openWebModal = async () => {
    if (!activeChat) await handleCreateNewChat()
    setShowWebModal(true)
    setWebError('')
    setWebUrl('')
  }

  // YouTube handlers
  const handleYoutubeSummarize = async () => {
    if (!youtubeUrl.trim() || !activeChat) return
    setYoutubeLoading(true)
    setYoutubeError('')
    try {
      const res = await summarizeYoutube(activeChat._id, youtubeUrl.trim())
      setLinkedVideo({ url: youtubeUrl.trim(), title: res.data.youtubeTitle })
      setUploadedPdf(null)
      setScrapedWeb(null)
      setActiveChat(prev => ({
        ...prev,
        youtubeUrl: youtubeUrl.trim(),
        youtubeTitle: res.data.youtubeTitle,
        title: prev.title === 'New Chat' ? res.data.youtubeTitle.slice(0, 50) : prev.title,
        messages: [...(prev.messages || []).filter(m => m.role !== 'system'), res.data.systemMessage, res.data.assistantMessage],
      }))
      setChats(prev => prev.map(c => c._id === activeChat._id
        ? { ...c, youtubeUrl: youtubeUrl.trim(), title: c.title === 'New Chat' ? res.data.youtubeTitle.slice(0, 50) : c.title }
        : c
      ))
      setShowYoutubeModal(false)
      setYoutubeUrl('')
    } catch (err) {
      setYoutubeError(err.response?.data?.message || 'Failed to process YouTube video')
    } finally {
      setYoutubeLoading(false)
    }
  }

  const handleRemoveYoutube = async () => {
    if (!activeChat) return
    try {
      await removeYoutubeFromChat(activeChat._id)
      setLinkedVideo(null)
      setActiveChat(prev => ({ ...prev, youtubeUrl: null, youtubeTitle: null, messages: (prev.messages || []).filter(m => m.role !== 'system') }))
    } catch (err) { console.error(err) }
  }

  const openYoutubeModal = async () => {
    if (!activeChat) await handleCreateNewChat()
    setShowYoutubeModal(true)
    setYoutubeError('')
    setYoutubeUrl('')
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeChat || isTyping) return
    const content = inputMessage.trim()
    setInputMessage('')
    setIsTyping(true)
    const tempUserMsg = { _id: Date.now(), role: 'user', content }
    setActiveChat(prev => ({ ...prev, messages: [...(prev.messages || []), tempUserMsg] }))
    try {
      const res = await sendMessage(activeChat._id, content)
      setActiveChat(prev => {
        const withoutTemp = prev.messages.filter(m => m._id !== tempUserMsg._id)
        return { ...prev, title: prev.title === 'New Chat' ? content.slice(0, 50) : prev.title, messages: [...withoutTemp, res.data.userMessage, res.data.assistantMessage] }
      })
      setChats(prev => prev.map(c => c._id === activeChat._id ? { ...c, title: c.title === 'New Chat' ? content.slice(0, 50) : c.title } : c))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message')
      setActiveChat(prev => ({ ...prev, messages: prev.messages.filter(m => m._id !== tempUserMsg._id) }))
    } finally { setIsTyping(false) }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() }
  }

  const startNewChatWithPdf = async () => {
    await handleCreateNewChat()
    setTimeout(() => fileInputRef.current?.click(), 100)
  }

  const startNewChatWithWeb = async () => {
    await handleCreateNewChat()
    setTimeout(() => { setShowWebModal(true); setWebError(''); setWebUrl('') }, 100)
  }

  const hasContext = uploadedPdf || scrapedWeb || linkedVideo

  return (
    <div className="flex h-[calc(100vh-180px)] lg:h-[calc(100vh-140px)] bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
      <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />

      {/* YouTube Modal */}
      {showYoutubeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                  <Youtube className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">YouTube Summarizer</h3>
              </div>
              <button onClick={() => { setShowYoutubeModal(false); setYoutubeError('') }} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Paste a YouTube video URL. The AI will fetch the transcript and generate a summary you can learn from.
            </p>
            <div className="relative mb-3">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={youtubeUrl}
                onChange={e => { setYoutubeUrl(e.target.value); setYoutubeError('') }}
                onKeyDown={e => e.key === 'Enter' && handleYoutubeSummarize()}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                autoFocus
              />
            </div>
            {youtubeError && (
              <p className="text-sm text-red-500 mb-3 flex items-center gap-1"><X size={14} /> {youtubeError}</p>
            )}
            <div className="bg-red-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-red-700 font-medium mb-1">Requirements:</p>
              <p className="text-xs text-red-600">Video must have captions/subtitles enabled. Works with most educational, lecture, and tutorial videos.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowYoutubeModal(false); setYoutubeError('') }} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleYoutubeSummarize}
                disabled={!youtubeUrl.trim() || youtubeLoading}
                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {youtubeLoading ? <><Loader2 size={16} className="animate-spin" /> Summarizing...</> : <><Youtube size={16} /> Summarize</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Web URL Modal */}
      {showWebModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Web Scraping Agent</h3>
              </div>
              <button onClick={() => { setShowWebModal(false); setWebError('') }} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Paste any web page URL and the AI will extract its content so you can ask questions and learn from it.
            </p>

            <div className="relative mb-3">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={webUrl}
                onChange={e => { setWebUrl(e.target.value); setWebError('') }}
                onKeyDown={e => e.key === 'Enter' && handleWebScrape()}
                placeholder="https://example.com/article"
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                autoFocus
              />
            </div>

            {webError && (
              <p className="text-sm text-red-500 mb-3 flex items-center gap-1">
                <X size={14} /> {webError}
              </p>
            )}

            <div className="bg-blue-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-blue-700 font-medium mb-1">Works great with:</p>
              <p className="text-xs text-blue-600">Wikipedia articles • News articles • Blog posts • Documentation • Research papers • Educational websites</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setShowWebModal(false); setWebError('') }} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleWebScrape}
                disabled={!webUrl.trim() || webLoading}
                className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {webLoading ? <><Loader2 size={16} className="animate-spin" /> Scraping...</> : <><Globe size={16} /> Scrape & Load</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 lg:w-72 bg-slate-50 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <button onClick={handleCreateNewChat} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors">
            <Plus size={18} /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loadingChats ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-slate-400 animate-spin" /></div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">No chats yet. Start a new conversation!</div>
          ) : chats.map(chat => (
            <div key={chat._id} onClick={() => handleSelectChat(chat)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors mb-1 ${activeChat?._id === chat._id ? 'bg-primary-100 text-primary-800' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <MessageSquare size={18} className="flex-shrink-0" />
              <span className="flex-1 truncate text-sm font-medium">{chat.title || 'New Chat'}</span>
              {chat.pdfName && <FileText size={14} className="text-primary-500 flex-shrink-0" />}
              {chat.webUrl && <Globe size={14} className="text-blue-500 flex-shrink-0" />}
              {chat.youtubeUrl && <Youtube size={14} className="text-red-500 flex-shrink-0" />}
              <button onClick={e => handleDeleteChat(chat._id, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded-lg transition-all flex-shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
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

            {/* YouTube Banner */}
            {linkedVideo && (
              <div className="px-4 py-3 bg-red-50 border-b border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Youtube className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-red-800 truncate max-w-[200px] lg:max-w-[300px]">{linkedVideo.title}</p>
                    <a href={linkedVideo.url} target="_blank" rel="noopener noreferrer" className="text-xs text-red-500 hover:underline truncate block max-w-[200px] lg:max-w-[300px]">
                      {linkedVideo.url}
                    </a>
                  </div>
                </div>
                <button onClick={handleRemoveYoutube} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors">
                  <X size={16} className="text-red-600" />
                </button>
              </div>
            )}

            {/* Web Banner */}
            {scrapedWeb && (
              <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-blue-800 truncate max-w-[200px] lg:max-w-[300px]">{scrapedWeb.title}</p>
                    <a href={scrapedWeb.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block max-w-[200px] lg:max-w-[300px]">
                      {scrapedWeb.url}
                    </a>
                  </div>
                </div>
                <button onClick={handleRemoveWeb} className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors">
                  <X size={16} className="text-blue-600" />
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
              ) : activeChat.messages?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  {/* Action Cards */}
                  <div className="w-full max-w-lg grid grid-cols-2 gap-3 mb-8">
                    {/* PDF Card */}
                    <div onClick={startNewChatWithPdf} className="bg-slate-50 rounded-2xl p-5 border-2 border-dashed border-slate-300 hover:border-primary-400 hover:bg-primary-50/50 cursor-pointer transition-all text-center">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-2" />
                      ) : (
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <Upload className="w-6 h-6 text-primary-600" />
                        </div>
                      )}
                      <p className="text-sm font-semibold text-slate-700">Upload PDF</p>
                      <p className="text-xs text-slate-400 mt-1">Ask questions about a document</p>
                    </div>

                    {/* Web Scraping Card */}
                    <div onClick={openWebModal} className="bg-slate-50 rounded-2xl p-5 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Globe className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">Web Page</p>
                      <p className="text-xs text-slate-400 mt-1">Learn from any website</p>
                    </div>

                    {/* YouTube Card */}
                    <div onClick={openYoutubeModal} className="bg-slate-50 rounded-2xl p-5 border-2 border-dashed border-slate-300 hover:border-red-400 hover:bg-red-50/50 cursor-pointer transition-all text-center col-span-2">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Youtube className="w-6 h-6 text-red-600" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">YouTube Video</p>
                      <p className="text-xs text-slate-400 mt-1">Summarize & ask questions about any YouTube video</p>
                    </div>
                  </div>

                  <div className="w-20 h-20 bg-secondary-100 rounded-2xl flex items-center justify-center mb-4">
                    <Bot className="w-10 h-10 text-secondary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Study Mate AI Assistant</h3>
                  <p className="text-slate-500 max-w-md">
                    Upload a PDF, paste a web link, or just ask me anything. I'll help you learn!
                  </p>
                </div>
              ) : activeChat.messages.map(message => (
                <ChatMessage key={message._id} message={message} />
              ))}
              {isTyping && <ChatMessage message={{ role: 'assistant' }} isTyping />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-end gap-2">
                {/* PDF Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-colors disabled:opacity-50 flex-shrink-0"
                  title="Upload PDF"
                >
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                </button>

                {/* Web Scrape Button */}
                <button
                  onClick={openWebModal}
                  className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors flex-shrink-0"
                  title="Scrape Web Page"
                >
                  <Globe size={18} />
                </button>

                {/* YouTube Button */}
                <button
                  onClick={openYoutubeModal}
                  className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors flex-shrink-0"
                  title="YouTube Summarizer"
                >
                  <Youtube size={18} />
                </button>

                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={
                      linkedVideo ? `Ask anything about "${linkedVideo.title}"...` :
                      scrapedWeb ? `Ask anything about "${scrapedWeb.title}"...` :
                      uploadedPdf ? `Ask anything about ${uploadedPdf.name}...` :
                      'Ask me anything...'
                    }
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

              {!hasContext && activeChat.messages?.length > 0 && (
                <p className="text-xs text-slate-400 mt-2 text-center">
                  💡 Tip: Upload a PDF or paste a web link for more accurate answers
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-secondary-100 rounded-3xl flex items-center justify-center mb-4">
              <Bot className="w-12 h-12 text-secondary-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Welcome to Study Mate AI</h3>
            <p className="text-slate-500 max-w-md mb-6">
              Upload a PDF, paste a web link, or just start chatting. Powered by Groq AI.
            </p>
            <div className="flex gap-3">
              <button onClick={startNewChatWithPdf} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors">
                <Upload size={18} /> Upload PDF
              </button>
              <button onClick={startNewChatWithWeb} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
                <Globe size={18} /> Scrape Web Page
              </button>
              <button onClick={openYoutubeModal} className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors">
                <Youtube size={18} /> YouTube
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chatbot
