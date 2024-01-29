import express from 'express';
import { Chroma } from 'langchain/vectorstores/chroma';
import * as fs from "fs";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MongoClient } from "mongodb";
import { ChatOpenAI } from "@langchain/openai";
import { MongoDBChatMessageHistory } from "@langchain/community/stores/message/mongodb";
import { RunnablePassthrough, RunnableSequence } from "langchain/schema/runnable"
import { StringOutputParser } from 'langchain/schema/output_parser'
import { PromptTemplate } from 'langchain/prompts'
import { combineMessages } from "./utils/combineMessages.js";
import { combineDocuments } from "./utils/combineDocuments.js";


//Server setup
const app = express();
app.use(express.json());
const port = process.env.PORT || 4545;

//Initialise LLM
const model = new ChatOpenAI({
  openAIApiKey: "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",
  temperature: 0,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: "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",
  batchSize: 512, // Default value if omitted is 512. Max is 2048
});

const client = new MongoClient("mongodb+srv://vinay81:Shxlc9x2nO0Gt6WF@cluster0.ht1mvpr.mongodb.net/?retryWrites=true&w=majority");
await client.connect();
const collection = client.db("langchain").collection("chat_memory");

const vectorStore = new Chroma(embeddings, {
  collectionName: "all_data_collection",
});

const retriever = vectorStore.asRetriever();

const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
conversation history: {conv_history}
question: {question} 
standalone question:`
const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)

const answerTemplate = `You are a helpful support bot who can answer a given question based on the context provided. Try to find the answer in the context. If you really don't know the answer, say "I'm sorry, I don't know the answer to that.". Don't try to make up an answer.
context: {context}
question: {question}
answer: `
const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)

const standaloneQuestionChain = standaloneQuestionPrompt
  .pipe(model)
  .pipe(new StringOutputParser())

const answerChain = answerPrompt
  .pipe(model)
  .pipe(new StringOutputParser())

//Routes  
app.post("/ask", async (req, res) => {
  const question = req.body.prompt;
  const sessionId = req.body.sessionId;

  try {

    if (question == null) {
      throw new Error("There is no prompt!");
    }

    const retrieverChain = RunnableSequence.from([
      prevResult => prevResult.standalone_question,
      retriever,
      combineDocuments
    ])

    const chain = RunnableSequence.from([
      {
        standalone_question: standaloneQuestionChain,
        original_input: new RunnablePassthrough()
      },
      {
        context: retrieverChain,
        question: ({ original_input }) => original_input.question,
        conv_history: ({ original_input }) => original_input.conv_history
      },
      answerChain
    ])

    const chatHistory = new MongoDBChatMessageHistory({
      collection: collection,
      sessionId: sessionId,
    });
    const messages = await chatHistory.getMessages();

    chatHistory.addUserMessage(question);

    const response = await chain.invoke({
      question: question,
      conv_history: combineMessages(messages)
    })

    chatHistory.addAIChatMessage(response);

    return res.status(200).json({
      success: true,
      message: response,
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
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 500 });
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
