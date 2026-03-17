import { Document } from '@langchain/core/documents';

export function loadTextDocument(text: string, metadata: Record<string, unknown> = {}) {
  return [
    new Document({
      pageContent: text,
      metadata
    })
  ];
}
