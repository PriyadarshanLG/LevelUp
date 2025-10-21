import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, User, Minimize2, Volume2, VolumeX } from 'lucide-react'
import { chatbotAPI, APIError } from '../utils/api'
import type { ChatMessage } from '../utils/api'
import EmojiPicker from 'emoji-picker-react'

interface ChatbotProps {
  courseContext?: {
    courseId?: string
    courseTitle?: string
    currentTopic?: string
  }
  showLauncher?: boolean
}

const Chatbot: React.FC<ChatbotProps> = ({ courseContext, showLauncher = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [, setError] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const MAX_MESSAGE_LENGTH = 500

  // TTS function
  const speak = (text: string) => {
    if (!isSpeechEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const cancelSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Minimal markdown renderer: supports **bold** and bullet lists starting with '*' or '-'
  const renderInlineBold = (text: string): React.ReactNode[] => {
    const result: React.ReactNode[] = []
    const regex = /\*\*(.+?)\*\*/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push(text.slice(lastIndex, match.index))
      }
      result.push(<strong key={result.length}>{match[1]}</strong>)
      lastIndex = regex.lastIndex
    }
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex))
    }
    return result
  }

  const renderMessageContent = (content: string): React.JSX.Element => {
    const lines = content.split(/\r?\n/)
    const elements: React.ReactNode[] = []
    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      if (/^\s*[\*-]\s+/.test(line)) {
        const items: React.ReactNode[] = []
        while (i < lines.length && /^\s*[\*-]\s+/.test(lines[i])) {
          const itemText = lines[i].replace(/^\s*[\*-]\s+/, '')
          items.push(<li key={`li-${i}`}>{renderInlineBold(itemText)}</li>)
          i++
        }
        elements.push(
          <ul key={`ul-${i}`} className="list-disc pl-5 space-y-1 text-sm">
            {items}
          </ul>
        )
        continue
      }
      if (line.trim().length > 0) {
        elements.push(
          <p key={`p-${i}`} className="text-sm leading-relaxed">
            {renderInlineBold(line)}
          </p>
        )
      }
      i++
    }
    return <>{elements}</>
  }

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Listen for global open event from GlobalAINovaButton
  useEffect(() => {
    const handler = () => {
      setIsOpen(true)
      setIsMinimized(false)
    }
    window.addEventListener('open-ainova', handler)
    return () => window.removeEventListener('open-ainova', handler)
  }, [])

  // Notify others when chat opens/closes
  useEffect(() => {
    if (isOpen && !isMinimized) {
      window.dispatchEvent(new Event('ainova-open'))
    } else {
      window.dispatchEvent(new Event('ainova-close'))
    }
  }, [isOpen, isMinimized])

  // Load suggestions when component mounts
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const response = await chatbotAPI.getSuggestions(courseContext?.courseTitle)
        if (response.success) {
          setSuggestions(response.data.suggestions)
        }
      } catch (error) {
        console.error('Failed to load suggestions:', error)
      }
    }

    if (isOpen && suggestions.length === 0) {
      loadSuggestions()
    }
  }, [isOpen, courseContext?.courseTitle, suggestions.length])

  // Send welcome message when opening
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: courseContext?.courseTitle 
          ? `Hello! I'm AI Nova, your LevelUp AI assistant. I'm here to help you with "${courseContext.courseTitle}". What would you like to know?`
          : "Hello! I'm AI Nova, your LevelUp AI assistant. I'm here to help you with your learning journey. What can I assist you with today?",
        timestamp: new Date().toISOString()
      }
      setMessages([welcomeMessage])
      speak(welcomeMessage.content);
    }
  }, [isOpen, messages.length, courseContext?.courseTitle])

  // Speak the latest message if it's from the assistant
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      speak(lastMessage.content);
    }
  }, [messages]);

  // Cleanup speech on close
  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return
    cancelSpeech();

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await chatbotAPI.sendMessage(
        inputMessage,
        messages,
        courseContext
      )

      if (response.success) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: response.data.timestamp
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      let errorMessage = 'Sorry, I encountered an error. Please try again.'
      
      if (error instanceof APIError) {
        errorMessage = error.message
      }

      setError(errorMessage)
      
      const errorResponse: ChatMessage = {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    cancelSpeech();
    setMessages([])
    setError(null)
    // Re-add welcome message
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: courseContext?.courseTitle 
        ? `Hello! I'm AI Nova, your LevelUp AI assistant. I'm here to help you with "${courseContext.courseTitle}". What would you like to know?`
        : "Hello! I'm AI Nova, your LevelUp AI assistant. I'm here to help you with your learning journey. What can I assist you with today?",
      timestamp: new Date().toISOString()
    }
    setMessages([welcomeMessage])
    speak(welcomeMessage.content)
  }

  return (
    <>
      {/* Floating Chat Button or Minimized Chat */}
      {showLauncher && (!isOpen || isMinimized) && (
        <button
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
          }}
          className={`fixed bottom-6 right-6 ${
            isMinimized 
              ? 'w-auto px-4 rounded-full'
              : 'w-14 h-14 rounded-full'
          } bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-pink-600 text-white shadow-lg hover:shadow-[0_12px_35px_rgba(168,85,247,0.45)] transition-all duration-300 flex items-center justify-center z-50 space-x-2`}
          aria-label="Open AI Assistant"
        >
          <MessageSquare size={24} />
          {isMinimized && (
            <span className="text-sm font-medium">Restore AI Nova</span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-96 sm:h-[32rem] bg-white/95 dark:bg-gray-900/95 border border-zara-lightsilver rounded-2xl shadow-2xl flex flex-col z-50 backdrop-blur-sm overflow-hidden">
          {/* Glow border */}
          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/30 to-pink-500/30 opacity-60"></div>
          {/* Header */}
          <div className="relative flex items-center justify-between p-4 border-b border-zara-lightsilver bg-gradient-to-r from-indigo-50 via-fuchsia-50 to-pink-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 text-white flex items-center justify-center shadow-sm">
                <Bot size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-zara-black text-sm">AI Nova</h3>
                {courseContext?.courseTitle && (
                  <p className="text-xs text-zara-gray font-light">
                    {courseContext.courseTitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                className="p-2 rounded-lg text-zara-gray hover:text-zara-charcoal hover:bg-white/70 transition-all duration-200"
                title={isSpeechEnabled ? "Disable speech" : "Enable speech"}
              >
                {isSpeechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={clearChat}
                className="p-2 rounded-lg text-zara-gray hover:text-zara-charcoal hover:bg-white/70 transition-all duration-200"
                title="Clear chat"
              >
                <X size={16} />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 rounded-lg text-zara-gray hover:text-zara-charcoal hover:bg-white/70 transition-all duration-200"
                title="Minimize chat"
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  cancelSpeech();
                }}
                className="p-2 rounded-lg text-zara-gray hover:text-zara-charcoal hover:bg-white/70 transition-all duration-200"
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white/40 to-transparent dark:from-gray-900/40">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-xl text-sm font-light transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-indigo-500/20'
                      : 'bg-white/90 text-zara-charcoal border border-zara-lightsilver hover:bg-white'
                  }`}
                >
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <Bot size={16} className="mt-1 flex-shrink-0 text-zara-gray" />
                      )}
                      {message.role === 'user' && (
                        <User size={16} className="mt-1 flex-shrink-0 text-white" />
                      )}
                      <div className="whitespace-pre-wrap break-words">
                        {renderMessageContent(message.content)}
                      </div>
                    </div>
                    <div className="text-xs text-zara-gray font-light ml-6">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/90 border border-zara-lightsilver px-3 py-2 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Bot size={16} className="text-zara-gray" />
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-zara-gray animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-zara-gray animate-bounce" style={{ animationDelay: '120ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-zara-gray animate-bounce" style={{ animationDelay: '240ms' }}></span>
                    </span>
                    <span className="text-sm font-light text-zara-gray">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions (show only when no messages except welcome) */}
            {messages.length <= 1 && suggestions.length > 0 && !isLoading && (
              <div className="space-y-2">
                <p className="text-xs text-zara-gray font-light">Suggested questions:</p>
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="block w-full text-left text-xs text-zara-charcoal bg-white/90 hover:bg-white border border-zara-lightsilver rounded-lg px-3 py-2 transition-all duration-200 font-medium hover:shadow hover:-translate-y-0.5"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zara-lightsilver bg-white/70 dark:bg-gray-900/70">
            <div className="relative">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                        setInputMessage(e.target.value)
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="w-full px-3 py-2 text-sm font-light border border-zara-lightsilver rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors duration-200 bg-white text-zara-charcoal placeholder-zara-lightgray pr-16 shadow-sm"
                    disabled={isLoading}
                  />
                  <div className="absolute right-2 top-2 flex items-center space-x-2">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-zara-gray hover:text-zara-charcoal transition-colors duration-200"
                      type="button"
                    >
                      😊
                    </button>
                    <span className="text-xs text-zara-gray">
                      {inputMessage.length}/{MAX_MESSAGE_LENGTH}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-600 hover:from-indigo-700 hover:via-fuchsia-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 shadow hover:shadow-[0_10px_24px_rgba(168,85,247,0.35)]"
                >
                  <Send size={16} />
                </button>
              </div>
              
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2">
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => {
                      if (inputMessage.length < MAX_MESSAGE_LENGTH) {
                        setInputMessage(prev => prev + emojiObject.emoji)
                      }
                      setShowEmojiPicker(false)
                    }}
                    width={280}
                    height={400}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot
