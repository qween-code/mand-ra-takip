import { createClient } from "@/lib/supabase";

export async function getCalves() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("calves")
    .select(`
      *,
      cattle:mother_id (name, ear_tag)
    `)
    .order("name");

  if (error) {
    console.error("Error fetching calves:", error);
    return [];
  }

  return data;
}
