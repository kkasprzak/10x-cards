# Awesome 10x-cards

## Project Description

10x-cards is a fast and efficient application designed to help users quickly create and manage flashcards for learning. It leverages AI to automatically generate flashcards from provided text, while also offering capabilities for manual creation, editing, and deletion. Key features include:

- **Automatic Flashcard Generation:** Paste text and receive AI-suggested question-answer pairs.
- **Manual Flashcard Management:** Create, edit, and delete flashcards as needed.
- **User Authentication:** Secure registration and login functionalities.
- **Spaced Repetition Integration:** Organize learning sessions using a proven spaced repetition algorithm.
- **Statistics & Analytics:** Track the number of generated and approved flashcards.

## Tech Stack

**Frontend:**
- Astro 5
- React 19
- TypeScript 5
- Tailwind CSS 4
- Shadcn/ui

**Backend:**
- Supabase (PostgreSQL, authentication, and backend services)

**AI Integration:**
- Openrouter.ai (access to multiple LLM models for flashcard generation)

**Testing:**
- Vitest + React Testing Library (unit and integration tests)
- Playwright Test (end-to-end tests)
- MSW (API mocking)
- Supabase Local Development (backend testing)
- k6 + Lighthouse CI (performance testing)
- OWASP ZAP, Snyk (security testing)

**CI/CD & Hosting:**
- GitHub Actions for CI/CD pipelines
- Cloudflare Pages for production deployment

## Getting Started Locally

### Prerequisites

- [Node.js (v22.14.0)](https://nodejs.org/) (as specified in `.nvmrc`)
- npm (or yarn)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd 10x-cards
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

Now you can open your browser and navigate to the local server (usually http://localhost:3000) to see the project in action.

## Available Scripts

In the project directory, you can run:

- **`npm run dev`**: Runs the app in development mode.
- **`npm run build`**: Builds the app for production.
- **`npm run preview`**: Serves the production build locally.
- **`npm run astro`**: Runs Astro specific commands.
- **`npm run lint`**: Lints the project files.
- **`npm run lint:fix`**: Automatically fixes linting errors.
- **`npm run format`**: Formats the code using Prettier.

## Project Scope

Based on the PRD, 10x-cards focuses on:

- Simplifying flashcard generation using AI
- Allowing manual flashcard creation and management
- Providing secure user authentication
- Integrating a spaced repetition learning session to optimize study habits
- Collecting statistics on flashcard generation and user interaction

This project targets building a Minimum Viable Product (MVP) that can later be expanded with features such as advanced user analytics, gamification, and collaboration capabilities.

## Project Status

This project is currently in the MVP stage and under active development.

## License

This project is licensed under the [MIT License](LICENSE).
