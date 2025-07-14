
// /src/tests/Home.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import Home from '@/app/page';

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ assembledPrompt: 'This is a test prompt' }),
  } as Response)
);

describe('Home', () => {
  it('renders the heading', () => {
    render(<Home />);
    const heading = screen.getByText('PromptBuilder');
    expect(heading).toBeInTheDocument();
  });

  it('generates a prompt when the form is submitted', async () => {
    render(<Home />);
    const input = screen.getByPlaceholderText('Describe your video idea... (e.g., a cat playing with yarn)');
    const button = screen.getByText('Generate Prompt');

    fireEvent.change(input, { target: { value: 'a test idea' } });
    fireEvent.click(button);

    const prompts = await screen.findAllByText('This is a test prompt');
    expect(prompts.length).toBeGreaterThanOrEqual(1);
  });
});
