import { Client } from "pg";

async function query(queryObject) {
    const client = new Client({
        host: process.env.POSTGRES_HOST,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        port: process.env.POSTGRES_PORT,
    });
    
    await client.connect();
    try {
        const result = await client.query(queryObject);        
        return result;
    } catch (error) {
        console.error("Error executing query:", error);
    }
    finally {
        await client.end();
    }
}

export default {
    query: query,
}