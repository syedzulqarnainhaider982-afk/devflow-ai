import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: history, error } = await supabase
      .from("website_generations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[WEBSITE_GEN_HISTORY_GET]", error);
      return NextResponse.json({ success: false, error: "Failed to fetch history" }, { status: 500 });
    }

    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    console.error("[WEBSITE_GEN_HISTORY_GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
