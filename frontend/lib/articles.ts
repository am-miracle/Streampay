export interface Article {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAddress: string;
  readTime: number;
  ratePerMinute: number;
  estimatedCost: number;
  category: string;
  thumbnail: string;
}

export const PREMIUM_ARTICLES: Article[] = [
  {
    id: "1",
    title: "Understanding StreamPay's Gasless Micropayment Architecture",
    description:
      "A deep dive into how account abstraction and bundlers enable true micropayments without gas fees. Learn the technical architecture behind StreamPay.",
    author: "StreamPay Team",
    authorAddress: "0x742d35cc6634c0532925a3b844bc454e4438f44e",
    readTime: 8,
    ratePerMinute: 0.02,
    estimatedCost: 0.16,
    category: "Technical",
    thumbnail: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "2",
    title: "The Future of Content Monetization: Why Micropayments Win",
    description:
      "Traditional subscriptions are broken. Discover why pay-per-second models will dominate the creator economy and how blockchain makes it possible.",
    author: "Creator Economy Labs",
    authorAddress: "0xB0a1020486fDd86795e4f2E06fBF11d6aD2C19BB",
    readTime: 6,
    ratePerMinute: 0.015,
    estimatedCost: 0.09,
    category: "Business",
    thumbnail: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: "3",
    title: "Building Gasless dApps: A Developer's Guide to ERC-4337",
    description:
      "Step-by-step tutorial on implementing account abstraction in your dApp. Code examples, best practices, and common pitfalls to avoid.",
    author: "Web3 Builders",
    authorAddress: "0xe9f1406E039d5c3FBF442C2542Df84E52A51d3C4",
    readTime: 12,
    ratePerMinute: 0.025,
    estimatedCost: 0.3,
    category: "Tutorial",
    thumbnail: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    id: "4",
    title: "Smart Contract Security in Payment Streaming Protocols",
    description:
      "Analyzing potential vulnerabilities in streaming payment systems. How StreamPay protects against reentrancy, front-running, and other attack vectors.",
    author: "Security Research",
    authorAddress: "0x1360eDa247bF2fEfeCc5FD5926aC1EF628b19733",
    readTime: 10,
    ratePerMinute: 0.03,
    estimatedCost: 0.3,
    category: "Security",
    thumbnail: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
];
