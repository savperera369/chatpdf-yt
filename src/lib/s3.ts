import AWS from 'aws-sdk';

export async function uploadToS3(file: File) {
    try {
        // configure aws object
        AWS.config.update({
            accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
        });
        // get s3 object
        const s3 = new AWS.S3({
            params: {
                Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME
            },
            region: 'us-east-1'
        });

        // want to upload to an uploads folder within AWS S3 so we can organize properly
        const file_key = "uploads/" + Date.now().toString() + file.name.replace(' ', '-');

        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key: file_key,
            Body: file
        }

        const upload = s3.putObject(params).on('httpUploadProgress', evt => {
            console.log('uploading to s3...');
        }).promise()

        // callback function will be called whenever file is done being uploaded
        await upload.then((data) => {
            console.log('successfully uploaded to s3!', file_key);
        });

        // will use these 2 params to save to dtabase later
        return Promise.resolve({
            file_key,
            file_name: file.name
        })
    } catch (error) {
        
    }
}

// return us a publicly accessible s3 url so we can embed pdf into our chat screen later
export async function getS3Url(file_key: string) {
    const url = `http://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${file_key}`;
    return url;
}

// Retrieval Augmented Generation

// Vector and Embedding - vector is array of numbers

// example text
// 1) I like cats
// 2) Cats are feline species
// 3) Dogs are the opposites of cats 

// embed - convert string to vector
// how do we determine which texts are most similar to each other?
// there is a function that takes in a string and returns a multi dimensional vector - this is called an embedding
// bigger the dimension - the more information it can represent
// vector represents semantic meaning of text

// new query : what are cats?

// convert query to vector

// its embedding will probably be similar to the first one 1-like cats
// cosine similarity will find out how similar our query vector is to each of 
// the above 3 vectors. the most similar one is 2, whihc is the answer to our query
// after we find most similar vector, we can convert it to text
// store text in metadata of vector
// {embedding: [1,2,5....], metadata: {textContent: 'Ilikecats}}

// our backend will split pdf into small chunks (documents, could be paragraphs, sentences etc)

// segment pdf into documents
// doc1 -> pageContent(metaData) -> vector embedding
// doc2
// doc3
// we could have 20 vector embeddings total
// store all these individual embeddings into a vector database (pineconedb)

// query: where did he intern at?
// one of the documents, like doc1 could be I interned at reluvate company

// turn search query into another vector embedding
// then ai will go thru all current embeddings in vector db
// look and return vector that is most similar
// its going to take that most similar vector -> and pull out metadata from it
// feed in metadata to chatgpt, to create a prompt that takes in context of metadat, 
// query, and generate response based on these vectors

// 1) obtain pdf
// 2) split and segment pdf into documents
// 3) vectorize and embed each individual document
// 4) store vectors into piencone db
// search
// 5) embed query
// 6) query pinecone db for similar vectors
// 7) extract out metadata of similar vectors
// 8) feed metadata into openai prompt