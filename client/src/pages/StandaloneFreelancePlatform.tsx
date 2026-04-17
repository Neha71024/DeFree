import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  UserCircle, 
  LogOut, 
  Plus, 
  Search, 
  Bookmark, 
  Bell, 
  MessageSquare, 
  Users, 
  CheckCircle, 
  XCircle, 
  Star,
  Award,
  ChevronRight,
  LayoutDashboard,
  Inbox,
  User,
  FileText,
  Menu,
  X,
  BarChart3,
  Activity,
  Mail,
  Edit2,
  MapPin,
  Clock,
  UserPlus,
  Handshake,
  Heart,
  MessageCircle,
  TrendingUp,
  MoreHorizontal
} from 'lucide-react';

import { USERS, GIGS, PROJECTS, COMMUNITY_POSTS, NOTIFICATIONS } from './mockData';

// Extract proposals from gigs for flat UI state management
const EXTRACTED_PROPOSALS = GIGS.flatMap(g => 
  (g.proposals || []).map(p => ({
     id: p.id,
     gigId: g.id,
     clientId: p.clientId,
     clientName: p.clientName,
     message: p.message,
     budgetOffer: p.budget,
     deliveryDays: p.deliveryDays || 7,
     isRead: p.isRead || false,
     status: p.status
  }))
);

// Format gigs to match existing UI
const FORMATTED_GIGS = GIGS.map(g => {
  const freelancer = USERS.find(u => u.id === g.freelancerId) || USERS[0];
  return {
    ...g,
    freelancerName: freelancer.name,
    price: g.budget
  };
});

// Format community posts to match existing UI
const FORMATTED_COMMUNITY = COMMUNITY_POSTS.map(post => {
  const author = USERS.find(u => u.id === post.authorId);
  return {
    ...post,
    author: post.authorName,
    role: author?.role || 'user'
  }
});

// -- MAIN COMPONENT --
export default function StandaloneFreelancePlatform() {
  const [role, setRole] = useState<string | null>(null); // 'freelancer' | 'client'
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [users, setUsers] = useState(USERS);
  const [projects] = useState(PROJECTS);
  const [gigs, setGigs] = useState(FORMATTED_GIGS);
  const [proposals, setProposals] = useState(EXTRACTED_PROPOSALS);
  const [savedGigs, setSavedGigs] = useState<number[]>([FORMATTED_GIGS[1]?.id]); 
  const [savedProjects, setSavedProjects] = useState<number[]>([201, 202, 203]);
  const [viewProjectId, setViewProjectId] = useState<number | null>(null);
  const [projectsList] = useState(PROJECTS);
  const [notifications, setNotifications] = useState<Array<{id: number, text: string, time: string, read: boolean, type?: string}>>(NOTIFICATIONS.map(n => ({
    id: n.id,
    text: n.message,
    time: "Just now",
    read: n.isRead,
    type: 'default'
  })));
  const [communityPosts, setCommunityPosts] = useState(FORMATTED_COMMUNITY);
  const [communityFilter, setCommunityFilter] = useState('All');
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Discussion');
  const [commentInputs, setCommentInputs] = useState<{[key: number]: string}>({});
  
  const currentUser = users.find(u => u.id === 'u1') || users[0];
  const [networkConnections, setNetworkConnections] = useState<string[]>(currentUser.connections || []);
  const [networkRequests, setNetworkRequests] = useState<string[]>(currentUser.connectionRequests || []);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [networkTab, setNetworkTab] = useState('connections');
  const [discoverSearch, setDiscoverSearch] = useState('');

  // Profile State
  const [profileTab, setProfileTab] = useState('overview');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState(currentUser);
  const [editProfileSkillInput, setEditProfileSkillInput] = useState('');

  // Freelancer specific state
  const [showCreateGig, setShowCreateGig] = useState(false);
  const [newGig, setNewGig] = useState({ title: '', description: '', price: '', category: '', deliveryDays: '' });
  const [newGigTags, setNewGigTags] = useState<string[]>([]);
  const [newGigTagInput, setNewGigTagInput] = useState('');
  const [viewProposalsGigId, setViewProposalsGigId] = useState<number | null>(null);
  const [proposalFilter, setProposalFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<{title: string, message: string} | null>(null);
  
  // App Shared State Additions
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('All');

  // Client specific state
  const [applyModalGig, setApplyModalGig] = useState<any>(null);
  const [proposalMsg, setProposalMsg] = useState('');
  const [proposalPrice, setProposalPrice] = useState('');
  const [proposalDays, setProposalDays] = useState('');
  const [viewFreelancerId, setViewFreelancerId] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState({ category: 'All', minBudget: '', maxBudget: '', maxDays: '' });

  useEffect(() => {
    if (role) {
      setActiveView('dashboard');
    }
  }, [role]);

  // -- HANDLERS --
  const handleCreateGig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGig.title || !newGig.description || !newGig.price || !newGig.category || !newGig.deliveryDays || newGigTags.length === 0) {
      setToastMessage({ title: 'Error', message: 'All fields including tags are required.'});
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const gig = {
      id: Date.now(),
      freelancerId: 'u1',
      freelancerName: 'Alex (You)',
      ...newGig,
      price: Number(newGig.price) as number,
      budget: Number(newGig.price) as number,
      deliveryDays: Number(newGig.deliveryDays),
      createdAt: new Date().toISOString(),
      proposals: [],
      tags: newGigTags,
      status: 'active'
    };
    setGigs([gig, ...gigs]);
    setShowCreateGig(false);
    setNewGig({ title: '', description: '', price: '', category: '', deliveryDays: '' });
    setNewGigTags([]);
    setToastMessage({ title: 'Success', message: 'Gig created successfully!'});
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGigStatusToggle = (id: number) => {
    setGigs(gigs.map(g => g.id === id ? { ...g, status: g.status === 'active' ? 'paused' : 'active' } : g));
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (proposalMsg.length < 100) {
      setToastMessage({ title: 'Error', message: 'Cover letter must be at least 100 characters.'});
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const prop = {
      id: Date.now(),
      gigId: applyModalGig.id,
      clientId: 'u4', // Tech Innovators Inc. (assume client is u4)
      clientName: 'Tech Innovators Inc.',
      message: proposalMsg,
      budgetOffer: Number(proposalPrice) || applyModalGig.budget || applyModalGig.price as number,
      deliveryDays: Number(proposalDays) || 7,
      isRead: false,
      status: 'pending'
    };
    setProposals([prop, ...proposals]);
    setNotifications([{ id: Date.now(), type: 'proposal_received', text: `New proposal received for [${applyModalGig.title}]`, time: 'Just now', read: false }, ...notifications]);
    setApplyModalGig(null);
    setProposalMsg('');
    setProposalPrice('');
    setProposalDays('');
    setToastMessage({ title: 'Success', message: 'Proposal sent successfully!'});
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleProposalAction = (proposalId: number, status: string, popGigId: number, gigTitle?: string) => {
    setProposals(proposals.map(p => {
       if (p.id === proposalId) return { ...p, status };
       if (status === 'accepted' && p.gigId === popGigId) return { ...p, status: 'rejected' };
       return p;
    }));
    const type = status === 'accepted' ? 'proposal_accepted' : 'proposal_rejected';
    const text = status === 'accepted' ? `Your proposal for [${gigTitle}] was accepted!` : `Your proposal for [${gigTitle}] was not accepted`;
    setNotifications([{ id: Date.now(), type, text, time: 'Just now', read: false }, ...notifications]);
  };

  const toggleSaveGig = (gigId: number) => {
    setSavedGigs(prev => prev.includes(gigId) ? prev.filter(id => id !== gigId) : [...prev, gigId]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
    setShowNotificationDropdown(false);
  };

  const getNotificationDetails = (type: string) => {
    switch(type) {
      case 'proposal_received': return { icon: <Mail size={16}/>, color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'proposal_accepted': return { icon: <CheckCircle size={16}/>, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'proposal_rejected': return { icon: <XCircle size={16}/>, color: 'text-red-400', bg: 'bg-red-500/10' };
      case 'connection_request': return { icon: <UserPlus size={16}/>, color: 'text-purple-400', bg: 'bg-purple-500/10' };
      case 'connection_accepted': return { icon: <Handshake size={16}/>, color: 'text-teal-400', bg: 'bg-teal-500/10' };
      case 'post_liked': return { icon: <Heart size={16}/>, color: 'text-pink-400', bg: 'bg-pink-500/10' };
      default: return { icon: <Bell size={16}/>, color: 'text-slate-400', bg: 'bg-slate-500/10' };
    }
  };

  // Nav Items Definitions
  const freelancerNav = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'my_gigs', label: 'My Gigs', icon: <Briefcase size={18} /> },
    { id: 'applications_received', label: 'Applications Received', icon: <Inbox size={18} /> },
    { id: 'community', label: 'Community', icon: <MessageSquare size={18} /> },
    { id: 'network', label: 'Network / Connections', icon: <Users size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> }
  ];

  const clientNav = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'browse_gigs', label: 'Browse Gigs', icon: <Search size={18} /> },
    { id: 'my_proposals', label: 'My Proposals', icon: <FileText size={18} /> },
    { id: 'saved_projects', label: 'Saved Projects', icon: <Bookmark size={18} /> },
    { id: 'community', label: 'Community', icon: <MessageSquare size={18} /> },
    { id: 'network', label: 'Network / Connections', icon: <Users size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> }
  ];

  const navItems = role === 'freelancer' ? freelancerNav : clientNav;
  const unreadCount = notifications.filter(n => !n.read).length;

  const navigateTo = (id: string) => {
    setActiveView(id);
    setIsSidebarOpen(false);
  };

  // -- INITIAL SPLASH SCREEN --
  if (!role) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4 font-sans bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-slate-950 to-slate-950">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]"></div>
            <div className="absolute bottom-[0%] -right-[10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[100px]"></div>
        </div>
        <div className="z-10 text-center max-w-xl">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/20 rounded-2xl mb-8 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)] backdrop-blur-md">
            <Briefcase className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            FreelanceHub
          </h1>
          <p className="text-xl text-slate-400 mb-12">
            The decentralized future of work. Choose how you want to participate in the ecosystem.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 w-full">
            <button 
              onClick={() => setRole('freelancer')}
              className="group relative p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] text-left flex flex-col gap-4 backdrop-blur-sm overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              <UserCircle className="w-10 h-10 text-blue-400" />
              <div>
                <h3 className="text-2xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">I am a Freelancer</h3>
                <p className="text-slate-400 mt-2">Create service gigs, showcase my skills, and receive proposals from clients.</p>
              </div>
            </button>

            <button 
              onClick={() => setRole('client')}
              className="group relative p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-teal-500/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(20,184,166,0.2)] text-left flex flex-col gap-4 backdrop-blur-sm overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
              <Users className="w-10 h-10 text-teal-400" />
              <div>
                <h3 className="text-2xl font-bold text-slate-100 group-hover:text-teal-400 transition-colors">I am a Client</h3>
                <p className="text-slate-400 mt-2">Browse expert gigs and send proposals to hire top talent.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING SHARED & SPECIFIC VIEWS ---

  const renderDashboard = () => {
    if (role === 'freelancer') {
      const myGigs = gigs.filter(g => g.freelancerId === 'u1' || g.freelancerId === 'me_freelancer');
      const receivedProps = proposals.filter(p => myGigs.some(g => g.id === p.gigId));
      const acceptedProps = receivedProps.filter(p => p.status === 'accepted');
      
      const maxProposals = Math.max(...myGigs.map(g => proposals.filter(p => p.gigId === g.id).length), 1);
      
      const recentProposals = [...receivedProps].sort((a,b) => b.id - a.id).slice(0, 5);

      return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in pb-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white">Freelancer Dashboard</h2>
              <p className="text-slate-400 mt-1">Here's the latest on your business.</p>
            </div>
            <div className="flex flex-wrap gap-3">
               <button onClick={() => setShowCreateGig(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all">Create New Gig</button>
               <button onClick={() => navigateTo('applications')} className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-bold transition-all">View All Proposals</button>
               <button onClick={() => navigateTo('profile')} className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-bold transition-all">Edit Profile</button>
            </div>
          </div>
          
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3 mb-2 text-slate-400 font-medium"><Briefcase size={18}/> Total Gigs Created</div>
              <p className="text-3xl font-bold text-slate-100">{myGigs.length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3 mb-2 text-slate-400 font-medium"><Inbox size={18}/> Proposals Received</div>
              <p className="text-3xl font-bold text-slate-100">{receivedProps.length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3 mb-2 text-emerald-400 font-medium"><CheckCircle size={18}/> Accepted Proposals</div>
              <p className="text-3xl font-bold text-emerald-400">{acceptedProps.length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3 mb-2 text-slate-400 font-medium"><UserCircle size={18}/> Profile Views</div>
              <p className="text-3xl font-bold text-blue-400">2,450</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Horizontal Bar Chart (Proposals per Gig) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-200 mb-6">Proposals per Gig</h3>
              <div className="space-y-4">
                {myGigs.map(g => {
                   const count = proposals.filter(p => p.gigId === g.id).length;
                   const pct = (count / maxProposals) * 100;
                   return (
                     <div key={g.id} className="relative">
                        <div className="flex justify-between text-xs text-slate-400 mb-1 font-semibold">
                           <span className="truncate w-3/4">{g.title}</span>
                           <span>{count}</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                           <div className="bg-blue-500 h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                        </div>
                     </div>
                   );
                })}
              </div>
            </div>

            {/* Line Chart SVG (Weekly Activity) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-200 mb-6">Weekly Activity</h3>
              <div className="h-48 relative border-b border-slate-800 flex items-end">
                 <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <polyline fill="none" stroke="rgba(37,99,235,0.5)" strokeWidth="2" points="5,80 20,60 35,90 50,40 65,50 80,20 95,30" />
                    {[ {x:5,y:80}, {x:20,y:60}, {x:35,y:90}, {x:50,y:40}, {x:65,y:50}, {x:80,y:20}, {x:95,y:30} ].map((pt, i) => (
                       <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#3b82f6" />
                    ))}
                 </svg>
              </div>
              <div className="flex justify-between text-xs text-slate-500 pt-2 font-semibold px-2">
                 <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </div>

          {/* Recent Proposals List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-200 mb-6">Recent Proposals</h3>
            <div className="space-y-4">
               {recentProposals.length === 0 ? <p className="text-slate-500 text-sm">No proposals received yet.</p> : recentProposals.map(p => {
                  const gig = myGigs.find(g => g.id === p.gigId);
                  return (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                       <div>
                          <p className="font-bold text-slate-200">{p.clientName}</p>
                          <p className="text-xs text-slate-500">Applied to: <span className="text-blue-400 font-semibold">{gig?.title}</span></p>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-500 font-medium">Just now</span>
                          <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${p.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : p.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {p.status}
                          </span>
                       </div>
                    </div>
                  );
               })}
            </div>
          </div>
        </div>
      );
    } else {
      const myProposals = proposals.filter(p => p.clientId === 'me_client' || p.clientId === 'u4');
      const acceptedProps = myProposals.filter(p => p.status === 'accepted');
      const pendingProps = myProposals.filter(p => p.status === 'pending');
      
      const totalProps = myProposals.length || 1; // avoid div by 0
      
      const dashGigs = gigs.slice(0, 3);

      return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in pb-10">
          <div>
            <h2 className="text-3xl font-bold text-white">Client Dashboard</h2>
            <p className="text-slate-400 mt-1">Manage your hiring pipeline.</p>
          </div>
          
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
               <div className="flex items-center gap-3 mb-2 text-slate-400 font-medium"><Inbox size={18}/> Proposals Sent</div>
               <p className="text-3xl font-bold text-slate-100">{myProposals.length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
               <div className="flex items-center gap-3 mb-2 text-emerald-400 font-medium"><CheckCircle size={18}/> Proposals Accepted</div>
               <p className="text-3xl font-bold text-emerald-400">{acceptedProps.length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
               <div className="flex items-center gap-3 mb-2 text-teal-400 font-medium"><Bookmark size={18}/> Saved Projects</div>
               <p className="text-3xl font-bold text-teal-400">{savedGigs.length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
               <div className="flex items-center gap-3 mb-2 text-slate-400 font-medium"><Users size={18}/> Active Connections</div>
               <p className="text-3xl font-bold text-slate-100">{networkConnections.length || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Donut Chart */}
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-1 flex flex-col items-center">
                <h3 className="text-lg font-bold text-slate-200 mb-6 w-full">Proposal Status</h3>
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                     <circle cx="50" cy="50" r="40" fill="none" stroke="#0f172a" strokeWidth="20" />
                     {myProposals.length > 0 && (
                       <>
                         <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray={`${100} 100`} />
                         <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray={`${(pendingProps.length/totalProps)*100 + (acceptedProps.length/totalProps)*100} 100`} />
                         <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray={`${(acceptedProps.length/totalProps)*100} 100`} />
                       </>
                     )}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                     <span className="text-3xl font-bold text-white">{myProposals.length}</span>
                     <span className="text-xs text-slate-500 font-semibold uppercase">Total</span>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-3 w-full gap-2 text-center text-xs font-bold uppercase">
                   <div className="text-emerald-400 flex flex-col items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>Accept</div>
                   <div className="text-amber-400 flex flex-col items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500"></div>Pending</div>
                   <div className="text-red-400 flex flex-col items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div>Reject</div>
                </div>
             </div>

             {/* Recent Activity Feed */}
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-200 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                   {notifications.slice(0, 5).map(n => (
                     <div key={n.id} className="flex items-start gap-4 p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-teal-500/10 flex justify-center items-center text-teal-400 shrink-0">
                           <Bell size={18} />
                        </div>
                        <div>
                           <p className="text-slate-200 font-medium text-sm leading-snug">{n.text}</p>
                           <p className="text-xs text-slate-500 mt-1 font-semibold">{n.time}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Recommended Gigs */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-xl font-bold text-slate-100">Recommended Gigs</h3>
              <button onClick={() => navigateTo('browse')} className="text-teal-400 hover:text-teal-300 text-sm font-bold flex items-center gap-1 transition-colors">View All <ChevronRight size={16}/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashGigs.map(gig => {
                const freelancer = users.find(u => u.id === gig.freelancerId) || users[0];
                return (
                  <div key={gig.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col group hover:border-teal-500/50 transition-all cursor-pointer" onClick={() => navigateTo('browse')}>
                     <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex justify-center items-center font-bold text-xs text-white">{freelancer.avatar}</div>
                           <div>
                              <p className="text-xs text-slate-400 font-medium">{freelancer.name}</p>
                              <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase">{gig.category}</span>
                           </div>
                        </div>
                        <span className="text-lg font-bold text-emerald-400">${gig.budget || gig.price}</span>
                     </div>
                     <h3 className="text-lg font-bold text-slate-200 mb-2 leading-snug group-hover:text-teal-400 transition-colors">{gig.title}</h3>
                     <p className="text-slate-400 text-sm line-clamp-2 mb-4">{gig.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
  };

  const renderFreelancerGigs = () => {
    const myGigs = gigs.filter(g => g.freelancerId === 'u1' || g.freelancerId === 'me_freelancer');
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-100">My Gigs</h2>
          <button onClick={() => setShowCreateGig(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Plus size={16} /> Create Gig
          </button>
        </div>
        
        {myGigs.length === 0 ? (
           <div className="bg-slate-900 border border-slate-800 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                 <Briefcase size={40} className="text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">No gigs yet</h3>
              <p className="text-slate-400 max-w-sm mb-6 font-medium">Start offering your services and accept proposals from top clients globally.</p>
              <button onClick={() => setShowCreateGig(true)} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2"><Plus size={18}/> Create Your First Gig</button>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myGigs.map(gig => {
              const gigProposals = proposals.filter(p => p.gigId === gig.id);
              const unreadCount = gigProposals.filter(p => !p.isRead && p.status === 'pending').length;
              return (
                <div key={gig.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative flex flex-col group hover:border-slate-700 transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-200">{gig.title}</h3>
                    <span className="text-lg font-bold text-emerald-400">${gig.budget || gig.price}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-4 text-xs font-semibold">
                    <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded">{gig.category}</span>
                    <span className="text-slate-400">{gig.deliveryDays} Days Delivery</span>
                    <span className={`px-2 py-1 rounded ${gig.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {gig.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">{gig.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {gig.tags.map(t => <span key={t} className="bg-blue-500/10 text-blue-300 text-xs px-2 py-0.5 rounded border border-blue-500/20">{t}</span>)}
                  </div>
                  
                  <div className="mt-auto bg-slate-950 rounded-xl border border-slate-800 p-4 mb-4 relative overflow-hidden flex items-center justify-between">
                     {unreadCount > 0 && <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>}
                     <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 rounded-full text-white font-bold text-sm shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                       {gigProposals.length} Proposals Received
                     </span>
                     {unreadCount > 0 && <span className="text-xs font-bold text-orange-400">{unreadCount} Unread</span>}
                  </div>

                  <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
                    <button onClick={() => setViewProposalsGigId(gig.id)} className="flex-1 py-2 bg-blue-600/10 text-blue-400 border border-blue-600/20 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-semibold transition">
                       View Proposals
                    </button>
                    <button className="px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg text-sm font-semibold transition">
                       Edit
                    </button>
                    <button onClick={() => handleGigStatusToggle(gig.id)} className="px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg text-sm font-semibold transition">
                       {gig.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderApplicationsReceived = () => {
    const receivedProps = proposals.filter(p => gigs.some(g => g.id === p.gigId && g.freelancerId === 'me_freelancer'));
    return (
      <div className="space-y-6 animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-100">Applications Received</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {receivedProps.length === 0 ? (
           <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                 <Inbox size={40} className="text-indigo-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">No applications yet</h3>
              <p className="text-slate-400 max-w-sm mb-6 font-medium">When clients apply to your active gigs, you'll see them here.</p>
              <button onClick={() => setActiveView('my_gigs')} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">Manage Active Gigs</button>
           </div>
          ) : (
             <div className="divide-y divide-slate-800/50">
               {receivedProps.map(p => {
                 const gig = gigs.find(g => g.id === p.gigId);
                 return (
                   <div key={p.id} className="p-6 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <span className="font-semibold text-slate-200">{p.clientName}</span>
                         <span className="text-slate-500 text-sm">applied to</span>
                         <span className="text-blue-400 font-medium">{gig?.title}</span>
                       </div>
                       <p className="text-slate-400 text-sm italic">"{p.message}"</p>
                       <div className="mt-2 flex items-center gap-4">
                         <span className="text-emerald-400 font-semibold text-sm">Offer: ${p.budgetOffer}</span>
                         <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${p.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : p.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                           {p.status}
                         </span>
                       </div>
                     </div>
                     {p.status === 'pending' && (
                       <div className="flex gap-2">
                         <button onClick={() => handleProposalAction(p.id, 'accepted', gig!.id, gig?.title)} className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors text-sm font-medium flex items-center gap-1">
                           <CheckCircle size={14} /> Accept
                         </button>
                         <button onClick={() => handleProposalAction(p.id, 'rejected', gig!.id, gig?.title)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors text-sm font-medium flex items-center gap-1">
                           <XCircle size={14} /> Reject
                         </button>
                       </div>
                     )}
                   </div>
                 );
               })}
             </div>
          )}
        </div>
      </div>
    );
  };

  const renderClientBrowse = () => {
    let filteredGigs = gigs;
    if (clientFilter.category && clientFilter.category !== 'All') filteredGigs = filteredGigs.filter(g => g.category === clientFilter.category);
    if (clientFilter.minBudget) filteredGigs = filteredGigs.filter(g => (g.budget || g.price) >= Number(clientFilter.minBudget));
    if (clientFilter.maxBudget) filteredGigs = filteredGigs.filter(g => (g.budget || g.price) <= Number(clientFilter.maxBudget));
    if (clientFilter.maxDays) filteredGigs = filteredGigs.filter(g => g.deliveryDays <= Number(clientFilter.maxDays));

    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px]"></div>
          <h2 className="text-3xl font-bold text-slate-100 mb-2 relative z-10">Discover Services</h2>
          <p className="text-slate-400 mb-6 relative z-10">Find professional freelancers for your project.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
            <div className="relative md:col-span-1">
              <select value={clientFilter.category} onChange={e => setClientFilter({...clientFilter, category: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-teal-500 font-medium appearance-none">
                <option value="All">All Categories</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Writing">Writing</option>
              </select>
            </div>
            <div>
              <input type="number" placeholder="Min Budget $" value={clientFilter.minBudget} onChange={e => setClientFilter({...clientFilter, minBudget: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-teal-500 font-medium" />
            </div>
            <div>
              <input type="number" placeholder="Max Budget $" value={clientFilter.maxBudget} onChange={e => setClientFilter({...clientFilter, maxBudget: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-teal-500 font-medium" />
            </div>
            <div>
              <input type="number" placeholder="Max Days delivery" value={clientFilter.maxDays} onChange={e => setClientFilter({...clientFilter, maxDays: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-teal-500 font-medium" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredGigs.map(gig => {
            const hasSentProposal = proposals.some(p => p.gigId === gig.id && p.clientId === 'u4');
            const freelancer = users.find(u => u.id === gig.freelancerId) || users[0];
            const gigPropsCount = proposals.filter(p => p.gigId === gig.id).length;
            
            return (
              <div key={gig.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-teal-500/50 hover:shadow-[0_4px_30px_rgb(20,184,166,0.1)] transition-all flex flex-col group">
                <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                  <div className="absolute top-3 right-3">
                    <button 
                      onClick={() => toggleSaveGig(gig.id)} 
                      className={`p-2 rounded-full bg-slate-950/50 backdrop-blur-md transition-colors ${savedGigs.includes(gig.id) ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <Bookmark size={18} fill={savedGigs.includes(gig.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <button onClick={() => setViewFreelancerId(freelancer.id)} className="absolute -bottom-5 left-5 w-12 h-12 bg-slate-800 rounded-full border-[3px] border-slate-900 flex items-center justify-center font-bold text-sm text-white hover:ring-2 hover:ring-teal-500 transition-all z-10">
                    {freelancer.avatar}
                  </button>
                </div>
                <div className="p-5 pt-8 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-1">
                     <p onClick={() => setViewFreelancerId(freelancer.id)} className="text-xs text-slate-400 font-medium hover:text-teal-400 focus:outline-none cursor-pointer transition-colors">{gig.freelancerName}</p>
                     <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase">{gig.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-200 mb-2 leading-snug group-hover:text-teal-400 transition-colors">{gig.title}</h3>
                  <div className="flex items-center gap-3 mb-3 text-xs font-semibold text-slate-400">
                     <span>${gig.budget || gig.price} Budget</span>
                     <span>•</span>
                     <span>{gig.deliveryDays} Days</span>
                     <span>•</span>
                     <span className="text-blue-400">{gigPropsCount} Proposals</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{gig.description}</p>
                  
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {gig.tags.map(t => <span key={t} className="bg-teal-500/10 text-teal-300 text-xs px-2 py-0.5 rounded border border-teal-500/20">{t}</span>)}
                    </div>
                    <div className="flex items-center mt-4">
                      {hasSentProposal ? (
                         <div className="w-full text-center py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-semibold text-sm">
                            Proposal Sent
                         </div>
                      ) : (
                         <button 
                           onClick={() => {
                             setApplyModalGig(gig);
                             setProposalPrice((gig.budget || gig.price).toString());
                             setProposalDays(gig.deliveryDays?.toString() || '7');
                             setProposalMsg('');
                           }}
                           className="w-full py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all text-sm shadow-[0_4px_20px_rgba(20,184,166,0.3)]"
                         >
                           Send Proposal
                         </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderClientProposals = () => {
    const myProposals = proposals.filter(p => p.clientId === 'me_client');
    return (
      <div className="space-y-6 animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-100">My Proposals</h2>
        {myProposals.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-slate-400">You haven't sent any proposals to gigs yet.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
             <div className="divide-y divide-slate-800/50">
                {myProposals.map(p => {
                  const gig = gigs.find(g => g.id === p.gigId);
                  return (
                    <div key={p.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div>
                          <p className="font-bold text-slate-200">{gig?.title}</p>
                          <p className="text-sm text-slate-500 mt-1">Proposed to {gig?.freelancerName}</p>
                          <p className="text-sm text-slate-400 italic mt-2 line-clamp-1 border-l-2 border-slate-700 pl-2">"{p.message}"</p>
                       </div>
                       <div className="flex items-center gap-6">
                           <div className="text-right">
                              <p className="text-xs text-slate-500 uppercase font-semibold">Offer</p>
                              <p className="font-bold text-emerald-400">${p.budgetOffer}</p>
                           </div>
                           <span className={`px-3 py-1 rounded border text-xs font-bold uppercase ${p.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : p.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                             {p.status}
                           </span>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        )}
      </div>
    );
  };

  const handleAcceptRequest = (userId: string, userName: string) => {
    setNetworkConnections([...networkConnections, userId]);
    setNetworkRequests(networkRequests.filter(id => id !== userId));
    setNotifications([{ id: Date.now(), type: 'connection_accepted', text: `${userName} accepted your connection request!`, time: 'Just now', read: false }, ...notifications]);
    setToastMessage({ title: 'Success', message: `Connected with ${userName}` });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeclineRequest = (userId: string) => {
    setNetworkRequests(networkRequests.filter(id => id !== userId));
  };

  const handleSendRequest = (userId: string) => {
    setSentRequests([...sentRequests, userId]);
  };

  const handleRemoveConnection = (userId: string) => {
    setNetworkConnections(networkConnections.filter(id => id !== userId));
  };

  const handleLikePost = (postId: number) => {
    setCommunityPosts(communityPosts.map(p => {
       if (p.id === postId) {
         const hasLiked = p.likes.includes('u1');
         const newLikes = hasLiked ? p.likes.filter((id: string) => id !== 'u1') : [...p.likes, 'u1'];
         return { ...p, likes: newLikes };
       }
       return p;
    }));
  };

  const handleCommentSubmit = (postId: number) => {
    const text = commentInputs[postId];
    if (!text || text.trim() === '') return;
    setCommunityPosts(communityPosts.map(p => {
       if (p.id === postId) {
         const newComment = { id: Date.now(), authorId: 'u1', authorName: 'Alex (You)', content: text, createdAt: new Date().toISOString() };
         return { ...p, comments: [...(p.comments || []), newComment] };
       }
       return p;
    }));
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  const handleCreatePost = () => {
    if (newPostContent.length < 20) {
      setToastMessage({ title: 'Error', message: 'Post content must be at least 20 characters.' });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const newPost = {
      id: Date.now(),
      authorId: 'u1',
      authorName: 'Alex (You)',
      authorAvatar: 'AL',
      author: 'Alex (You)',
      content: newPostContent,
      category: newPostCategory,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
      role: role || 'freelancer'
    };
    setCommunityPosts([newPost, ...communityPosts]);
    setShowCreatePost(false);
    setNewPostContent('');
    setToastMessage({ title: 'Success', message: 'Post created successfully!' });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const renderSharedViews = () => {
    switch(activeView) {
      case 'saved_projects':
        const savedProjsList = projectsList.filter(p => savedProjects.includes(p.id));
        return (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-100">Saved Projects</h2>
                <span className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-sm font-bold text-slate-300">{savedProjsList.length} Saved</span>
             </div>
             
             {savedProjsList.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-lg">
                   <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                      <Bookmark size={40} className="text-amber-500" />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-100 mb-2">No saved projects yet</h3>
                   <p className="text-slate-400 max-w-sm mb-6 font-medium">Bookmarks help you keep track of interesting opportunities. Browse the marketplace and start saving!</p>
                   <button onClick={() => { setActiveView('browse_gigs'); setRole('client'); }} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all">Browse Gigs</button>
                </div>
             ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {savedProjsList.map(proj => {
                      const client = users.find(u => u.id === proj.postedBy);
                      return (
                        <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700 transition-all group relative">
                           <button onClick={() => setSavedProjects(savedProjects.filter(id => id !== proj.id))} className="absolute top-6 right-6 text-amber-500 hover:text-amber-400 transition-colors" title="Unsave">
                              <Bookmark size={24} className="fill-amber-500 hover:opacity-80 transition-all drop-shadow-md" />
                           </button>
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-slate-800 border focus-within:border-indigo-400 group-hover:border-indigo-500 transition-colors flex items-center justify-center text-xs font-bold text-slate-200">
                                 {client?.avatar || 'CL'}
                              </div>
                              <div>
                                 <p className="font-bold text-slate-100">{client?.name || 'Unknown Client'}</p>
                                 <p className="text-[10px] uppercase font-bold text-slate-500">Posted {proj.deadline}</p>
                              </div>
                           </div>
                           <h3 className="text-lg font-bold text-slate-100 mb-2 pr-8">{proj.title}</h3>
                           <p className="text-sm text-slate-400 line-clamp-2 mb-6">{proj.description}</p>
                           
                           <div className="flex flex-wrap gap-2 mb-6">
                              {proj.skills.map((skill: string) => (
                                <span key={skill} className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-indigo-400 uppercase tracking-wider">{skill}</span>
                              ))}
                           </div>
                           
                           <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-auto">
                              <div>
                                 <p className="text-xs font-bold text-slate-500 uppercase">Budget</p>
                                 <p className="font-bold text-emerald-400">${proj.budget}</p>
                              </div>
                              <button onClick={() => setViewProjectId(proj.id)} className="px-5 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-bold rounded-xl text-sm transition-all border border-indigo-500/20">View Details</button>
                           </div>
                        </div>
                      )
                   })}
                </div>
             )}
          </div>
        );
      case 'community':
        const filteredPosts = communityPosts.filter(p => communityFilter === 'All' || p.category === communityFilter);
        return (
          <div className="animate-in fade-in max-w-7xl">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-3xl font-bold text-slate-100">Community Flow</h2>
               <button onClick={() => setShowCreatePost(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all flex items-center gap-2"><Plus size={16}/> New Post</button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left Column - Post Feed */}
               <div className="lg:col-span-2 space-y-6">
                  {/* Filters */}
                  <div className="flex gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
                    {['All', 'Discussion', 'Showcase', 'Question', 'Job'].map(f => (
                      <button key={f} onClick={() => setCommunityFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${communityFilter === f ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                  
                  {/* Feed */}
                  <div className="space-y-6">
                    {filteredPosts.length === 0 ? <p className="text-slate-500 bg-slate-900 p-8 rounded-2xl text-center border border-slate-800">No posts in this category.</p> : filteredPosts.map(post => {
                      const isExpanded = expandedComments.includes(post.id);
                      const hasLiked = post.likes.includes('u1');
                      return (
                        <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
                           <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-sm text-white">
                                    {post.authorName.substring(0,2).toUpperCase()}
                                 </div>
                                 <div>
                                    <p className="font-bold text-slate-200">{post.authorName}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                       <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{post.role}</span>
                                       <span className="text-xs text-slate-500">2h ago</span>
                                    </div>
                                 </div>
                              </div>
                              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2 py-1 rounded font-bold uppercase">{post.category}</span>
                           </div>
                           <p className="text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>
                           
                           <div className="flex gap-6 border-t border-slate-800 pt-4">
                              <button onClick={() => handleLikePost(post.id)} className={`flex items-center gap-2 text-sm font-semibold transition-colors ${hasLiked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-400'}`}>
                                 <Heart size={18} className={hasLiked ? "fill-pink-500" : ""} /> {post.likes.length} Likes
                              </button>
                              <button onClick={() => setExpandedComments(isExpanded ? expandedComments.filter(id => id !== post.id) : [...expandedComments, post.id])} className={`flex items-center gap-2 text-sm font-semibold transition-colors ${isExpanded ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}>
                                 <MessageCircle size={18} /> {post.comments.length} Comments
                              </button>
                           </div>
                           
                           {/* Inline Comments */}
                           {isExpanded && (
                             <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-4">
                                {post.comments.map((comment: any) => (
                                  <div key={comment.id} className="flex gap-3">
                                     <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">{comment.authorName.substring(0,2).toUpperCase()}</div>
                                     <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl rounded-tl-none p-3 flex-1 text-sm">
                                        <div className="flex justify-between items-end mb-1">
                                           <span className="font-bold text-slate-300">{comment.authorName}</span>
                                           <span className="text-[10px] text-slate-500">Just now</span>
                                        </div>
                                        <p className="text-slate-400">{comment.content}</p>
                                     </div>
                                  </div>
                                ))}
                                <div className="flex gap-3 mt-2">
                                   <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">AL</div>
                                   <div className="flex-1 flex gap-2">
                                     <input 
                                       type="text" 
                                       placeholder="Add a comment..." 
                                       value={commentInputs[post.id] || ''}
                                       onChange={(e) => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
                                       className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
                                       onKeyDown={(e) => { if(e.key==='Enter') handleCommentSubmit(post.id); }}
                                     />
                                     <button onClick={() => handleCommentSubmit(post.id)} className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-xl text-sm font-bold transition-all">Post</button>
                                   </div>
                                </div>
                             </div>
                           )}
                        </div>
                      )
                    })}
                  </div>
               </div>

               {/* Right Column - Sidebar Widgets */}
               <div className="lg:col-span-1 space-y-6">
                  {/* Your Stats */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                     <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2"><User size={18}/> Your Impact</h3>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-400">Posts Created</span>
                           <span className="font-bold text-slate-200">{communityPosts.filter(p => p.authorId === 'u1').length}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-400">Comments Made</span>
                           <span className="font-bold text-slate-200">12</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-400">Total Likes Received</span>
                           <span className="font-bold text-pink-400">{communityPosts.reduce((acc, p) => p.authorId === 'u1' ? acc + p.likes.length : acc, 0) + 224}</span>
                        </div>
                     </div>
                  </div>
                  
                  {/* Trending Topics */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                     <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-indigo-400"/> Trending Topics</h3>
                     <div className="space-y-3">
                        {['#Web3Development', '#DesignSystem', '#SolidityAudits', '#Tokenomics', '#RemoteWork'].map((tag, i) => (
                           <div key={i} className="flex justify-between items-center cursor-pointer group">
                              <span className="text-sm font-semibold text-slate-300 group-hover:text-indigo-400 transition-colors">{tag}</span>
                              <span className="text-xs text-slate-500">{120 - i*15} posts</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Active Members */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                     <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2"><Users size={18}/> Active Members</h3>
                     <div className="grid grid-cols-2 gap-3">
                        {users.slice(1,7).map(u => (
                          <div key={u.id} className="flex items-center gap-2 cursor-pointer group">
                             <div className="w-8 h-8 rounded-full bg-slate-800 border focus-within:border-indigo-400 group-hover:border-indigo-500 transition-colors flex items-center justify-center text-[10px] font-bold text-slate-300">
                                {u.avatar}
                             </div>
                             <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 truncate">{u.name.split(' ')[0]}</span>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        );
      case 'network':
        return (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in">
             <div className="flex justify-between items-end mb-6">
               <h2 className="text-3xl font-bold text-slate-100">Network</h2>
               {networkTab === 'discover' && (
                 <div className="relative w-64 md:w-80">
                   <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
                   <input type="text" placeholder="Search skills, names..." value={discoverSearch} onChange={e => setDiscoverSearch(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm" />
                 </div>
               )}
             </div>

             <div className="flex gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
               {[
                  { id: 'connections', label: 'My Connections', count: networkConnections.length },
                  { id: 'requests', label: 'Requests', count: networkRequests.length },
                  { id: 'discover', label: 'Discover', count: 0 }
               ].map(tab => (
                 <button key={tab.id} onClick={() => setNetworkTab(tab.id)} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${networkTab === tab.id ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>
                   {tab.label} {tab.count > 0 && <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${networkTab === tab.id ? 'bg-white text-indigo-600' : 'bg-slate-800 text-slate-300'}`}>{tab.count}</span>}
                 </button>
               ))}
             </div>

             {/* Tab Contents */}
             {networkTab === 'connections' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {networkConnections.length === 0 ? <p className="col-span-full text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center font-medium">You have no connections yet.</p> : networkConnections.map(cId => {
                    const u = users.find(user => user.id === cId);
                    if (!u) return null;
                    return (
                      <div key={cId} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center shadow-xl hover:border-slate-700 transition-all group">
                         <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-4 text-xl font-bold text-slate-200">
                           {u.avatar}
                         </div>
                         <h3 className="font-bold text-slate-100 text-lg">{u.name}</h3>
                         <p className="text-indigo-400 text-sm font-semibold mb-2">{u.title}</p>
                         <div className="flex items-center gap-1 text-xs text-slate-500 mb-6 font-medium">
                            <Users size={12} /> {Math.floor(Math.random() * 8) + 1} mutual connections
                         </div>
                         <div className="flex gap-3 w-full mt-auto">
                            <button onClick={() => { setToastMessage({ title: 'Success', message: 'Messaging coming soon!' }); setTimeout(() => setToastMessage(null), 3000); }} className="flex-1 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-bold rounded-xl text-sm transition-colors border border-indigo-500/20">Message</button>
                            <button onClick={() => handleRemoveConnection(cId)} className="p-2 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 rounded-xl transition-colors" title="Remove Connection"><X size={18}/></button>
                         </div>
                      </div>
                    )
                  })}
                </div>
             )}

             {networkTab === 'requests' && (
                <div className="space-y-4">
                  {networkRequests.length === 0 ? <p className="text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center font-medium">No pending requests.</p> : networkRequests.map(cId => {
                    const u = users.find(user => user.id === cId);
                    if (!u) return null;
                    return (
                      <div key={cId} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg hover:border-slate-700 transition">
                         <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row w-full md:w-auto">
                           <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-lg font-bold text-slate-200 shrink-0">
                             {u.avatar}
                           </div>
                           <div className="flex flex-col items-center md:items-start">
                             <h3 className="font-bold text-slate-100 text-lg">{u.name}</h3>
                             <p className="text-slate-400 text-sm">{u.title}</p>
                             <div className="flex justify-center md:justify-start items-center gap-1 text-xs text-slate-500 mt-1 font-medium">
                               <Users size={12} /> {Math.floor(Math.random() * 5)} mutual
                             </div>
                           </div>
                         </div>
                         <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                            <button onClick={() => handleAcceptRequest(cId, u.name)} className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-all">Accept</button>
                            <button onClick={() => handleDeclineRequest(cId)} className="flex-1 md:flex-none px-6 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-bold rounded-xl text-sm transition-all">Decline</button>
                         </div>
                      </div>
                    )
                  })}
                </div>
             )}

             {networkTab === 'discover' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {users.filter(u => u.id !== 'u1' && !networkConnections.includes(u.id) && !networkRequests.includes(u.id))
                  .filter(u => discoverSearch === '' || u.name.toLowerCase().includes(discoverSearch.toLowerCase()) || u.skills.some(s => s.toLowerCase().includes(discoverSearch.toLowerCase())))
                  .map(u => {
                    const isSent = sentRequests.includes(u.id);
                    return (
                      <div key={u.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center shadow-xl hover:border-slate-700 transition-all">
                         <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-3 text-xl font-bold text-slate-200">
                           {u.avatar}
                         </div>
                         <h3 className="font-bold text-slate-100 text-base">{u.name}</h3>
                         <p className="text-slate-400 text-xs mt-1 mb-3 line-clamp-1 h-4">{u.title}</p>
                         
                         <div className="flex flex-wrap justify-center gap-1.5 mb-5 h-12 overflow-hidden">
                           {u.skills.slice(0,3).map(skill => <span key={skill} className="px-2 py-0.5 rounded border border-slate-800 bg-slate-950 text-[10px] uppercase font-bold text-slate-400">{skill}</span>)}
                         </div>
                         
                         <div className="flex flex-col gap-2 w-full mt-auto">
                            <button onClick={() => { setViewFreelancerId(u.id); setIsSidebarOpen(false); }} className="w-full py-2 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white font-bold rounded-xl text-sm transition-colors">View Profile</button>
                            <button disabled={isSent} onClick={() => handleSendRequest(u.id)} className={`w-full py-2 font-bold rounded-xl text-sm transition-all border ${isSent ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 'bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border-indigo-500/20'}`}>
                               {isSent ? 'Request Sent' : 'Connect'}
                            </button>
                         </div>
                      </div>
                    )
                  })}
                </div>
             )}
          </div>
        );
      case 'notifications':
        const filteredNotifs = notifications.filter(n => {
           if (notificationFilter === 'All') return true;
           if (notificationFilter === 'Unread') return !n.read;
           if (notificationFilter === 'Proposals') return n.type?.startsWith('proposal_');
           if (notificationFilter === 'Connections') return n.type?.startsWith('connection_');
           if (notificationFilter === 'Community') return n.type === 'post_liked';
           return true;
        });
        return (
          <div className="max-w-3xl mx-auto animate-in fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-100">Notifications</h2>
                <button onClick={markAllNotificationsRead} className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-bold transition-all">Mark all read</button>
             </div>
             <div className="flex gap-2 border-b border-slate-800 pb-4 mb-6 overflow-x-auto">
               {['All', 'Unread', 'Proposals', 'Connections', 'Community'].map(f => (
                 <button key={f} onClick={() => setNotificationFilter(f)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${notificationFilter === f ? 'bg-teal-500 text-slate-950 shadow-[0_0_15px_rgba(20,184,166,0.4)]' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>
                   {f}
                 </button>
               ))}
             </div>
             <div className="space-y-3">
               {filteredNotifs.length === 0 ? <p className="text-slate-500 bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">No notifications found.</p> : filteredNotifs.map(n => {
                 const details = getNotificationDetails(n.type || 'default');
                 return (
                 <div key={n.id} onClick={() => {
                     setNotifications(notifications.map(nf => nf.id === n.id ? {...nf, read: true} : nf));
                     if (n.type?.startsWith('proposal_')) navigateTo(role === 'freelancer' ? 'applications_received' : 'my_proposals');
                     else if (n.type?.startsWith('connection_')) navigateTo('network');
                     else if (n.type === 'post_liked') navigateTo('community');
                 }} className={`p-5 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border ${n.read ? 'bg-slate-900 border-slate-800' : 'bg-slate-800/80 border-slate-600 shadow-[0_0_20px_rgba(20,184,166,0.1)] hover:border-teal-500/50'}`}>
                   <div className={`p-3 rounded-full ${details.bg} ${details.color}`}>
                      {details.icon}
                   </div>
                   <div className="flex-1">
                     <p className={`text-sm md:text-base ${n.read ? 'text-slate-300' : 'text-slate-100 font-bold'}`}>{n.text}</p>
                     <p className="text-xs text-slate-500 mt-1 font-semibold">{n.time}</p>
                   </div>
                   {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)] shrink-0"></div>}
                 </div>
                 );
               })}
             </div>
          </div>
        );
      case 'profile':
        const themeColorText = role === 'freelancer' ? 'text-indigo-400' : 'text-teal-400';
        const themeColorBg = role === 'freelancer' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_4px_20px_rgba(79,70,229,0.3)]' : 'bg-teal-600 hover:bg-teal-500 shadow-[0_4px_20px_rgba(20,184,166,0.3)]';
        const activeTabClass = role === 'freelancer' ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-teal-500 text-slate-950 shadow-[0_0_15px_rgba(20,184,166,0.4)]';
        
        return (
          <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
             {/* Profile Header */}
             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-xl">
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 ${role === 'freelancer' ? 'bg-indigo-500' : 'bg-teal-500'}`}></div>
                
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                   <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-4xl font-bold text-slate-200 shrink-0 shadow-lg">
                      {currentUser.avatar}
                   </div>
                   
                   <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                         <h2 className="text-3xl font-bold text-slate-100">{currentUser.name}</h2>
                         <button onClick={() => { setEditProfileForm({...currentUser}); setShowEditProfile(true); }} className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${themeColorBg} flex items-center gap-2 justify-center`}><Edit2 size={16}/> Edit Profile</button>
                      </div>
                      <p className={`text-lg font-semibold mb-3 ${themeColorText}`}>{currentUser.title}</p>
                      
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-semibold text-slate-400 mb-6">
                         <span className="flex items-center gap-1"><MapPin size={16}/> {currentUser.location}</span>
                         <span className="flex items-center gap-1 text-amber-400"><Star size={16} fill="currentColor"/> {currentUser.rating} ({currentUser.completedProjects} Reviews)</span>
                         <span className="flex items-center gap-1"><Clock size={16}/> {currentUser.hourlyRate ? `$${currentUser.hourlyRate}/hr` : 'Custom Rate'}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-800/60">
                         <div className="bg-slate-950/50 rounded-2xl p-4 text-center border border-slate-800/50">
                            <p className="text-2xl font-bold text-slate-100">{currentUser.completedProjects}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Completed</p>
                         </div>
                         <div className="bg-slate-950/50 rounded-2xl p-4 text-center border border-slate-800/50">
                            <p className="text-2xl font-bold text-slate-100">{role === 'freelancer' ? gigs.length : 3}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Active {role === 'freelancer' ? 'Gigs' : 'Projects'}</p>
                         </div>
                         <div className="bg-slate-950/50 rounded-2xl p-4 text-center border border-slate-800/50">
                            <p className="text-2xl font-bold text-slate-100">{networkConnections.length}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Connections</p>
                         </div>
                         <div className="bg-slate-950/50 rounded-2xl p-4 text-center border border-slate-800/50">
                            <p className="text-2xl font-bold text-slate-100">2026</p>
                            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Member Since</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Tabs Navigation */}
             <div className="flex gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
               {[
                 { id: 'overview', label: 'Overview' },
                 { id: 'content', label: role === 'freelancer' ? 'My Gigs' : 'My Proposals' },
                 { id: 'reviews', label: 'Reviews' },
                 { id: 'activity', label: 'Activity' }
               ].map(tab => (
                 <button key={tab.id} onClick={() => setProfileTab(tab.id)} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${profileTab === tab.id ? activeTabClass : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>
                   {tab.label}
                 </button>
               ))}
             </div>
             
             {/* Tabs Content */}
             {profileTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="lg:col-span-2 space-y-6">
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
                         <h3 className="text-xl font-bold text-slate-100 mb-4">About Me</h3>
                         <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{currentUser.bio}</p>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
                         <h3 className="text-xl font-bold text-slate-100 mb-4">Skills & Expertise</h3>
                         <div className="flex flex-wrap gap-2.5">
                            {currentUser.skills.map(s => <span key={s} className="px-4 py-2 bg-slate-950 border border-slate-700/50 text-slate-300 rounded-xl text-sm font-semibold tracking-wide shadow-sm hover:border-slate-500 transition-colors">{s}</span>)}
                         </div>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                         <h3 className="text-lg font-bold text-slate-100 mb-4">Availability</h3>
                         <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                            <div className="flex items-center gap-3">
                               <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                               <span className="font-bold text-slate-200">Available</span>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${role === 'freelancer' ? 'bg-indigo-500' : 'bg-teal-500'}`}>
                               <div className="w-4 h-4 rounded-full bg-white ml-auto"></div>
                            </div>
                         </div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                         <h3 className="text-lg font-bold text-slate-100 mb-4">Hourly Rate</h3>
                         <p className="text-3xl font-bold text-emerald-400 mb-1">${currentUser.hourlyRate}</p>
                         <p className="text-sm font-semibold text-slate-500">per hour</p>
                      </div>
                   </div>
                </div>
             )}
             
             {profileTab === 'content' && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                   <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <Briefcase size={28} className="text-slate-400" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-100 mb-2">{role === 'freelancer' ? 'Manage your gigs' : 'Track your proposals'}</h3>
                   <p className="text-slate-400 mb-6 max-w-sm font-medium">Head over to the specialized dashboard to actively manage your workflows.</p>
                   <button onClick={() => navigateTo(role === 'freelancer' ? 'my_gigs' : 'my_proposals')} className={`px-6 py-3 rounded-xl font-bold text-white transition-all ${themeColorBg}`}>Go to {role === 'freelancer' ? 'My Gigs' : 'My Proposals'}</button>
                </div>
             )}
             
             {profileTab === 'reviews' && (
                <div className="space-y-4">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm">U{i}</div>
                              <div>
                                 <h4 className="font-bold text-slate-200">Awesome Client {i}</h4>
                                 <p className="text-xs font-semibold text-slate-500">2 months ago</p>
                              </div>
                           </div>
                           <div className="flex text-amber-400 gap-1"><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/></div>
                        </div>
                        <p className="text-slate-300 italic">"Highly recommended! The communication was crisp and the deliverables exactly matched what was requested without any delays."</p>
                     </div>
                   ))}
                </div>
             )}
             
             {profileTab === 'activity' && (
                <div className="space-y-4">
                   {communityPosts.filter(p => p.authorId === 'u1').map(post => (
                      <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                         <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs px-2 py-1 bg-slate-800 text-slate-300 uppercase font-bold rounded">Posted in {post.category}</span>
                            <span className="text-xs font-semibold text-slate-500">Recent</span>
                         </div>
                         <p className="text-slate-200 line-clamp-2">{post.content}</p>
                      </div>
                   ))}
                </div>
             )}
          </div>
        );
      default: return null;
    }
  };


  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100 max-w-[100vw] overflow-x-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-slate-950 border-r border-slate-800 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/50 bg-slate-950">
           {/* Logo rendered again inside mobile sidebar header for neatness, hidden on md */}
           <div className="flex items-center gap-2 md:hidden">
              <div className="p-1.5 bg-indigo-500/20 rounded-md">
                <Briefcase className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="font-bold text-lg tracking-tight">FreelanceHub</span>
           </div>
           <span className="hidden md:block text-xs font-semibold text-slate-500 uppercase tracking-widest">
               {role === 'freelancer' ? 'Freelancer' : 'Client'} Menu
           </span>
           <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
           </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map(item => {
            const isActive = activeView === item.id;
            const themeColor = role === 'freelancer' ? 'blue' : 'teal';
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all text-sm font-semibold outline-none
                  ${isActive 
                    ? `bg-slate-800 text-white` 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
              >
                <div className="flex items-center gap-3">
                   <div className={`${isActive ? `text-${themeColor}-400` : ''}`}>{item.icon}</div>
                   {item.label}
                </div>
                {/* Specific Sidebar Badges */}
                {item.id === 'notifications' && unreadCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-${themeColor}-500/20 text-${themeColor}-400`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Layout Shell */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-950/40 relative md:ml-64">
        
        {/* Top bar */}
        <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 md:px-8 z-40 transition-all">
          
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white md:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${role === 'freelancer' ? 'bg-blue-500/20' : 'bg-teal-500/20'}`}>
                <Briefcase className={`w-5 h-5 ${role === 'freelancer' ? 'text-blue-400' : 'text-teal-400'}`} />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">FreelanceHub</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            
            <button 
              onClick={() => setRole(null)} 
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            >
               Switch Role
            </button>

            <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

             <div className="relative">
               <button 
                 onClick={() => setShowNotificationDropdown(!showNotificationDropdown)} 
                 className="relative text-slate-400 hover:text-white transition-colors"
               >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${role === 'freelancer' ? 'bg-blue-500' : 'bg-teal-500'}`}></span>
                  )}
               </button>
               {showNotificationDropdown && (
                 <div className="absolute top-10 -right-2 md:-right-4 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                       <h3 className="font-bold text-slate-100">Notifications</h3>
                       <button onClick={markAllNotificationsRead} className="text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto w-full">
                       {notifications.length === 0 ? <p className="text-center p-6 text-slate-500 text-sm">No new notifications.</p> : notifications.slice(0, 5).map(n => {
                          const details = getNotificationDetails(n.type || 'default');
                          return (
                            <div key={n.id} onClick={() => {
                               setNotifications(notifications.map(nf => nf.id === n.id ? {...nf, read: true} : nf));
                               setShowNotificationDropdown(false);
                               if (n.type?.startsWith('proposal_')) navigateTo(role === 'freelancer' ? 'applications_received' : 'my_proposals');
                               else if (n.type?.startsWith('connection_')) navigateTo('network');
                               else if (n.type === 'post_liked') navigateTo('community');
                               else navigateTo('notifications');
                            }} className={`p-4 border-b border-slate-800 last:border-none flex gap-3 cursor-pointer hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-slate-800/30' : ''}`}>
                               <div className={`p-2 rounded-full h-8 w-8 flex items-center justify-center ${details.bg} ${details.color} shrink-0`}>
                                  {details.icon}
                               </div>
                               <div>
                                  <p className={`text-sm ${!n.read ? 'text-slate-200 font-bold' : 'text-slate-400 font-medium'}`}>{n.text}</p>
                                  <p className="text-xs text-slate-500 mt-1 font-semibold">{n.time}</p>
                               </div>
                               {!n.read && <div className="w-2 h-2 rounded-full bg-teal-400 shrink-0 self-center"></div>}
                            </div>
                          )
                       })}
                    </div>
                    <div className="p-2 border-t border-slate-800 bg-slate-950">
                       <button onClick={() => { setShowNotificationDropdown(false); navigateTo('notifications'); }} className="w-full py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors">View all notifications</button>
                    </div>
                 </div>
               )}
             </div>
            
            <button onClick={() => navigateTo('profile')} className="flex items-center gap-2 outline-none group hover:bg-slate-900 p-1 rounded-full md:pr-3 transition-colors border border-transparent hover:border-slate-800">
               <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-200">
                 {role === 'freelancer' ? 'AL' : 'CU'}
               </div>
               <span className="hidden md:block text-sm font-medium text-slate-300 group-hover:text-white">
                 {role === 'freelancer' ? 'Alex' : 'Client'}
               </span>
            </button>

          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] pt-20 p-4 md:p-8 md:pt-24 relative overflow-y-auto w-full">
           
           {/* ambient background blur based on role */}
           <div className={`absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[150px] opacity-10 pointer-events-none md:block hidden ${role==='freelancer'?'bg-blue-500' : 'bg-teal-500'}`}></div>

           <div className="max-w-7xl mx-auto relative z-10">
             {role === 'freelancer' && activeView === 'dashboard' && renderDashboard()}
             {role === 'freelancer' && activeView === 'my_gigs' && renderFreelancerGigs()}
             {role === 'freelancer' && activeView === 'applications_received' && renderApplicationsReceived()}
             
             {role === 'client' && activeView === 'dashboard' && renderDashboard()}
             {role === 'client' && activeView === 'browse_gigs' && renderClientBrowse()}
             {role === 'client' && activeView === 'my_proposals' && renderClientProposals()}
             
             {/* Shared views mapped */}
             {(
               activeView === 'community' || 
               activeView === 'network' || 
               activeView === 'notifications' || 
               activeView === 'profile' ||
               activeView === 'saved_projects'
             ) && renderSharedViews()}
           </div>
        </main>
      </div>

      {/* --- MODALS --- */}
      
      {/* Create Gig Modal (Freelancer) */}
      {showCreateGig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-100">Create New Gig</h3>
              <button onClick={() => setShowCreateGig(false)} className="text-slate-400 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateGig} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Gig Title</label>
                <input required type="text" value={newGig.title} onChange={e => setNewGig({...newGig, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="e.g. I will build a React app" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea required rows={3} value={newGig.description} onChange={e => setNewGig({...newGig, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 resize-none" placeholder="Describe your service..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Budget ($)</label>
                  <input required type="number" min="1" value={newGig.price} onChange={e => setNewGig({...newGig, price: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Delivery Time (Days)</label>
                  <input required type="number" min="1" value={newGig.deliveryDays} onChange={e => setNewGig({...newGig, deliveryDays: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="7" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                  <select required value={newGig.category} onChange={e => setNewGig({...newGig, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500">
                    <option value="">Select...</option>
                    <option value="Web Dev">Web Development</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Skills / Tags (Press Enter)</label>
                  <input type="text" value={newGigTagInput} onChange={(e) => setNewGigTagInput(e.target.value)} onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newGigTagInput.trim()) {
                           setNewGigTags([...newGigTags, newGigTagInput.trim()]);
                           setNewGigTagInput('');
                        }
                     }
                  }} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="React, Figma..." />
                  {newGigTags.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{newGigTags.map(t => <span key={t} className="bg-slate-800 text-xs px-2 py-1 rounded text-slate-300">{t} <button type="button" onClick={() => setNewGigTags(newGigTags.filter(tg=>tg!==t))} className="text-slate-500 hover:text-red-400 ml-1">x</button></span>)}</div>}
                </div>
              </div>
              {toastMessage && toastMessage.title === 'Error' && <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/20">{toastMessage.message}</div>}
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowCreateGig(false)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium">Publish Gig</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Community Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
             <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <h3 className="text-xl font-bold text-slate-100">Create Post</h3>
                <button onClick={() => setShowCreatePost(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
             </div>
             <div className="p-6 space-y-4 bg-slate-950">
                <div>
                   <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                   <select value={newPostCategory} onChange={e => setNewPostCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500">
                      <option value="Discussion">Discussion</option>
                      <option value="Showcase">Showcase</option>
                      <option value="Question">Question</option>
                      <option value="Job">Job</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-400 mb-1">Content</label>
                   <textarea rows={4} value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder="What's on your mind?" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none"></textarea>
                   <div className="flex justify-between mt-1 px-1">
                      <span className={`text-xs font-semibold ${newPostContent.length < 20 ? 'text-red-400' : 'text-slate-500'}`}>{newPostContent.length} / 20 min chars</span>
                   </div>
                </div>
                {toastMessage && toastMessage.title === 'Error' && <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/20">{toastMessage.message}</div>}
                <button onClick={handleCreatePost} disabled={newPostContent.length < 20} className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-[0_4px_20px_rgba(79,70,229,0.3)]">Publish Post</button>
             </div>
           </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && toastMessage.title === 'Success' && (
         <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-[0_10px_40px_rgba(16,185,129,0.3)] font-medium animate-in slide-in-from-right fade-in">
           {toastMessage.message}
         </div>
      )}

      {/* View Proposals Panel (Freelancer) */}
      {viewProposalsGigId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="w-full md:w-2/3 lg:w-1/2 h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
             <div className="h-20 border-b border-slate-800 flex items-center justify-between px-8">
                <div>
                   <h2 className="text-xl font-bold text-white">Manage Proposals</h2>
                   <p className="text-sm text-slate-400">Review and accept applications.</p>
                </div>
                <button onClick={() => setViewProposalsGigId(null)} className="p-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-full transition"><X size={20} /></button>
             </div>
             
             <div className="p-8 border-b border-slate-800 bg-slate-950 flex items-center gap-2">
                {['All', 'Pending', 'Accepted', 'Rejected'].map(f => (
                   <button key={f} onClick={() => setProposalFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${proposalFilter === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{f}</button>
                ))}
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-6">
                 {(() => {
                    let gigProps = proposals.filter(p => p.gigId === viewProposalsGigId);
                    if (proposalFilter !== 'All') {
                       gigProps = gigProps.filter(p => p.status.toLowerCase() === proposalFilter.toLowerCase());
                    }
                    if (gigProps.length === 0) return <p className="text-slate-500 text-center py-20">No proposals found.</p>;
                    
                    return gigProps.map(p => {
                       const gig = gigs.find(g => g.id === viewProposalsGigId);
                       return (
                         <div key={p.id} className={`bg-slate-950 border ${!p.isRead && p.status === 'pending' ? 'border-l-4 border-l-orange-500 border-slate-800' : 'border-slate-800'} rounded-2xl p-6`}>
                            <div className="flex justify-between items-start mb-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-slate-800 flex justify-center items-center font-bold text-slate-200">
                                     {p.clientName.substring(0,2).toUpperCase()}
                                  </div>
                                  <div>
                                     <p className="font-bold text-slate-200">{p.clientName}</p>
                                     <p className="text-xs text-slate-500">Submitted details</p>
                                  </div>
                               </div>
                               <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${p.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : p.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                 {p.status}
                               </span>
                            </div>
                            <p className="text-slate-300 text-sm mb-4 leading-relaxed bg-slate-900 p-4 rounded-xl">"{p.message}"</p>
                            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                               <div className="flex items-center gap-6">
                                  <div>
                                     <p className="text-xs text-slate-500 uppercase font-semibold">Offer</p>
                                     <p className="font-bold text-emerald-400">${p.budgetOffer}</p>
                                  </div>
                                  <div>
                                     <p className="text-xs text-slate-500 uppercase font-semibold">Delivery</p>
                                     <p className="font-bold text-slate-200">{p.deliveryDays || 7} Days</p>
                                  </div>
                               </div>
                               {p.status === 'pending' && (
                                  <div className="flex items-center gap-2">
                                     <button onClick={() => handleProposalAction(p.id, 'accepted', viewProposalsGigId as number, gig?.title)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition">Accept</button>
                                     <button onClick={() => handleProposalAction(p.id, 'rejected', viewProposalsGigId as number, gig?.title)} className="px-4 py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-lg text-sm font-semibold transition">Reject</button>
                                  </div>
                               )}
                            </div>
                         </div>
                       );
                    });
                 })()}
             </div>
           </div>
        </div>
      )}

      {/* Apply Modal (Client) */}
      {applyModalGig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div>
                 <h3 className="text-xl font-bold text-slate-100">Send Proposal</h3>
                 <p className="text-sm text-slate-400">For {applyModalGig.title} by {applyModalGig.freelancerName}</p>
              </div>
              <button onClick={() => setApplyModalGig(null)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleApply} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-400 mb-1">Proposed Budget ($)</label>
                   <input required type="number" min="1" value={proposalPrice} onChange={e => setProposalPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-400 mb-1">Delivery Time (Days)</label>
                   <input required type="number" min="1" value={proposalDays} onChange={e => setProposalDays(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" />
                 </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1">
                   <label className="block text-sm font-medium text-slate-400">Cover Letter</label>
                   <span className={`text-xs font-semibold ${proposalMsg.length < 100 ? 'text-red-400' : 'text-teal-400'}`}>{proposalMsg.length} / 100 min chars</span>
                </div>
                <textarea required rows={5} value={proposalMsg} onChange={e => setProposalMsg(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-500 resize-none" placeholder="I am highly interested in helping you complete this project..."></textarea>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setApplyModalGig(null)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={proposalMsg.length < 100} className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold transition-colors">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Quick-view Modal */}
      {viewFreelancerId && (() => {
         const freelancer = users.find(u => u.id === viewFreelancerId) || users[0];
         return (
           <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setViewFreelancerId(null)}>
             <div className="w-full md:w-96 h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
               <div className="p-6 border-b border-slate-800 flex justify-between items-center relative overflow-hidden bg-slate-950">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-[40px]"></div>
                 <h3 className="text-xl font-bold text-slate-100 relative z-10">Freelancer Profile</h3>
                 <button onClick={() => setViewFreelancerId(null)} className="text-slate-400 hover:text-white relative z-10 transition-colors bg-slate-800 p-2 rounded-full">
                   <X size={20} />
                 </button>
               </div>
               <div className="p-6 flex-1 overflow-y-auto w-full max-w-sm self-center">
                  <div className="flex flex-col items-center mb-8">
                     <div className="w-24 h-24 rounded-full bg-slate-800 flex justify-center items-center font-bold text-slate-200 text-3xl mb-4 shadow-[0_0_20px_rgba(20,184,166,0.3)] border-2 border-teal-500/30">
                        {freelancer.avatar}
                     </div>
                     <h2 className="text-2xl font-bold text-white text-center">{freelancer.name}</h2>
                     <p className="text-teal-400 font-semibold mb-2">{freelancer.title}</p>
                     <div className="flex items-center gap-4 text-sm font-semibold text-slate-400">
                        <span className="flex items-center gap-1 text-amber-400"><Star size={14} fill="currentColor"/> {freelancer.rating}</span>
                        <span>•</span>
                        <span>{freelancer.completedProjects} Jobs</span>
                        <span>•</span>
                        <span>${freelancer.hourlyRate}/hr</span>
                     </div>
                  </div>
                  
                  <div className="space-y-6">
                     <div>
                        <h4 className="text-slate-500 text-sm font-bold uppercase mb-2">About</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{freelancer.bio}</p>
                     </div>
                     <div>
                        <h4 className="text-slate-500 text-sm font-bold uppercase mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                           {freelancer.skills.map(s => <span key={s} className="bg-slate-800 text-slate-300 px-3 py-1 text-xs rounded-full border border-slate-700">{s}</span>)}
                        </div>
                     </div>
                     <div>
                        <h4 className="text-slate-500 text-sm font-bold uppercase mb-2">Location</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{freelancer.location}</p>
                     </div>
                  </div>
               </div>
               <div className="p-6 border-t border-slate-800 bg-slate-950 flex flex-col gap-3">
                  {(() => {
                     const isConn = networkConnections.includes(freelancer.id);
                     const isSent = sentRequests.includes(freelancer.id);
                     const isIncoming = networkRequests.includes(freelancer.id);
                     
                     if (isConn) {
                        return <button onClick={() => { setToastMessage({ title: 'Success', message: 'Messaging coming soon!' }); setTimeout(() => setToastMessage(null), 3000); }} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-[0_4px_20px_rgba(79,70,229,0.3)]">Send Message</button>;
                     } else if (isIncoming) {
                        return <button onClick={() => { handleAcceptRequest(freelancer.id, freelancer.name); setViewFreelancerId(null); }} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)]">Accept Request</button>;
                     } else {
                        return <button disabled={isSent} onClick={() => handleSendRequest(freelancer.id)} className={`w-full py-3 font-bold rounded-xl transition-all border ${isSent ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-500 text-white border-transparent shadow-[0_4px_20px_rgba(20,184,166,0.3)]'}`}>{isSent ? 'Request Sent' : 'Connect'}</button>;
                     }
                  })()}
               </div>
             </div>
           </div>
         );
      })()}

      {/* Project Detail Modal */}
      {viewProjectId && (() => {
        const proj = projectsList.find(p => p.id === viewProjectId);
        if (!proj) return null;
        const client = users.find(u => u.id === proj.postedBy);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
               <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950">
                  <div className="pr-4">
                     <h3 className="text-2xl font-bold text-slate-100 mb-2">{proj.title}</h3>
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-200">
                           {client?.avatar || 'CL'}
                        </div>
                        <span className="text-slate-400 font-medium">Posted by <span className="font-bold text-slate-200">{client?.name || 'Unknown'}</span></span>
                     </div>
                  </div>
                  <button onClick={() => setViewProjectId(null)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full shrink-0">
                    <X size={20} />
                  </button>
               </div>
               
               <div className="p-8 overflow-y-auto space-y-8 flex-1">
                  <div>
                     <h4 className="text-slate-100 font-bold mb-3 text-lg">Project Description</h4>
                     <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{proj.description}</p>
                  </div>
                  
                  <div>
                     <h4 className="text-slate-100 font-bold mb-3 text-lg">Required Skills & Expertise</h4>
                     <div className="flex flex-wrap gap-2">
                        {proj.skills.map((skill: string) => (
                           <span key={skill} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-xl text-sm font-bold uppercase tracking-wide">{skill}</span>
                        ))}
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                     <div>
                        <p className="text-sm font-bold text-slate-500 uppercase mb-1">Fixed Budget</p>
                        <p className="text-2xl font-bold text-emerald-400">${proj.budget}</p>
                     </div>
                     <div>
                        <p className="text-sm font-bold text-slate-500 uppercase mb-1">Target Deadline</p>
                        <p className="text-xl font-bold text-slate-200">{proj.deadline}</p>
                     </div>
                  </div>
               </div>
               
               <div className="p-6 border-t border-slate-800 bg-slate-950 flex gap-4">
                  <button onClick={() => setViewProjectId(null)} className="flex-1 py-3 px-6 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-bold rounded-xl transition-all">Close</button>
                  {role === 'client' ? (
                     <button onClick={() => { setToastMessage({ title: 'Success', message: 'Application submitted!' }); setTimeout(() => setToastMessage(null), 3000); setViewProjectId(null); }} className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all">Apply Now (Demo)</button>
                  ) : (
                     <button disabled className="flex-1 py-3 px-6 bg-slate-800 text-slate-500 font-bold rounded-xl cursor-not-allowed">Freelancers Only</button>
                  )}
               </div>
             </div>
          </div>
        );
      })()}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
             <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <h3 className="text-2xl font-bold text-slate-100">Edit Profile</h3>
                <button onClick={() => setShowEditProfile(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full">
                  <X size={20} />
                </button>
             </div>
             
             <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-bold text-slate-400 mb-2">Display Name</label>
                      <input type="text" value={editProfileForm.name} onChange={e => setEditProfileForm({...editProfileForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-semibold focus:border-indigo-500 focus:outline-none transition-colors" />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-slate-400 mb-2">Professional Title</label>
                      <input type="text" value={editProfileForm.title} onChange={e => setEditProfileForm({...editProfileForm, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-semibold focus:border-indigo-500 focus:outline-none transition-colors" />
                   </div>
                </div>
                
                <div>
                   <label className="block text-sm font-bold text-slate-400 mb-2">Bio / About Me</label>
                   <textarea rows={4} value={editProfileForm.bio} onChange={e => setEditProfileForm({...editProfileForm, bio: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors resize-none"></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-bold text-slate-400 mb-2">Location</label>
                      <input type="text" value={editProfileForm.location} onChange={e => setEditProfileForm({...editProfileForm, location: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-semibold focus:border-indigo-500 focus:outline-none transition-colors" />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-slate-400 mb-2">Hourly Rate ($)</label>
                      <input type="number" value={editProfileForm.hourlyRate} onChange={e => setEditProfileForm({...editProfileForm, hourlyRate: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-semibold focus:border-indigo-500 focus:outline-none transition-colors" />
                   </div>
                </div>
                
                <div>
                   <label className="block text-sm font-bold text-slate-400 mb-2">Skills & Expertise (Press Enter to add)</label>
                   <div className="flex flex-wrap gap-2 mb-3 bg-slate-950 p-3 rounded-xl border border-slate-800 min-h-[50px]">
                      {editProfileForm.skills?.map((skill: string) => (
                         <span key={skill} className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                            {skill}
                            <button onClick={() => setEditProfileForm({...editProfileForm, skills: editProfileForm.skills.filter((s: string) => s !== skill)})} className="hover:text-amber-400 transition-colors"><X size={14}/></button>
                         </span>
                      ))}
                      <input type="text" value={editProfileSkillInput} onChange={e => setEditProfileSkillInput(e.target.value)} onKeyDown={e => {
                         if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            const val = editProfileSkillInput.trim();
                            if (val && !editProfileForm.skills.includes(val)) {
                               setEditProfileForm({...editProfileForm, skills: [...editProfileForm.skills, val]});
                               setEditProfileSkillInput('');
                            }
                         }
                      }} className="bg-transparent border-none focus:outline-none text-white text-sm font-semibold min-w-[150px] flex-1 py-1" placeholder="Type a skill..." />
                   </div>
                </div>
             </div>
             
             <div className="p-6 border-t border-slate-800 bg-slate-950 flex gap-4">
                <button onClick={() => setShowEditProfile(false)} className="flex-1 py-3 px-6 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-bold rounded-xl transition-all">Cancel</button>
                <button onClick={() => {
                   setUsers(users.map(u => u.id === currentUser.id ? editProfileForm : u));
                   setShowEditProfile(false);
                   setToastMessage({ title: 'Success', message: 'Profile updated successfully!' });
                   setTimeout(() => setToastMessage(null), 3000);
                }} className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all">Save Changes</button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
