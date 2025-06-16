import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://enzpacmxxlkvnoyuqtyv.supabase.co";

const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuenBhY214eGxrdm5veXVxdHl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDY0MjYsImV4cCI6MjA2MzQ4MjQyNn0.10mS5qvWGQby9eiKjLilmWhIPiHz3mTkOO3vE9RP28s";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
