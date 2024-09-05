// pages/api/addCompany.js

import { neon } from "@neondatabase/serverless"

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Extract company details from the request body
    const { company_name, company_description } = req.body;

    // Validate the input
    if (!company_name || !company_description) {
      return res.status(400).json({ error: 'Company name and description are required.' });
    }

    try {
      // Initialize the database connection
      const sql = neon(process.env.DATABASE_URL);

      // Insert the company details into the database
      const query = `
        INSERT INTO company (company_name, company_description)
        VALUES ($1, $2)
        RETURNING id;
      `;
      const result = await sql(query, [company_name, company_description]);

      // Return the ID of the newly created company
      res.status(201).json({ companyId: result[0].id });
    } catch (error) {
      console.error('Error adding company:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  } else {
    // Only allow POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
