# Narrative - AI-Powered Language Learning App

Narrative is an intelligent language learning application that helps you extract and track vocabulary from your tutoring sessions. Upload diarized transcripts of your language lessons, and our AI will automatically identify the words and phrases your teacher taught you.

## Features

- 📝 **Upload Diarized Transcripts** - Upload transcripts with speaker labels (Teacher/Student)
- 🤖 **AI-Powered Extraction** - Intelligent identification of taught vocabulary using pattern matching and heuristics
- 📚 **Vocabulary Management** - Track which words you know vs. still learning
- 💡 **Confidence Scoring** - Each extracted word comes with a confidence score (high/medium/low)
- 🎯 **Context Preservation** - See the exact context where each word was used
- ✅ **One-Click Addition** - Add extracted words to your vocabulary list instantly

## How It Works

1. **Upload Your Transcript** - Paste a diarized transcript in the format:
   ```
   Teacher: [text]
   Student: [text]
   ```

2. **AI Extracts Vocabulary** - The system uses multiple strategies:
   - Pattern matching for explicit teaching moments (e.g., "this means...", "in Spanish we say...")
   - Repetition detection (words the teacher emphasizes)
   - Unknown word identification (words not in your vocabulary list)

3. **Review & Add** - Review extracted words with confidence scores and add them to your vocabulary list

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM with SQLite (easily upgradeable to PostgreSQL)
- **AI/NLP**: Pattern matching with extensibility for OpenAI integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd narrative-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run database migrations
   npx prisma db push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The app uses four main models:

- **VocabularyItem** - Your personal vocabulary list
- **Transcript** - Uploaded tutoring session transcripts
- **TranscriptLine** - Individual lines of conversation
- **ExtractedItem** - Words/phrases extracted from transcripts

## Transcript Format

Transcripts should be in a simple diarized format:

```
Teacher: Hello! Today we'll learn about food vocabulary.
Student: Great, I need to learn this.
Teacher: Let's start with "manzana". This word means "apple" in Spanish.
Student: Manzana... got it!
Teacher: Perfect! Now try to use it in a sentence.
```

Each line should start with a speaker label followed by a colon. Common speaker labels:
- Teacher / Tutor / Instructor
- Student / Learner / Me

## API Endpoints

### Vocabulary
- `GET /api/vocabulary` - Get all vocabulary items (filter by language, isKnown)
- `POST /api/vocabulary` - Create a new vocabulary item
- `GET /api/vocabulary/:id` - Get a single vocabulary item
- `PATCH /api/vocabulary/:id` - Update a vocabulary item
- `DELETE /api/vocabulary/:id` - Delete a vocabulary item

### Transcripts
- `GET /api/transcripts` - Get all transcripts
- `POST /api/transcripts` - Upload and process a new transcript
- `GET /api/transcripts/:id` - Get a single transcript with all details
- `DELETE /api/transcripts/:id` - Delete a transcript
- `PATCH /api/transcripts/:id/extracted` - Mark extracted item as added to vocab

## Extraction Algorithm

The vocabulary extraction service uses three main strategies:

1. **Pattern-Based Extraction** (High Confidence)
   - Detects explicit teaching patterns like:
     - "X means Y"
     - "In [language] we say X"
     - "The word for X is Y"
     - Corrections: "Not X, but Y"

2. **Repetition-Based Extraction** (Medium Confidence)
   - Identifies words the teacher uses multiple times (default: 3+)
   - Filters out common words (articles, pronouns, etc.)

3. **Unknown Word Detection** (Low Confidence)
   - Finds words the teacher uses that aren't in your vocabulary list
   - Useful for discovering vocabulary gaps

## Customization

### Adding More Teaching Patterns

Edit `lib/extractionService.ts` and add patterns to the `TEACHING_PATTERNS` array:

```typescript
const TEACHING_PATTERNS = [
  // Add your custom pattern
  /your\s+pattern\s+here/gi,
  // ...existing patterns
];
```

### Changing Confidence Thresholds

Adjust the `minOccurrences` parameter in the extraction service to change how many repetitions are needed for medium confidence.

### Database Migration to PostgreSQL

To upgrade from SQLite to PostgreSQL:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/narrative"
   ```

3. Run migrations:
   ```bash
   npx prisma db push
   ```

## Future Enhancements

- Real-time transcription integration (Zoom/Facetime plugins)
- Spaced repetition system for vocabulary review
- AI-powered translations using OpenAI/Claude
- Audio file upload with automatic transcription
- Flashcard generation from extracted vocabulary
- Progress tracking and learning analytics
- Multi-language support with language detection
- Export vocabulary to Anki, Quizlet, etc.

## Development

### Running Prisma Studio

To view and edit your database:

```bash
npx prisma studio
```

### Type Generation

After modifying the Prisma schema:

```bash
npx prisma generate
```

### Building for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your language learning journey!
