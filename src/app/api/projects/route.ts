import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[PROJECTS_GET]", error);
      return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 });
    }

    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    console.error("[PROJECTS_GET]", error);
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
    const { name, description, tech_stack } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Project name is required" }, { status: 400 });
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        tech_stack: tech_stack || [],
        status: "active"
      })
      .select()
      .single();

    if (error) {
      console.error("[PROJECTS_POST]", error);
      return NextResponse.json({ success: false, error: "Failed to create project" }, { status: 500 });
    }

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error("[PROJECTS_POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
