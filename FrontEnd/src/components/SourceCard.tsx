// ============================================================
// SourceCard.tsx
// RAG 검색 결과로 반환된 참고 제품 정보를 카드 형태로 표시하는 컴포넌트
// 제품명, 대표 성분, 제조사, 원산지, 섭취량, 출처 등을 렌더링
// ============================================================

import type { SourceItem } from '../api/chat';

interface Props {
  source: SourceItem; // 백엔드에서 반환된 제품 메타데이터
  index: number;      // 검색 순위 (0부터 시작, 표시 시 +1)
}

export default function SourceCard({ source, index }: Props) {
  return (
    <div className="source-card">
      {/* 검색 순위 배지 (1, 2, 3 순위) */}
      <div className="source-card__badge">{index + 1}</div>
      <div className="source-card__body">
        {/* 제품명 */}
        <p className="source-card__name">{source.product_name}</p>
        {/* 대표 성분명 */}
        <p className="source-card__ingredient">{source.representative_ingredient}</p>
        <div className="source-card__meta">
          {/* 값이 있을 때만 조건부 렌더링 */}
          {source.manufacturer && (
            <span className="source-card__tag">🏭 {source.manufacturer}</span>
          )}
          {source.origin_country && (
            <span className="source-card__tag">🌏 {source.origin_country}</span>
          )}
          {source.serving_size && (
            <span className="source-card__tag">💊 {source.serving_size}</span>
          )}
        </div>
        {/* 공공데이터 출처 표시 */}
        <p className="source-card__provider">출처: {source.source_name}</p>
      </div>
    </div>
  );
}
