const { createClient } = require('@supabase/supabase-js');

// Hardcoded credentials (same as your newsletter.js file)
const supabaseUrl = 'https://ypibornojdvnlqjfctyd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwaWJvcm5vamR2bmxxamZjdHlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzI0ODUsImV4cCI6MjA2NzQ0ODQ4NX0.PIcJg3FOg9aVKHEaRNjgt6SELqqi_AZTn4cxmw_fNF4';

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
};
