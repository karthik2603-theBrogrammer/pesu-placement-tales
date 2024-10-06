import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  // Extract the studentId from the query parameters
  const { studentId } = req.query;
  console.log("student Id: ", studentId)
  
  // Ensure studentId is a valid number
  if (!studentId || isNaN(studentId)) {
    return res.status(400).json({ error: 'Invalid studentId' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Use tagged template literals for the query to fetch student details by studentId
    const data = await sql`
      SELECT 
          sp.id,
          sp.first_name,
          sp.middle_name,
          sp.last_name,
          sp.year_placed,
          sp.linkedin_url,
          sp.phone_number,
          sp.remarks_markdown,
          sp.upvote,
          sp.downvote
      FROM 
          student_placed sp
      WHERE 
          sp.id = ${studentId};
    `;
    // Send the data back as JSON
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
