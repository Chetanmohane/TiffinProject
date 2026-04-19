import { supabase } from "./lib/supabase/client";

async function findTable() {
  const commonNames = ['pause_entries', 'paused_meals', 'pause_meal', 'paused_delivery', 'pause_entries'];
  for (const name of commonNames) {
    const { error } = await supabase.from(name).select('*').limit(1);
    if (!error) {
      console.log(`Success! Table found: ${name}`);
      return;
    } else {
       console.log(`Failed for ${name}: ${error.message}`);
    }
  }
}

findTable();
