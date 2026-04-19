import { supabase } from "./lib/supabase/client";

async function listAdmins() {
  const { data, error } = await supabase
    .from('accounts')
    .select('email, role, password')
    .eq('role', 'admin');
  
  if (error) {
    console.error("Error fetching admins:", error);
  } else {
    console.log("Admin accounts:", data);
  }
}

listAdmins();
