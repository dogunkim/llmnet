export interface Chunk {
  content: string;
  index: number;
}

export function splitText(
  text: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200,
): Chunk[] {
  const chunks: Chunk[] = [];
  let startIndex = 0;

  // Simple splitting by characters with overlap
  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;

    // If not at the end, try to find the nearest paragraph or sentence break
    if (endIndex < text.length) {
      const remainingText = text.substring(startIndex, endIndex + 100);
      const lastBreak = remainingText.lastIndexOf("\n\n");
      const lastSentence = remainingText.lastIndexOf(". ");

      if (lastBreak > chunkSize * 0.5) {
        endIndex = startIndex + lastBreak;
      } else if (lastSentence > chunkSize * 0.5) {
        endIndex = startIndex + lastSentence + 1;
      }
    }

    chunks.push({
      content: text.substring(startIndex, endIndex).trim(),
      index: chunks.length,
    });

    startIndex = endIndex - chunkOverlap;

    // Safety break to prevent infinite loops if overlap is too large
    if (startIndex >= text.length || endIndex >= text.length) break;
  }

  return chunks.filter((c) => c.content.length > 0);
}
