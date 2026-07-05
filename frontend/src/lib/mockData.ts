export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  is_admin?: boolean;
  is_suspended?: boolean;
  created_at: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  image_urls?: string[];
  seller_id: number;
  fraud_score: number;
  fraud_level: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  content?: string;
  message_type: string;
  media_url?: string;
  is_delivered: boolean;
  is_read: boolean;
  created_at: string;
}

export interface ChatConversation {
  id: number;
  listing_id: number;
  buyer_id: number;
  seller_id: number;
  is_archived_buyer: boolean;
  is_archived_seller: boolean;
  is_pinned_buyer: boolean;
  is_pinned_seller: boolean;
  created_at: string;
  updated_at: string;
  other_party_name?: string;
  listing_title?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  other_party_online: boolean;
}

export interface Offer {
  id: number;
  listing_id: number;
  buyer_id: number;
  seller_id: number;
  offer_price: number;
  status: string;
  created_at: string;
  listing_title?: string;
  buyer_name?: string;
  seller_name?: string;
}

// 1. MOCK USER DEFINITION
export const MOCK_USER: User = {
  id: 999,
  email: "demo@smartbazaar.ai",
  full_name: "Demo Seller & Buyer",
  phone: "+91 99999 99999",
  is_admin: true,
  is_suspended: false,
  created_at: new Date().toISOString()
};

// 2. MOCK LISTINGS
export const MOCK_LISTINGS: Listing[] = [
  {
    id: 1,
    title: "Yamaha FG800 Acoustic Guitar",
    description: "Mint condition Yamaha acoustic guitar. Perfect for beginners and intermediate players. Warm tone, steel strings, includes a soft carry bag and guitar tuner. Selling because I upgraded to an electric guitar.",
    price: 8500,
    category: "Others",
    location: "Mumbai, Maharashtra",
    image_urls: [
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&auto=format&fit=crop&q=60"
    ],
    seller_id: 101,
    fraud_score: 12,
    fraud_level: "LOW",
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString() // 2 days ago
  },
  {
    id: 2,
    title: "iPhone 13 Pro - 256GB - Graphite",
    description: "Battery health is at 88%. No scratches on front or back, always used with screen protector and case. Original box and unused charging cable included. Indian unit, out of warranty.",
    price: 48000,
    category: "Electronics",
    location: "Delhi, NCR",
    image_urls: [
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1565849511593-ed34f2af0475?w=600&auto=format&fit=crop&q=60"
    ],
    seller_id: 102,
    fraud_score: 8,
    fraud_level: "LOW",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
  },
  {
    id: 3,
    title: "Ergonomic Mesh Office Chair",
    description: "High-back office chair with adjustable armrests, lumbar support, and headrest. Synchro-tilt mechanism. Very comfortable for long work-from-home sessions. Only 6 months old.",
    price: 6200,
    category: "Furniture",
    location: "Bangalore, Karnataka",
    image_urls: [
      "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=60"
    ],
    seller_id: 103,
    fraud_score: 25,
    fraud_level: "MEDIUM",
    created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString() // 4 days ago
  },
  {
    id: 4,
    title: "Mountain Bike - Rockrider ST100",
    description: "Decathlon Rockrider ST100 MTB. 21-speed Shimano gears, lightweight aluminum frame, front suspension. Barely ridden, tires are in excellent condition. Perfect for trails and city commutes.",
    price: 11500,
    category: "Vehicles",
    location: "Pune, Maharashtra",
    image_urls: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=60"
    ],
    seller_id: 104,
    fraud_score: 15,
    fraud_level: "LOW",
    created_at: new Date(Date.now() - 3600000 * 3).toISOString() // 3 hours ago
  },
  {
    id: 5,
    title: "Complete Harry Potter Book Set (Hardcover)",
    description: "All 7 books in a beautiful collectible chest. Hardcover edition with original cover art. Like new condition, only read once. Perfect gift for any book lover.",
    price: 3200,
    category: "Books",
    location: "Kolkata, West Bengal",
    image_urls: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=60"
    ],
    seller_id: 105,
    fraud_score: 5,
    fraud_level: "LOW",
    created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString() // 7 days ago
  },
  {
    id: 6,
    title: "Sony WH-1000XM4 Noise Cancelling Headphones",
    description: "Excellent active noise cancellation. 30 hours battery life. Touches controls work perfectly. Includes case, aux cable, and airline adapter. Minor cosmetic wear on earcups, but functions perfectly.",
    price: 13900,
    category: "Electronics",
    location: "Hyderabad, Telangana",
    image_urls: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60"
    ],
    seller_id: 106,
    fraud_score: 18,
    fraud_level: "LOW",
    created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString() // 1 day ago
  }
];

export const MOCK_TRENDING_LISTINGS = MOCK_LISTINGS.slice(0, 4);

// 3. MOCK WISHLIST
export const MOCK_WISHLIST = [MOCK_LISTINGS[0], MOCK_LISTINGS[2]];

// 4. MOCK OFFERS
export const MOCK_OFFERS: Offer[] = [
  {
    id: 1,
    listing_id: 1,
    buyer_id: 999, // Current User
    seller_id: 101,
    offer_price: 7500,
    status: "PENDING",
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    listing_title: "Yamaha FG800 Acoustic Guitar",
    seller_name: "Sameer 'Quick-List' Sen",
    buyer_name: "Demo Seller & Buyer"
  },
  {
    id: 2,
    listing_id: 3,
    buyer_id: 108,
    seller_id: 999, // Current User is Seller
    offer_price: 5800,
    status: "ACCEPTED",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    listing_title: "Ergonomic Mesh Office Chair",
    seller_name: "Demo Seller & Buyer",
    buyer_name: "Rajesh Kumar"
  },
  {
    id: 3,
    listing_id: 2,
    buyer_id: 999, // Current User
    seller_id: 102,
    offer_price: 45000,
    status: "REJECTED",
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    listing_title: "iPhone 13 Pro - 256GB - Graphite",
    seller_name: "Delhi Electronics",
    buyer_name: "Demo Seller & Buyer"
  }
];

// 5. MOCK CHAT CONVERSATIONS & MESSAGES
export const MOCK_CONVERSATIONS: ChatConversation[] = [
  {
    id: 10,
    listing_id: 1,
    buyer_id: 999,
    seller_id: 101,
    is_archived_buyer: false,
    is_archived_seller: false,
    is_pinned_buyer: true,
    is_pinned_seller: false,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    other_party_name: "Sameer 'Quick-List' Sen",
    listing_title: "Yamaha FG800 Acoustic Guitar",
    last_message: "Would you be willing to do ₹7,500? I can pick it up tomorrow.",
    last_message_time: new Date(Date.now() - 3600000 * 2).toISOString(),
    unread_count: 0,
    other_party_online: true
  },
  {
    id: 20,
    listing_id: 3,
    buyer_id: 108,
    seller_id: 999,
    is_archived_buyer: false,
    is_archived_seller: false,
    is_pinned_buyer: false,
    is_pinned_seller: false,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    other_party_name: "Rajesh Kumar",
    listing_title: "Ergonomic Mesh Office Chair",
    last_message: "Awesome, I accept the offer of ₹5,800. Let me know when I can collect it.",
    last_message_time: new Date(Date.now() - 3600000 * 24).toISOString(),
    unread_count: 2,
    other_party_online: false
  }
];

export const MOCK_MESSAGES: Record<number, ChatMessage[]> = {
  10: [
    {
      id: 1001,
      conversation_id: 10,
      sender_id: 101,
      content: "Hello! Yes, the guitar is still available.",
      message_type: "text",
      is_delivered: true,
      is_read: true,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 1002,
      conversation_id: 10,
      sender_id: 999,
      content: "Great! Are there any scratches or issues with the bridge?",
      message_type: "text",
      is_delivered: true,
      is_read: true,
      created_at: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 1003,
      conversation_id: 10,
      sender_id: 101,
      content: "No issues at all. It's clean and tuned. I'll send an image of the bridge.",
      message_type: "text",
      is_delivered: true,
      is_read: true,
      created_at: new Date(Date.now() - 3600000 * 2.8).toISOString()
    },
    {
      id: 1004,
      conversation_id: 10,
      sender_id: 101,
      message_type: "image",
      media_url: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=60",
      is_delivered: true,
      is_read: true,
      created_at: new Date(Date.now() - 3600000 * 2.7).toISOString()
    },
    {
      id: 1005,
      conversation_id: 10,
      sender_id: 999,
      content: "Would you be willing to do ₹7,500? I can pick it up tomorrow.",
      message_type: "text",
      is_delivered: true,
      is_read: true,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ],
  20: [
    {
      id: 2001,
      conversation_id: 20,
      sender_id: 108,
      content: "Hi, I am interested in the office chair. Can you deliver to HSR layout?",
      message_type: "text",
      is_delivered: true,
      is_read: true,
      created_at: new Date(Date.now() - 3600000 * 26).toISOString()
    },
    {
      id: 2002,
      conversation_id: 20,
      sender_id: 999,
      content: "Hi Rajesh, delivery isn't possible, but I can help you load it in a cab if you arrange self-pickup.",
      message_type: "text",
      is_delivered: true,
      is_read: true,
      created_at: new Date(Date.now() - 3600000 * 25).toISOString()
    },
    {
      id: 2003,
      conversation_id: 20,
      sender_id: 108,
      content: "Awesome, I accept the offer of ₹5,800. Let me know when I can collect it.",
      message_type: "text",
      is_delivered: true,
      is_read: false,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ]
};

// 6. MOCK ANALYTICS OVERVIEW & INSIGHTS
export const MOCK_ANALYTICS_OVERVIEW = {
  views: {
    total: 3420,
    change: "+18.4% vs last week",
    history: [120, 150, 180, 290, 420, 380, 540, 680, 650]
  },
  inquiries: {
    total: 245,
    change: "+12.1% vs last week",
    history: [10, 15, 12, 22, 35, 28, 44, 40, 39]
  },
  sales: {
    total: 125000,
    change: "+24.8% vs last week",
    history: [5000, 12000, 8000, 15000, 22000, 18000, 20000, 25000, 0]
  },
  conversion_rate: {
    total: "7.16%",
    change: "+1.2% vs last week",
    history: [4.2, 5.1, 4.8, 6.2, 7.5, 6.8, 7.8, 7.1, 7.1]
  }
};

export const MOCK_ANALYTICS_INSIGHTS = {
  insights: [
    {
      type: "opportunity",
      message: "The demand for 'Electronics' in your neighborhood is up 35% this week. Consider pricing your iPhone 13 Pro closer to the higher end (₹49,000) for faster sell.",
      score_impact: "+12%"
    },
    {
      type: "alert",
      message: "You have 3 active inquiries that haven't received replies in over 12 hours. Fast responses increase final sales rates by 4.2x.",
      score_impact: "-5%"
    },
    {
      type: "suggestion",
      message: "Adding a video demonstration or 3D scan to your listings increases buyers' trust rating by up to 28%. We recommend using the SmartBazaar Scanner app.",
      score_impact: "+15%"
    }
  ]
};

// 7. MOCK SELLER TRUST SCORE
export const MOCK_SELLER_TRUST_SCORE = {
  seller_id: 101,
  score: 96,
  level: "Excellent",
  verifications: ["EMAIL", "PHONE", "GOVERNMENT_ID"],
  response_rate: 98,
  average_response_time: "5 minutes",
  completed_trades: 24
};

// 8. MOCK AI COPILOT INTERACTION
export const MOCK_AI_RESPONSE = {
  response: "SmartBazaar Copilot Offline Mode active. Your listing draft triggers no warning signals and fits perfectly in the general pricing guidelines.",
  actions: [
    { type: "suggest_price", payload: { min: 7200, max: 8000, average: 7500 } },
    { type: "suggest_categories", payload: ["Electronics", "Music Instruments"] }
  ]
};

// 9. MOCK ADMIN DATA
export const MOCK_ADMIN_OVERVIEW = {
  total_users: 1845,
  active_listings: 932,
  reported_items: 14,
  pending_verifications: 6
};

export const MOCK_ADMIN_USERS = [
  { id: 1, email: "seller1@smartbazaar.ai", full_name: "Sameer Sen", is_suspended: false, is_admin: false, created_at: "2026-06-15" },
  { id: 2, email: "seller2@smartbazaar.ai", full_name: "Rajesh Electronics", is_suspended: false, is_admin: false, created_at: "2026-06-20" },
  { id: 3, email: "spammer@gmail.com", full_name: "Fake Offers Spammer", is_suspended: true, is_admin: false, created_at: "2026-06-25" },
  { id: 999, email: "demo@smartbazaar.ai", full_name: "Demo Seller & Buyer", is_suspended: false, is_admin: true, created_at: "2026-06-01" }
];

export const MOCK_ADMIN_LISTINGS = [
  { id: 1, title: "Yamaha FG800 Acoustic Guitar", price: 8500, category: "Others", location: "Mumbai", seller_id: 101, fraud_score: 12, fraud_level: "LOW" },
  { id: 2, title: "iPhone 13 Pro - 256GB - Graphite", price: 48000, category: "Electronics", location: "Delhi", seller_id: 102, fraud_score: 8, fraud_level: "LOW" },
  { id: 99, title: "FREE GIFT CARDS JUST SEND SHIPPING CASH", price: 100, category: "Others", location: "Online", seller_id: 3, fraud_score: 95, fraud_level: "CRITICAL" }
];

export const MOCK_ADMIN_REPORTS = [
  { id: 1, listing_id: 99, reason: "Suspiciously low price asking for wire transfer shipping cash", reporter_id: 102, status: "PENDING", created_at: "2026-07-02" }
];

export const MOCK_ADMIN_VERIFICATIONS = [
  { id: 1, seller_id: 101, verification_type: "GOVERNMENT_ID", status: "PENDING", submitted_at: "2026-07-03", document_type: "Passport" }
];

export const MOCK_ADMIN_SETTINGS = [
  { key: "site_maintenance", value: "false", description: "Puts the marketplace in read-only maintenance mode." },
  { key: "fraud_threshold", value: "65", description: "Listings above this safety score are auto-flagged as high-risk." }
];

export const MOCK_ADMIN_AUDIT_LOGS = [
  { id: 1, user_id: 999, action: "SUSPEND_USER", entity_type: "User", entity_id: 3, details: "Auto-suspended user for Critical fraud score listings.", created_at: "2026-07-04" }
];
