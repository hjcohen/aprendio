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
  // Instructional / meta-language a tutor uses to explain things in the
  // student's own language — not target-language vocabulary being taught.
  'mean', 'means', 'word', 'words', 'say', 'says', 'said', 'saying',
  'let', 'lets', 'try', 'use', 'used', 'using', 'example', 'sentence',
  'verb', 'verbs', 'noun', 'nouns', 'remember', 'repeat', 'again',
  'okay', 'right', 'good', 'great', 'perfect', 'exactly', 'excellent',
  'correct', 'nice', 'learn', 'learning', 'speak', 'write', 'read',
  'know', 'think', 'make', 'want', 'need', 'like', 'look', 'going',
  'get', 'one', 'two', 'some', 'more', 'most', 'many', 'much', 'about',
  'because', 'then', 'into', 'over', 'temporary', 'state', 'useful',
  'thing', 'things', 'today', 'time', 'understand',
]);

/**
 * Tokenize text into lowercased words, preserving Unicode letters such as
 * accented characters (ñ, é, ü, ç ...). The default `\w` class is ASCII-only,
 * so a naive tokenizer would split "español" into "espa" — disastrous for a
 * language-learning app where accented words are exactly the vocabulary.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s'-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Whether a word contains non-ASCII letters (e.g. ñ, é, ü). Such words are
 * very likely target-language vocabulary rather than the English (or other
 * shared language) the tutor uses to explain things.
 */
function hasNonAsciiLetters(word: string): boolean {
  return /[^\x00-\x7F]/.test(word);
}

/**
 * Pull the individual tokens from any double-quoted spans in the text. Tutors
 * almost always quote the exact word or phrase they are teaching, so quoted
 * tokens are a strong signal of taught vocabulary. Only double/curly quotes
 * are treated as delimiters — apostrophes are left alone so contractions
 * ("let's", "don't") don't get mistaken for quote boundaries.
 */
function extractQuotedTokens(text: string): Set<string> {
  const tokens = new Set<string>();
  for (const match of text.matchAll(/["“”]([^"“”]+)["“”]/g)) {
    tokenize(match[1]).forEach((t) => tokens.add(t));
  }
  return tokens;
}

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
    const words = tokenize(line.text).filter(
      w => w.length > 3 && !COMMON_WORDS.has(w)
    );

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
 * Extract likely target-language vocabulary the teacher used that isn't yet
 * in the student's known list.
 *
 * A transcript is mostly the tutor speaking the *shared* language (e.g.
 * English) to explain things, sprinkled with target-language vocabulary. To
 * avoid flooding the results with that explanatory English, we only keep words
 * that actually look like target-language vocabulary: words containing accented
 * characters, or words the tutor placed in quotes (tutors quote what they
 * teach). This trades a little recall for much higher precision.
 */
function extractUnknownWords(
  lines: TranscriptLine[],
  knownWords: Set<string>
): ExtractedWord[] {
  const teacherLines = lines.filter(l => l.speaker.toLowerCase() === 'teacher');
  const extracted: ExtractedWord[] = [];
  const seenWords = new Set<string>();

  teacherLines.forEach((line) => {
    const quotedTokens = extractQuotedTokens(line.text);

    const words = tokenize(line.text).filter(w =>
      w.length > 2 &&
      !COMMON_WORDS.has(w) &&
      !knownWords.has(w) &&
      !seenWords.has(w) &&
      // Only surface words that look like target-language vocabulary.
      (hasNonAsciiLetters(w) || quotedTokens.has(w))
    );

    words.forEach((word) => {
      seenWords.add(word);
      extracted.push({
        word,
        context: line.text,
        speaker: 'teacher',
        confidence: 'low',
        extractionReason: quotedTokens.has(word)
          ? 'Quoted by the teacher (likely taught)'
          : 'Unfamiliar word not in your vocabulary list',
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
