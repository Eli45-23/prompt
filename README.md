# PromptBuilder

PromptBuilder is a full-stack web application that allows users to generate optimized video prompts for Google Veo 3 and Flow models based on a simple concept.

## Features

- Generate prompts for Google Veo 3 and Flow.
- Simple and intuitive user interface.
- Copy generated prompts to clipboard.
- Built with Next.js, TypeScript, and Tailwind CSS.

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

## CI/CD

This project uses GitHub Actions for continuous integration and deployment. The workflow is defined in `.github/workflows/ci.yml`.

- **Linting and Type-checking**: Ensures code quality and type safety.
- **Testing**: Runs unit and UI tests.
- **Deployment**: Deploys the application to Vercel on push to the `main` branch.

To enable Vercel deployment, you need to set the following secrets in your GitHub repository:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`