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
    // Students are tied directly to a company; company_visited is only stats
    // data (and can have multiple role rows per year), so we join company alone
    // to avoid duplicating students.
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
          c.company_name,
          c.company_description
      FROM 
          student_placed sp
      JOIN 
          company c ON sp.company_placed_id = c.id
      WHERE 
          sp.company_placed_id = ${companyId}
      ORDER BY sp.year_placed DESC, sp.id DESC;
    `;

    // Send the data back as JSON
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
