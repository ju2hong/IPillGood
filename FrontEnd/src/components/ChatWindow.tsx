// ============================================================
// ChatWindow.tsx
// 채팅 UI의 핵심 컴포넌트
// 메시지 상태 관리, 백엔드 API 호출, 로딩 처리, 추천 질문 표시를 담당
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../api/chat';
import ChatMessage, { type Message } from './ChatMessage';

// 초기 화면에 표시할 추천 질문 목록
const SUGGESTED_QUESTIONS = [
  '피로회복에 좋은 영양제 추천해줘',
  '비타민C 영양제 어떤 제품이 있어?',
  '프로바이오틱스 복용 방법 알려줘',
  '오메가3 고르는 기준이 뭐야?',
];

// 메시지 고유 ID 생성기 (React key 충돌 방지)
let idCounter = 0;
const genId = () => `msg-${++idCounter}`;

export default function ChatWindow() {
  // 대화 메시지 목록 상태 (초기값: AI 인사말)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: genId(),
      role: 'assistant',
      content:
        '안녕하세요! 저는 영양제 전문 AI 어시스턴트 IPillGood입니다 💊\n궁금한 영양제 성분, 효능, 복용 방법 등 무엇이든 물어보세요!',
    },
  ]);
  const [input, setInput] = useState('');          // 입력창 텍스트 상태
  const [loading, setLoading] = useState(false);   // API 호출 중 여부

  // 새 메시지가 추가될 때 스크롤을 최하단으로 이동시키기 위한 ref
  const bottomRef = useRef<HTMLDivElement>(null);
  // 전송 후 입력창에 자동 포커스를 복원하기 위한 ref
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 메시지 또는 로딩 상태 변경 시 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // 메시지 전송 처리 함수 (직접 입력 또는 추천 질문 클릭 모두 처리)
  const handleSubmit = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || loading) return; // 빈 입력 또는 로딩 중 재전송 방지

    setInput('');
    // 사용자 메시지를 즉시 UI에 추가
    setMessages((prev) => [
      ...prev,
      { id: genId(), role: 'user', content: question },
    ]);
    setLoading(true);

    try {
      // 백엔드 RAG API 호출
      const data = await sendMessage(question);
      // AI 응답 메시지를 대화 목록에 추가
      setMessages((prev) => [
        ...prev,
        {
          id: genId(),
          role: 'assistant',
          content: data.answer,
        },
      ]);
    } catch (err: unknown) {
      // 에러 발생 시 에러 메시지를 채팅창에 표시
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setMessages((prev) => [
        ...prev,
        {
          id: genId(),
          role: 'assistant',
          content: `⚠️ 오류가 발생했습니다: ${message}`,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus(); // 전송 후 입력창 포커스 자동 복원
    }
  };

  // Enter 키 전송 처리 (Shift+Enter는 줄바꿈으로 허용)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 인사말만 있는 초기 상태 여부 (추천 질문 표시 조건)
  const isOnlyGreeting = messages.length === 1;

  return (
    <div className="chat-window">
      {/* 메시지 목록 영역 */}
      <div className="chat-window__messages">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* API 응답 대기 중 로딩 버블 애니메이션 표시 */}
        {loading && (
          <div className="chat-message chat-message--assistant">
            <div className="chat-message__avatar">
              <span>💊</span>
            </div>
            <div className="chat-message__bubble-wrap">
              <div className="chat-message__bubble chat-message__bubble--loading">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          </div>
        )}

        {/* 초기 화면에서만 추천 질문 버튼 표시 */}
        {isOnlyGreeting && !loading && (
          <div className="suggested-questions">
            <p className="suggested-questions__label">이런 질문을 해보세요</p>
            <div className="suggested-questions__list">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  className="suggested-questions__item"
                  onClick={() => handleSubmit(q)} // 클릭 시 바로 전송
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 스크롤 앵커 */}
        <div ref={bottomRef} />
      </div>

      {/* 메시지 입력 영역 */}
      <div className="chat-window__input-area">
        <textarea
          ref={inputRef}
          className="chat-window__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="영양제에 대해 궁금한 것을 물어보세요... (Enter로 전송)"
          rows={1}
          disabled={loading} // API 호출 중 입력 비활성화
        />
        {/* 전송 버튼: 로딩 중이거나 입력이 비어있으면 비활성화 */}
        <button
          className="chat-window__send"
          onClick={() => handleSubmit()}
          disabled={loading || !input.trim()}
          aria-label="전송"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
