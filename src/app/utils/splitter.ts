export interface Chunk {
  content: string;
  index: number;
}

/**
 * Recursive Character Text Splitter
 * Inspired by LangChain and AiChat
 */
export class RecursiveCharacterTextSplitter {
  private separators: string[];
  private chunkSize: number;
  private chunkOverlap: number;

  constructor(
    chunkSize: number = Number(process.env.CHUNK_SIZE || 700), // 1000
    chunkOverlap: number = Number(process.env.CHUNK_OVERLAP || 150), // 200
    separators: string[] = ["\n\n", "\n", " ", ""],
  ) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
    this.separators = separators;
  }

  splitText(text: string): string[] {
    return this.recursiveSplit(text, this.separators);
  }

  private recursiveSplit(text: string, separators: string[]): string[] {
    const finalChunks: string[] = [];

    // Pick the best separator
    let separator = separators[separators.length - 1]; // Default to last (usually empty string)
    let newSeparators: string[] = [];

    for (let i = 0; i < separators.length; i++) {
      const s = separators[i];
      if (s === "") {
        separator = s;
        break;
      }
      if (text.includes(s)) {
        separator = s;
        newSeparators = separators.slice(i + 1);
        break;
      }
    }

    // Split on the separator
    const splits = text.split(separator).filter((s) => s !== "");

    const goodSplits: string[] = [];
    for (const s of splits) {
      if (s.length < this.chunkSize) {
        goodSplits.push(s);
      } else {
        // Current split is too big
        if (goodSplits.length > 0) {
          const merged = this.mergeSplits(goodSplits, separator);
          finalChunks.push(...merged);
          goodSplits.length = 0;
        }

        if (newSeparators.length === 0) {
          finalChunks.push(s);
        } else {
          const otherInfo = this.recursiveSplit(s, newSeparators);
          finalChunks.push(...otherInfo);
        }
      }
    }

    if (goodSplits.length > 0) {
      const merged = this.mergeSplits(goodSplits, separator);
      finalChunks.push(...merged);
    }

    return finalChunks;
  }

  private mergeSplits(splits: string[], separator: string): string[] {
    const docs: string[] = [];
    const currentDoc: string[] = [];
    let total = 0;

    for (const d of splits) {
      const len = d.length;

      // If adding this split exceeds chunk size
      if (
        total + len + (currentDoc.length > 0 ? separator.length : 0) >
        this.chunkSize
      ) {
        if (currentDoc.length > 0) {
          const doc = currentDoc.join(separator);
          if (doc) docs.push(doc);

          // Keep overlapping chunks
          while (
            total > this.chunkOverlap ||
            (total + len + separator.length > this.chunkSize && total > 0)
          ) {
            const first = currentDoc.shift();
            if (first)
              total -=
                first.length + (currentDoc.length > 0 ? separator.length : 0);
          }
        }
      }

      currentDoc.push(d);
      total += len + (currentDoc.length > 1 ? separator.length : 0);
    }

    const doc = currentDoc.join(separator);
    if (doc) docs.push(doc);

    return docs;
  }
}

export function splitText(
  text: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200,
): Chunk[] {
  const splitter = new RecursiveCharacterTextSplitter(chunkSize, chunkOverlap);
  const result = splitter.splitText(text);
  return result.map((content, index) => ({ content, index }));
}
