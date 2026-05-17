import os
from dotenv import load_dotenv
import google.generativeai as genai # 구버전 gemini
#from google import genai
#from google.genai import types

# .env 파일의 API KEY 로드
load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")

# Gemini 최신 클라이언트 생성
#client = genai.Client(api_key=api_key)
genai.configure(api_key=api_key)

# 사용할 Gemini 최신 임베딩 모델
EMBEDDING_MODEL = "models/gemini-embedding-001"

# 단일 텍스트 임베딩 생성 (유저 질문 검색용 등)
def create_embedding(text: str):
    response = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
        task_type="retrieval_query" # 검색 쿼리용 태그 권장
        
    )
    # 단일 임베딩의 경우 바로 list[float]를 꺼내어 반환합니다.
    return response['embedding']

# 여러 텍스트를 한 번에 임베딩 생성 (배치 학습 및 DB 구축용)
def create_embeddings(texts: list[str]):
    response = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=texts,
        task_type="retrieval_document" 
        
    )
    # 각 문서의 임베딩 벡터 배열 리스트 반환
    return response['embedding']