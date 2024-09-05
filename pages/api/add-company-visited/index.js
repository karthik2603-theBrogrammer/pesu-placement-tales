// pages/api/addCompanyVisited.js

import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Extract company visited details from the request body
    const {
      company_id,
      year,
      base_salary,
      ctc,
      internship_stipend,
      girls_only,
      internship_only,
      fte_only,
      internship_fte,
      total_hired,
      males_hired,
      females_hired
    } = req.body;

    // Validate the input and find missing fields
    const requiredFields = [
      'company_id',
      'year',
      'base_salary',
      'ctc',
      'internship_stipend',
      'girls_only',
      'internship_only',
      'fte_only',
      'internship_fte',
      'total_hired',
      'males_hired',
      'females_hired'
    ];
    
    const missingFields = requiredFields.filter(field => req.body[field] === undefined);

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing fields', 
        missingFields 
      });
    }

    try {
      // Initialize the database connection
      const sql = neon(process.env.DATABASE_URL);

      // Insert the company visited details into the database
      const query = `
        INSERT INTO company_visited (
          company_id,
          year,
          base_salary,
          ctc,
          internship_stipend,
          girls_only,
          internship_only,
          fte_only,
          internship_fte,
          total_hired,
          males_hired,
          females_hired
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
        RETURNING company_id, year;
      `;
      const result = await sql(query, [
        company_id,
        year,
        base_salary,
        ctc,
        internship_stipend,
        girls_only,
        internship_only,
        fte_only,
        internship_fte,
        total_hired,
        males_hired,
        females_hired
      ]);

      // Return the details of the newly created record
      res.status(201).json({ companyId: result[0].company_id, year: result[0].year });
    } catch (error) {
      console.error('Error adding company visited:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  } else {
    // Only allow POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
