// ============================================================
// ChatMessage.tsx
// 단일 채팅 메시지를 렌더링하는 컴포넌트
// role이 'user'인지 'assistant'인지에 따라 레이아웃과 스타일을 분기 처리
// ============================================================

// 메시지 데이터 구조 타입 정의 (ChatWindow에서도 공유)
export interface Message {
  id: string;
  role: 'user' | 'assistant'; // 발신자 역할: 사용자 or AI
  content: string;
  isError?: boolean; // 에러 메시지 여부 (에러 스타일 적용)
}

interface Props {
  message: Message;
}

export default function ChatMessage({ message }: Props) {
  // role에 따라 레이아웃 방향과 아바타 위치를 결정
  const isUser = message.role === 'user';

  return (
    <div className={`chat-message chat-message--${isUser ? 'user' : 'assistant'}`}>
      {/* AI 아바타: assistant일 때만 왼쪽에 표시 */}
      {!isUser && (
        <div className="chat-message__avatar">
          <span>💊</span>
        </div>
      )}

      <div className="chat-message__bubble-wrap">
        {/* 에러 여부에 따라 버블 스타일 분기 */}
        <div
          className={`chat-message__bubble ${message.isError ? 'chat-message__bubble--error' : ''}`}
        >
          {/* 줄바꿈(\n) 문자를 <br> 태그로 변환하여 렌더링 */}
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>
      </div>

      {/* 유저 아바타: user일 때만 오른쪽에 표시 */}
      {isUser && (
        <div className="chat-message__avatar chat-message__avatar--user">
          <span>👤</span>
        </div>
      )}
    </div>
  );
}
