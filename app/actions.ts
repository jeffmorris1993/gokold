"use server";

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const signupSchema = z.object({
  fullName: z.string().trim().min(1, "Please enter your name").max(200, "That name is too long"),
  email: z.email("Please enter a valid email").max(320),
});

export type EarlyAccessState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: { fullName?: string; email?: string };
};

export async function joinEarlyAccess(
  _prev: EarlyAccessState,
  formData: FormData
): Promise<EarlyAccessState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors;
    return {
      status: "error",
      errors: { fullName: flat.fullName?.[0], email: flat.email?.[0] },
    };
  }
  const { fullName, email } = parsed.data;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error("joinEarlyAccess: missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY");
    return { status: "error", message: "Something went wrong on our end. Please try again later." };
  }

  // The signups table only grants INSERT (RLS insert-only policy), so the
  // publishable key is sufficient — reads happen in the Supabase dashboard.
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase
    .from("early_access_signups")
    .insert({ full_name: fullName, email: email.toLowerCase() });

  // 23505 = unique violation: they're already on the list, which is a success.
  if (error && error.code !== "23505") {
    console.error("joinEarlyAccess: insert failed", error);
    return { status: "error", message: "Something went wrong on our end. Please try again." };
  }
  const isNew = !error;

  // Notify the team; a mail failure must not fail the signup (the row is stored).
  if (isNew && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error: mailError } = await resend.emails.send({
        from: process.env.EARLY_ACCESS_FROM ?? "KOLD <onboarding@resend.dev>",
        to: [process.env.EARLY_ACCESS_TO ?? "hello@sirromstudios.com"],
        cc: [process.env.EARLY_ACCESS_CC ?? "adwatermedia@gmail.com"],
        subject: "New KOLD early-access signup",
        text: [
          "A new signup just landed on the KOLD early-access list.",
          "",
          `Name:  ${fullName}`,
          `Email: ${email}`,
          `Time:  ${new Date().toISOString()}`,
        ].join("\n"),
      });
      if (mailError) console.error("joinEarlyAccess: Resend error", mailError);
    } catch (err) {
      console.error("joinEarlyAccess: Resend threw", err);
    }
  }

  return { status: "success" };
}
