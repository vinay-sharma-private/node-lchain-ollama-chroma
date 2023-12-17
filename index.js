import express from 'express';
import { Ollama } from "langchain/llms/ollama";
import { OllamaEmbeddings } from "langchain/embeddings/ollama";
import { Chroma } from 'langchain/vectorstores/chroma';
import * as fs from "fs";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

//Server setup
const app = express();
app.use(express.json());
const port = process.env.PORT || 4545;
//Initialise Ollama LLM
const ollama = new Ollama({});
//Initialise Ollama Embeddings
const embeddings = new OllamaEmbeddings({});
//Initialise Chroma Vector Store
const vectorStore = new Chroma(embeddings, {
  collectionName: "mydata",
});
//Initialise Conversational Retrieval QA Chain
const chain = ConversationalRetrievalQAChain.fromLLM(
    ollama,
    vectorStore.asRetriever()
);
//Routes  
app.post("/ask", async (req, res) => {
  const question = req.body.prompt;
  
  try {
    if (question == null) {
      throw new Error("There is no question!");
    }
    //Call the chain
    const result = await chain.call({ question, chat_history: [] });

    return res.status(200).json({
      success: true,
      message: result,
    });
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/add-to-collection", async (req, res) => {
  const filePath = req.body.filePath;

  try {
    if (!filePath) {
      throw new Error("Invalid request parameters!");
    }
    //Read the file
    const fileContents = fs.readFileSync(filePath, "utf-8");
    //Split the text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
    //Create documents from the chunks
    const docs = await textSplitter.createDocuments([fileContents]);
    //Add documents to the collection
    await vectorStore.addDocuments(docs);

    return res.status(200).json({
      success: true,
      message: `Added documents to the collection.`,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding documents to the collection.",
    });
  }
});
//Start the server
app.listen(port, () => console.log(`Server is running on port ${port}!!`));