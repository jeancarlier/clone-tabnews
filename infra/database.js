import { Client } from "pg";

async function query(queryObject) {
    console.log(`is development: ${process.env.NODE_ENV === "development"}`);
    const client = new Client({
        host: process.env.POSTGRES_HOST,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        port: process.env.POSTGRES_PORT,
        ssl: process.env.NODE_ENV === "development" ? false : true,
    });
    
    try {
        await client.connect();
        const result = await client.query(queryObject);        
        return result;
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
    finally {
        await client.end();
    }
}

export default {
    query: query,
}