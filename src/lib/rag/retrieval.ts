import { cheapEmbedding, cosineLikeSimilarity } from './embeddings';
import { buildInMemoryIndex } from './vectorStore';
import { chunkText } from './chunker';

export function retrieveRelevantContext(sourceText: string, query: string, topK = 4): string {
  const chunks = chunkText(sourceText);
  const index = buildInMemoryIndex(chunks);
  const queryEmbedding = cheapEmbedding(query);

  return index
    .map((item) => ({
      ...item,
      score: cosineLikeSimilarity(item.embedding, queryEmbedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item, index) => `Chunk ${index + 1}: ${item.text}`)
    .join('\n\n');
}
