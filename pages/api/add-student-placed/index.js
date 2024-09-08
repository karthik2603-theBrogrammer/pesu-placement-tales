// pages/api/addStudentPlaced.js

import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Extract student details from the request body
    const {
      first_name,
      middle_name,
      last_name,
      company_placed_id,
      year_placed,
      linkedin_url,
      phone_number,
      remarks_markdown
    } = req.body;

    // Validate the input and find missing fields
    const requiredFields = [
      'first_name',
      'last_name',
      'company_placed_id',
      'year_placed',
      'linkedin_url',
      'remarks_markdown'
    ];
    
    const missingFields = requiredFields.filter(field => req.body[field] === undefined);

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing fields', 
        missingFields 
      });
    }
    if (!company_placed_id) {
      return res.status(400).json({ 
        error: 'Invalid company_placed_id',
      });
    }

    try {
      // Initialize the database connection
      const sql = neon(process.env.DATABASE_URL);

      // Insert the student details into the database
      const query = `
        INSERT INTO student_placed (
          first_name,
          middle_name,
          last_name,
          company_placed_id,
          year_placed,
          linkedin_url,
          phone_number,
          remarks_markdown
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        )
        RETURNING id;
      `;
      const result = await sql(query, [
        first_name,
        middle_name,
        last_name,
        company_placed_id,
        year_placed,
        linkedin_url,
        phone_number,
        remarks_markdown
      ]);

      // Return the ID of the newly created student
      res.status(201).json({ studentId: result[0].id });
    } catch (error) {
      console.error('Error adding student:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  } else {
    // Only allow POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}