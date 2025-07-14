# PromptBuilder

PromptBuilder is a full-stack web application that allows users to generate optimized video prompts for multiple AI video generation models including Google Veo 3, Flow, Runway, and Pika.

🌐 **Live Demo**: [https://Eli45-23.github.io/prompt](https://Eli45-23.github.io/prompt)

## Features

- **Multi-Model Support**: Generate prompts for Veo 3, Flow, Runway, and Pika
- **Live Preview**: Real-time prompt updates as you type and adjust parameters
- **Advanced Customization**: Fine-tune visual style, camera movement, lighting, audio, and more
- **Template Library**: Built-in templates for quick start
- **History & Favorites**: Save and organize your generated prompts
- **Export & Sharing**: Export to Markdown, copy shareable links
- **AI Refinement**: Refine prompts with AI assistance
- **Dark/Light Mode**: Toggle between themes
- **PWA Support**: Offline functionality and mobile app experience
- **Glass Morphism UI**: Modern, beautiful interface with neon gradients

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/promptbuilder.git
   cd promptbuilder
   ```

2. Install dependencies:

   ```bash
   npm install
   # or yarn install
   ```

3. Create a `.env.local` file in the root directory and add your API key:

   ```
   PROMPT_ENGINE_API_KEY=your_api_key_here
   ```

   Replace `your_api_key_here` with your actual API key for calling a prompt-engine service.

### Running the Development Server

To run the application in development mode:

```bash
npm run dev
# or yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

To build the application for production:

```bash
npm run build
# or yarn build
```

### Running Production Build

To start the production server:

```bash
npm run start
# or yarn start
```

## How to Update Prompt Templates

The prompt templates are located in `src/lib/generatePrompt.ts`. You can modify the `veo3Template` and `flowTemplate` strings to update the prompt generation logic. The templates are designed to be easily extensible. When new features or best practices are introduced, you can add new sections to the templates.

For example, if a new parameter for controlling the "emotional tone" is added, you could add a new line to the templates like:

```
Emotional Tone: {emotional_tone}
```

Then, you would need to update the `promptFragments` object and the `generatePrompt` function to handle the new parameter.

## Testing

To run the tests:

```bash
npm test
# or yarn test
```

## Deployment

### GitHub Pages (Current)

This project is automatically deployed to GitHub Pages using GitHub Actions. The workflow is defined in `.github/workflows/ci.yml`.

**Live URL**: [https://Eli45-23.github.io/prompt](https://Eli45-23.github.io/prompt)

#### Manual Deployment

To manually deploy to GitHub Pages:

```bash
npm run deploy
```

This will build the project and push the static files to the `gh-pages` branch.

#### Setting up GitHub Pages

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "Deploy from a branch"
4. Choose "gh-pages" branch and "/ (root)" folder
5. Save the settings

### Local Development Deployment

For local testing of the production build:

```bash
npm run build
npm run start
```

## CI/CD Pipeline

The GitHub Actions workflow includes:

- **Code Quality**: Linting and type-checking with ESLint and TypeScript
- **Testing**: Unit and integration tests with Jest and React Testing Library
- **Build**: Next.js static export optimized for GitHub Pages
- **Deploy**: Automatic deployment to GitHub Pages on push to `main` branch

## Environment Variables

Create a `.env.local` file for local development:

```bash
# Optional: For future API integrations
NEXT_PUBLIC_API_URL=your_api_url_here
```