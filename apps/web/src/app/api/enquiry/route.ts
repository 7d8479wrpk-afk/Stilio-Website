import { z } from "zod/v4";

export const runtime = "nodejs";

const EnquirySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  projectType: z.enum(["Interior design", "Renovation", "Workplace", "Not sure yet"]),
  location: z.string().max(160).optional().default(""),
  message: z.string().min(10).max(4000),
  // honeypot — bots fill it, humans never see it
  company: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  let data: z.infer<typeof EnquirySchema>;
  try {
    data = EnquirySchema.parse(await req.json());
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof z.ZodError ? z.prettifyError(err) : "Invalid form" },
      { status: 400 },
    );
  }

  const record = {
    at: new Date().toISOString(),
    name: data.name,
    email: data.email,
    projectType: data.projectType,
    location: data.location,
    message: data.message,
  };

  // Server-side record. Forward to a webhook if one is configured for the deploy.
  console.info("[enquiry]", JSON.stringify(record));

  const webhook = process.env.STILIO_ENQUIRY_WEBHOOK;
  let forwarded = false;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(record),
      });
      forwarded = res.ok;
    } catch {
      forwarded = false;
    }
  }

  return Response.json({ ok: true, forwarded });
}
