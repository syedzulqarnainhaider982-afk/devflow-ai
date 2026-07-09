import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: sessions, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[CHAT_SESSIONS_GET]", error);
      return NextResponse.json({ success: false, error: "Failed to fetch chat sessions" }, { status: 500 });
    }

    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    console.error("[CHAT_SESSIONS_GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title } = body;

    const { data: session, error } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: user.id,
        title: title || "New Chat",
      })
      .select()
      .single();

    if (error) {
      console.error("[CHAT_SESSIONS_POST]", error);
      return NextResponse.json({ success: false, error: "Failed to create chat session" }, { status: 500 });
    }

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    console.error("[CHAT_SESSIONS_POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
