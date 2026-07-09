import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[CHAT_MESSAGES_GET]", error);
      return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 });
    }

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role, content } = body;

    if (!role || !content) {
      return NextResponse.json({ success: false, error: "Role and content are required" }, { status: 400 });
    }

    const { data: message, error } = await supabase
      .from("chat_messages")
      .insert({
        session_id: id,
        user_id: user.id,
        role,
        content
      })
      .select()
      .single();

    if (error) {
      console.error("[CHAT_MESSAGES_POST]", error);
      return NextResponse.json({ success: false, error: "Failed to save message" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
