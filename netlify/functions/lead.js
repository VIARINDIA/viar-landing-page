import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

  const { name, email, phone, company, message } = data;

  const { error } = await supabase
    .from("leads")
    .insert([
      {
        name,
        email,
        phone,
        company,
        message,
      }
    ]);

  if (error) {
    console.error("Supabase Insert Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error saving your details. Please try again.",
        error: error.message,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "We will get back to you soon :)",
    }),
  };
}
