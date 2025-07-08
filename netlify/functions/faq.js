const { createClient } = require('@supabase/supabase-js');

// ✅ Replace these with your real Supabase URL and anon key
const supabaseUrl = 'https://ypibornojdvnlqjfctyd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // use your real key here

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
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
        question
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
      message: "Thanks for asking! We'll get back to you soon.",
    }),
  };
};
