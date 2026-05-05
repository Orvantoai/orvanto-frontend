import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ezysipmtljznwfhmpheb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eXNpcG10bGp6bndmaG1waGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTcxODIsImV4cCI6MjA5MDE3MzE4Mn0.2N5TkSOBtGZJjsDEXMKV3CFwHXQdoiUhLbeg-kgidUE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data: client, error: clientErr } = await supabase.from('Clients').select('*').limit(1).single();
  if (clientErr) {
    console.error("Client Error:", clientErr);
  } else {
    console.log("All Columns in Clients:");
    Object.keys(client).sort().forEach(c => console.log("- " + c));
  }
}

checkData();
