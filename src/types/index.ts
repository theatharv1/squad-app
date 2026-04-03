export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string;
  city: string;
  sportsPlayed: string[];
  rating: string;
  totalGames: number;
  showUpRate: number;
  followersCount: number;
  followingCount: number;
  karma: number;
  isVerified: boolean;
  role: string;
  email?: string;
  phone?: string;
  isBanned?: boolean;
  createdAt: string;
  badges?: Badge[];
  isFollowing?: boolean;
}

export interface Badge {
  id: string;
  icon: string;
  label: string;
  earnedAt: string;
}

export interface Pool {
  id: string;
  title: string;
  category: string;
  emoji: string;
  host: {
    id: string;
    name: string;
    avatar: string | null;
    rating: string;
    showUpRate: number;
  };
  city: string;
  area: string;
  venue: string;
  description: string;
  tags: string[];
  skillLevel: string | null;
  scheduledTime: string;
  spotsTotal: number;
  spotsFilled: number;
  costPerHead: number;
  isLive: boolean;
  status: string;
  createdAt: string;
  joined: boolean;
  participants?: PoolParticipant[];
  conversationId?: string;
}

export interface PoolParticipant {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  rating: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  isGroup: boolean;
  emoji?: string;
  members?: number;
  lastMessage: string;
  lastSender: string;
  timestamp: string;
  poolId?: string;
}

export interface Message {
  id: string;
  sender: string;
  senderAvatar: string;
  senderId: string | null;
  text: string;
  time: string;
  isMe: boolean;
  isSystem: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  text: string;
  linkTo: string | null;
  actionLabel: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Venue {
  id: string;
  name: string;
  type: string;
  address: string;
  area: string;
  city: string;
  rating: string;
  reviewCount: number;
  amenities: string[];
  sports: string[];
  poolsThisWeek: number;
}

export interface Review {
  id: string;
  rating: number;
  text: string | null;
  createdAt: string;
  reviewerName: string;
  reviewerAvatar: string | null;
  reviewerId: string;
}

export interface Report {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  reporterName: string;
  reportedUserId: string | null;
  reportedPoolId: string | null;
}

export interface AdminStats {
  totalUsers: number;
  totalPools: number;
  activePools: number;
  pendingReports: number;
  totalMessages: number;
}
