import { getEmbeddings } from "./embeddings";
import { getPineconeClient } from "./pinecone";
import { convertToAscii } from "./utils";
// function will take query vector, search pinecone specific name space
// for top 5 similar vectors
// embeddings is the embedding of the query string
export async function getMatchesFromEmbeddings(embeddings: number[], fileKey: string) {
    const pinecone = await getPineconeClient();
    const index = await pinecone.index("chatpdf-yt");

    try {
        const namespace = convertToAscii(fileKey);
        const queryResult = await index.namespace(namespace).query({
            topK: 5,
            vector: embeddings,
            includeMetadata: true
        });

        return queryResult.matches || [];
    } catch (error) {
        console.log('error querying embeddings', error);
        throw error;
    }
}

// function to get context of query
// need to fileKey to access the namespace
// search vector db for correct naespace, dont want info from other pdfs
export async function getContext(query: string, fileKey: string) {
    const queryEmbeddings = await getEmbeddings(query);
    const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

    const qualifyingDocs = matches.filter((match) => match.score && match.score > 0.7);

    type Metadata = {
        text: string,
        pageNumber: number
    }

    let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);
    return docs.join('\n').substring(0, 3000);
}