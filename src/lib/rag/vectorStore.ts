import { cheapEmbedding } from './embeddings';

type StoredChunk = {
  id: string;
  text: string;
  embedding: Map<string, number>;
};

export function buildInMemoryIndex(chunks: string[]): StoredChunk[] {
  return chunks.map((text, index) => ({
    id: `chunk-${index + 1}`,
    text,
    embedding: cheapEmbedding(text)
  }));
}
