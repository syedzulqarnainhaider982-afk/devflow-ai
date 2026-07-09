/* eslint-disable */
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

    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error("[PROJECT_GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Create an update object with only the fields that were provided
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.tech_stack !== undefined) updateData.tech_stack = body.tech_stack;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No data provided to update" }, { status: 400 });
    }

    const { data: project, error } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[PROJECT_PUT]", error);
      return NextResponse.json({ success: false, error: "Failed to update project" }, { status: 500 });
    }

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error("[PROJECT_PUT]", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[PROJECT_DELETE]", error);
      return NextResponse.json({ success: false, error: "Failed to delete project" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[PROJECT_DELETE]", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
