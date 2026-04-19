import { supabase } from "./my-app/lib/supabase/client";

async function addPlans() {
  const plans = [
    {
      name: "Basic Monthly",
      description: "One healthy meal per day (Lunch or Dinner)",
      price: 1500,
      duration: 30,
      meals_per_day: 1,
      visible: true,
      tag: "Budget Friendly"
    },
    {
      name: "Standard Monthly",
      description: "Two meals per day (Lunch & Dinner)",
      price: 2800,
      duration: 30,
      meals_per_day: 2,
      visible: true,
      tag: "Most Popular"
    },
    {
      name: "Premium Monthly",
      description: "Two gourmet meals per day + Dessert",
      price: 4000,
      duration: 30,
      meals_per_day: 2,
      visible: true,
      tag: "Everything Included"
    }
  ];

  const { data, error } = await supabase.from('plans').insert(plans);
  
  if (error) {
    console.error("Error adding plans:", error);
  } else {
    console.log("Successfully added 3 plans to Supabase!");
  }
}

addPlans();
