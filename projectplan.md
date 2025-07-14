## Review

This project involved creating a full-stack web application called "PromptBuilder" using Next.js, TypeScript, and Tailwind CSS. The application allows users to generate optimized video prompts for Google Veo 3 and Flow models.

Key changes made:

- **Project Setup**: Initialized a Next.js project, set up the directory structure, and configured environment variables.
- **Backend Development**: Implemented prompt generation logic in `src/lib/generatePrompt.ts` and created an API route `src/pages/api/prompt.ts` with input validation.
- **Frontend Development**: Developed the main UI in `src/app/page.tsx` with an input form, loading state, prompt display, and model toggle.
- **Testing**: Configured Jest and React Testing Library, and wrote unit tests for prompt generation and UI tests for the main page.
- **CI/CD**: Created a GitHub Actions workflow for linting, type-checking, testing, and deployment to Vercel.
- **Documentation**: Created a comprehensive `README.md` file with setup, usage, and update instructions.

All requirements have been met, and the codebase is ready for immediate commit to a new GitHub repository.