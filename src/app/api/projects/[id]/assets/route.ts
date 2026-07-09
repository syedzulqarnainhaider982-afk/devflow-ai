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

    const { data: assets, error } = await supabase
      .from("project_assets")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[PROJECT_ASSETS_GET]", error);
      return NextResponse.json({ success: false, error: "Failed to fetch project assets" }, { status: 500 });
    }

    return NextResponse.json({ success: true, assets });
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
    const { asset_type, asset_id, title } = body;

    if (!asset_type || !asset_id || !title) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Check if it already exists to avoid unique constraint errors blowing up ungracefully
    const { data: existing } = await supabase
      .from("project_assets")
      .select("id")
      .eq("project_id", id)
      .eq("asset_type", asset_type)
      .eq("asset_id", asset_id)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, asset: existing, message: "Already linked" });
    }

    const { data: asset, error } = await supabase
      .from("project_assets")
      .insert({
        project_id: id,
        user_id: user.id,
        asset_type,
        asset_id,
        title
      })
      .select()
      .single();

    if (error) {
      console.error("[PROJECT_ASSETS_POST]", error);
      return NextResponse.json({ success: false, error: "Failed to link asset" }, { status: 500 });
    }

    return NextResponse.json({ success: true, asset });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
