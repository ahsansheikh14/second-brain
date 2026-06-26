const { GoogleGenAI } = require('@google/genai')
const { searchSimilarChunks } = require('./embeddingService')

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const generateAnswer = async (question, userId) => {
  // Step 1: Find relevant chunks from Supabase
  const relevantChunks = await searchSimilarChunks(question, userId, 5)

  if (!relevantChunks || relevantChunks.length === 0) {
    return {
      answer: "I could not find any relevant information in your knowledge base. Try adding some content first.",
      sources: []
    }
  }

  // Step 2: Build context from chunks
  const context = relevantChunks
    .map((chunk, index) => `[Source ${index + 1}]: ${chunk.content}`)
    .join('\n\n')

  // Step 3: Build prompt
  const prompt = `You are a helpful AI assistant for a personal knowledge base called Second Brain.
  
Your job is to answer the user's question using ONLY the context provided below.
If the answer is not in the context, say "I don't have information about this in your knowledge base."
Always mention which source you used at the end of your answer.

CONTEXT:
${context}

QUESTION: ${question}

Answer clearly and concisely:`

  // Step 4: Send to Gemini Flash
  const response = await genAI.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt
  })

  const answer = response.text

  // Step 5: Return answer with sources
  return {
    answer,
    sources: relevantChunks.map(chunk => ({
      documentId: chunk.document_id,
      content: chunk.content.substring(0, 150) + '...',
      similarity: Math.round(chunk.similarity * 100) / 100
    }))
  }
}

module.exports = { generateAnswer }