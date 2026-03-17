export function routeContent(text: string): 'direct' | 'rag-lite' {
  return text.length > 6000 ? 'rag-lite' : 'direct';
}
