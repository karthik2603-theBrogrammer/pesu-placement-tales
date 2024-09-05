// pages/api/addCompany.js

import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method === 'GET') {

    

    try {

      const sql = neon(process.env.DATABASE_URL);
      const query = `
        SELECT * FROM company;
      `;
      const result = await sql(query);

      // Return the ID of the newly created company
      res.status(201).json({ result });
    } catch (error) {
      console.error('Error Fetching Companies:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  } else {
    // Only allow POST requests
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
