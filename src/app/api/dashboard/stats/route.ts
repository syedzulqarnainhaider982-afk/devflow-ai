/* eslint-disable */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Run all count and recent activity queries in parallel
    const [
      { count: projectsCount },
      { count: websitesCount },
      { count: codesCount },
      { count: chatsCount },
      { data: recentProjects },
      { data: recentWebsites },
      { data: recentCodes },
      { data: recentChats }
    ] = await Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("website_generations").select("id", { count: "exact", head: true }),
      supabase.from("code_generations").select("id", { count: "exact", head: true }),
      supabase.from("chat_sessions").select("id", { count: "exact", head: true }),
      supabase.from("projects").select("id, name, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("website_generations").select("id, brand_name, prompt, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("code_generations").select("id, prompt, language, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("chat_sessions").select("id, title, created_at").order("created_at", { ascending: false }).limit(5)
    ]);

    // Format and merge activities
    const activities: any[] = [];

    if (recentProjects) {
      recentProjects.forEach(p => {
        activities.push({
          id: p.id,
          type: "project",
          title: p.name,
          timestamp: p.created_at,
          url: `/dashboard/projects/${p.id}`
        });
      });
    }

    if (recentWebsites) {
      recentWebsites.forEach(w => {
        activities.push({
          id: w.id,
          type: "website",
          title: w.brand_name || "Generated Website",
          description: w.prompt,
          timestamp: w.created_at,
          url: "/dashboard/website-gen"
        });
      });
    }

    if (recentCodes) {
      recentCodes.forEach(c => {
        activities.push({
          id: c.id,
          type: "code",
          title: `Generated ${c.language} snippet`,
          description: c.prompt,
          timestamp: c.created_at,
          url: "/dashboard/code-gen"
        });
      });
    }

    if (recentChats) {
      recentChats.forEach(c => {
        activities.push({
          id: c.id,
          type: "chat",
          title: c.title,
          timestamp: c.created_at,
          url: "/dashboard/chat"
        });
      });
    }

    // Sort chronologically (latest first) and take top 10
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const topActivities = activities.slice(0, 10);

    return NextResponse.json({
      success: true,
      stats: {
        projects: projectsCount || 0,
        websites: websitesCount || 0,
        codes: codesCount || 0,
        chats: chatsCount || 0
      },
      activities: topActivities
    });

  } catch (error: any) {
    console.error("[DASHBOARD_STATS_GET]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
