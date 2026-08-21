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

  // Notify the team and welcome the signup; mail failures must not fail the
  // signup (the row is already stored).
  if (isNew && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.EARLY_ACCESS_FROM ?? "KOLD <onboarding@resend.dev>";
      const [notify, welcome] = await Promise.allSettled([
        resend.emails.send({
          from,
          to: [process.env.EARLY_ACCESS_TO ?? "hello@sirromstudios.com"],
          cc: [process.env.EARLY_ACCESS_CC ?? "adwatermedia@gmail.com"],
          replyTo: email,
          subject: `${fullName} joined the KOLD early-access list`,
          html: signupEmailHtml(fullName, email),
          text: [
            "A new signup just landed on the KOLD early-access list.",
            "",
            `Name:  ${fullName}`,
            `Email: ${email}`,
            `Time:  ${signupTime()}`,
          ].join("\n"),
        }),
        resend.emails.send({
          from,
          to: [email],
          replyTo: process.env.EARLY_ACCESS_TO ?? "hello@sirromstudios.com",
          subject: "You’re on the KOLD early-access list",
          html: welcomeEmailHtml(fullName),
          text: [
            `Hi ${fullName.split(" ")[0]},`,
            "",
            "You're on the KOLD early-access list.",
            "",
            "KOLD is purpose-built refrigerated storage — cold storage, reconsidered.",
            "You'll be the first to hear launch timing, and founding-member pricing",
            "is reserved for the people on this list.",
            "",
            "Until then,",
            "KOLD",
            "https://gokold.com",
          ].join("\n"),
        }),
      ]);
      for (const r of [notify, welcome]) {
        if (r.status === "rejected") console.error("joinEarlyAccess: Resend threw", r.reason);
        else if (r.value.error) console.error("joinEarlyAccess: Resend error", r.value.error);
      }
    } catch (err) {
      console.error("joinEarlyAccess: Resend threw", err);
    }
  }

  return { status: "success" };
}

function signupTime() {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Welcome email for the person who signed up. Same visual system as the
// site: dark card, gold eyebrows, mono labels. Table layout + inline styles
// for email-client compatibility; hero image hosted on gokold.com.
function welcomeEmailHtml(fullName: string) {
  const first = escapeHtml(fullName.trim().split(/\s+/)[0] || "there");
  const sans = "Helvetica Neue, Helvetica, Arial, sans-serif";
  const mono = "'SF Mono', 'Courier New', Courier, monospace";
  const promise = (label: string, copy: string) => `
    <tr>
      <td style="padding:16px 0; border-top:1px solid rgba(231,227,219,0.12);">
        <div style="font-family:${mono}; font-size:10px; letter-spacing:3px; color:#c9b28c; text-transform:uppercase;">${label}</div>
        <div style="font-family:${sans}; font-size:15px; line-height:1.5; color:#b4b0a8; padding-top:6px;">${copy}</div>
      </td>
    </tr>`;

  return `<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#f2efe9;">
  <div style="display:none; max-height:0; overflow:hidden;">You&rsquo;ll be first to hear launch timing &mdash; founding-member pricing is reserved for this list.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2efe9;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#0a0a0b;">
          <tr>
            <td style="padding:34px 40px 26px;">
              <span style="font-family:${sans}; font-size:15px; font-weight:600; letter-spacing:8px; color:#f2efe9;">KOLD</span>
            </td>
          </tr>
          <tr>
            <td>
              <img src="https://gokold.com/email/kold-hero.jpg" width="560" alt="The KOLD case, smoked lid closed, photographed on black"
                   style="display:block; width:100%; height:auto; border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 8px;">
              <div style="font-family:${mono}; font-size:11px; letter-spacing:4px; color:#c9b28c; text-transform:uppercase;">Founding access</div>
              <div style="font-family:${sans}; font-size:32px; line-height:1.1; letter-spacing:-0.5px; color:#faf8f4; padding:16px 0 18px;">You&rsquo;re on the list.</div>
              <div style="font-family:${sans}; font-size:15px; line-height:1.65; color:#b4b0a8; padding-bottom:26px;">
                Hi ${first} &mdash; thanks for joining KOLD early access. Cold storage, reconsidered:
                a considered home for the part of your routine nobody redesigned.
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${promise("Launch news", "You&rsquo;ll hear timing here first, before general availability.")}
                ${promise("Founding-member pricing", "Reserved for the people on this list.")}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 40px 42px;">
              <a href="https://gokold.com"
                 style="display:inline-block; font-family:${mono}; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#0a0a0b; background:#e7e3db; padding:14px 24px; text-decoration:none;">Visit gokold.com &rarr;</a>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="padding:18px 4px; font-family:${mono}; font-size:10px; letter-spacing:2px; color:#8a7f6b; text-transform:uppercase;">
              You&rsquo;re receiving this because you joined the list at <a href="https://gokold.com" style="color:#8a7f6b; text-decoration:none;">gokold.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Brand-styled notification: dark KOLD card on the site's light ground.
// Table layout + inline styles only, for email-client compatibility.
function signupEmailHtml(fullName: string, email: string) {
  const name = escapeHtml(fullName);
  const addr = escapeHtml(email);
  const sans = "Helvetica Neue, Helvetica, Arial, sans-serif";
  const mono = "'SF Mono', 'Courier New', Courier, monospace";
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:14px 0; border-top:1px solid rgba(231,227,219,0.12); font-family:${mono}; font-size:10px; letter-spacing:3px; color:#7d766a; text-transform:uppercase; vertical-align:baseline; width:110px;">${label}</td>
      <td style="padding:14px 0 14px 16px; border-top:1px solid rgba(231,227,219,0.12); font-family:${sans}; font-size:15px; color:#e7e3db; vertical-align:baseline;">${value}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#f2efe9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2efe9;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#0a0a0b;">
          <tr>
            <td style="padding:34px 40px 26px; border-bottom:1px solid rgba(231,227,219,0.12);">
              <span style="font-family:${sans}; font-size:15px; font-weight:600; letter-spacing:8px; color:#f2efe9;">KOLD</span>
            </td>
          </tr>
          <tr>
            <td style="padding:38px 40px 6px;">
              <div style="font-family:${mono}; font-size:11px; letter-spacing:4px; color:#c9b28c; text-transform:uppercase;">New early-access signup</div>
              <div style="font-family:${sans}; font-size:30px; line-height:1.15; letter-spacing:-0.5px; color:#faf8f4; padding:16px 0 26px;">${name}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${row("Email", `<a href="mailto:${addr}" style="color:#c9b28c; text-decoration:none;">${addr}</a>`)}
                ${row("Signed up", escapeHtml(signupTime()))}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 40px 40px;">
              <a href="https://supabase.com/dashboard/project/ifzmmtxxwoppwxxrqpjr/editor"
                 style="display:inline-block; font-family:${mono}; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#0a0a0b; background:#e7e3db; padding:14px 24px; text-decoration:none;">View the full list &rarr;</a>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="padding:18px 4px; font-family:${mono}; font-size:10px; letter-spacing:2px; color:#8a7f6b; text-transform:uppercase;">
              Sent by the KOLD landing page &middot; <a href="https://gokold.com" style="color:#8a7f6b; text-decoration:none;">gokold.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
