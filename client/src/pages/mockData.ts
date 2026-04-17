export const USERS = [
  {
    id: 'u1',
    name: 'Alex (You)',
    avatar: 'AL',
    role: 'freelancer',
    title: 'Full Stack Web3 Developer',
    skills: ['React', 'Solidity', 'Node.js', 'Tailwind'],
    bio: 'I build decentralized applications with modern UI/UX.',
    rating: 4.9,
    completedProjects: 42,
    hourlyRate: 85,
    location: 'San Francisco, CA',
    joinedDate: '2023-01-15',
    connections: ['u3', 'u5', 'u6'],
    connectionRequests: ['u7']
  },
  {
    id: 'u2',
    name: 'Sarah Jenkins',
    avatar: 'SJ',
    role: 'freelancer',
    title: 'Senior Brand Designer',
    skills: ['Figma', 'Illustrator', 'Branding', 'Typography'],
    bio: 'Award-winning designer helping startups find their visual identity.',
    rating: 5.0,
    completedProjects: 118,
    hourlyRate: 120,
    location: 'London, UK',
    joinedDate: '2022-06-10',
    connections: ['u4'],
    connectionRequests: []
  },
  {
    id: 'u3',
    name: 'Mike Tech',
    avatar: 'MT',
    role: 'freelancer',
    title: 'Smart Contract Auditor',
    skills: ['Solidity', 'Security', 'Rust', 'Hardhat'],
    bio: 'I secure protocols before they go to mainnet.',
    rating: 4.8,
    completedProjects: 25,
    hourlyRate: 150,
    location: 'Berlin, DE',
    joinedDate: '2024-02-28',
    connections: ['u1'],
    connectionRequests: []
  },
  {
    id: 'u4',
    name: 'Tech Innovators Inc.',
    avatar: 'TI',
    role: 'client',
    title: 'Startup Studio',
    skills: [],
    bio: 'We incubate and launch exciting Web3 SaaS products.',
    rating: 4.7,
    completedProjects: 12,
    hourlyRate: 0,
    location: 'Austin, TX',
    joinedDate: '2023-11-05',
    connections: ['u2'],
    connectionRequests: []
  },
  {
    id: 'u5',
    name: 'Startup Hub',
    avatar: 'SH',
    role: 'client',
    title: 'Incubator',
    skills: [],
    bio: 'Funding the next generation of decentralized applications.',
    rating: 4.9,
    completedProjects: 30,
    hourlyRate: 0,
    location: 'New York, NY',
    joinedDate: '2021-08-20',
    connections: ['u1'],
    connectionRequests: []
  },
  {
    id: 'u6',
    name: 'Elena Rostova',
    avatar: 'ER',
    role: 'freelancer',
    title: 'Content Marketing Specialist',
    skills: ['Copywriting', 'SEO', 'Twitter Growth', 'Strategy'],
    bio: 'I tell your product story to the people who matter.',
    rating: 4.6,
    completedProjects: 65,
    hourlyRate: 50,
    location: 'Lisbon, PT',
    joinedDate: '2023-05-12',
    connections: ['u1'],
    connectionRequests: []
  },
  {
    id: 'u7',
    name: 'David Chen',
    avatar: 'DC',
    role: 'client',
    title: 'E-commerce Founder',
    skills: [],
    bio: 'Scaling my D2C brand and looking for technical partners.',
    rating: 5.0,
    completedProjects: 3,
    hourlyRate: 0,
    location: 'Toronto, CA',
    joinedDate: '2024-01-10',
    connections: [],
    connectionRequests: ['u1']
  },
  {
    id: 'u8',
    name: 'Vanguard Studios',
    avatar: 'VS',
    role: 'client',
    title: 'Game Development Agency',
    skills: [],
    bio: 'Building AA titles with integrated blockchain economies.',
    rating: 4.5,
    completedProjects: 8,
    hourlyRate: 0,
    location: 'Tokyo, JP',
    joinedDate: '2022-12-01',
    connections: [],
    connectionRequests: []
  }
];

export const GIGS = [
  {
    id: 1,
    freelancerId: 'u1',
    title: 'Full Stack React & Web3 Application',
    description: 'I will build a complete web application with React, Tailwind CSS, and Web3 integrations using Ethers.js and Wagmi. Perfect for NFT minting pages or DeFi dashboards.',
    category: 'Development',
    budget: 1500,
    deliveryDays: 14,
    tags: ['React', 'Tailwind', 'Node.js', 'Web3'],
    createdAt: '2026-03-10T10:00:00Z',
    status: 'active',
    proposals: [
      {
        id: 101,
        clientId: 'u4',
        clientName: 'Tech Innovators Inc.',
        clientAvatar: 'TI',
        message: 'We need a full-stack dashboard for our new DeFi tracking product. Let us discuss details and see if we can expedite delivery.',
        budget: 1600,
        deliveryDays: 10,
        status: 'pending',
        submittedAt: '2026-04-09T14:30:00Z',
        isRead: false
      }
    ]
  },
  {
    id: 2,
    freelancerId: 'u2',
    title: 'Premium Logo & Brand Identity System',
    description: 'High-quality vector logo design with 3 revisions. Deliverables include primary logo, usage guidelines, and custom color palette.',
    category: 'Design',
    budget: 800,
    deliveryDays: 7,
    tags: ['Illustrator', 'Branding', 'Logo'],
    createdAt: '2026-03-15T09:00:00Z',
    status: 'active',
    proposals: [
      {
        id: 102,
        clientId: 'u7',
        clientName: 'David Chen',
        clientAvatar: 'DC',
        message: 'I am launching a new coffee brand and love your minimalist style.',
        budget: 800,
        deliveryDays: 7,
        status: 'accepted',
        submittedAt: '2026-04-01T10:00:00Z',
        isRead: true
      }
    ]
  },
  {
    id: 3,
    freelancerId: 'u3',
    title: 'Comprehensive Smart Contract Audit',
    description: 'Line-by-line review of your Solidity smart contracts. Checking for reentrancy, overflow, logic bugs, and gas optimization.',
    category: 'Development',
    budget: 3000,
    deliveryDays: 21,
    tags: ['Solidity', 'Audit', 'Security'],
    createdAt: '2026-02-28T11:00:00Z',
    status: 'active',
    proposals: []
  },
  {
    id: 4,
    freelancerId: 'u6',
    title: 'Twitter Thread Strategy & Ghostwriting',
    description: 'I will write 4 high-converting, viral-style Twitter threads for your Web3 project to build hype before your token launch.',
    category: 'Writing',
    budget: 400,
    deliveryDays: 5,
    tags: ['Copywriting', 'Twitter', 'Marketing'],
    createdAt: '2026-04-02T15:00:00Z',
    status: 'active',
    proposals: [
      {
        id: 103,
        clientId: 'u5',
        clientName: 'Startup Hub',
        clientAvatar: 'SH',
        message: 'Can you do a trial thread first? If it performs well, we will order the full package.',
        budget: 100,
        deliveryDays: 2,
        status: 'rejected',
        submittedAt: '2026-04-05T08:20:00Z',
        isRead: true
      }
    ]
  },
  {
    id: 5,
    freelancerId: 'u1',
    title: 'Fix React/Next.js Bugs & Optimization',
    description: 'Quick turnaround for fixing annoying UI bugs, solving hydration errors, and improving your Lighthouse score.',
    category: 'Development',
    budget: 200,
    deliveryDays: 2,
    tags: ['React', 'Next.js', 'Bugfix'],
    createdAt: '2026-04-10T12:00:00Z',
    status: 'active',
    proposals: []
  },
  {
    id: 6,
    freelancerId: 'u3',
    title: 'Custom DeFi Strategy Vault Bot',
    description: 'Development of an automated MEV or Yield Farming bot. Supports flash loans and multi-DEX routing.',
    category: 'Development',
    budget: 5000,
    deliveryDays: 30,
    tags: ['Bot', 'MEV', 'DeFi'],
    createdAt: '2026-03-01T09:00:00Z',
    status: 'paused',
    proposals: []
  }
];

export const PROJECTS = [
  {
    id: 201,
    title: 'E-commerce Mobile App UI Design',
    description: 'Seeking an expert Mobile UI designer for a modern streetwear app. Need dark mode support.',
    postedBy: 'u7',
    budget: 1200,
    skills: ['Figma', 'Mobile Design', 'UI/UX'],
    deadline: '2026-05-01',
    savedBy: ['u1', 'u2']
  },
  {
    id: 202,
    title: 'Solana Rust Engineer for NFT Marketplace',
    description: 'We are expanding to Solana and need a Rust dev to port our EVM contracts.',
    postedBy: 'u4',
    budget: 4500,
    skills: ['Rust', 'Solana', 'Anchor'],
    deadline: '2026-06-15',
    savedBy: ['u3']
  },
  {
    id: 203,
    title: 'Technical Writer for Protocol Documentation',
    description: 'Need documentation for our new lending protocol. Must understand AMM mechanics deeply.',
    postedBy: 'u5',
    budget: 800,
    skills: ['Technical Writing', 'DeFi'],
    deadline: '2026-04-30',
    savedBy: ['u6']
  },
  {
    id: 204,
    title: 'Unreal Engine Environment Artist',
    description: 'We need a cyberpunk city environment block-out for our upcoming Metaverse project.',
    postedBy: 'u8',
    budget: 3000,
    skills: ['Unreal Engine', '3D Modeling'],
    deadline: '2026-05-20',
    savedBy: []
  },
  {
    id: 205,
    title: 'Marketing Manager for Token Launch',
    description: 'Seeking a CMO-level consultant to helm our upcoming TGE strategy across Twitter and Telegram.',
    postedBy: 'u4',
    budget: 2500,
    skills: ['Marketing', 'Strategy', 'Community'],
    deadline: '2026-04-25',
    savedBy: ['u6']
  }
];

export const COMMUNITY_POSTS = [
  {
    id: 301,
    authorId: 'u2',
    authorName: 'Sarah Jenkins',
    authorAvatar: 'SJ',
    content: 'Just landed my first 5-star review! Hard work pays off. Keep pushing everyone! 🚀',
    category: 'Showcase',
    likes: ['u1', 'u4', 'u6'],
    comments: [
      { id: 401, authorId: 'u1', authorName: 'Alex (You)', content: 'Huge congrats Sarah!', createdAt: '2026-04-10T11:05:00Z' }
    ],
    createdAt: '2026-04-10T11:00:00Z'
  },
  {
    id: 302,
    authorId: 'u5',
    authorName: 'Startup Hub',
    authorAvatar: 'SH',
    content: 'Looking for prompt engineers. Anyone specializing in LLMs here? We have a new project brewing.',
    category: 'Job',
    likes: ['u1'],
    comments: [],
    createdAt: '2026-04-11T08:30:00Z'
  },
  {
    id: 303,
    authorId: 'u3',
    authorName: 'Mike Tech',
    authorAvatar: 'MT',
    content: 'PSA: Always verify the origin sender in your cross-chain bridges. Found a critical bug in a major protocol today.',
    category: 'Discussion',
    likes: ['u1', 'u4', 'u5', 'u8'],
    comments: [],
    createdAt: '2026-04-09T18:15:00Z'
  },
  {
    id: 304,
    authorId: 'u6',
    authorName: 'Elena Rostova',
    authorAvatar: 'ER',
    content: 'Whats working best for Twitter growth right now? Memes or long-form threads?',
    category: 'Question',
    likes: ['u2'],
    comments: [
      { id: 402, authorId: 'u4', authorName: 'Tech Innovators Inc.', content: 'A mix of both. Hook them with a meme, retain them with a thread.', createdAt: '2026-04-08T10:12:00Z' }
    ],
    createdAt: '2026-04-08T09:00:00Z'
  },
  {
    id: 305,
    authorId: 'u7',
    authorName: 'David Chen',
    authorAvatar: 'DC',
    content: 'Thrilled to reveal the new branding for my coffee co. Huge shoutout to Sarah Jenkins for the amazing logo design.',
    category: 'Showcase',
    likes: ['u2', 'u5', 'u6'],
    comments: [],
    createdAt: '2026-04-05T14:45:00Z'
  },
  {
    id: 306,
    authorId: 'u1',
    authorName: 'Alex (You)',
    authorAvatar: 'AL',
    content: 'Just open-sourced my new React Tailwind component library. Feel free to use it in your next gig!',
    category: 'Showcase',
    likes: ['u3', 'u4', 'u7'],
    comments: [],
    createdAt: '2026-04-11T10:00:00Z'
  }
];

export const NOTIFICATIONS = [
  {
    id: 501,
    userId: 'u1',
    type: 'proposal_received',
    message: 'Tech Innovators Inc. sent a proposal for your gig "Full Stack React & Web3 Application"',
    isRead: false,
    createdAt: '2026-04-09T14:30:00Z',
    relatedId: 1
  },
  {
    id: 502,
    userId: 'u1',
    type: 'post_liked',
    message: 'Mike Tech liked your post',
    isRead: true,
    createdAt: '2026-04-11T10:15:00Z',
    relatedId: 306
  },
  {
    id: 503,
    userId: 'u1',
    type: 'connection_request',
    message: 'David Chen sent you a connection request',
    isRead: false,
    createdAt: '2026-04-10T16:20:00Z',
    relatedId: 'u7'
  }
];
