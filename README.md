 ![image](https://github.com/user-attachments/assets/84c02119-14e4-46e0-9a10-70e0aedf9b90)
# AI Text Summarizer

A modern web application that uses AI to summarize and analyze text. Built with Next.js and Tailwind CSS.

![AI Text Summarizer Screenshot](screenshot.png)

## Features

- Multiple summarization modes:
  - Paragraph summary
  - Bullet points
  - Custom instructions
  - Grammar checking
- Support for multiple AI providers:
  - OpenAI
  - Anthropic (Claude)
  - Mistral AI
- Dark/Light mode
- File upload support (TXT, DOC, DOCX, PDF)
- History tracking
- Responsive design

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/thisismamad-n/ai-text.git
cd ai-text
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

Before using the application, you'll need to configure your AI provider API key:

1. Click the settings icon in the top right
2. Select your preferred AI provider
3. Enter your API key
4. Save the settings

## Technologies Used

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Radix UI Components
- PDF Parse
- Mammoth (for Word documents) 
