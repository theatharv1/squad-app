import { db, schema } from "./index.js";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

const avatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true&size=128`;

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.execute(sql`TRUNCATE TABLE refresh_tokens, blocked_users, reports, badges, reviews, messages, conversation_members, conversations, pool_participants, follows, notifications, venues, pools, users CASCADE`);

  const hash = await bcrypt.hash("password123", 12);

  // ── Users ──
  const userValues = [
    { name: "Admin", username: "admin", email: "admin@squad.app", passwordHash: hash, avatarUrl: avatar("Admin"), bio: "Platform administrator", city: "Bhopal", sportsPlayed: ["Football"], rating: "5.00", totalGames: 0, showUpRate: 100, followersCount: 0, followingCount: 0, karma: 9999, role: "admin" as const, isVerified: true },
    { name: "Yathu", username: "yathu_bhopal", email: "yathu@squad.app", passwordHash: hash, avatarUrl: avatar("Yathu"), bio: "Builder. Footballer. Always down for something.", city: "Bhopal", sportsPlayed: ["Football", "Badminton", "Cricket"], rating: "4.80", totalGames: 47, showUpRate: 98, followersCount: 234, followingCount: 89, karma: 1240, isVerified: true },
    { name: "Rahul Sharma", username: "rahul_s", email: "rahul@squad.app", passwordHash: hash, avatarUrl: avatar("Rahul Sharma"), bio: "Cricket fanatic and weekend traveler", city: "Indore", sportsPlayed: ["Cricket", "Football", "Running"], rating: "4.50", totalGames: 63, showUpRate: 95, followersCount: 189, followingCount: 112, karma: 980, isVerified: true },
    { name: "Priya Mehta", username: "priya_m", email: "priya@squad.app", passwordHash: hash, avatarUrl: avatar("Priya Mehta"), bio: "Run first, think later. Hiker on rest days.", city: "Bhopal", sportsPlayed: ["Running", "Badminton", "Hiking"], rating: "4.90", totalGames: 31, showUpRate: 100, followersCount: 312, followingCount: 67, karma: 1560, isVerified: true },
    { name: "Arjun Kapoor", username: "arjun_k", email: "arjun@squad.app", passwordHash: hash, avatarUrl: avatar("Arjun Kapoor"), bio: "Basketball and biryani. That's it.", city: "Pune", sportsPlayed: ["Basketball", "Tennis", "Cycling"], rating: "4.20", totalGames: 28, showUpRate: 89, followersCount: 98, followingCount: 134, karma: 650 },
    { name: "Sneha Rao", username: "sneha_r", email: "sneha@squad.app", passwordHash: hash, avatarUrl: avatar("Sneha Rao"), bio: "Cyclist by morning, gamer by night", city: "Bangalore", sportsPlayed: ["Cycling", "Gaming", "Hiking"], rating: "4.70", totalGames: 52, showUpRate: 96, followersCount: 445, followingCount: 201, karma: 1890 },
    { name: "Vikram Singh", username: "vikram_s", email: "vikram@squad.app", passwordHash: hash, avatarUrl: avatar("Vikram Singh"), bio: "Football is life. Everything else is waiting.", city: "Bhopal", sportsPlayed: ["Football", "Cricket"], rating: "4.60", totalGames: 71, showUpRate: 94, followersCount: 267, followingCount: 88, karma: 2100 },
    { name: "Ananya Iyer", username: "ananya_i", email: "ananya@squad.app", passwordHash: hash, avatarUrl: avatar("Ananya Iyer"), bio: "Hiking trails and coffee tales", city: "Mumbai", sportsPlayed: ["Hiking", "Running", "Travel"], rating: "4.80", totalGames: 39, showUpRate: 97, followersCount: 523, followingCount: 156, karma: 1420 },
    { name: "Karan Desai", username: "karan_d", email: "karan@squad.app", passwordHash: hash, avatarUrl: avatar("Karan Desai"), bio: "Party organizer. Bringing people together since 2019.", city: "Jaipur", sportsPlayed: ["Party", "Cricket", "Gaming"], rating: "4.40", totalGames: 45, showUpRate: 91, followersCount: 378, followingCount: 210, karma: 1100 },
    { name: "Meera Joshi", username: "meera_j", email: "meera@squad.app", passwordHash: hash, avatarUrl: avatar("Meera Joshi"), bio: "Badminton doubles partner wanted!", city: "Bhopal", sportsPlayed: ["Badminton", "Tennis"], rating: "4.30", totalGames: 22, showUpRate: 93, followersCount: 76, followingCount: 54, karma: 540 },
    { name: "Rohan Gupta", username: "rohan_g", email: "rohan@squad.app", passwordHash: hash, avatarUrl: avatar("Rohan Gupta"), bio: "Weekend warrior. Weekday coder.", city: "Delhi", sportsPlayed: ["Football", "Gaming", "Running"], rating: "4.10", totalGames: 19, showUpRate: 87, followersCount: 145, followingCount: 178, karma: 380 },
    { name: "Tanya Bhat", username: "tanya_b", email: "tanya@squad.app", passwordHash: hash, avatarUrl: avatar("Tanya Bhat"), bio: "Travel more, worry less. Always planning the next trip.", city: "Hyderabad", sportsPlayed: ["Travel", "Cycling", "Running"], rating: "4.90", totalGames: 34, showUpRate: 100, followersCount: 612, followingCount: 89, karma: 2340 },
    { name: "Aditya Nair", username: "aditya_n", email: "aditya@squad.app", passwordHash: hash, avatarUrl: avatar("Aditya Nair"), bio: "Tennis at dawn. Coffee at 7. Office at 9.", city: "Surat", sportsPlayed: ["Tennis", "Running"], rating: "4.50", totalGames: 41, showUpRate: 95, followersCount: 198, followingCount: 67, karma: 870 },
    { name: "Ishita Verma", username: "ishita_v", email: "ishita@squad.app", passwordHash: hash, avatarUrl: avatar("Ishita Verma"), bio: "Travel addict. Bhopal born, globally curious.", city: "Bhopal", sportsPlayed: ["Travel", "Running", "Cycling"], rating: "4.60", totalGames: 27, showUpRate: 96, followersCount: 334, followingCount: 145, karma: 920 },
    { name: "Dev Patel", username: "dev_p", email: "dev@squad.app", passwordHash: hash, avatarUrl: avatar("Dev Patel"), bio: "Cricket captain material. Looking for my squad.", city: "Nagpur", sportsPlayed: ["Cricket", "Football", "Basketball"], rating: "4.30", totalGames: 56, showUpRate: 92, followersCount: 167, followingCount: 123, karma: 760 },
    { name: "Nisha Agarwal", username: "nisha_a", email: "nisha@squad.app", passwordHash: hash, avatarUrl: avatar("Nisha Agarwal"), bio: "Cycling trails and sunset chases", city: "Pune", sportsPlayed: ["Cycling", "Hiking", "Running"], rating: "4.70", totalGames: 38, showUpRate: 98, followersCount: 289, followingCount: 98, karma: 1340 },
    { name: "Sameer Khan", username: "sameer_k", email: "sameer@squad.app", passwordHash: hash, avatarUrl: avatar("Sameer Khan"), bio: "Basketball courts are my second home", city: "Bhopal", sportsPlayed: ["Basketball", "Football", "Gaming"], rating: "4.40", totalGames: 33, showUpRate: 90, followersCount: 156, followingCount: 87, karma: 710 },
  ];

  const insertedUsers = await db.insert(schema.users).values(userValues).returning();
  const userMap = new Map(insertedUsers.map(u => [u.username, u]));
  const u = (username: string) => userMap.get(username)!;

  console.log(`Inserted ${insertedUsers.length} users`);

  // ── Venues ──
  const venueValues = [
    { name: "Malviya Nagar Turf", type: "Turf", address: "Plot 45, Malviya Nagar", area: "Malviya Nagar", city: "Bhopal", rating: "4.30", reviewCount: 127, amenities: ["Parking", "Floodlights", "Drinking Water", "Changing Room"], sports: ["Football", "Cricket"], poolsThisWeek: 5 },
    { name: "TT Nagar Sports Complex", type: "Sports Complex", address: "TT Nagar Main Road", area: "TT Nagar", city: "Bhopal", rating: "4.50", reviewCount: 203, amenities: ["Parking", "Changing Room", "Seating", "Drinking Water", "Floodlights"], sports: ["Badminton", "Tennis", "Basketball"], poolsThisWeek: 8 },
    { name: "Shahpura Lake", type: "Outdoor", address: "Shahpura Lake Road", area: "Shahpura", city: "Bhopal", rating: "4.70", reviewCount: 89, amenities: ["Parking", "Drinking Water"], sports: ["Running", "Cycling"], poolsThisWeek: 3 },
    { name: "Level Up Gaming Cafe", type: "Gaming Cafe", address: "MP Nagar Zone 2", area: "MP Nagar", city: "Bhopal", rating: "4.10", reviewCount: 67, amenities: ["Seating", "Drinking Water"], sports: ["Gaming"], poolsThisWeek: 4 },
    { name: "DB City Tennis Courts", type: "Court", address: "DB City Mall Complex", area: "DB City", city: "Bhopal", rating: "4.40", reviewCount: 45, amenities: ["Parking", "Floodlights", "Changing Room", "Seating"], sports: ["Tennis"], poolsThisWeek: 2 },
    { name: "Skyline Terrace", type: "Rooftop", address: "New Market, 5th Floor", area: "New Market", city: "Bhopal", rating: "4.20", reviewCount: 156, amenities: ["Parking", "Seating"], sports: ["Party"], poolsThisWeek: 1 },
  ];

  const insertedVenues = await db.insert(schema.venues).values(venueValues).returning();
  console.log(`Inserted ${insertedVenues.length} venues`);

  // ── Pools ──
  const now = new Date();
  const today = (h: number, m: number) => { const d = new Date(now); d.setHours(h, m, 0, 0); return d; };
  const tomorrow = (h: number, m: number) => { const d = new Date(now); d.setDate(d.getDate() + 1); d.setHours(h, m, 0, 0); return d; };
  const friday = (h: number, m: number) => { const d = new Date(now); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7)); d.setHours(h, m, 0, 0); return d; };
  const saturday = (h: number, m: number) => { const d = new Date(now); d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7)); d.setHours(h, m, 0, 0); return d; };
  const sunday = (h: number, m: number) => { const d = new Date(now); d.setDate(d.getDate() + ((0 - d.getDay() + 7) % 7 || 7)); d.setHours(h, m, 0, 0); return d; };

  const poolValues = [
    { title: "Anyone up for football tonight?", category: "football", emoji: "⚽", hostId: u("vikram_s").id, city: "Bhopal", area: "Malviya Nagar", venue: "Malviya Nagar Turf", description: "Looking for 4 more players for a friendly 5-a-side match. All skill levels welcome.", tags: ["Beginners OK", "Chill vibes"], scheduledTime: today(20, 0), spotsTotal: 10, spotsFilled: 6, costPerHead: 80, isLive: true },
    { title: "Sunrise run + chai session", category: "running", emoji: "🏃", hostId: u("priya_m").id, city: "Bhopal", area: "Shahpura", venue: "Shahpura Lake", description: "Easy 5K run around the lake followed by chai.", tags: ["Beginners OK", "Solo friendly"], scheduledTime: tomorrow(6, 0), spotsTotal: 8, spotsFilled: 3, costPerHead: 0 },
    { title: "Coorg weekend trip - 2 spots left", category: "travel", emoji: "🗺", hostId: u("rahul_s").id, city: "Bhopal", area: "Pickup: Railway Station", venue: "Coorg, Karnataka", description: "3-day trip to Coorg. Staying at a homestay.", tags: ["Solo friendly", "Women Welcome"], scheduledTime: friday(18, 0), spotsTotal: 8, spotsFilled: 6, costPerHead: 3500 },
    { title: "Badminton doubles at Sports Complex", category: "badminton", emoji: "🏸", hostId: u("meera_j").id, city: "Bhopal", area: "TT Nagar", venue: "TT Nagar Sports Complex", description: "Need 2 more for doubles. Intermediate level preferred.", tags: ["Competitive"], scheduledTime: today(18, 0), spotsTotal: 4, spotsFilled: 2, costPerHead: 60, isLive: true },
    { title: "Rooftop party Friday night", category: "party", emoji: "🎉", hostId: u("karan_d").id, city: "Bhopal", area: "New Market", venue: "Skyline Terrace", description: "Rooftop party with music, food, and great people.", tags: ["Bring friends", "Chill vibes"], scheduledTime: friday(21, 0), spotsTotal: 20, spotsFilled: 12, costPerHead: 200 },
    { title: "Cycling to Bhojpur Temple and back", category: "cycling", emoji: "🚴", hostId: u("nisha_a").id, city: "Bhopal", area: "Lake Front", venue: "Upper Lake Cycling Track", description: "30km round trip to Bhojpur Temple. Moderate difficulty.", tags: ["Solo friendly", "Competitive"], scheduledTime: sunday(6, 30), spotsTotal: 10, spotsFilled: 5, costPerHead: 0 },
    { title: "BGMI tournament at gaming cafe", category: "gaming", emoji: "🎮", hostId: u("rohan_g").id, city: "Bhopal", area: "MP Nagar", venue: "Level Up Gaming Cafe", description: "4v4 BGMI tournament. Winner team gets free gaming hours.", tags: ["Competitive"], scheduledTime: saturday(16, 0), spotsTotal: 8, spotsFilled: 6, costPerHead: 100 },
    { title: "Tennis practice partner needed", category: "tennis", emoji: "🎾", hostId: u("aditya_n").id, city: "Bhopal", area: "DB City", venue: "DB City Tennis Courts", description: "Looking for a regular practice partner.", tags: ["Competitive"], scheduledTime: tomorrow(7, 0), spotsTotal: 2, spotsFilled: 1, costPerHead: 100 },
    { title: "Cricket net practice session", category: "cricket", emoji: "🏏", hostId: u("rahul_s").id, city: "Indore", area: "Vijay Nagar", venue: "Holkar Stadium Nets", description: "Net practice session. Bowlers and batsmen both welcome.", tags: ["Competitive", "Solo friendly"], scheduledTime: today(17, 0), spotsTotal: 6, spotsFilled: 4, costPerHead: 50, isLive: true },
    { title: "Weekend basketball pickup game", category: "basketball", emoji: "🏀", hostId: u("arjun_k").id, city: "Pune", area: "Koregaon Park", venue: "KP Basketball Court", description: "Regular Sunday morning pickup game. 5v5 full court.", tags: ["Beginners OK", "Chill vibes"], scheduledTime: sunday(7, 0), spotsTotal: 10, spotsFilled: 7, costPerHead: 0 },
    { title: "Nandi Hills sunrise trek", category: "hiking", emoji: "⛰", hostId: u("sneha_r").id, city: "Bangalore", area: "Pickup: MG Road Metro", venue: "Nandi Hills", description: "Early morning drive to Nandi Hills for sunrise.", tags: ["Solo friendly", "Women Welcome"], scheduledTime: sunday(4, 0), spotsTotal: 12, spotsFilled: 9, costPerHead: 250 },
    { title: "Late night gaming session", category: "gaming", emoji: "🎮", hostId: u("sameer_k").id, city: "Bhopal", area: "Arera Colony", venue: "Sameer's Place", description: "Valorant and FIFA night. Bring your own laptop.", tags: ["Chill vibes", "Bring friends"], scheduledTime: friday(22, 0), spotsTotal: 6, spotsFilled: 3, costPerHead: 0 },
    { title: "Morning yoga at the park", category: "running", emoji: "🏃", hostId: u("priya_m").id, city: "Bhopal", area: "Shahpura", venue: "Shahpura Park", description: "Free yoga session every morning. Beginner-friendly.", tags: ["Beginners OK", "Women Welcome", "Solo friendly"], scheduledTime: tomorrow(6, 30), spotsTotal: 15, spotsFilled: 8, costPerHead: 0 },
    { title: "Football at Shivaji Park", category: "football", emoji: "⚽", hostId: u("dev_p").id, city: "Mumbai", area: "Dadar", venue: "Shivaji Park Ground", description: "Sunday morning football tradition. 7-a-side.", tags: ["Competitive", "Solo friendly"], scheduledTime: sunday(6, 0), spotsTotal: 14, spotsFilled: 10, costPerHead: 0 },
    { title: "Hyderabad biking group ride", category: "cycling", emoji: "🚴", hostId: u("tanya_b").id, city: "Hyderabad", area: "Hussain Sagar", venue: "Tank Bund Starting Point", description: "20km scenic ride along the lake.", tags: ["Solo friendly", "Chill vibes"], scheduledTime: saturday(5, 30), spotsTotal: 10, spotsFilled: 4, costPerHead: 0 },
    { title: "Delhi cricket league match", category: "cricket", emoji: "🏏", hostId: u("rohan_g").id, city: "Delhi", area: "Dwarka", venue: "Dwarka Sports Complex", description: "Inter-colony league match. 20 overs.", tags: ["Competitive"], scheduledTime: sunday(15, 0), spotsTotal: 22, spotsFilled: 18, costPerHead: 150 },
    { title: "Board game night at the cafe", category: "gaming", emoji: "🎮", hostId: u("ananya_i").id, city: "Mumbai", area: "Bandra", venue: "Dice & Dine Cafe", description: "Catan, Codenames, Exploding Kittens - great way to meet new people!", tags: ["Beginners OK", "Chill vibes", "Solo friendly"], scheduledTime: friday(19, 0), spotsTotal: 8, spotsFilled: 5, costPerHead: 0 },
  ];

  const insertedPools = await db.insert(schema.pools).values(poolValues).returning();
  console.log(`Inserted ${insertedPools.length} pools`);

  // ── Badges ──
  const badgeValues = [
    { userId: u("yathu_bhopal").id, icon: "🏆", label: "47 Games Played" },
    { userId: u("yathu_bhopal").id, icon: "🔥", label: "Hot Streak" },
    { userId: u("yathu_bhopal").id, icon: "✅", label: "98% Shows Up" },
    { userId: u("yathu_bhopal").id, icon: "🌍", label: "3 Cities Explored" },
    { userId: u("rahul_s").id, icon: "🏆", label: "63 Games" },
    { userId: u("rahul_s").id, icon: "🏏", label: "Cricket Pro" },
    { userId: u("priya_m").id, icon: "✅", label: "100% Shows Up" },
    { userId: u("priya_m").id, icon: "🏃", label: "Early Bird" },
    { userId: u("vikram_s").id, icon: "⚽", label: "Football Legend" },
    { userId: u("vikram_s").id, icon: "🔥", label: "Hot Streak" },
    { userId: u("sneha_r").id, icon: "🚴", label: "Century Rider" },
    { userId: u("sneha_r").id, icon: "🎮", label: "Pro Gamer" },
    { userId: u("ananya_i").id, icon: "⛰", label: "Peak Bagger" },
    { userId: u("karan_d").id, icon: "🎉", label: "Party King" },
    { userId: u("meera_j").id, icon: "🏸", label: "Shuttle Master" },
    { userId: u("ishita_v").id, icon: "🌍", label: "Explorer" },
    { userId: u("dev_p").id, icon: "🏏", label: "Captain" },
    { userId: u("tanya_b").id, icon: "🌍", label: "Globe Trotter" },
    { userId: u("sameer_k").id, icon: "🏀", label: "Court King" },
  ];

  await db.insert(schema.badges).values(badgeValues);
  console.log(`Inserted ${badgeValues.length} badges`);

  // ── Follows (Yathu follows some users) ──
  const yathuId = u("yathu_bhopal").id;
  const followValues = [
    { followerId: yathuId, followingId: u("rahul_s").id },
    { followerId: yathuId, followingId: u("priya_m").id },
    { followerId: yathuId, followingId: u("vikram_s").id },
    { followerId: yathuId, followingId: u("ishita_v").id },
    { followerId: u("priya_m").id, followingId: yathuId },
    { followerId: u("vikram_s").id, followingId: yathuId },
    { followerId: u("rahul_s").id, followingId: yathuId },
  ];
  await db.insert(schema.follows).values(followValues);
  console.log(`Inserted ${followValues.length} follows`);

  // ── Reviews ──
  const reviewValues = [
    { reviewerId: u("rahul_s").id, reviewedUserId: yathuId, rating: 5, text: "Great footballer, very welcoming to newcomers!" },
    { reviewerId: u("priya_m").id, reviewedUserId: yathuId, rating: 5, text: "Showed up on time and kept the energy high" },
    { reviewerId: u("arjun_k").id, reviewedUserId: yathuId, rating: 4, text: "Good organizer, would play again" },
    { reviewerId: u("vikram_s").id, reviewedUserId: yathuId, rating: 5, text: "Best captain I've played under. Always fair." },
    { reviewerId: u("ishita_v").id, reviewedUserId: yathuId, rating: 5, text: "Amazing host! The cycling trip was so well planned." },
  ];
  await db.insert(schema.reviews).values(reviewValues);
  console.log(`Inserted ${reviewValues.length} reviews`);

  // ── Notifications for Yathu ──
  const notifValues = [
    { userId: yathuId, type: "activity" as const, text: "Rahul joined your Football pool", linkTo: `/pool/${insertedPools[0].id}` },
    { userId: yathuId, type: "reminder" as const, text: "Your pool starts in 1 hour! Football at Malviya Nagar", actionLabel: "View Pool", linkTo: `/pool/${insertedPools[0].id}` },
    { userId: yathuId, type: "social" as const, text: "Priya Mehta started following you", actionLabel: "Follow Back", linkTo: `/profile/${u("priya_m").id}` },
    { userId: yathuId, type: "pool_full" as const, text: "Coorg Weekend Trip is now full (8/8)", linkTo: `/pool/${insertedPools[2].id}` },
    { userId: yathuId, type: "payment" as const, text: "₹80 received from Sneha for Football pool" },
    { userId: yathuId, type: "review" as const, text: "Priya left you a 5-star review!" },
    { userId: yathuId, type: "milestone" as const, text: "You've played 47 games! Badge unlocked" },
  ];
  await db.insert(schema.notifications).values(notifValues);
  console.log(`Inserted ${notifValues.length} notifications`);

  console.log("\nSeed complete!");
  console.log("Admin login: admin@squad.app / password123");
  console.log("User login: yathu@squad.app / password123");
  console.log("(All users share password: password123)");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
