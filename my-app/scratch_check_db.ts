import { supabase } from "./lib/supabase/client";

async function checkColumns() {
  const { data, error } = await supabase.from('payments').select('*').limit(1);
  if (error) {
    console.error("Error fetching payments:", error);
  } else {
    console.log("Columns in payments table:", Object.keys(data[0] || {}));
  }
}

checkColumns();
