import chromadb
from pathlib import Path

# 경로가 꼬이지 않도록 위치를 명시적으로 고정
BASE_DIR = Path(__file__).resolve().parent.parent
CHROMA_DB_DIR = str(BASE_DIR / "chroma_db")
COLLECTION_NAME = "health_supplements"

# 로컬 ChromaDB 연결
chroma_client = chromadb.PersistentClient(
    path=CHROMA_DB_DIR
)

# 컬렉션 생성
collection = chroma_client.get_or_create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"}
)

# 문서 + 임베딩을 Vector DB에 저장
def add_documents(ids, documents, metadatas, embeddings):
    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings
    )

# 유사도 검색
def search(query_embedding, top_k=5):
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    return results