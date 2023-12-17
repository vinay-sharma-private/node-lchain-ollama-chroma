const ConversationalRetrievalQAChain = require('./ConversationalRetrievalQAChain');
const VectorStore = require('./VectorStore');

describe('index.js', () => {
  it('should create a ConversationalRetrievalQAChain with the correct parameters', () => {
    // Mock the necessary dependencies
    const ollama = jest.fn();
    const vectorStore = jest.fn();

    // Create the chain
    const chain = ConversationalRetrievalQAChain.fromLLM(ollama, vectorStore);

    // Assert that the chain was created with the correct parameters
    expect(chain).toBeInstanceOf(ConversationalRetrievalQAChain);
    expect(chain.ollama).toBe(ollama);
    expect(chain.vectorStore).toBe(vectorStore.asRetriever());
  });
});