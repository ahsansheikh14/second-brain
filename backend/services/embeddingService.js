const { GoogleGenerativeAI } = require('@google/generative-ai')
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters')
const supabase = require('../config/supabase')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Split text into chunks
const splitText = async (text) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,       // each chunk max 500 characters
    chunkOverlap: 50      // 50 char overlap between chunks for context continuity
  })
  return await splitter.createDocuments([text])
}

// Convert text to vector using Gemini
const generateEmbedding = async (text) => {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })
  const result = await model.embedContent(text)
  return result.embedding.values
}

// Main function — takes rawText, splits, embeds, stores in Supabase
const embedAndStore = async (documentId, userId, rawText) => {
  try {
    // Step 1: Split text into chunks
    const chunks = await splitText(rawText)
    console.log(`Split into ${chunks.length} chunks`)

    // Step 2: Embed each chunk and store
    const embedPromises = chunks.map(async (chunk) => {
      const embedding = await generateEmbedding(chunk.pageContent)

      return supabase.from('document_chunks').insert({
        document_id: documentId,
        user_id: userId,
        content: chunk.pageContent,
        embedding
      })
    })

    await Promise.all(embedPromises)
    console.log(`Successfully embedded document ${documentId}`)

  } catch (error) {
    console.error('Embedding error:', error.message)
    throw error
  }
}

// Search for relevant chunks using a query
const searchSimilarChunks = async (query, userId, matchCount = 5) => {
  // Convert query to vector
  const queryEmbedding = await generateEmbedding(query)

  // Search Supabase for similar chunks
  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    match_user_id: userId,
    match_count: matchCount
  })

  if (error) throw error
  return data
}

// Delete chunks when document is deleted
const deleteChunks = async (documentId) => {
  const { error } = await supabase
    .from('document_chunks')
    .delete()
    .eq('document_id', documentId)

  if (error) throw error
}

module.exports = { embedAndStore, searchSimilarChunks, deleteChunks }