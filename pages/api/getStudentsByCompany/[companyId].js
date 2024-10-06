import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  // Extract the companyId from the query parameters
  const { companyId } = req.query;
  
  // Ensure companyId is a valid number
  if (!companyId || isNaN(companyId)) {
    return res.status(400).json({ error: 'Invalid companyId' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Use tagged template literals for the query
    const data = await sql`
      SELECT 
          sp.id AS student_id,
          sp.first_name,
          sp.middle_name,
          sp.last_name,
          sp.year_placed,
          sp.linkedin_url,
          sp.phone_number,
          sp.remarks_markdown,
          sp.upvote,
          sp.downvote,
          cv.year AS visited_year,
          cv.base_salary,
          cv.ctc,
          cv.internship_stipend,
          cv.girls_only,
          cv.internship_only,
          cv.fte_only,
          cv.internship_fte,
          cv.total_hired,
          cv.males_hired,
          cv.females_hired,
          c.company_name,
          c.company_description
      FROM 
          student_placed sp
      JOIN 
          company_visited cv ON sp.company_placed_id = cv.company_id
      JOIN 
          company c ON cv.company_id = c.id
      WHERE 
          sp.company_placed_id = ${companyId} AND sp.year_placed = cv.year;
    `;

    // Send the data back as JSON
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
