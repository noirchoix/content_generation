import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { loadTextDocument } from '$lib/server/langchain/loaders';

export async function splitTextWithLangChain(
  text: string,
  metadata: Record<string, unknown> = {},
  options: { chunkSize?: number; chunkOverlap?: number } = {}
): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: options.chunkSize ?? 1800,
    chunkOverlap: options.chunkOverlap ?? 250
  });

  const docs = loadTextDocument(text, metadata);
  const splitDocs = await splitter.splitDocuments(docs);
  return splitDocs.map((doc) => doc.pageContent.trim()).filter(Boolean);
}
