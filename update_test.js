import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ezysipmtljznwfhmpheb.supabase.co';
// Using the anon key which is fine for updating your own client if RLS allows, or we can use service_role. 
// For this quick test on 'orvanto_self', let's use the anon key.
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eXNpcG10bGp6bndmaG1waGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTcxODIsImV4cCI6MjA5MDE3MzE4Mn0.2N5TkSOBtGZJjsDEXMKV3CFwHXQdoiUhLbeg-kgidUE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log("1. Fetching current data for 'orvanto_self'...");
  const { data: client, error: clientErr } = await supabase.from('Clients').select('client_id, pipeline_value, name').eq('client_id', 'orvanto_self').single();
  
  if (clientErr) {
    console.error("Error fetching:", clientErr);
    return;
  }
  
  console.log(`Current Pipeline Value for ${client.name}: $${client.pipeline_value || 0}`);
  
  const newValue = (client.pipeline_value || 0) + 100;
  console.log(`\n2. Updating Pipeline Value to $${newValue}...`);
  
  const { data: updateData, error: updateErr } = await supabase
    .from('Clients')
    .update({ pipeline_value: newValue })
    .eq('client_id', 'orvanto_self')
    .select('pipeline_value')
    .single();
    
  if (updateErr) {
    console.error("Update Error:", updateErr);
  } else {
    console.log("Update Successful! New value returned from database:", updateData.pipeline_value);
  }
}

testSupabase();
