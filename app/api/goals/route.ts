import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/goals → renvoie tous les paliers triés.
// Utilisé par le polling côté client pour rafraîchir l'état.
export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("donation_goals")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ goals: data ?? [] });
}

// PATCH /api/goals → toggle un palier.
// Aucune auth: pour un tout petit projet. Ne partage pas l'URL /admin si
// tu ne veux pas que les viewers puissent cocher/décocher les paliers.
export async function PATCH(request: Request) {
  let body: { id?: number; completed?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  if (typeof body.id !== "number" || typeof body.completed !== "boolean") {
    return NextResponse.json(
      { error: "Champs attendus: id (number), completed (boolean)" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("donation_goals")
    .update({ completed: body.completed, updated_at: new Date().toISOString() })
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ goal: data });
}
