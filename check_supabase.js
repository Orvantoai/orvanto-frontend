import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ezysipmtljznwfhmpheb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eXNpcG10bGp6bndmaG1waGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTcxODIsImV4cCI6MjA5MDE3MzE4Mn0.2N5TkSOBtGZJjsDEXMKV3CFwHXQdoiUhLbeg-kgidUE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log("Fetching client 'orvanto_self'...");
  const { data: client, error: clientErr } = await supabase.from('Clients').select('*').eq('client_id', 'orvanto_self').limit(1);
  if (clientErr) {
    console.error("Client Error:", clientErr);
  } else {
    console.log("Client Data:", JSON.stringify(client, null, 2));
  }

  console.log("\nFetching leads for 'orvanto_self'...");
  const { data: leads, error: leadsErr } = await supabase.from('Leads').select('*').eq('client_id', 'orvanto_self');
  if (leadsErr) {
    console.error("Leads Error:", leadsErr);
  } else {
    console.log(`Found ${leads?.length || 0} leads.`);
    if (leads?.length > 0) {
        console.log("First 2 leads:", JSON.stringify(leads.slice(0, 2), null, 2));
    }
  }
}

checkData();
