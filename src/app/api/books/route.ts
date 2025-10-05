// app/api/books/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const VALID_STATUSES = ["reading", "completed", "wishlist"] as const;
type BookStatus = (typeof VALID_STATUSES)[number];

async function getUserFromToken(token: string | null) {
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

// GET /api/books?status=<status>
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") ?? null;

    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 401 });

    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status") as BookStatus | null;

    let query = supabaseAdmin
      .from("books")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (statusFilter && VALID_STATUSES.includes(statusFilter)) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
  } catch (err: unknown) {
    if (err instanceof Error) console.error("GET /api/books error:", err.message);
    else console.error("GET /api/books unknown error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/books
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") ?? null;

    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 401 });

    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { title, author, status } = body as { title?: string; author?: string; status?: BookStatus };

    if (!title || !author) {
      return NextResponse.json({ error: "Missing title or author" }, { status: 400 });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    console.log("Adding book for user:", user.id, { title, author, status });

    const { data, error } = await supabaseAdmin
      .from("books")
      .insert([{ title, author, status: status ?? "reading", user_id: user.id }])
      .select()
      .single();

    console.log("Insert result:", { data, error });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) console.error("POST /api/books error:", err.message);
    else console.error("POST /api/books unknown error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
