# node-lchain-ollama-chroma
This is a Node.js application that implements a RAG-based (Retrieval-Augmented Generation) system using the Ollama, Langchain, and Chroma libraries. It exposes two API endpoints: one for uploading documents and inserting them into the vector store, and another for sending a prompt to the LLM.




https://github.com/vinay-sharma-private/node-lchain-ollama-chroma/assets/153127781/c60c9918-29ed-4b96-bc4f-ed39d2f68829


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. You would need to install and run Ollama and Chroma locally on your system.

### Prerequisites

- Node.js
- npm
- Ollama
- Chroma

### Installing

1. Clone the repository: `git clone https://github.com/vinay-sharma-private/node-lchain-ollama-chroma`
2. Navigate to the project directory: `cd node-lchain-ollama-chroma`
3. Install the dependencies: `npm install`

## Running the Application

To start the application, run: `node index.js`

## Application Structure

- `index.js`: This is the main file where the application starts. It initializes Ollama, Ollama Embeddings, Chroma Vector Store, and the Conversational Retrieval QA Chain.

## Built With

- [Ollama](https://ollama.ai/): A library for getting up and running with large language models locally.
- [Chroma](https://docs.trychroma.com/getting-started): An AI-native open-source embedding database.
- [Langchain](https://www.langchain.com/): A framework for developing applications powered by language models.

## License

This project is licensed under the MIT License.
