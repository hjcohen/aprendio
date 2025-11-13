/**
 * Service for extracting taught vocabulary from transcripts
 * Uses pattern matching and heuristics to identify teaching moments
 */

export interface TranscriptLine {
  speaker: string;
  text: string;
  timestamp?: string;
}

export interface ExtractedWord {
  word: string;
  context: string;
  speaker: string;
  confidence: 'high' | 'medium' | 'low';
  extractionReason: string;
}

/**
 * Teaching patterns that indicate explicit instruction
 * These are strong signals that vocabulary is being taught
 */
const TEACHING_PATTERNS = [
  // Direct definitions
  /(?:this|that|it)\s+means?\s+["']?([^"'.,]+)["']?/gi,
  /["']([^"']+)["']?\s+means?\s+["']?([^"'.,]+)["']?/gi,

  // Translations
  /in\s+\w+\s+(?:we\s+)?(?:say|call)\s+["']?([^"'.,]+)["']?/gi,
  /(?:we\s+)?say\s+["']?([^"'.,]+)["']?\s+in\s+\w+/gi,
  /the\s+word\s+for\s+.+\s+is\s+["']?([^"'.,]+)["']?/gi,

  // Corrections and emphasis
  /not?\s+["']?([^"'.,]+)["']?,?\s+(?:but|rather)\s+["']?([^"'.,]+)["']?/gi,
  /(?:you\s+should\s+say|try\s+saying|better\s+to\s+say)\s+["']?([^"'.,]+)["']?/gi,

  // Examples and usage
  /for\s+example[,:]?\s+["']?([^"'.,]+)["']?/gi,
  /(?:like|such\s+as)\s+["']?([^"'.,]+)["']?/gi,
];

/**
 * Words that are too common to be considered learned vocabulary
 * These should be filtered out unless explicitly taught
 */
const COMMON_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'should', 'could', 'may', 'might', 'can', 'shall', 'must',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
  'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'this', 'that', 'these', 'those', 'what', 'which', 'who', 'when',
  'where', 'why', 'how', 'yes', 'no', 'not', 'so', 'than', 'very',
  'just', 'now', 'here', 'there', 'well', 'also', 'too', 'only',
]);

/**
 * Extract words using pattern matching for explicit teaching moments
 */
function extractByPatterns(lines: TranscriptLine[]): ExtractedWord[] {
  const extracted: ExtractedWord[] = [];

  lines.forEach((line) => {
    if (line.speaker.toLowerCase() !== 'teacher') return;

    TEACHING_PATTERNS.forEach((pattern) => {
      const matches = line.text.matchAll(pattern);
      for (const match of matches) {
        // Extract the taught word/phrase (usually in capture group 1)
        const word = match[1]?.trim();
        if (word && word.length > 1 && !COMMON_WORDS.has(word.toLowerCase())) {
          extracted.push({
            word,
            context: line.text,
            speaker: line.speaker,
            confidence: 'high',
            extractionReason: 'Explicit teaching pattern detected',
          });
        }
      }
    });
  });

  return extracted;
}

/**
 * Extract words that appear multiple times in teacher's speech
 * Repetition often indicates emphasis on vocabulary
 */
function extractByRepetition(lines: TranscriptLine[], minOccurrences = 3): ExtractedWord[] {
  const teacherLines = lines.filter(l => l.speaker.toLowerCase() === 'teacher');
  const wordCounts = new Map<string, { count: number; contexts: string[] }>();

  teacherLines.forEach((line) => {
    // Extract words (simple tokenization)
    const words = line.text
      .toLowerCase()
      .replace(/[^\w\s'-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !COMMON_WORDS.has(w));

    words.forEach((word) => {
      const current = wordCounts.get(word) || { count: 0, contexts: [] };
      current.count++;
      if (current.contexts.length < 3) {
        current.contexts.push(line.text);
      }
      wordCounts.set(word, current);
    });
  });

  const extracted: ExtractedWord[] = [];
  wordCounts.forEach((data, word) => {
    if (data.count >= minOccurrences) {
      extracted.push({
        word,
        context: data.contexts[0],
        speaker: 'teacher',
        confidence: 'medium',
        extractionReason: `Repeated ${data.count} times by teacher`,
      });
    }
  });

  return extracted;
}

/**
 * Extract words that are NOT in the user's known vocabulary
 */
function extractUnknownWords(
  lines: TranscriptLine[],
  knownWords: Set<string>
): ExtractedWord[] {
  const teacherLines = lines.filter(l => l.speaker.toLowerCase() === 'teacher');
  const extracted: ExtractedWord[] = [];
  const seenWords = new Set<string>();

  teacherLines.forEach((line) => {
    const words = line.text
      .toLowerCase()
      .replace(/[^\w\s'-]/g, ' ')
      .split(/\s+/)
      .filter(w =>
        w.length > 3 &&
        !COMMON_WORDS.has(w) &&
        !knownWords.has(w) &&
        !seenWords.has(w)
      );

    words.forEach((word) => {
      seenWords.add(word);
      extracted.push({
        word,
        context: line.text,
        speaker: 'teacher',
        confidence: 'low',
        extractionReason: 'Not in vocabulary list',
      });
    });
  });

  return extracted;
}

/**
 * Main extraction function that combines all strategies
 */
export function extractVocabulary(
  lines: TranscriptLine[],
  knownWords: string[] = []
): ExtractedWord[] {
  const knownWordSet = new Set(knownWords.map(w => w.toLowerCase()));

  // Combine results from different extraction strategies
  const patternBased = extractByPatterns(lines);
  const repetitionBased = extractByRepetition(lines);
  const unknownWords = extractUnknownWords(lines, knownWordSet);

  // Deduplicate by word (keeping highest confidence)
  const wordMap = new Map<string, ExtractedWord>();

  const confidenceScore = { high: 3, medium: 2, low: 1 };

  [...patternBased, ...repetitionBased, ...unknownWords].forEach((item) => {
    const existing = wordMap.get(item.word.toLowerCase());
    if (!existing || confidenceScore[item.confidence] > confidenceScore[existing.confidence]) {
      wordMap.set(item.word.toLowerCase(), item);
    }
  });

  return Array.from(wordMap.values()).sort((a, b) =>
    confidenceScore[b.confidence] - confidenceScore[a.confidence]
  );
}

/**
 * Parse a simple diarized transcript format
 * Expected format:
 * [Speaker]: Text
 * or
 * Speaker: Text
 */
export function parseTranscript(content: string): TranscriptLine[] {
  const lines = content.split('\n').filter(l => l.trim());
  const parsed: TranscriptLine[] = [];

  lines.forEach((line, index) => {
    // Match patterns like "[Teacher]: ..." or "Teacher: ..."
    const match = line.match(/^\[?(\w+)\]?:\s*(.+)$/);
    if (match) {
      const [, speaker, text] = match;
      parsed.push({
        speaker: speaker.trim(),
        text: text.trim(),
      });
    }
  });

  return parsed;
}
