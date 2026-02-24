import { PrismaClient, Creator, Video, Payment } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.activity.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.video.deleteMany();
  await prisma.creator.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await hash(process.env.ADMIN_PASSWORD || "admin123", 12);
  const managerPassword = await hash("manager123", 12);
  const viewerPassword = await hash("viewer123", 12);

  const admin = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || "admin@playkami.io",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: "sarah@playkami.io",
      name: "Sarah Chen",
      password: managerPassword,
      role: "MANAGER",
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: "mike@playkami.io",
      name: "Mike Torres",
      password: viewerPassword,
      role: "VIEWER",
    },
  });

  console.log("Created users");

  const users = [admin, manager, viewer];

  // Creator data
  const creatorsData = [
    { name: "Alex Pokevault", handle: "pokevault", platform: "INSTAGRAM" as const, category: "TCG" as const, status: "ACTIVE" as const, source: "OUTBOUND_DM" as const, followerCount: 245000, engagementRate: 4.2, ratePerVideo: 500, rateType: "FLAT" as const, paymentTerms: "NET_30" as const, priority: "HIGH" as const, tags: ["pokemon", "whale", "consistent"], bio: "Pokemon TCG collector & content creator. Opening packs daily.", profileImageUrl: null, outreachDate: "2024-06-15", responseDate: "2024-06-17", closedDate: "2024-07-01" },
    { name: "Maya CardQueen", handle: "cardqueenmaya", platform: "TIKTOK" as const, category: "TCG" as const, status: "ACTIVE" as const, source: "INBOUND" as const, followerCount: 890000, engagementRate: 6.8, ratePerVideo: 1200, rateType: "FLAT" as const, paymentTerms: "NET_15" as const, priority: "HIGH" as const, tags: ["pokemon", "one-piece", "viral", "whale"], bio: "TCG girlie | 900K on TikTok | Pack openings & pulls", profileImageUrl: null, outreachDate: "2024-05-01", responseDate: "2024-05-02", closedDate: "2024-05-15" },
    { name: "Brandon Rips", handle: "brandonrips", platform: "YOUTUBE" as const, category: "TCG" as const, status: "ACTIVE" as const, source: "REFERRAL" as const, followerCount: 156000, engagementRate: 3.5, ratePerVideo: 800, rateType: "HYBRID" as const, paymentTerms: "NET_30" as const, priority: "HIGH" as const, tags: ["pokemon", "youtube-focus", "long-form"], bio: "YouTube TCG content. Pack openings, market analysis, investment tips.", profileImageUrl: null, outreachDate: "2024-07-10", responseDate: "2024-07-12", closedDate: "2024-08-01" },
    { name: "Jess OnePiece", handle: "jessonepiece", platform: "INSTAGRAM" as const, category: "TCG" as const, status: "ACTIVE" as const, source: "OUTBOUND_DM" as const, followerCount: 78000, engagementRate: 5.1, ratePerVideo: 300, rateType: "FLAT" as const, paymentTerms: "NET_30" as const, priority: "MEDIUM" as const, tags: ["one-piece", "micro", "high-engagement"], bio: "One Piece TCG collector. Daily reel content.", profileImageUrl: null, outreachDate: "2024-08-01", responseDate: "2024-08-05", closedDate: "2024-08-20" },
    { name: "Tyler PackRipper", handle: "tylerpackripper", platform: "MULTI_PLATFORM" as const, category: "TCG" as const, status: "ACTIVE" as const, source: "AGENCY" as const, followerCount: 420000, engagementRate: 4.8, ratePerVideo: 1500, rateType: "CPM" as const, paymentTerms: "NET_15" as const, priority: "HIGH" as const, tags: ["pokemon", "multi-platform", "premium", "whale"], bio: "Full-time TCG creator. IG + TikTok + YT. Agency represented.", profileImageUrl: null, outreachDate: "2024-04-01", responseDate: "2024-04-03", closedDate: "2024-04-20" },
    { name: "Luna GamingVibes", handle: "lunagamingvibes", platform: "TIKTOK" as const, category: "GAMING" as const, status: "ACTIVE" as const, source: "INBOUND" as const, followerCount: 310000, engagementRate: 7.2, ratePerVideo: 600, rateType: "FLAT" as const, paymentTerms: "NET_30" as const, priority: "MEDIUM" as const, tags: ["gaming", "crossover", "female-audience"], bio: "Gaming + collectibles. Mixing digital and physical worlds.", profileImageUrl: null, outreachDate: "2024-09-01", responseDate: "2024-09-03", closedDate: "2024-09-15" },
    { name: "Chris CardMarket", handle: "chriscardmarket", platform: "YOUTUBE" as const, category: "TCG" as const, status: "ACTIVE" as const, source: "OUTBOUND_DM" as const, followerCount: 95000, engagementRate: 3.9, ratePerVideo: 400, rateType: "REVENUE_SHARE" as const, paymentTerms: "NET_60" as const, priority: "MEDIUM" as const, tags: ["pokemon", "market-analysis", "educational"], bio: "TCG market analyst. Data-driven content about card values.", profileImageUrl: null, revSharePercentage: 15, outreachDate: "2024-07-20", responseDate: "2024-07-25", closedDate: "2024-08-10" },
    { name: "Diamond Dave", handle: "diamonddave_tcg", platform: "INSTAGRAM" as const, category: "TCG" as const, status: "NEGOTIATING" as const, source: "OUTBOUND_DM" as const, followerCount: 185000, engagementRate: 4.5, ratePerVideo: null, rateType: null, paymentTerms: null, priority: "HIGH" as const, tags: ["pokemon", "high-end", "luxury"], bio: "High-end Pokemon collector. PSA 10 specialist.", profileImageUrl: null, outreachDate: "2024-10-01", responseDate: "2024-10-05", closedDate: null },
    { name: "Sakura Pulls", handle: "sakura_pulls", platform: "TIKTOK" as const, category: "TCG" as const, status: "RESPONDED" as const, source: "INBOUND" as const, followerCount: 520000, engagementRate: 8.1, ratePerVideo: null, rateType: null, paymentTerms: null, priority: "HIGH" as const, tags: ["pokemon", "japanese-cards", "viral"], bio: "Japanese Pokemon card specialist. Viral pull reactions.", profileImageUrl: null, outreachDate: "2024-10-10", responseDate: "2024-10-12", closedDate: null },
    { name: "Mike Duelist", handle: "mikeduelist", platform: "YOUTUBE" as const, category: "TCG" as const, status: "CONTACTED" as const, source: "OUTBOUND_DM" as const, followerCount: 67000, engagementRate: 3.2, ratePerVideo: null, rateType: null, paymentTerms: null, priority: "MEDIUM" as const, tags: ["yugioh", "gameplay"], bio: "Yu-Gi-Oh! competitive player and content creator.", profileImageUrl: null, outreachDate: "2024-10-15", responseDate: null, closedDate: null },
    { name: "Amber Unboxes", handle: "amberunboxes", platform: "INSTAGRAM" as const, category: "LIFESTYLE" as const, status: "LEAD" as const, source: "OTHER" as const, followerCount: 145000, engagementRate: 5.3, ratePerVideo: null, rateType: null, paymentTerms: null, priority: "LOW" as const, tags: ["unboxing", "lifestyle", "potential"], bio: "Lifestyle unboxing content. Could cross into TCG.", profileImageUrl: null, outreachDate: null, responseDate: null, closedDate: null },
    { name: "Kai Collector", handle: "kai_collector", platform: "TIKTOK" as const, category: "TCG" as const, status: "LEAD" as const, source: "REFERRAL" as const, followerCount: 34000, engagementRate: 9.2, ratePerVideo: null, rateType: null, paymentTerms: null, priority: "MEDIUM" as const, tags: ["micro", "high-engagement", "pokemon"], bio: "Micro influencer with incredible engagement. Growing fast.", profileImageUrl: null, outreachDate: null, responseDate: null, closedDate: null },
    { name: "Nate Graded", handle: "nategraded", platform: "INSTAGRAM" as const, category: "TCG" as const, status: "AGREED" as const, source: "OUTBOUND_DM" as const, followerCount: 112000, engagementRate: 4.0, ratePerVideo: 350, rateType: "FLAT" as const, paymentTerms: "NET_30" as const, priority: "MEDIUM" as const, tags: ["grading", "psa", "pokemon"], bio: "Grading specialist. PSA submissions and reveals.", profileImageUrl: null, outreachDate: "2024-09-20", responseDate: "2024-09-25", closedDate: "2024-10-10" },
    { name: "Riley Slots", handle: "rileyslots", platform: "TIKTOK" as const, category: "GAMBLING" as const, status: "ACTIVE" as const, source: "INBOUND" as const, followerCount: 670000, engagementRate: 5.5, ratePerVideo: 900, rateType: "FLAT" as const, paymentTerms: "NET_15" as const, priority: "MEDIUM" as const, tags: ["gambling", "slots", "crossover"], bio: "Slots + pack openings. The gamble content king.", profileImageUrl: null, outreachDate: "2024-06-01", responseDate: "2024-06-02", closedDate: "2024-06-15" },
    { name: "Cody Comedy", handle: "codycomedy_tcg", platform: "TIKTOK" as const, category: "COMEDY" as const, status: "ACTIVE" as const, source: "OUTBOUND_DM" as const, followerCount: 1200000, engagementRate: 8.5, ratePerVideo: 2000, rateType: "FLAT" as const, paymentTerms: "ON_DELIVERY" as const, priority: "HIGH" as const, tags: ["comedy", "viral", "mega", "pokemon"], bio: "Comedy + TCG. Viral skits about pack opening addiction.", profileImageUrl: null, outreachDate: "2024-03-01", responseDate: "2024-03-02", closedDate: "2024-03-10" },
    { name: "Elena Evolves", handle: "elenaevolves", platform: "INSTAGRAM" as const, category: "TCG" as const, status: "ONBOARDING" as const, source: "REFERRAL" as const, followerCount: 93000, engagementRate: 4.7, ratePerVideo: 275, rateType: "FLAT" as const, paymentTerms: "NET_30" as const, priority: "MEDIUM" as const, tags: ["pokemon", "evolving-skies", "aesthetic"], bio: "Aesthetic Pokemon content. Beautiful flat lays and pulls.", profileImageUrl: null, outreachDate: "2024-10-01", responseDate: "2024-10-03", closedDate: "2024-10-15" },
    { name: "Jake BoxBreaks", handle: "jakeboxbreaks", platform: "YOUTUBE" as const, category: "TCG" as const, status: "PAUSED" as const, source: "OUTBOUND_DM" as const, followerCount: 45000, engagementRate: 2.8, ratePerVideo: 200, rateType: "FLAT" as const, paymentTerms: "NET_30" as const, priority: "LOW" as const, tags: ["pokemon", "box-breaks", "budget"], bio: "Budget box breaks and affordable TCG content.", profileImageUrl: null, outreachDate: "2024-05-01", responseDate: "2024-05-10", closedDate: "2024-06-01" },
    { name: "Tara TradingPost", handle: "taratradingpost", platform: "MULTI_PLATFORM" as const, category: "TCG" as const, status: "CHURNED" as const, source: "AGENCY" as const, followerCount: 200000, engagementRate: 3.0, ratePerVideo: 700, rateType: "FLAT" as const, paymentTerms: "NET_30" as const, priority: "LOW" as const, tags: ["pokemon", "trading", "churned-q3"], bio: "Trading card marketplace influencer. Moved to competitor.", profileImageUrl: null, outreachDate: "2024-02-01", responseDate: "2024-02-03", closedDate: "2024-02-20" },
    { name: "Oscar Openings", handle: "oscaropenings", platform: "TIKTOK" as const, category: "TCG" as const, status: "REJECTED" as const, source: "OUTBOUND_DM" as const, followerCount: 380000, engagementRate: 6.0, ratePerVideo: null, rateType: null, paymentTerms: null, priority: "LOW" as const, tags: ["pokemon", "rejected", "too-expensive"], bio: "High-energy pack openings. Wanted $5K per video.", profileImageUrl: null, outreachDate: "2024-08-01", responseDate: "2024-08-03", closedDate: null },
    { name: "Wendy Wax Packs", handle: "wendywaxpacks", platform: "INSTAGRAM" as const, category: "TCG" as const, status: "LEAD" as const, source: "OTHER" as const, followerCount: 28000, engagementRate: 7.8, ratePerVideo: null, rateType: null, paymentTerms: null, priority: "MEDIUM" as const, tags: ["vintage", "wax-packs", "micro"], bio: "Vintage wax pack opener. Small but dedicated audience.", profileImageUrl: null, outreachDate: null, responseDate: null, closedDate: null },
    { name: "Derek DigiCards", handle: "derekdigicards", platform: "YOUTUBE" as const, category: "GAMING" as const, status: "CONTACTED" as const, source: "OUTBOUND_DM" as const, followerCount: 55000, engagementRate: 3.8, ratePerVideo: null, rateType: null, paymentTerms: null, priority: "MEDIUM" as const, tags: ["digital-cards", "gaming", "tech"], bio: "Digital card games and blockchain collectibles.", profileImageUrl: null, outreachDate: "2024-10-20", responseDate: null, closedDate: null },
    { name: "Fiona FoilPulls", handle: "fionafoilpulls", platform: "TIKTOK" as const, category: "TCG" as const, status: "NEGOTIATING" as const, source: "INBOUND" as const, followerCount: 290000, engagementRate: 7.0, ratePerVideo: null, rateType: null, paymentTerms: null, priority: "HIGH" as const, tags: ["foil", "secret-rare", "pokemon", "satisfying"], bio: "Satisfying foil pulls and ASMR card content.", profileImageUrl: null, outreachDate: "2024-10-05", responseDate: "2024-10-06", closedDate: null },
    { name: "Grant GameNight", handle: "grantgamenight", platform: "YOUTUBE" as const, category: "GAMING" as const, status: "RESPONDED" as const, source: "REFERRAL" as const, followerCount: 125000, engagementRate: 4.1, ratePerVideo: null, rateType: null, paymentTerms: null, priority: "MEDIUM" as const, tags: ["tabletop", "game-night", "family-friendly"], bio: "Family-friendly tabletop and TCG game night content.", profileImageUrl: null, outreachDate: "2024-10-08", responseDate: "2024-10-14", closedDate: null },
    { name: "Hana HoloCards", handle: "hanaholocards", platform: "INSTAGRAM" as const, category: "TCG" as const, status: "AGREED" as const, source: "OUTBOUND_DM" as const, followerCount: 165000, engagementRate: 5.6, ratePerVideo: 450, rateType: "FLAT" as const, paymentTerms: "NET_30" as const, priority: "HIGH" as const, tags: ["holographic", "aesthetic", "pokemon", "premium-content"], bio: "Holographic card photography and premium unboxing.", profileImageUrl: null, outreachDate: "2024-09-15", responseDate: "2024-09-18", closedDate: "2024-10-05" },
    { name: "Ivan InvestCards", handle: "ivaninvestcards", platform: "YOUTUBE" as const, category: "TCG" as const, status: "LEAD" as const, source: "INBOUND" as const, followerCount: 48000, engagementRate: 3.4, ratePerVideo: null, rateType: null, paymentTerms: null, priority: "LOW" as const, tags: ["investment", "market", "long-form", "educational"], bio: "TCG as investment. Market analysis and portfolio tracking.", profileImageUrl: null, outreachDate: null, responseDate: null, closedDate: null },
  ];

  const creators: Creator[] = [];
  for (const data of creatorsData) {
    const c = await prisma.creator.create({
      data: {
        name: data.name,
        handle: data.handle,
        platform: data.platform,
        category: data.category,
        status: data.status,
        source: data.source,
        followerCount: data.followerCount,
        engagementRate: data.engagementRate,
        ratePerVideo: data.ratePerVideo,
        rateType: data.rateType,
        paymentTerms: data.paymentTerms,
        priority: data.priority,
        tags: data.tags,
        bio: data.bio,
        profileImageUrl: data.profileImageUrl,
        revSharePercentage: (data as any).revSharePercentage || null,
        outreachDate: data.outreachDate ? new Date(data.outreachDate) : null,
        responseDate: data.responseDate ? new Date(data.responseDate) : null,
        closedDate: data.closedDate ? new Date(data.closedDate) : null,
        assignedToId: users[Math.floor(Math.random() * 2)].id, // assign to admin or manager
      },
    });
    creators.push(c);
  }
  console.log(`Created ${creators.length} creators`);

  // Get active creators for videos
  const activeCreators = creators.filter((c) =>
    ["ACTIVE", "PAUSED"].includes(creatorsData[creators.indexOf(c)].status)
  );

  // Video data
  const videoPlatforms = ["INSTAGRAM_REEL", "INSTAGRAM_STORY", "TIKTOK", "YOUTUBE_SHORT", "YOUTUBE_VIDEO"] as const;
  const contentTypes = ["PACK_OPENING", "REVIEW", "UNBOXING", "GIVEAWAY", "TESTIMONIAL", "TUTORIAL"] as const;
  const products = [
    "PlayKami Pokemon Collection", "PlayKami Starter Pack", "PlayKami One Piece Drop",
    "PlayKami Holiday Box", "PlayKami Vintage Series", "PlayKami Mystery Box",
    "PlayKami Premium Collection", "PlayKami Digital + Physical Bundle",
  ];

  const videos: Video[] = [];
  for (let i = 0; i < 55; i++) {
    const creator = activeCreators[i % activeCreators.length];
    const creatorData = creatorsData[creators.indexOf(creator)];
    const platform = creatorData.platform === "YOUTUBE"
      ? (Math.random() > 0.3 ? "YOUTUBE_VIDEO" : "YOUTUBE_SHORT")
      : creatorData.platform === "TIKTOK"
      ? "TIKTOK"
      : (Math.random() > 0.3 ? "INSTAGRAM_REEL" : "INSTAGRAM_STORY");

    const views = Math.floor(Math.random() * 500000) + 10000;
    const likes = Math.floor(views * (0.02 + Math.random() * 0.08));
    const comments = Math.floor(likes * (0.05 + Math.random() * 0.15));
    const shares = Math.floor(likes * (0.02 + Math.random() * 0.1));
    const saves = Math.floor(likes * (0.1 + Math.random() * 0.3));
    const rate = creatorData.ratePerVideo || 300;
    const amountPaid = rate + Math.floor(Math.random() * 200) - 100;

    const daysAgo = Math.floor(Math.random() * 180);
    const postedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const v = await prisma.video.create({
      data: {
        creatorId: creator.id,
        platform: platform as any,
        postUrl: `https://example.com/video/${i}`,
        postedAt,
        contentType: contentTypes[Math.floor(Math.random() * contentTypes.length)],
        caption: `Check out the new ${products[Math.floor(Math.random() * products.length)]}! #PlayKami #TCG #Pokemon`,
        productFeatured: products[Math.floor(Math.random() * products.length)],
        views,
        likes,
        comments,
        shares,
        saves,
        amountPaid: Math.max(amountPaid, 50),
        paymentStatus: Math.random() > 0.2 ? "PAID" : Math.random() > 0.5 ? "PENDING" : "INVOICED",
        paymentDate: Math.random() > 0.3 ? new Date(postedAt.getTime() + 30 * 24 * 60 * 60 * 1000) : null,
      },
    });
    videos.push(v);
  }
  console.log(`Created ${videos.length} videos`);

  // Payments
  const payments: Payment[] = [];
  for (const video of videos) {
    if (video.paymentStatus === "PAID" || Math.random() > 0.4) {
      const p = await prisma.payment.create({
        data: {
          creatorId: video.creatorId,
          videoId: video.id,
          amount: video.amountPaid,
          method: (["PAYPAL", "WIRE", "CRYPTO", "VENMO"] as const)[Math.floor(Math.random() * 4)],
          status: video.paymentStatus === "PAID" ? "COMPLETED" : Math.random() > 0.5 ? "SCHEDULED" : "PROCESSING",
          reference: `PAY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          scheduledDate: video.paymentDate || new Date(video.postedAt.getTime() + 30 * 24 * 60 * 60 * 1000),
          completedDate: video.paymentStatus === "PAID" ? video.paymentDate : null,
        },
      });
      payments.push(p);
    }
  }
  console.log(`Created ${payments.length} payments`);

  // Activity logs
  const activityTypes = ["NOTE", "EMAIL", "DM", "CALL", "STATUS_CHANGE", "VIDEO_ADDED", "PAYMENT"] as const;
  const activityTemplates = [
    "Initial outreach via DM. Sent partnership proposal.",
    "Creator responded positively. Interested in collaboration.",
    "Discussed rates and content expectations on a call.",
    "Sent contract draft for review.",
    "Creator signed agreement. Moving to onboarding.",
    "First video delivered and posted. Great quality!",
    "Payment processed successfully.",
    "Followed up on content calendar for next month.",
    "Creator asked about increasing frequency to 2x/month.",
    "Reviewed Q3 performance metrics. CPV trending down nicely.",
    "Negotiating rate increase for Q4.",
    "Added to VIP creator list for product launches.",
    "Creator mentioned interest in One Piece TCG content too.",
    "Discussed exclusive content for PlayKami app launch.",
    "Sent PlayKami merch package as a thank you.",
    "Creator shared positive feedback about PlayKami products.",
    "Set up content calendar for next quarter.",
    "Discussed potential event collaboration for card expo.",
    "Creator requested early access to new collection drops.",
    "Monthly check-in call completed. All good.",
  ];

  for (const creator of creators) {
    const numActivities = Math.floor(Math.random() * 8) + 2;
    for (let i = 0; i < numActivities; i++) {
      const daysAgo = Math.floor(Math.random() * 120);
      await prisma.activity.create({
        data: {
          creatorId: creator.id,
          userId: users[Math.floor(Math.random() * 2)].id,
          type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
          content: activityTemplates[Math.floor(Math.random() * activityTemplates.length)],
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
  console.log("Created activity logs");

  console.log("Seed completed successfully!");
  console.log(`\nLogin credentials:`);
  console.log(`  Admin: admin@playkami.io / admin123`);
  console.log(`  Manager: sarah@playkami.io / manager123`);
  console.log(`  Viewer: mike@playkami.io / viewer123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
