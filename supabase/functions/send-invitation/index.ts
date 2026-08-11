import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, role, firstName, lastName, orgName, invitationUrl } = await req.json();

    if (!email || !invitationUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not configured — skipping email send");
      return new Response(
        JSON.stringify({ success: true, skipped: true, message: "Email service not configured; invitation created without email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);

    const roleLabel = role === "VENDOR" ? "Vendor" : "Tenant";
    const subject = `You're invited to join ${orgName || "PropertyMS"} as a ${roleLabel}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { background: linear-gradient(135deg, #1e3a8a, #312e81); color: white; padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
            .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; }
            .greeting { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
            .message { font-size: 16px; color: #4b5563; margin-bottom: 24px; }
            .button { display: inline-block; padding: 14px 32px; background: #1e3a8a; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0; }
            .button:hover { background: #312e81; }
            .footer { background: #f9fafb; padding: 24px 30px; border-radius: 0 0 12px 12px; text-align: center; font-size: 14px; color: #6b7280; }
            .details { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0; }
            .details-item { margin: 8px 0; font-size: 14px; }
            .details-label { font-weight: 600; color: #374151; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>PropertyMS</h1>
              <p>Kenya Property Management</p>
            </div>
            <div class="content">
              <div class="greeting">Hi${firstName ? ` ${firstName}` : ""},</div>
              <div class="message">
                You've been invited to join <strong>${orgName || "PropertyMS"}</strong> as a <strong>${roleLabel}</strong>.
                Click the button below to set up your account and access your portal.
              </div>
              <div class="details">
                <div class="details-item">
                  <span class="details-label">Organization:</span> ${orgName || "PropertyMS"}
                </div>
                <div class="details-item">
                  <span class="details-label">Role:</span> ${roleLabel}
                </div>
                ${firstName ? `<div class="details-item"><span class="details-label">Name:</span> ${firstName}${lastName ? ` ${lastName}` : ""}</div>` : ""}
              </div>
              <a href="${invitationUrl}" class="button">Accept Invitation</a>
              <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
                This link will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>PropertyMS · Nairobi · Kenya</p>
              <p style="margin-top: 8px; font-size: 12px;">This is an automated message. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: "PropertyMS <noreply@propertyms.co.ke>",
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
