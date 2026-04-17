import { useState, useEffect } from 'react'
import { PageLoader } from '@/components/ui/spinner'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Star,
  Calendar,
  Globe,
  Github,
  Linkedin,
  Edit,
  Save,
  X,
  Mail,
  Plus,
  DollarSign,
  Briefcase,
  Users,
  Award,
} from "lucide-react";
import { useAuthState } from "@/hooks/useAuth";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuthState();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const targetUserId = id || user?._id;
  const isOwnProfile = user?._id === targetUserId;

  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  const [editData, setEditData] = useState<any>({
    username: "",
    fullName: "",
    bio: "",
    location: "",
    hourlyRate: 0,
    portfolioUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    websiteUrl: "",
    skills: [],
    avatar: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${targetUserId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile({
            ...data,
            joinedAt: new Date(data.joinedAt),
          });
          if (isOwnProfile) {
            setEditData({
              username: data.username || "",
              fullName: data.fullName || "",
              bio: data.bio || "",
              location: data.location || "",
              hourlyRate: data.hourlyRate || 0,
              portfolioUrl: data.portfolioUrl || "",
              githubUrl: data.githubUrl || "",
              linkedinUrl: data.linkedinUrl || "",
              websiteUrl: data.websiteUrl || "",
              skills: data.skills || [],
              avatar: data.avatar || "",
            });
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${targetUserId}/reviews`);
        setReviews(res.data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    if (targetUserId) {
      setIsLoading(true);
      fetchUserProfile().then(() => fetchReviews()).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [targetUserId, isOwnProfile]);

  const handleSave = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile({
          ...updatedProfile,
          joinedAt: new Date(updatedProfile.joinedAt),
        });
        setIsEditing(false);
      } else {
        console.error("Update failed with status:", res.status);
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  if (isLoading) {
    return (
      <PageLoader message="Loading profile..." variant="faded" />
    );
  }

  if (!isAuthenticated || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-semibold mb-2">Please Log In</h2>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to view your profile.
            </p>
            <Button asChild className="w-full">
              <a href="/login">Log In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCancel = () => {
    setEditData({
      username: profile?.username || "",
      fullName: profile?.fullName || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      hourlyRate: profile?.hourlyRate || 0,
      portfolioUrl: profile?.portfolioUrl || "",
      githubUrl: profile?.githubUrl || "",
      linkedinUrl: profile?.linkedinUrl || "",
      websiteUrl: profile?.websiteUrl || "",
      skills: profile?.skills || [],
      avatar: profile?.avatar || "",
    });
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !editData.skills.includes(newSkill.trim())) {
      setEditData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setEditData((prev: any) => ({
      ...prev,
      skills: prev.skills.filter((skill: string) => skill !== skillToRemove),
    }));
  };

  const handleAddReview = async () => {
    if (!user?._id) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/users/${targetUserId}/reviews`, {
        reviewerId: user._id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      toast({ title: "Success", description: "Review added successfully." });
      setReviewDialogOpen(false);

      // Refresh reviews
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${targetUserId}/reviews`);
      setReviews(res.data);
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to add review.", variant: "destructive" });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className={"w-24 h-24" + (isEditing ? " border-2 border-primary border-dashed" : "")}>
              <AvatarImage
                src={isEditing && editData.avatar ? editData.avatar : (profile?.avatar || undefined)}
                alt={editData.username}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl">
                {profile?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 w-full max-w-full overflow-hidden">
              {isEditing && (
                <div className="mb-4">
                  <Label htmlFor="avatarUrl" className="text-xs text-muted-foreground uppercase font-semibold">Avatar Image URL</Label>
                  <Input
                    id="avatarUrl"
                    placeholder="https://example.com/avatar.png"
                    value={editData.avatar}
                    onChange={(e) => setEditData((prev) => ({ ...prev, avatar: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Paste a direct link to an image to update your profile picture.</p>
                </div>
              )}
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{profile.username}</h1>
                {profile.isVerified && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    <Award className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-gray-600 mb-3">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{profile.rating}</span>
                  <span>({profile.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>
                    {/* Joined{" "} */}
                    {profile.email}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                {profile.bio || "No bio available"}
              </p>

              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {isOwnProfile ? (
                !isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )
              ) : (
                <div className="flex gap-2">
                  <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Star className="w-4 h-4 mr-2" />
                        Write a Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Write a Review for {profile.username}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Rating (1-5)</Label>
                          <Input type="number" min="1" max="5" value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })} />
                        </div>
                        <div>
                          <Label>Comment</Label>
                          <Textarea placeholder="Share your experience working with this freelancer..." value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} />
                        </div>
                        <Button onClick={handleAddReview} className="w-full">Submit Review</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={editData.username}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={editData.fullName}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editData.location}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={editData.hourlyRate}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        hourlyRate: parseFloat(e.target.value) || 0,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  disabled={!isEditing}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {skill}
                    {isEditing && (
                      <button onClick={() => removeSkill(skill)}>
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  />
                  <Button onClick={addSkill} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="portfolioUrl">Portfolio</Label>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <Input
                    id="portfolioUrl"
                    value={editData.portfolioUrl}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        portfolioUrl: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="githubUrl">GitHub</Label>
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-gray-500" />
                  <Input
                    id="githubUrl"
                    value={editData.githubUrl}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        githubUrl: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="linkedinUrl">LinkedIn</Label>
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-gray-500" />
                  <Input
                    id="linkedinUrl"
                    value={editData.linkedinUrl}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        linkedinUrl: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="websiteUrl">Website</Label>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <Input
                    id="websiteUrl"
                    value={editData.websiteUrl}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        websiteUrl: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({profile.reviewCount})</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{review.reviewer?.username?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">{review.reviewer?.username}</p>
                            <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{review.rating}</span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">{profile.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reviews</span>
                <span className="font-semibold">{profile.reviewCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Projects</span>
                <span className="font-semibold">15</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Rate</span>
                <span className="font-semibold">96%</span>
              </div>
            </CardContent>
          </Card>

          {/* Web3 Wallet */}
          <Card>
            <CardHeader>
              <CardTitle>Web3 Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">Connected Wallet</div>
                <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {profile.walletAddress}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <DollarSign className="w-4 h-4 mr-2" />
                  View Earnings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                View My Gigs
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Users className="w-4 h-4 mr-2" />
                My Network
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Star className="w-4 h-4 mr-2" />
                Reviews
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
