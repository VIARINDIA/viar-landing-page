const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const { email } = JSON.parse(event.body);

  const supabaseUrl = 'https://ypibornojdvnlqjfctyd.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwaWJvcm5vamR2bmxxamZjdHlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzI0ODUsImV4cCI6MjA2NzQ0ODQ4NX0.PIcJg3FOg9aVKHEaRNjgt6SELqqi_AZTn4cxmw_fNF4';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('newsletter')
    .insert([{ email }]);

  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error saving data', error }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Subscribed successfully!' }),
  };
};
