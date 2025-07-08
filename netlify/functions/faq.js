import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase values:
const supabaseUrl = 'https://ypibornojdvnlqjfctyd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwaWJvcm5vamR2bmxxamZjdHlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg3MjQ4NSwiZXhwIjoyMDY3NDQ4NDg1fQ.4VTANpnM9Gy_3cNhl52yprtQ9GdtYJ-MtJs8ywm3gLQ';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON" }),
    };
  }

  const { name, email, question } = data;

  const { error } = await supabase
    .from("faqs")
    .insert([
      {
        name,
        email,
        question,
      }
    ]);

  if (error) {
    console.error("Supabase Insert Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error submitting your question. Please try again.",
        error: error.message,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: " We'll get back to you soon.",
    }),
  };
}
