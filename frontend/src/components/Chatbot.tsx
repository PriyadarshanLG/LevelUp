import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Loader2, Bot, User } from 'lucide-react'
import { chatbotAPI, APIError } from '../utils/api'
import type { ChatMessage } from '../utils/api'

interface ChatbotProps {
  courseContext?: {
    courseId?: string
    courseTitle?: string
    currentTopic?: string
  }
}

const Chatbot: React.FC<ChatbotProps> = ({ courseContext }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
          ? `Hello! I'm your LearnHub AI assistant. I'm here to help you with "${courseContext.courseTitle}". What would you like to know?`
          : "Hello! I'm your LearnHub AI assistant. I'm here to help you with your learning journey. What can I assist you with today?",
        timestamp: new Date().toISOString()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length, courseContext?.courseTitle])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

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
    setMessages([])
    setError(null)
    // Re-add welcome message
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: courseContext?.courseTitle 
        ? `Hello! I'm your LearnHub AI assistant. I'm here to help you with "${courseContext.courseTitle}". What would you like to know?`
        : "Hello! I'm your LearnHub AI assistant. I'm here to help you with your learning journey. What can I assist you with today?",
      timestamp: new Date().toISOString()
    }
    setMessages([welcomeMessage])
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-zara-black text-zara-white rounded-full shadow-lg hover:bg-zara-charcoal transition-all duration-200 flex items-center justify-center z-50"
          aria-label="Open AI Assistant"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-zara-white border border-zara-lightsilver rounded-lg shadow-xl flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zara-lightsilver">
            <div className="flex items-center space-x-2">
              <Bot size={20} className="text-zara-charcoal" />
              <div>
                <h3 className="font-light text-zara-black text-sm">AI Assistant</h3>
                {courseContext?.courseTitle && (
                  <p className="text-xs text-zara-gray font-light">
                    {courseContext.courseTitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearChat}
                className="text-zara-gray hover:text-zara-charcoal transition-colors duration-200"
                title="Clear chat"
              >
                <X size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zara-gray hover:text-zara-charcoal transition-colors duration-200"
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm font-light ${
                    message.role === 'user'
                      ? 'bg-zara-charcoal text-zara-white'
                      : 'bg-zara-offwhite text-zara-charcoal border border-zara-lightsilver'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <Bot size={16} className="mt-1 flex-shrink-0 text-zara-gray" />
                    )}
                    {message.role === 'user' && (
                      <User size={16} className="mt-1 flex-shrink-0 text-zara-white" />
                    )}
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zara-offwhite border border-zara-lightsilver px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot size={16} className="text-zara-gray" />
                    <Loader2 size={16} className="animate-spin text-zara-gray" />
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
                    className="block w-full text-left text-xs text-zara-charcoal bg-zara-offwhite hover:bg-zara-lightsilver border border-zara-lightsilver rounded px-2 py-1 transition-colors duration-200 font-light"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zara-lightsilver">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 text-sm font-light border border-zara-lightsilver rounded focus:outline-none focus:border-zara-black transition-colors duration-200 bg-zara-white text-zara-charcoal placeholder-zara-lightgray"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-3 py-2 bg-zara-black text-zara-white rounded hover:bg-zara-charcoal transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot
