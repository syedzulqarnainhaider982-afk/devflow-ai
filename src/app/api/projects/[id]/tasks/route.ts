import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: tasks, error } = await supabase
      .from("project_tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[TASKS_GET]", error);
      return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 });
    }

    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
    console.error("[TASKS_GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, status } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Task title is required" }, { status: 400 });
    }

    const { data: task, error } = await supabase
      .from("project_tasks")
      .insert({
        project_id: projectId,
        user_id: user.id,
        title,
        status: status || "todo"
      })
      .select()
      .single();

    if (error) {
      console.error("[TASKS_POST]", error);
      return NextResponse.json({ success: false, error: "Failed to create task" }, { status: 500 });
    }

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error("[TASKS_POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
