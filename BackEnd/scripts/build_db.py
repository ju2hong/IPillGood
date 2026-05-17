import json
import time
from pathlib import Path
from tqdm import tqdm

from embed import create_embeddings
from vector_store import add_documents

# 실행 위치와 상관없이 scripts 폴더 기준 상위의 data 폴더를 잡도록 변경
BASE_DIR = Path(__file__).resolve().parent.parent
JSONL_PATH = BASE_DIR / "data" / "processed_data" / "rag_health_supplements_preprocessed.jsonl"

# JSONL 파일 로드
def load_jsonl(path):
    rows = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            rows.append(json.loads(line))
    return rows

# Vector DB 구축
def build_vector_db(rows, batch_size=100):
    total = len(rows)

    # batch 단위로 반복
    for start_idx in tqdm(range(0, total, batch_size)):
        batch = rows[start_idx:start_idx + batch_size]

        ids = [row["id"] for row in batch]
        documents = [row["text"] for row in batch]
        
        # ChromaDB 메타데이터 안정화 작업
        metadatas = []
        for row in batch:
            meta = row["metadata"].copy()
            # 메타데이터 내부에 파싱되어 있는 nutrients 리스트는 ChromaDB 원시 타입(str, int, float 등)이 아니므로
            # 안전하게 json string 문자로 변환하여 저장합니다. (나중에 꺼내서 json.loads로 복원 가능)
            if "nutrients" in meta:
                meta["nutrients"] = json.dumps(meta["nutrients"], ensure_ascii=False)
            metadatas.append(meta)
# 💡 예외 처리 및 자동 재시도 로직 추가
        while True:
            try:
                # Gemini Embedding 생성
                embeddings = create_embeddings(documents)

                # ChromaDB 저장
                add_documents(
                    ids=ids,
                    documents=documents,
                    metadatas=metadatas,
                    embeddings=embeddings
                )
                
                # 💡 구글 무료 제한을 피하기 위해 한 번 보낼 때마다 3초씩 안전하게 쉽니다.
                time.sleep(3.0)
                break  # 성공하면 다음 배치(루프)로 이동
                
            except Exception as e:
                # 만약 또 429 제한에 걸리면 서버가 풀릴 때까지 잠시 대기 후 자동 재시도합니다.
                if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                    print("\n⚠️ 구글 API 속도 제한 감지! 20초간 대기 후 자동으로 이어서 시작합니다...")
                    time.sleep(20)
                    continue
                else:
                    print(f"\n❌ 기타 에러 발생: {e}")
                    return

    print("=== Vector DB 구축 완료 ===")


if __name__ == "__main__":
    rows = load_jsonl(JSONL_PATH)
    print(f"문서 수: {len(rows)}")
    build_vector_db(rows)