export const CITIES = ["Bhopal", "Indore", "Pune", "Bangalore", "Jaipur", "Mumbai", "Delhi", "Hyderabad", "Surat", "Nagpur"];

export const CATEGORIES = [
  { id: "football", label: "Football", emoji: "⚽" },
  { id: "badminton", label: "Badminton", emoji: "🏸" },
  { id: "cricket", label: "Cricket", emoji: "🏏" },
  { id: "basketball", label: "Basketball", emoji: "🏀" },
  { id: "tennis", label: "Tennis", emoji: "🎾" },
  { id: "travel", label: "Travel", emoji: "🗺" },
  { id: "food", label: "Food", emoji: "🍜" },
  { id: "party", label: "Party", emoji: "🎉" },
  { id: "running", label: "Running", emoji: "🏃" },
  { id: "cycling", label: "Cycling", emoji: "🚴" },
  { id: "hiking", label: "Hiking", emoji: "⛰" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
];

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  city: string;
  sportsPlayed: string[];
  rating: number;
  totalGames: number;
  showUpRate: number;
  followers: number;
  following: number;
  isFollowing: boolean;
  badges: { icon: string; label: string }[];
  karma: number;
}

export interface Pool {
  id: string;
  title: string;
  category: string;
  emoji: string;
  host: { id: string; name: string; avatar: string; rating: number; showUpRate: number };
  city: string;
  area: string;
  venue: string;
  time: string;
  date: string;
  spotsTotal: number;
  spotsFilled: number;
  costPerHead: number;
  description: string;
  tags: string[];
  joined: boolean;
  isLive: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  isGroup: boolean;
  emoji?: string;
  members?: number;
  lastMessage: string;
  lastSender?: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

export interface Message {
  id: string;
  sender: string;
  senderAvatar: string;
  text: string;
  time: string;
  isMe: boolean;
  isSystem?: boolean;
}

export interface Notification {
  id: string;
  type: "activity" | "reminder" | "social" | "pool_full" | "cancelled" | "new_pool" | "payment" | "review" | "milestone";
  text: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  linkTo?: string;
}

export interface Venue {
  id: string;
  name: string;
  type: string;
  address: string;
  area: string;
  city: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  poolsThisWeek: number;
  sports: string[];
}

const avatar = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true&size=128`;

export const CURRENT_USER: User = {
  id: "user_me",
  name: "Yathu",
  username: "@yathu_bhopal",
  avatar: avatar("Yathu"),
  city: "Bhopal",
  bio: "Builder. Footballer. Always down for something.",
  sportsPlayed: ["Football", "Badminton", "Cricket"],
  rating: 4.8,
  totalGames: 47,
  showUpRate: 98,
  followers: 234,
  following: 89,
  isFollowing: false,
  badges: [
    { icon: "🏆", label: "47 Games Played" },
    { icon: "🔥", label: "Hot Streak" },
    { icon: "✅", label: "98% Shows Up" },
    { icon: "🌍", label: "3 Cities Explored" },
  ],
  karma: 1240,
};

export const USERS: User[] = [
  {
    id: "u1", name: "Rahul Sharma", username: "@rahul_s", avatar: avatar("Rahul Sharma"), bio: "Cricket fanatic and weekend traveler", city: "Indore",
    sportsPlayed: ["Cricket", "Football", "Running"], rating: 4.5, totalGames: 63, showUpRate: 95, followers: 189, following: 112, isFollowing: true,
    badges: [{ icon: "🏆", label: "63 Games" }, { icon: "🏏", label: "Cricket Pro" }], karma: 980,
  },
  {
    id: "u2", name: "Priya Mehta", username: "@priya_m", avatar: avatar("Priya Mehta"), bio: "Run first, think later. Foodie on rest days.", city: "Bhopal",
    sportsPlayed: ["Running", "Badminton", "Food"], rating: 4.9, totalGames: 31, showUpRate: 100, followers: 312, following: 67, isFollowing: true,
    badges: [{ icon: "✅", label: "100% Shows Up" }, { icon: "🏃", label: "Early Bird" }], karma: 1560,
  },
  {
    id: "u3", name: "Arjun Kapoor", username: "@arjun_k", avatar: avatar("Arjun Kapoor"), bio: "Basketball and biryani. That's it.", city: "Pune",
    sportsPlayed: ["Basketball", "Tennis", "Cycling"], rating: 4.2, totalGames: 28, showUpRate: 89, followers: 98, following: 134, isFollowing: false,
    badges: [{ icon: "🏀", label: "Baller" }], karma: 650,
  },
  {
    id: "u4", name: "Sneha Rao", username: "@sneha_r", avatar: avatar("Sneha Rao"), bio: "Cyclist by morning, gamer by night", city: "Bangalore",
    sportsPlayed: ["Cycling", "Gaming", "Hiking"], rating: 4.7, totalGames: 52, showUpRate: 96, followers: 445, following: 201, isFollowing: false,
    badges: [{ icon: "🚴", label: "Century Rider" }, { icon: "🎮", label: "Pro Gamer" }], karma: 1890,
  },
  {
    id: "u5", name: "Vikram Singh", username: "@vikram_s", avatar: avatar("Vikram Singh"), bio: "Football is life. Everything else is waiting.", city: "Bhopal",
    sportsPlayed: ["Football", "Cricket"], rating: 4.6, totalGames: 71, showUpRate: 94, followers: 267, following: 88, isFollowing: true,
    badges: [{ icon: "⚽", label: "Football Legend" }, { icon: "🔥", label: "Hot Streak" }], karma: 2100,
  },
  {
    id: "u6", name: "Ananya Iyer", username: "@ananya_i", avatar: avatar("Ananya Iyer"), bio: "Hiking trails and coffee tales", city: "Mumbai",
    sportsPlayed: ["Hiking", "Running", "Travel"], rating: 4.8, totalGames: 39, showUpRate: 97, followers: 523, following: 156, isFollowing: false,
    badges: [{ icon: "⛰", label: "Peak Bagger" }], karma: 1420,
  },
  {
    id: "u7", name: "Karan Desai", username: "@karan_d", avatar: avatar("Karan Desai"), bio: "Party organizer. Bringing people together since 2019.", city: "Jaipur",
    sportsPlayed: ["Party", "Food", "Cricket"], rating: 4.4, totalGames: 45, showUpRate: 91, followers: 378, following: 210, isFollowing: false,
    badges: [{ icon: "🎉", label: "Party King" }], karma: 1100,
  },
  {
    id: "u8", name: "Meera Joshi", username: "@meera_j", avatar: avatar("Meera Joshi"), bio: "Badminton doubles partner wanted!", city: "Bhopal",
    sportsPlayed: ["Badminton", "Tennis"], rating: 4.3, totalGames: 22, showUpRate: 93, followers: 76, following: 54, isFollowing: false,
    badges: [{ icon: "🏸", label: "Shuttle Master" }], karma: 540,
  },
  {
    id: "u9", name: "Rohan Gupta", username: "@rohan_g", avatar: avatar("Rohan Gupta"), bio: "Weekend warrior. Weekday coder.", city: "Delhi",
    sportsPlayed: ["Football", "Gaming", "Running"], rating: 4.1, totalGames: 19, showUpRate: 87, followers: 145, following: 178, isFollowing: false,
    badges: [{ icon: "🎮", label: "Gamer" }], karma: 380,
  },
  {
    id: "u10", name: "Tanya Bhat", username: "@tanya_b", avatar: avatar("Tanya Bhat"), bio: "Travel more, worry less. Always planning the next trip.", city: "Hyderabad",
    sportsPlayed: ["Travel", "Food", "Cycling"], rating: 4.9, totalGames: 34, showUpRate: 100, followers: 612, following: 89, isFollowing: false,
    badges: [{ icon: "🌍", label: "Globe Trotter" }, { icon: "✅", label: "100% Shows Up" }], karma: 2340,
  },
  {
    id: "u11", name: "Aditya Nair", username: "@aditya_n", avatar: avatar("Aditya Nair"), bio: "Tennis at dawn. Coffee at 7. Office at 9.", city: "Surat",
    sportsPlayed: ["Tennis", "Running"], rating: 4.5, totalGames: 41, showUpRate: 95, followers: 198, following: 67, isFollowing: false,
    badges: [{ icon: "🎾", label: "Ace Serve" }], karma: 870,
  },
  {
    id: "u12", name: "Ishita Verma", username: "@ishita_v", avatar: avatar("Ishita Verma"), bio: "Street food explorer. Bhopal born, globally curious.", city: "Bhopal",
    sportsPlayed: ["Food", "Travel", "Running"], rating: 4.6, totalGames: 27, showUpRate: 96, followers: 334, following: 145, isFollowing: true,
    badges: [{ icon: "🍜", label: "Foodie" }], karma: 920,
  },
  {
    id: "u13", name: "Dev Patel", username: "@dev_p", avatar: avatar("Dev Patel"), bio: "Cricket captain material. Looking for my squad.", city: "Nagpur",
    sportsPlayed: ["Cricket", "Football", "Basketball"], rating: 4.3, totalGames: 56, showUpRate: 92, followers: 167, following: 123, isFollowing: false,
    badges: [{ icon: "🏏", label: "Captain" }], karma: 760,
  },
  {
    id: "u14", name: "Nisha Agarwal", username: "@nisha_a", avatar: avatar("Nisha Agarwal"), bio: "Cycling trails and sunset chases", city: "Pune",
    sportsPlayed: ["Cycling", "Hiking", "Running"], rating: 4.7, totalGames: 38, showUpRate: 98, followers: 289, following: 98, isFollowing: false,
    badges: [{ icon: "🚴", label: "Trail Blazer" }], karma: 1340,
  },
  {
    id: "u15", name: "Sameer Khan", username: "@sameer_k", avatar: avatar("Sameer Khan"), bio: "Basketball courts are my second home", city: "Bhopal",
    sportsPlayed: ["Basketball", "Football", "Gaming"], rating: 4.4, totalGames: 33, showUpRate: 90, followers: 156, following: 87, isFollowing: false,
    badges: [{ icon: "🏀", label: "Court King" }], karma: 710,
  },
];

export const POOLS: Pool[] = [
  { id: "p1", title: "Anyone up for football tonight?", category: "football", emoji: "⚽", host: { id: "u5", name: "Vikram Singh", avatar: avatar("Vikram Singh"), rating: 4.6, showUpRate: 94 }, city: "Bhopal", area: "Malviya Nagar", venue: "Malviya Nagar Turf", time: "8:00 PM", date: "Today", spotsTotal: 10, spotsFilled: 6, costPerHead: 80, description: "Looking for 4 more players for a friendly 5-a-side match. All skill levels welcome. We play every Tuesday and Thursday. Turf is booked, just need bodies!", tags: ["Beginners OK", "Chill vibes"], joined: false, isLive: true },
  { id: "p2", title: "Sunrise run + chai session", category: "running", emoji: "🏃", host: { id: "u2", name: "Priya Mehta", avatar: avatar("Priya Mehta"), rating: 4.9, showUpRate: 100 }, city: "Bhopal", area: "Shahpura", venue: "Shahpura Lake", time: "6:00 AM", date: "Tomorrow", spotsTotal: 8, spotsFilled: 3, costPerHead: 0, description: "Easy 5K run around the lake followed by chai at the stall near the gate. Pace doesn't matter, just show up!", tags: ["Beginners OK", "Solo friendly"], joined: false, isLive: false },
  { id: "p3", title: "Biryani cook-together at my place", category: "food", emoji: "🍜", host: { id: "u12", name: "Ishita Verma", avatar: avatar("Ishita Verma"), rating: 4.6, showUpRate: 96 }, city: "Bhopal", area: "Arera Colony", venue: "Ishita's Kitchen", time: "7:00 PM", date: "Saturday", spotsTotal: 8, spotsFilled: 4, costPerHead: 150, description: "We're making Hyderabadi biryani from scratch. I'll handle the recipe, you handle the vibes. Ingredients cost split equally.", tags: ["Chill vibes", "Bring friends"], joined: false, isLive: false },
  { id: "p4", title: "Coorg weekend trip - 2 spots left", category: "travel", emoji: "🗺", host: { id: "u1", name: "Rahul Sharma", avatar: avatar("Rahul Sharma"), rating: 4.5, showUpRate: 95 }, city: "Bhopal", area: "Pickup: Railway Station", venue: "Coorg, Karnataka", time: "Fri 6 PM", date: "This Friday", spotsTotal: 8, spotsFilled: 6, costPerHead: 3500, description: "3-day trip to Coorg. Staying at a homestay, visiting Abbey Falls, Raja's Seat, and doing a coffee plantation trek. Train tickets are separate.", tags: ["Solo friendly", "Women Welcome"], joined: false, isLive: false },
  { id: "p5", title: "Badminton doubles at Sports Complex", category: "badminton", emoji: "🏸", host: { id: "u8", name: "Meera Joshi", avatar: avatar("Meera Joshi"), rating: 4.3, showUpRate: 93 }, city: "Bhopal", area: "TT Nagar", venue: "TT Nagar Sports Complex", time: "6:00 PM", date: "Today", spotsTotal: 4, spotsFilled: 2, costPerHead: 60, description: "Need 2 more for doubles. Intermediate level preferred but beginners welcome too. Court is booked for 1.5 hours.", tags: ["Competitive"], joined: false, isLive: true },
  { id: "p6", title: "Rooftop party Friday night", category: "party", emoji: "🎉", host: { id: "u7", name: "Karan Desai", avatar: avatar("Karan Desai"), rating: 4.4, showUpRate: 91 }, city: "Bhopal", area: "New Market", venue: "Skyline Terrace", time: "9:00 PM", date: "Friday", spotsTotal: 20, spotsFilled: 12, costPerHead: 200, description: "Rooftop party with music, food, and great people. DJ setup, snacks included in the cost. BYOB. Come make new friends!", tags: ["Bring friends", "Chill vibes"], joined: false, isLive: false },
  { id: "p7", title: "Cycling to Bhojpur Temple and back", category: "cycling", emoji: "🚴", host: { id: "u14", name: "Nisha Agarwal", avatar: avatar("Nisha Agarwal"), rating: 4.7, showUpRate: 98 }, city: "Bhopal", area: "Lake Front", venue: "Upper Lake Cycling Track", time: "6:30 AM", date: "Sunday", spotsTotal: 10, spotsFilled: 5, costPerHead: 0, description: "30km round trip to Bhojpur Temple. Moderate difficulty. Bring your own cycle or rent from the shop near the lake. Water and snacks break midway.", tags: ["Solo friendly", "Competitive"], joined: false, isLive: false },
  { id: "p8", title: "BGMI tournament at gaming cafe", category: "gaming", emoji: "🎮", host: { id: "u9", name: "Rohan Gupta", avatar: avatar("Rohan Gupta"), rating: 4.1, showUpRate: 87 }, city: "Bhopal", area: "MP Nagar", venue: "Level Up Gaming Cafe", time: "4:00 PM", date: "Saturday", spotsTotal: 8, spotsFilled: 6, costPerHead: 100, description: "4v4 BGMI tournament. Cafe has high-end PCs. Winner team gets free gaming hours. Casual but competitive.", tags: ["Competitive"], joined: false, isLive: false },
  { id: "p9", title: "Street food crawl - Old Bhopal tonight", category: "food", emoji: "🍜", host: { id: "u12", name: "Ishita Verma", avatar: avatar("Ishita Verma"), rating: 4.6, showUpRate: 96 }, city: "Bhopal", area: "Chowk Bazaar", venue: "Starting Point: Jama Masjid Gate", time: "8:00 PM", date: "Today", spotsTotal: 12, spotsFilled: 7, costPerHead: 0, description: "Walking food tour through Old Bhopal's best street food spots. Kebabs, chaat, jalebi, and more. You pay for what you eat. I'll be your guide!", tags: ["Beginners OK", "Chill vibes", "Women Welcome"], joined: false, isLive: true },
  { id: "p10", title: "Tennis practice partner needed", category: "tennis", emoji: "🎾", host: { id: "u11", name: "Aditya Nair", avatar: avatar("Aditya Nair"), rating: 4.5, showUpRate: 95 }, city: "Bhopal", area: "DB City", venue: "DB City Tennis Courts", time: "7:00 AM", date: "Tomorrow", spotsTotal: 2, spotsFilled: 1, costPerHead: 100, description: "Looking for a regular practice partner. I play 3-4 times a week. Intermediate level. Let's rally and improve together.", tags: ["Competitive"], joined: false, isLive: false },
  { id: "p11", title: "Cricket net practice session", category: "cricket", emoji: "🏏", host: { id: "u1", name: "Rahul Sharma", avatar: avatar("Rahul Sharma"), rating: 4.5, showUpRate: 95 }, city: "Indore", area: "Vijay Nagar", venue: "Holkar Stadium Nets", time: "5:00 PM", date: "Today", spotsTotal: 6, spotsFilled: 4, costPerHead: 50, description: "Net practice session. Bowlers and batsmen both welcome. Nets are booked for 2 hours.", tags: ["Competitive", "Solo friendly"], joined: false, isLive: true },
  { id: "p12", title: "Weekend basketball pickup game", category: "basketball", emoji: "🏀", host: { id: "u3", name: "Arjun Kapoor", avatar: avatar("Arjun Kapoor"), rating: 4.2, showUpRate: 89 }, city: "Pune", area: "Koregaon Park", venue: "KP Basketball Court", time: "7:00 AM", date: "Sunday", spotsTotal: 10, spotsFilled: 7, costPerHead: 0, description: "Regular Sunday morning pickup game. 5v5 full court. All levels welcome. We usually play for about 2 hours.", tags: ["Beginners OK", "Chill vibes"], joined: false, isLive: false },
  { id: "p13", title: "Nandi Hills sunrise trek", category: "hiking", emoji: "⛰", host: { id: "u4", name: "Sneha Rao", avatar: avatar("Sneha Rao"), rating: 4.7, showUpRate: 96 }, city: "Bangalore", area: "Pickup: MG Road Metro", venue: "Nandi Hills", time: "4:00 AM", date: "Sunday", spotsTotal: 12, spotsFilled: 9, costPerHead: 250, description: "Early morning drive to Nandi Hills for sunrise. Trek up, breakfast at the top, and back by noon. Car pooling arranged.", tags: ["Solo friendly", "Women Welcome"], joined: false, isLive: false },
  { id: "p14", title: "Late night gaming session", category: "gaming", emoji: "🎮", host: { id: "u15", name: "Sameer Khan", avatar: avatar("Sameer Khan"), rating: 4.4, showUpRate: 90 }, city: "Bhopal", area: "Arera Colony", venue: "Sameer's Place", time: "10:00 PM", date: "Friday", spotsTotal: 6, spotsFilled: 3, costPerHead: 0, description: "Valorant and FIFA night. Bring your own laptop or we can share. Snacks on me. Let's squad up!", tags: ["Chill vibes", "Bring friends"], joined: false, isLive: false },
  { id: "p15", title: "Morning yoga at the park", category: "running", emoji: "🏃", host: { id: "u2", name: "Priya Mehta", avatar: avatar("Priya Mehta"), rating: 4.9, showUpRate: 100 }, city: "Bhopal", area: "Shahpura", venue: "Shahpura Park", time: "6:30 AM", date: "Daily", spotsTotal: 15, spotsFilled: 8, costPerHead: 0, description: "Free yoga session every morning. Bring your own mat. Beginner-friendly flow for 45 minutes. Rain or shine.", tags: ["Beginners OK", "Women Welcome", "Solo friendly"], joined: false, isLive: false },
  { id: "p16", title: "Jaipur food photography walk", category: "food", emoji: "🍜", host: { id: "u7", name: "Karan Desai", avatar: avatar("Karan Desai"), rating: 4.4, showUpRate: 91 }, city: "Jaipur", area: "Johari Bazaar", venue: "Meeting: LMB Sweet Shop", time: "5:00 PM", date: "Saturday", spotsTotal: 8, spotsFilled: 3, costPerHead: 0, description: "Walk through Jaipur's iconic food lanes. Taste and photograph. You pay for what you eat. Bring your phone/camera.", tags: ["Chill vibes", "Beginners OK"], joined: false, isLive: false },
  { id: "p17", title: "Football at Shivaji Park", category: "football", emoji: "⚽", host: { id: "u13", name: "Dev Patel", avatar: avatar("Dev Patel"), rating: 4.3, showUpRate: 92 }, city: "Mumbai", area: "Dadar", venue: "Shivaji Park Ground", time: "6:00 AM", date: "Sunday", spotsTotal: 14, spotsFilled: 10, costPerHead: 0, description: "Sunday morning football tradition. 7-a-side. Ground is open so no booking needed. Just show up on time.", tags: ["Competitive", "Solo friendly"], joined: false, isLive: false },
  { id: "p18", title: "Hyderabad biking group ride", category: "cycling", emoji: "🚴", host: { id: "u10", name: "Tanya Bhat", avatar: avatar("Tanya Bhat"), rating: 4.9, showUpRate: 100 }, city: "Hyderabad", area: "Hussain Sagar", venue: "Tank Bund Starting Point", time: "5:30 AM", date: "Saturday", spotsTotal: 10, spotsFilled: 4, costPerHead: 0, description: "20km scenic ride along the lake and through the old city. Moderate pace. Stops for photos and chai.", tags: ["Solo friendly", "Chill vibes"], joined: false, isLive: false },
  { id: "p19", title: "Delhi cricket league match", category: "cricket", emoji: "🏏", host: { id: "u9", name: "Rohan Gupta", avatar: avatar("Rohan Gupta"), rating: 4.1, showUpRate: 87 }, city: "Delhi", area: "Dwarka", venue: "Dwarka Sports Complex", time: "3:00 PM", date: "Sunday", spotsTotal: 22, spotsFilled: 18, costPerHead: 150, description: "Inter-colony league match. 20 overs. Teams will be shuffled. Kit provided. Just bring your enthusiasm.", tags: ["Competitive"], joined: false, isLive: false },
  { id: "p20", title: "Board game night at the cafe", category: "gaming", emoji: "🎮", host: { id: "u6", name: "Ananya Iyer", avatar: avatar("Ananya Iyer"), rating: 4.8, showUpRate: 97 }, city: "Mumbai", area: "Bandra", venue: "Dice & Dine Cafe", time: "7:00 PM", date: "Friday", spotsTotal: 8, spotsFilled: 5, costPerHead: 0, description: "Catan, Codenames, Exploding Kittens - the cafe has it all. Order food/drinks separately. Great way to meet new people!", tags: ["Beginners OK", "Chill vibes", "Solo friendly"], joined: false, isLive: false },
  { id: "p21", title: "Surat diamond market food tour", category: "food", emoji: "🍜", host: { id: "u11", name: "Aditya Nair", avatar: avatar("Aditya Nair"), rating: 4.5, showUpRate: 95 }, city: "Surat", area: "Ring Road", venue: "Meeting: Surat Station", time: "11:00 AM", date: "Sunday", spotsTotal: 6, spotsFilled: 2, costPerHead: 0, description: "Authentic Surati locho, undhiyu, and ghari. Walking tour through the best local spots. You pay for food.", tags: ["Chill vibes", "Beginners OK"], joined: false, isLive: false },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: "c1", name: "Football Tonight - Malviya Nagar", avatar: avatar("Football Group"), isGroup: true, emoji: "⚽", members: 6,
    lastMessage: "Everyone bring water", lastSender: "Priya", timestamp: "2m ago", unread: 3,
    messages: [
      { id: "m1", sender: "Rahul Sharma", senderAvatar: avatar("Rahul Sharma"), text: "Need 2 more players, anyone?", time: "2h ago", isMe: false },
      { id: "m2", sender: "Priya Mehta", senderAvatar: avatar("Priya Mehta"), text: "I'm in! Coming with a friend", time: "1h ago", isMe: false },
      { id: "m3", sender: "System", senderAvatar: "", text: "Sneha joined the pool", time: "45m ago", isMe: false, isSystem: true },
      { id: "m4", sender: "Sneha Rao", senderAvatar: avatar("Sneha Rao"), text: "Hey everyone! First time here", time: "40m ago", isMe: false },
      { id: "m5", sender: "Yathu", senderAvatar: avatar("Yathu"), text: "Game on! See everyone at 8", time: "20m ago", isMe: true },
      { id: "m6", sender: "Priya Mehta", senderAvatar: avatar("Priya Mehta"), text: "Everyone bring water", time: "2m ago", isMe: false },
    ],
  },
  {
    id: "c2", name: "Priya Mehta", avatar: avatar("Priya Mehta"), isGroup: false, lastMessage: "See you at 7!", timestamp: "15m ago", unread: 0,
    messages: [
      { id: "m1", sender: "Priya Mehta", senderAvatar: avatar("Priya Mehta"), text: "Hey, are you joining the run tomorrow?", time: "1h ago", isMe: false },
      { id: "m2", sender: "Yathu", senderAvatar: avatar("Yathu"), text: "Yes! What time are we meeting?", time: "50m ago", isMe: true },
      { id: "m3", sender: "Priya Mehta", senderAvatar: avatar("Priya Mehta"), text: "5:45 at the lake gate", time: "45m ago", isMe: false },
      { id: "m4", sender: "Yathu", senderAvatar: avatar("Yathu"), text: "Perfect, I'll be there", time: "30m ago", isMe: true },
      { id: "m5", sender: "Priya Mehta", senderAvatar: avatar("Priya Mehta"), text: "See you at 7!", time: "15m ago", isMe: false },
    ],
  },
  {
    id: "c3", name: "Coorg Weekend Trip", avatar: avatar("Coorg Trip"), isGroup: true, emoji: "🗺", members: 6,
    lastMessage: "Train tickets confirmed", lastSender: "Arjun", timestamp: "1h ago", unread: 1,
    messages: [
      { id: "m1", sender: "Rahul Sharma", senderAvatar: avatar("Rahul Sharma"), text: "So the plan is set - Friday 6pm departure", time: "3h ago", isMe: false },
      { id: "m2", sender: "Yathu", senderAvatar: avatar("Yathu"), text: "What should we pack?", time: "2h ago", isMe: true },
      { id: "m3", sender: "Sneha Rao", senderAvatar: avatar("Sneha Rao"), text: "Light clothes, raincoat, trekking shoes", time: "1.5h ago", isMe: false },
      { id: "m4", sender: "Arjun Kapoor", senderAvatar: avatar("Arjun Kapoor"), text: "Train tickets confirmed", time: "1h ago", isMe: false },
    ],
  },
  {
    id: "c4", name: "Rahul Sharma", avatar: avatar("Rahul Sharma"), isGroup: false, lastMessage: "Same time tomorrow?", timestamp: "3h ago", unread: 0,
    messages: [
      { id: "m1", sender: "Rahul Sharma", senderAvatar: avatar("Rahul Sharma"), text: "Great game today!", time: "4h ago", isMe: false },
      { id: "m2", sender: "Yathu", senderAvatar: avatar("Yathu"), text: "You were on fire with those shots", time: "3.5h ago", isMe: true },
      { id: "m3", sender: "Rahul Sharma", senderAvatar: avatar("Rahul Sharma"), text: "Same time tomorrow?", time: "3h ago", isMe: false },
    ],
  },
  {
    id: "c5", name: "Street Food Crawl", avatar: avatar("Food Group"), isGroup: true, emoji: "🍜", members: 7,
    lastMessage: "Meeting at Jama Masjid gate at 8 sharp", lastSender: "Ishita", timestamp: "30m ago", unread: 2,
    messages: [
      { id: "m1", sender: "Ishita Verma", senderAvatar: avatar("Ishita Verma"), text: "Tonight's going to be amazing!", time: "2h ago", isMe: false },
      { id: "m2", sender: "Vikram Singh", senderAvatar: avatar("Vikram Singh"), text: "Can't wait for the kebabs", time: "1h ago", isMe: false },
      { id: "m3", sender: "Ishita Verma", senderAvatar: avatar("Ishita Verma"), text: "Meeting at Jama Masjid gate at 8 sharp", time: "30m ago", isMe: false },
    ],
  },
  {
    id: "c6", name: "Vikram Singh", avatar: avatar("Vikram Singh"), isGroup: false, lastMessage: "Let's do it next week", timestamp: "5h ago", unread: 0,
    messages: [
      { id: "m1", sender: "Vikram Singh", senderAvatar: avatar("Vikram Singh"), text: "That football session was intense", time: "6h ago", isMe: false },
      { id: "m2", sender: "Yathu", senderAvatar: avatar("Yathu"), text: "My legs are still sore haha", time: "5.5h ago", isMe: true },
      { id: "m3", sender: "Vikram Singh", senderAvatar: avatar("Vikram Singh"), text: "Let's do it next week", time: "5h ago", isMe: false },
    ],
  },
  {
    id: "c7", name: "Badminton Doubles", avatar: avatar("Badminton"), isGroup: true, emoji: "🏸", members: 4,
    lastMessage: "Court 3 is booked", lastSender: "Meera", timestamp: "Yesterday", unread: 0,
    messages: [
      { id: "m1", sender: "Meera Joshi", senderAvatar: avatar("Meera Joshi"), text: "Court 3 is booked for 6-7:30", time: "Yesterday", isMe: false },
      { id: "m2", sender: "Yathu", senderAvatar: avatar("Yathu"), text: "I'll bring extra shuttlecocks", time: "Yesterday", isMe: true },
    ],
  },
  {
    id: "c8", name: "Sneha Rao", avatar: avatar("Sneha Rao"), isGroup: false, lastMessage: "Thanks for the tips!", timestamp: "Yesterday", unread: 0,
    messages: [
      { id: "m1", sender: "Sneha Rao", senderAvatar: avatar("Sneha Rao"), text: "Any good cycling routes in Bhopal?", time: "Yesterday", isMe: false },
      { id: "m2", sender: "Yathu", senderAvatar: avatar("Yathu"), text: "Try the Upper Lake loop, it's beautiful early morning", time: "Yesterday", isMe: true },
      { id: "m3", sender: "Sneha Rao", senderAvatar: avatar("Sneha Rao"), text: "Thanks for the tips!", time: "Yesterday", isMe: false },
    ],
  },
];

export const NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "activity", text: "Rahul joined your Football pool", timestamp: "2m ago", read: false, linkTo: "/pool/p1" },
  { id: "n2", type: "reminder", text: "Your pool starts in 1 hour! Football at Malviya Nagar", timestamp: "45m ago", read: false, actionLabel: "View Pool", linkTo: "/pool/p1" },
  { id: "n3", type: "social", text: "Priya Mehta started following you", timestamp: "1h ago", read: false, actionLabel: "Follow Back", linkTo: "/profile/u2" },
  { id: "n4", type: "pool_full", text: "Coorg Weekend Trip is now full (8/8)", timestamp: "1h ago", read: false, linkTo: "/pool/p4" },
  { id: "n5", type: "cancelled", text: "Tennis Practice by Arjun was cancelled", timestamp: "2h ago", read: true, linkTo: "/pool/p10" },
  { id: "n6", type: "new_pool", text: "Ishita raised a new pool: Street food crawl tonight", timestamp: "3h ago", read: true, actionLabel: "Join", linkTo: "/pool/p9" },
  { id: "n7", type: "payment", text: "₹80 received from Sneha for Football pool", timestamp: "4h ago", read: true },
  { id: "n8", type: "review", text: "Priya left you a 5-star review!", timestamp: "Yesterday", read: true },
  { id: "n9", type: "milestone", text: "You've played 47 games! Badge unlocked", timestamp: "2 days ago", read: true },
  { id: "n10", type: "activity", text: "Sneha joined your Cycling pool", timestamp: "2 days ago", read: true, linkTo: "/pool/p7" },
  { id: "n11", type: "social", text: "Vikram Singh started following you", timestamp: "3 days ago", read: true, linkTo: "/profile/u5" },
  { id: "n12", type: "reminder", text: "Biryani cook-together is tomorrow at 7 PM", timestamp: "3 days ago", read: true, linkTo: "/pool/p3" },
  { id: "n13", type: "new_pool", text: "Karan raised a new pool: Rooftop party Friday", timestamp: "4 days ago", read: true, linkTo: "/pool/p6" },
  { id: "n14", type: "payment", text: "₹150 received from Arjun for Biryani pool", timestamp: "5 days ago", read: true },
  { id: "n15", type: "activity", text: "Meera joined your Badminton pool", timestamp: "1 week ago", read: true, linkTo: "/pool/p5" },
];

export const VENUES: Venue[] = [
  { id: "v1", name: "Malviya Nagar Turf", type: "Turf", address: "Plot 45, Malviya Nagar", area: "Malviya Nagar", city: "Bhopal", rating: 4.3, reviewCount: 127, amenities: ["Parking", "Floodlights", "Drinking Water", "Changing Room"], poolsThisWeek: 5, sports: ["Football", "Cricket"] },
  { id: "v2", name: "TT Nagar Sports Complex", type: "Sports Complex", address: "TT Nagar Main Road", area: "TT Nagar", city: "Bhopal", rating: 4.5, reviewCount: 203, amenities: ["Parking", "Changing Room", "Seating", "Drinking Water", "Floodlights"], poolsThisWeek: 8, sports: ["Badminton", "Tennis", "Basketball"] },
  { id: "v3", name: "Shahpura Lake", type: "Outdoor", address: "Shahpura Lake Road", area: "Shahpura", city: "Bhopal", rating: 4.7, reviewCount: 89, amenities: ["Parking", "Drinking Water"], poolsThisWeek: 3, sports: ["Running", "Cycling"] },
  { id: "v4", name: "Level Up Gaming Cafe", type: "Gaming Cafe", address: "MP Nagar Zone 2", area: "MP Nagar", city: "Bhopal", rating: 4.1, reviewCount: 67, amenities: ["Seating", "Drinking Water"], poolsThisWeek: 4, sports: ["Gaming"] },
  { id: "v5", name: "DB City Tennis Courts", type: "Court", address: "DB City Mall Complex", area: "DB City", city: "Bhopal", rating: 4.4, reviewCount: 45, amenities: ["Parking", "Floodlights", "Changing Room", "Seating"], poolsThisWeek: 2, sports: ["Tennis"] },
  { id: "v6", name: "Skyline Terrace", type: "Rooftop", address: "New Market, 5th Floor", area: "New Market", city: "Bhopal", rating: 4.2, reviewCount: 156, amenities: ["Parking", "Seating"], poolsThisWeek: 1, sports: ["Party"] },
];

export const REVIEWS = [
  { id: "r1", userId: "u1", userName: "Rahul Sharma", userAvatar: avatar("Rahul Sharma"), rating: 5, text: "Great footballer, very welcoming to newcomers!", activity: "Football", date: "2 weeks ago" },
  { id: "r2", userId: "u2", userName: "Priya Mehta", userAvatar: avatar("Priya Mehta"), rating: 5, text: "Showed up on time and kept the energy high", activity: "Running", date: "3 weeks ago" },
  { id: "r3", userId: "u3", userName: "Arjun Kapoor", userAvatar: avatar("Arjun Kapoor"), rating: 4, text: "Good organizer, would play again", activity: "Cricket", date: "1 month ago" },
  { id: "r4", userId: "u5", userName: "Vikram Singh", userAvatar: avatar("Vikram Singh"), rating: 5, text: "Best captain I've played under. Always fair.", activity: "Football", date: "1 month ago" },
  { id: "r5", userId: "u12", userName: "Ishita Verma", userAvatar: avatar("Ishita Verma"), rating: 5, text: "Amazing host! The food walk was so well planned.", activity: "Food", date: "2 months ago" },
];

export const LEADERBOARD_DATA = {
  topHosts: [
    { ...USERS.find(u => u.id === "u5")!, poolsHosted: 23 },
    { ...USERS.find(u => u.id === "u2")!, poolsHosted: 19 },
    { ...USERS.find(u => u.id === "u12")!, poolsHosted: 17 },
    { ...USERS.find(u => u.id === "u7")!, poolsHosted: 15 },
    { ...USERS.find(u => u.id === "u1")!, poolsHosted: 14 },
    { ...USERS.find(u => u.id === "u4")!, poolsHosted: 12 },
    { ...USERS.find(u => u.id === "u6")!, poolsHosted: 11 },
    { ...USERS.find(u => u.id === "u3")!, poolsHosted: 9 },
    { ...USERS.find(u => u.id === "u10")!, poolsHosted: 8 },
    { ...USERS.find(u => u.id === "u13")!, poolsHosted: 7 },
  ],
  mostActive: [
    { ...USERS.find(u => u.id === "u5")!, gamesThisMonth: 18 },
    { ...USERS.find(u => u.id === "u1")!, gamesThisMonth: 15 },
    { ...USERS.find(u => u.id === "u4")!, gamesThisMonth: 14 },
    { ...USERS.find(u => u.id === "u2")!, gamesThisMonth: 12 },
    { ...USERS.find(u => u.id === "u13")!, gamesThisMonth: 11 },
    { ...USERS.find(u => u.id === "u10")!, gamesThisMonth: 10 },
    { ...USERS.find(u => u.id === "u14")!, gamesThisMonth: 9 },
    { ...USERS.find(u => u.id === "u6")!, gamesThisMonth: 8 },
    { ...USERS.find(u => u.id === "u11")!, gamesThisMonth: 7 },
    { ...USERS.find(u => u.id === "u15")!, gamesThisMonth: 6 },
  ],
};
