import React, { useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from '@/hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, User, Briefcase, Wallet, Building, CheckCircle2, Upload, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '', // Used internally, mapped from fullName
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    walletAddress: '',
    freelancerProfile: {
      region: '',
      nativeLanguage: '',
      languagesKnown: '',
      skills: '',
      workExperience: '',
      education: '',
      certifications: '',
      portfolio: '',
      profilePhoto: ''
    },
    clientProfile: {
      previousProjects: '',
      hiringExperience: '',
      projectScale: '',
      budgetRange: ''
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { setSession } = useAuthState();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Auto-fill username if fullName changes for backend compatibility
      ...(field === 'fullName' ? { username: value.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000) } : {})
    }));
  };

  const handleProfileChange = (type: 'freelancerProfile' | 'clientProfile', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined') {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          handleInputChange('walletAddress', accounts[0]);
          toast({ title: 'Wallet connected', description: `${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}` });
        }
      } catch (error: any) {
        toast({ title: 'Connection failed', description: error.message, variant: 'destructive' });
      }
    } else {
      toast({ title: 'MetaMask not found', description: 'Please install MetaMask to continue', variant: 'destructive' });
    }
  };

  const validateStep1 = () => {
    if (!formData.role) throw new Error('Please select a role');
  };

  const validateStep2 = () => {
    const { fullName, email, password, confirmPassword } = formData;
    if (!fullName || !email || !password || !confirmPassword) throw new Error('Please fill in all required fields');
    if (password !== confirmPassword) throw new Error('Passwords do not match');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');
  };

  const handleNextStep = () => {
    try {
      if (step === 1) validateStep1();
      if (step === 2) validateStep2();
      setStep(s => s + 1);
    } catch (e: any) {
      toast({ title: 'Validation Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        walletAddress: formData.walletAddress,
        ...(formData.role === 'freelancer' && {
          freelancerProfile: {
            ...formData.freelancerProfile,
            skills: formData.freelancerProfile.skills.split(',').map(s => s.trim()).filter(Boolean),
            languagesKnown: formData.freelancerProfile.languagesKnown.split(',').map(s => s.trim()).filter(Boolean),
          }
        }),
        ...(formData.role === 'client' && {
          clientProfile: {
            ...formData.clientProfile,
          }
        })
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }

      if (data.token && data.user) {
        // Auto-login
        setSession(data.user, data.token);
        toast({
          title: 'Account created!',
          description: 'Welcome to DeFree! You have been automatically logged in.',
        });
        window.location.href = '/dashboard';
      } else {
        toast({
          title: 'Account created!',
          description: 'Welcome to DeFree! Please sign in to continue.',
        });
        navigate('/login');
      }

    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-obsidian text-text-primary pt-24 pb-12">
      <div className="w-full max-w-4xl relative z-10">

        {/* Step Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <span className="text-2xl font-syne font-bold text-cyan-accent">DeFree</span>
          </Link>
          {step === 1 && (
            <>
              <h1 className="text-3xl font-syne font-bold mb-2">Choose Your Role</h1>
              <p className="text-text-secondary">Select how you want to use DeFree</p>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-3xl font-syne font-bold mb-2">Create your {formData.role} account</h1>
              <p className="text-text-secondary">Join the decentralized freelancing revolution</p>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="text-3xl font-syne font-bold mb-2">Complete your Profile</h1>
              <p className="text-text-secondary">Tell us more about yourself to get started</p>
            </>
          )}
        </div>

        <Card className="bg-obsidian-elevated border-border-subtle shadow-lg p-6">
          <CardContent className="pt-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (step < 3) {
                  handleNextStep();
                } else {
                  handleSubmit(e);
                }
              }}
              className="space-y-6"
            >

              {/* STEP 1: Role Selection */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <ConfigurableCard
                    title="Freelancer"
                    description="I want to offer my services"
                    features={['Find projects', 'Build portfolio', 'Earn crypto']}
                    icon={<Briefcase className="h-8 w-8 text-cyan-accent mb-4" />}
                    selected={formData.role === 'freelancer'}
                    onClick={() => handleInputChange('role', 'freelancer')}
                  />
                  <ConfigurableCard
                    title="Client"
                    description="I want to hire talent"
                    features={['Post projects', 'Hire experts', 'Secure payments']}
                    icon={<Building className="h-8 w-8 text-cyan-accent mb-4" />}
                    selected={formData.role === 'client'}
                    onClick={() => handleInputChange('role', 'client')}
                  />
                </div>
              )}

              {/* STEP 2: Basic Info */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-text-primary">Full Name <span className="text-error">*</span></Label>
                      <Input placeholder="Enter your full name" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} className="bg-obsidian border-border-subtle focus:border-cyan-accent text-text-primary" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-text-primary">Email Address <span className="text-error">*</span></Label>
                      <Input type="email" placeholder="your.email@example.com" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="bg-obsidian border-border-subtle focus:border-cyan-accent text-text-primary" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-text-primary">Password <span className="text-error">*</span></Label>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className="bg-obsidian border-border-subtle focus:border-cyan-accent pr-10 text-text-primary" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-text-secondary hover:text-text-primary">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-text-primary">Confirm Password <span className="text-error">*</span></Label>
                      <div className="relative">
                        <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter your password" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} className="bg-obsidian border-border-subtle focus:border-cyan-accent pr-10 text-text-primary" required />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-text-secondary hover:text-text-primary">
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Label className="text-text-primary">MetaMask Wallet ID (Optional)</Label>
                    <Input placeholder="Enter your MetaMask wallet address" value={formData.walletAddress} onChange={(e) => handleInputChange('walletAddress', e.target.value)} className="bg-obsidian border-border-subtle focus:border-cyan-accent text-text-primary mb-2" />
                    <p className="text-sm text-text-secondary mb-2">You can also connect your wallet below</p>

                    {formData.walletAddress ? (
                      <div className="flex items-center justify-between p-4 bg-obsidian border border-success/30 rounded-lg">
                        <div className="flex items-center space-x-3 text-success">
                          <div className="h-2 w-2 rounded-full bg-success"></div>
                          <div className="flex flex-col">
                            <span className="text-xs text-text-secondary">Connected Wallet</span>
                            <span className="font-mono text-success text-sm">{formData.walletAddress.substring(0, 8)}...{formData.walletAddress.substring(36)}</span>
                          </div>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>
                    ) : (
                      <Button type="button" onClick={connectWallet} className="w-full bg-transparent hover:bg-cyan-glow border border-border-subtle text-text-primary py-6 flex flex-col items-center justify-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Connect Wallet
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Detailed Profile Questionnaire */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">

                  {/* Freelancer Specific Fields */}
                  {formData.role === 'freelancer' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-text-primary">Region <span className="text-error">*</span></Label>
                          <Select onValueChange={(val) => handleProfileChange('freelancerProfile', 'region', val)}>
                            <SelectTrigger className="bg-obsidian border-border-subtle text-text-primary"><SelectValue placeholder="Select your region" /></SelectTrigger>
                            <SelectContent className="bg-obsidian-elevated border-border-subtle text-text-primary">
                              <SelectItem value="na">North America</SelectItem>
                              <SelectItem value="eu">Europe</SelectItem>
                              <SelectItem value="asia">Asia</SelectItem>
                              <SelectItem value="global">Global / Remote</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-text-primary">Native Language <span className="text-error">*</span></Label>
                          <Select onValueChange={(val) => handleProfileChange('freelancerProfile', 'nativeLanguage', val)}>
                            <SelectTrigger className="bg-obsidian border-border-subtle text-text-primary"><SelectValue placeholder="Select native language" /></SelectTrigger>
                            <SelectContent className="bg-obsidian-elevated border-border-subtle text-text-primary">
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-text-primary">Languages Known <span className="text-error">*</span></Label>
                        <Input placeholder="e.g. English, German, Japanese" value={formData.freelancerProfile.languagesKnown} onChange={(e) => handleProfileChange('freelancerProfile', 'languagesKnown', e.target.value)} className="bg-obsidian border-border-subtle focus:border-cyan-accent text-text-primary" required />
                        <p className="text-xs text-text-secondary">Select all languages you speak (comma separated)</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-text-primary">Skills <span className="text-error">*</span></Label>
                        <Input placeholder="Type a skill and press Enter/Comma" value={formData.freelancerProfile.skills} onChange={(e) => handleProfileChange('freelancerProfile', 'skills', e.target.value)} className="bg-obsidian border-border-subtle focus:border-cyan-accent text-text-primary" required />
                        <p className="text-xs text-text-secondary">Press comma to add each skill</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-text-primary">Work Experience</Label>
                        <Input placeholder="e.g., 5 years as Full Stack Developer" value={formData.freelancerProfile.workExperience} onChange={(e) => handleProfileChange('freelancerProfile', 'workExperience', e.target.value)} className="bg-obsidian border-border-subtle text-text-primary" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-text-primary">Education</Label>
                        <Input placeholder="e.g., Bachelor's in Computer Science" value={formData.freelancerProfile.education} onChange={(e) => handleProfileChange('freelancerProfile', 'education', e.target.value)} className="bg-obsidian border-border-subtle text-text-primary" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-text-primary">Certifications</Label>
                        <Input placeholder="e.g., AWS Certified Developer" value={formData.freelancerProfile.certifications} onChange={(e) => handleProfileChange('freelancerProfile', 'certifications', e.target.value)} className="bg-obsidian border-border-subtle text-text-primary" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-text-primary">Portfolio Links</Label>
                        <Input placeholder="https://yourportfolio.com, https://github.com/username" value={formData.freelancerProfile.portfolio} onChange={(e) => handleProfileChange('freelancerProfile', 'portfolio', e.target.value)} className="bg-obsidian border-border-subtle text-text-primary" />
                        <p className="text-xs text-text-secondary">Separate multiple links with commas</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-text-primary">Profile Photo</Label>
                        <div className="flex items-center gap-4">
                          <div className="h-24 w-24 rounded-lg border-2 border-dashed border-border-subtle flex items-center justify-center bg-obsidian">
                            <User className="h-8 w-8 text-text-secondary" />
                          </div>
                          <Button type="button" variant="outline" className="bg-obsidian hover:bg-obsidian-elevated border-border-subtle text-text-primary">
                            <Upload className="h-4 w-4 mr-2" /> Upload Photo
                          </Button>
                        </div>
                        <p className="text-xs text-text-secondary">JPG, PNG or GIF. Max size 5MB</p>
                      </div>
                    </>
                  )}

                  {/* Client Specific Fields */}
                  {formData.role === 'client' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-text-primary">Previous Projects</Label>
                        <Input placeholder="Briefly describe past projects (optional)" value={formData.clientProfile.previousProjects} onChange={(e) => handleProfileChange('clientProfile', 'previousProjects', e.target.value)} className="bg-obsidian border-border-subtle text-text-primary" />
                        <p className="text-xs text-text-secondary">Help us understand your project needs</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-text-primary">Hiring Experience</Label>
                        <Select onValueChange={(val) => handleProfileChange('clientProfile', 'hiringExperience', val)}>
                          <SelectTrigger className="bg-obsidian border-border-subtle text-text-primary"><SelectValue placeholder="Select your experience level" /></SelectTrigger>
                          <SelectContent className="bg-obsidian-elevated border-border-subtle text-text-primary">
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-text-primary">Project Scale <span className="text-error">*</span></Label>
                          <Select onValueChange={(val) => handleProfileChange('clientProfile', 'projectScale', val)}>
                            <SelectTrigger className="bg-obsidian border-border-subtle text-text-primary"><SelectValue placeholder="Select typical project size" /></SelectTrigger>
                            <SelectContent className="bg-obsidian-elevated border-border-subtle text-text-primary">
                              <SelectItem value="small">Small ($0 - $1k)</SelectItem>
                              <SelectItem value="medium">Medium ($1k - $10k)</SelectItem>
                              <SelectItem value="large">Large ($10k+)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-text-primary">Budget Range <span className="text-error">*</span></Label>
                          <Select onValueChange={(val) => handleProfileChange('clientProfile', 'budgetRange', val)}>
                            <SelectTrigger className="bg-obsidian border-border-subtle text-text-primary"><SelectValue placeholder="Select typical budget" /></SelectTrigger>
                            <SelectContent className="bg-obsidian-elevated border-border-subtle text-text-primary">
                              <SelectItem value="fixed">Fixed Price</SelectItem>
                              <SelectItem value="hourly">Hourly Rate</SelectItem>
                              <SelectItem value="bounty">Bounty Based</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="bg-obsidian border border-border-subtle p-4 rounded-lg mt-4 flex gap-3">
                        <div className="text-cyan-accent w-5 h-5 flex-shrink-0 mt-0.5">ℹ️</div>
                        <div>
                          <h4 className="font-semibold text-text-primary text-sm mb-1">Why we need this information</h4>
                          <p className="text-text-secondary text-sm">This helps us match you with the right freelancers and provide personalized recommendations based on your project needs and budget.</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex flex-col md:flex-row gap-4 pt-6">
                {step > 1 && step < 3 && (
                  <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} className="md:w-auto w-full border-border-subtle text-text-primary bg-obsidian hover:bg-obsidian-elevated transition-colors">
                    Back
                  </Button>
                )}
                {step === 3 && (
                  <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} className="md:w-1/3 w-full border-border-subtle text-text-primary bg-obsidian hover:bg-obsidian-elevated transition-colors">
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className={`w-full ${step === 3 ? 'md:w-2/3' : ''} bg-cyan-accent text-obsidian font-bold hover:bg-cyan-hover transition-all`}
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner variant="default" size="sm" /> : step === 3 ? `Create ${formData.role === 'freelancer' ? 'Freelancer' : 'Client'} Account` : 'Continue'}
                  {!isLoading && step < 3 && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center border-t border-border-subtle pt-6">
              <p className="text-sm text-text-secondary">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-accent hover:text-cyan-hover font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Subcomponent for the Role Selection cards
const ConfigurableCard = ({ title, description, features, icon, selected, onClick }: any) => {
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl p-6 border-2 transition-all duration-200 ${selected ? 'border-cyan-accent bg-cyan-glow/30' : 'border-border-subtle bg-obsidian hover:border-cyan-accent/50'
        }`}
    >
      <div className="flex flex-col items-start text-left">
        <div className="bg-obsidian-elevated p-3 rounded-xl mb-4">
          {icon}
        </div>
        <h3 className="font-syne font-bold text-xl mb-1 text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary mb-4">{description}</p>
        <ul className="space-y-2 mt-auto">
          {features.map((f: string, i: number) => (
            <li key={i} className="flex items-center text-sm text-text-primary">
              <CheckCircle2 className={`h-4 w-4 mr-2 ${selected ? 'text-cyan-accent' : 'text-text-secondary'}`} />
              {f}
            </li>
          ))}
        </ul>
        {selected && (
          <div className="absolute bottom-6 left-6 flex items-center text-sm font-medium text-cyan-accent mt-4">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Selected
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
