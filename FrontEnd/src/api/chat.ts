// ============================================================
// chat.ts
// 백엔드 API와의 통신을 담당하는 모듈
// POST /api/recommend 엔드포인트로 질문을 전송하고 답변을 반환
// Vite 프록시 설정(vite.config.ts)을 통해 CORS 없이 백엔드와 연결
// ============================================================

// 백엔드 응답 타입 정의 - answer 필드만 포함
export interface ChatResponse {
  answer: string;
}

// 사용자 질문을 백엔드로 전송하고 AI 답변을 반환하는 함수
export async function sendMessage(message: string): Promise<ChatResponse> {
  const response = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: message }), // 백엔드 ChatRequest 스키마에 맞게 query 키로 전송
  });

  // 응답 실패 시 백엔드의 detail 메시지를 그대로 에러로 전달
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.detail ?? `서버 오류 (${response.status})`);
  }

  return response.json();
}
