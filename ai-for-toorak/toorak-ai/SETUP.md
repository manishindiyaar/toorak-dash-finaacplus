# Toorak AI Loan Query Setup Guide

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the backend directory (`/backend/.env`) with your Google AI API key:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here
```

Get your Google AI API key from: https://makersuite.google.com/app/apikey

### 2. Start the Backend Server

```bash
cd backend
npm install
node server.js
```

The backend server will run on `http://localhost:3000`

### 3. Start the Frontend Application

```bash
cd ai-for-toorak/toorak-ai
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## How to Use

1. Open your browser and go to `http://localhost:5173`
2. You'll see the Toorak AI Loan Query Assistant
3. Try these example queries:
   - "Show me the last 10 loans"
   - "Find all funded loans"
   - "Show me residential loans"
   - "Find loans in California"
   - "Show me loans with high LTV"

## Features

- **Natural Language Queries**: Ask questions in plain English
- **Loan Card Display**: Each loan is displayed in a beautifully formatted card
- **Real-time AI Response**: Powered by Google's Gemini AI
- **Smart Filtering**: AI understands filters like status, property type, location
- **Responsive Design**: Works on desktop and mobile

## Example Queries

- "Show me the last 10 loans"
- "Find all approved loans"
- "Show me commercial properties"
- "Find loans in Texas"
- "Show me loans over $1 million"
- "Find declined loans"
- "Show me industrial properties"

## Technical Details

- **Frontend**: React + Vite + AI SDK
- **Backend**: Node.js + Express + AI SDK
- **AI Model**: Google Gemini (configurable)
- **Tool System**: Custom loan query tools with filtering
- **Streaming**: Real-time AI response streaming 