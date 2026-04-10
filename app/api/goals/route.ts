import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "ines_admin";

function isAuthorized(): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const token = cookies().get(COOKIE_NAME)?.value;
  return token === expected;
}

export async function PATCH(request: Request) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

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
