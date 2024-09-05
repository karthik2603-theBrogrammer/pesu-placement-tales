// pages/api/company.js
import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const data = await sql`SELECT * FROM company`;
    
    // Respond with the fetched data
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    
    // Respond with an error message
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
