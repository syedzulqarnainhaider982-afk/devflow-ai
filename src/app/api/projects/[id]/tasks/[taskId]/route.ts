/* eslint-disable */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  try {
    const { taskId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.status !== undefined) updateData.status = body.status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No data provided to update" }, { status: 400 });
    }

    const { data: task, error } = await supabase
      .from("project_tasks")
      .update(updateData)
      .eq("id", taskId)
      .select()
      .single();

    if (error) {
      console.error("[TASK_PUT]", error);
      return NextResponse.json({ success: false, error: "Failed to update task" }, { status: 500 });
    }

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error("[TASK_PUT]", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  try {
    const { taskId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("project_tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error("[TASK_DELETE]", error);
      return NextResponse.json({ success: false, error: "Failed to delete task" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[TASK_DELETE]", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
