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

    const { data: generation, error } = await supabase
      .from("code_generations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: "Generation not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, generation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
      .from("code_generations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[CODE_GEN_DELETE]", error);
      return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
