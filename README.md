# GenAI Credit Card Assistant

An intelligent, AI-powered credit card assistant application featuring a React frontend and a Node.js/Express backend. This assistant uses LLMs (Groq, OpenAI, or X.AI) to handle informational queries and perform secure banking actions.

## Features

-   **Hybrid AI Architecture**: Combines RAG (Retrieval Augmented Generation) for informational queries and structured action handling for banking tasks.
-   **Secure PIN/Password Entry**: Dynamic input masking in the chat interface when sensitive credentials are required.
-   **Banking Actions**: Check balance, view transactions, pay bills, check credit score, and more.
-   **Voice Support**: Text-to-speech output and voice input capabilities.
-   **Theme Support**: Light and Dark mode.

## Prerequisites

-   Node.js (v18 or higher recommended)
-   MongoDB (Local or Atlas)

## Setup Instructions

### 1. Server Setup

Navigate to the `server` directory and install dependencies:

```bash
cd server
npm install
```

**Environment Configuration:**

1.  Locate the `.env.example` file in the `server` directory.
2.  Rename it to `.env`:
    ```bash
    mv .env.example .env
    ```
3.  Open the `.env` file and populate it with your actual credentials:
    ```env
    PORT=3001
    MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/
    OPENAI_API_KEY=sk-...
    GROQ_API_KEY=gsk_...
    XAI_API_KEY=xai-...
    ```
    *Note: You only need to provide the API key for the service you intend to use.*

**Start the Server:**

```bash
npm run dev
```
The server will start on `http://localhost:3001`.

### 2. Client Setup

Open a new terminal, navigate to the `client` directory, and install dependencies:

```bash
cd client
npm install
```

**Start the Client:**

```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

## Usage

1.  Open the application in your browser.
2.  Sign up or Login (Demo user: `ronit` / `123456`).
3.  Use the chat interface to ask questions or perform actions (e.g., "Check my balance", "Show my credit score").
4.  When prompted for a PIN or Password, the input field will automatically switch to a secure mask mode.

## Tech Stack

-   **Frontend**: React, Vite, Axios, SpeechSynthesis API
-   **Backend**: Node.js, Express, Mongoose
-   **Database**: MongoDB
-   **AI**: Groq SDK, OpenAI SDK (supports X.AI)
