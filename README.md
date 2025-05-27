# 🧠 UserData_Based_ChatBot

A Proof of Concept (POC) chatbot that understands and answers queries using **user transactional data**. It leverages **NLP** and **embeddings** to provide intelligent, context-aware responses.

---

## ✨ Features

- 🔍 Semantic search using vector embeddings
- 🧾 Custom chatbot trained on user data (transactional)
- ⚙️ Built with modular structure: Node.js backend + Angular frontend
- 🧠 Integrates OpenAI + Pinecone for embedding and retrieval
- 💬 Real-time chat interface

---

## 📁 Project Structure
UserData_Based_ChatBot/
├── backend/       # Node.js backend for embeddings, vector search, chat logic
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── index.js
│
├── frontend/      # Angular frontend for chat interface
│   ├── src/
│   └── angular.json
│
├── .gitignore
└── README.md

---

## 🚀 Getting Started

### 🔧 Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- OpenAI API Key
- Pinecone API Key & Index

---

### 📦 Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file with:
   ```bash
   OPENAI_API_KEY=your_openai_key
   PINECONE_API_KEY=your_pinecone_key
   PINECONE_ENVIRONMENT=your_pinecone_environment
   PINECONE_INDEX=your_pinecone_index_name
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

### 💻 Frontend Setup

1. In a new terminal, navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install Angular dependencies:
   ```bash
   npm install
   ```
3. Start the Angular dev server:
   ```bash
   ng serve
   ```
4. Open your browser and visit:
   ```bash
   http://localhost:4200
   ```

## 🔍 Example Use Case

  “What was the total spend of user John in the last quarter?”
  → The chatbot will analyze stored transactional data and provide the answer contextually.

## 📌 Tech Stack

•	Frontend: Angular
•	Backend: Node.js, Express.js
•	AI/NLP: OpenAI, LangChain
•	Vector DB: Pinecone

## 🤝 Contributing

Contributions, feedback, and suggestions are welcome. Open an issue or create a pull request!
📄 License MIT License © 2025 Akshay Kaneri
