import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 });
  }

  const { templateBody, creator, tone } = await req.json();

  if (!templateBody || !creator) {
    return NextResponse.json({ error: "Template body and creator data are required" }, { status: 400 });
  }

  const toneInstruction = tone === "CASUAL_MALE"
    ? "Match this tone style: CASUAL_MALE. Use bro-ish/relaxed energy."
    : tone === "CASUAL_FEMALE"
    ? "Match this tone style: CASUAL_FEMALE. Use friendly/upbeat energy."
    : tone === "FORMAL"
    ? "Match this tone style: FORMAL. Keep it professional."
    : "Match this tone style: NEUTRAL. Maintain the brand voice from the template but keep it friendly.";

  const prompt = `You are a marketing outreach specialist for PlayKami (playkami.io), a gamified digital collectibles platform where users open Pokemon and One Piece TCG packs digitally and can redeem physical prizes including graded cards. Using the following template as a base structure and tone guide, write a personalized outreach DM for this creator. Make it feel natural and personal — reference their bio, content style, or niche specifically. Keep it concise (under 200 words for DMs). ${toneInstruction}

Template: ${templateBody}

Creator info:
Name: ${creator.name}
Handle: ${creator.handle}
Bio: ${creator.bio || "N/A"}
Followers: ${creator.followerCount || "N/A"}
Category: ${creator.category || "N/A"}
Notes: ${creator.notes || "N/A"}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Anthropic API error:", errText);
      return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
    }

    const data = await res.json();
    const message = data.content?.[0]?.text || "";

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
  }
}
