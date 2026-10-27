// One-time import of the creator community outreach sheet. Runs on app start
// and only seeds when the Community table is empty, so edits and deletions
// made in the CRM afterwards are never overwritten.
import { PrismaClient } from "@prisma/client";

// Source: creator_community_outreach_template.xlsx
const ROWS = [
  { name: "AyeZee", communityPlatform: "DISCORD", creatorPlatform: "KICK", communitySize: 70000, creatorSize: "XXL", status: "REACHED_OUT", notes: "Major gambling streamer, does not have a Prize Deal" },
  { name: "Syztmz", communityPlatform: "DISCORD", creatorPlatform: "KICK", communitySize: 12000, creatorSize: "XL", status: "REACHED_OUT", notes: "More Degen Gambling. Has a really well optimized leaderboard" },
  { name: "Chimper", communityPlatform: "DISCORD", creatorPlatform: "KICK", communitySize: 6000, creatorSize: "L", status: "REACHED_OUT", notes: "Good streamer archetype" },
  { name: "Gold Boys", communityPlatform: "DISCORD (PAID)", creatorPlatform: "INSTAGRAM", communitySize: 5000, creatorSize: "M", status: "REACHED_OUT", notes: "Sports Betting Group, more of an exploritory proposal" },
  { name: "RunAlong", communityPlatform: "DISCORD", creatorPlatform: "KICK", communitySize: 3000, creatorSize: "M", status: "REACHED_OUT", notes: "Streamer. Currently has packdraw deal" },
  { name: "Taiga", communityPlatform: "DISCORD", creatorPlatform: "KICK", communitySize: 3000, creatorSize: "M", status: "REACHED_OUT", notes: "Ex E-Sports, More \"Trad-Leaderboard\" Style" },
  { name: "Lady Luck Slots", communityPlatform: "DISCORD", creatorPlatform: "KICK", communitySize: 1600, creatorSize: "M", status: "REACHED_OUT", notes: "Female Angle. (Urban lol)" },
  { name: "HoneyLiva", communityPlatform: "DISCORD", creatorPlatform: "KICK", communitySize: 1000, creatorSize: "S/SM", status: "RESPONDED", askingDeal: "Retainer Heavy w/ Rev-Share", notes: "OF Girl Archetype. $2.6M in deposits with casino" },
  { name: "Prudent", communityPlatform: "DISCORD", creatorPlatform: "KICK", communitySize: 1000, creatorSize: "SM", status: "REACHED_OUT", notes: "Degen Gamble Space" },
  { name: "WiEma", communityPlatform: "DISCORD", creatorPlatform: "KICK", communitySize: 400, creatorSize: "S", status: "REACHED_OUT", notes: "Girl Angle duo" },
];

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.community.count();
  if (existing > 0) {
    console.log(`[import-communities] ${existing} communities already present, skipping`);
    return;
  }
  const result = await prisma.community.createMany({ data: ROWS });
  console.log(`[import-communities] created ${result.count} communities`);
}

main()
  .catch((e) => console.error("[import-communities] failed:", e))
  .finally(() => prisma.$disconnect());
