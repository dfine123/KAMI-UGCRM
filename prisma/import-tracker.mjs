// One-time import of the PLAYKAMI Influencer Tracker spreadsheet.
// Runs on app start. Only creates creators whose handle isn't already in the
// CRM; never modifies existing records. Skips entirely once the batch has run.
import { PrismaClient } from "@prisma/client";

const BATCH = "playkami-tracker-2026-10";

// Source: PLAYKAMI-Influencer-Tracker.xlsx (Creator, Handle, Followers, Posts per week, Rate)
const ROWS = [
  { name: "Jasmine Grey", handle: "pokejasminee", followers: 81376, postsPerWeek: null, rate: 800 },
  { name: "Kim", handle: "kimthecollector", followers: 34750, postsPerWeek: 5.73, rate: 500 },
  { name: "PokéDexter", handle: "itspokedexter", followers: 26495, postsPerWeek: 0.47, rate: null },
  { name: "Samantha Ramos", handle: "samthefox786", followers: 24779, postsPerWeek: 10.5, rate: 250, rateNote: "Quoted $200–300 per video" },
  { name: "pokimacy", handle: "pokimacy", followers: 12404, postsPerWeek: 2.25, rate: null },
  { name: "Mint", handle: "minty_bb", followers: 10583, postsPerWeek: 3.82, rate: null },
  { name: "Valerie", handle: "valzors", followers: 7418, postsPerWeek: 5.13, rate: 150 },
  { name: "Pikachu Girl", handle: "jessii_cattt", followers: 6308, postsPerWeek: 2.66, rate: 200 },
  { name: "Charlotte", handle: "foxxglitter", followers: 6165, postsPerWeek: 0.47, rate: 300 },
  { name: "Kayli", handle: "pokaylii", followers: 5958, postsPerWeek: 0.93, rate: null },
  { name: "Paige Louise", handle: "pokemon_paige", followers: 5413, postsPerWeek: 4.85, rate: null },
];

const prisma = new PrismaClient();

function priorityFor(followers) {
  if (followers >= 25000) return "HIGH";
  if (followers >= 10000) return "MEDIUM";
  return "LOW";
}

async function fetchInstagram(handle, apiKey) {
  try {
    const res = await fetch("https://instagram120.p.rapidapi.com/api/instagram/profile", {
      method: "POST",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "instagram120.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: handle }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.result ?? null;
  } catch {
    return null;
  }
}

// Instagram CDN links expire, so store the picture itself in the Upload table.
async function storeProfilePic(url, handle) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.startsWith("image/")) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length > 5 * 1024 * 1024) return null;
    const upload = await prisma.upload.create({
      data: { data: bytes, mimeType: type.split(";")[0], fileName: `${handle}.jpg` },
    });
    return `/api/uploads/${upload.id}`;
  } catch {
    return null;
  }
}

async function main() {
  const alreadyRan = await prisma.activity.findFirst({
    where: { metadata: { path: ["importComplete"], equals: BATCH } },
    select: { id: true },
  });
  if (alreadyRan) {
    console.log(`[import-tracker] ${BATCH} already imported, skipping`);
    return;
  }

  const existing = await prisma.creator.findMany({ select: { handle: true } });
  const taken = new Set(existing.map((c) => c.handle.replace(/^@/, "").toLowerCase()));
  const toCreate = ROWS.filter((r) => !taken.has(r.handle.toLowerCase()));
  if (toCreate.length === 0) {
    console.log("[import-tracker] all tracker creators already exist, nothing to do");
    return;
  }

  const user = await prisma.user.findFirst({ where: { role: "ADMIN" } }) ?? await prisma.user.findFirst();
  const apiKey = process.env.RAPIDAPI_KEY;

  let created = 0;
  let lastActivity = null;
  for (const row of toCreate) {
    const ig = apiKey ? await fetchInstagram(row.handle, apiKey) : null;
    const picUrl = ig ? ig.profile_pic_url_hd || ig.profile_pic_url : null;
    const profileImageUrl = picUrl ? await storeProfilePic(picUrl, row.handle) : null;

    const notes = [
      "Imported from PLAYKAMI Influencer Tracker (reactivation).",
      row.postsPerWeek != null ? `Posting cadence: ~${row.postsPerWeek} posts/week.` : null,
      ig?.edge_owner_to_timeline_media?.count != null ? `Instagram posts: ${ig.edge_owner_to_timeline_media.count}.` : null,
      ig?.is_private ? "Instagram account is private." : null,
    ].filter(Boolean).join("\n");

    const creator = await prisma.creator.create({
      data: {
        name: row.name,
        handle: row.handle,
        platform: "INSTAGRAM",
        category: "TCG",
        followerCount: row.followers,
        bio: ig?.biography || null,
        profileImageUrl,
        status: row.rate != null ? "RESPONDED" : "LEAD",
        source: "OTHER",
        priority: priorityFor(row.followers),
        ratePerVideo: row.rate,
        rateType: row.rate != null ? "FLAT" : null,
        contractNotes: row.rateNote ?? null,
        tags: ["pokemon", "reactivation", "tracker-import", row.followers < 100000 ? "micro" : "macro"],
        notes,
        assignedToId: user?.id ?? null,
      },
    });

    if (user) {
      lastActivity = await prisma.activity.create({
        data: {
          creatorId: creator.id,
          userId: user.id,
          type: "NOTE",
          content: `Creator "${row.name}" imported from PLAYKAMI Influencer Tracker`,
          metadata: { importBatch: BATCH, enriched: Boolean(ig) },
        },
      });
    }
    created++;
    console.log(`[import-tracker] created @${row.handle}${ig ? " (Instagram data added)" : ""}`);
  }

  // Mark the batch complete only after every row went in, so a crash mid-way
  // lets the next start finish the remaining rows (the handle check prevents duplicates).
  if (lastActivity) {
    await prisma.activity.update({
      where: { id: lastActivity.id },
      data: { metadata: { importBatch: BATCH, importComplete: BATCH } },
    });
  }

  console.log(`[import-tracker] done: ${created} created, ${ROWS.length - toCreate.length} skipped (already in CRM)`);
}

main()
  .catch((e) => console.error("[import-tracker] failed:", e))
  .finally(() => prisma.$disconnect());
