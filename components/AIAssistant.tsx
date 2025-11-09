'use client';

import { useState, useRef, useEffect } from 'react';
import { Plan } from '@/lib/plansData';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedPlans?: string[];
}

interface AIAssistantProps {
  onPlanClick?: (planId: string) => void;
}

export default function AIAssistant({ onPlanClick }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'こんにちは！住宅プラン検索のお手伝いをします。どんなお家をお探しですか？',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // チャットウィンドウを開いたときに入力欄にフォーカス
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // ユーザーメッセージを追加
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // APIに送信
      const conversationHistory = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: conversationHistory.slice(1), // 最初の挨拶メッセージは除外
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: data.message,
            suggestedPlans: data.suggestedPlans,
          },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: `エラーが発生しました: ${data.error}`,
          },
        ]);
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: '申し訳ございません。エラーが発生しました。もう一度お試しください。',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* フローティングボタン */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-dw-blue hover:bg-dw-blue-hover text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 z-50 flex items-center gap-2 group"
          title="AIアシスタント"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-medium">
            AIアシスタント
          </span>
        </button>
      )}

      {/* チャットウィンドウ */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-line-separator flex flex-col z-50">
          {/* ヘッダー */}
          <div className="bg-dw-blue text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <h3 className="font-bold">AIアシスタント</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded p-1 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* メッセージエリア */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-dw-blue text-white'
                      : 'bg-bg-soft text-text-primary'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.suggestedPlans && msg.suggestedPlans.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.suggestedPlans.map((planId) => (
                        <button
                          key={planId}
                          onClick={() => onPlanClick?.(planId)}
                          className="block w-full text-left text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
                        >
                          プランを表示
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-bg-soft rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-text-disable rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-text-disable rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-text-disable rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 入力エリア */}
          <div className="border-t border-line-separator p-4">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="メッセージを入力..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-line-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-line-focused focus:border-transparent disabled:bg-bg-soft disabled:text-text-disable text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="bg-dw-blue hover:bg-dw-blue-hover text-white px-4 py-2 rounded-lg transition-colors disabled:bg-button-disable disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-text-disable mt-2">
              Enterで送信
            </p>
          </div>
        </div>
      )}
    </>
  );
}
