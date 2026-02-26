import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username } = await req.json();

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "RapidAPI key not configured" }, { status: 500 });
  }

  // Clean the username: handle URLs, @prefix, etc.
  let clean = username.trim();
  // Handle full URLs like https://www.instagram.com/username/
  const urlMatch = clean.match(/instagram\.com\/([^/?]+)/);
  if (urlMatch) clean = urlMatch[1];
  // Remove @ prefix
  clean = clean.replace(/^@/, "");

  try {
    const res = await fetch("https://instagram120.p.rapidapi.com/api/instagram/profile", {
      method: "POST",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "instagram120.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: clean }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch Instagram profile" }, { status: 502 });
    }

    const data = await res.json();
    const result = data?.result;

    if (!result) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      fullName: result.full_name || "",
      username: result.username || clean,
      bio: result.biography || "",
      profilePicUrl: result.profile_pic_url_hd || result.profile_pic_url || "",
      followers: result.edge_followed_by?.count || 0,
      following: result.edge_follow?.count || 0,
      postCount: result.edge_owner_to_timeline_media?.count || 0,
      isPrivate: result.is_private || false,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch Instagram profile" }, { status: 502 });
  }
}
