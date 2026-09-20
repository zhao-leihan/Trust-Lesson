import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Shield,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock,
  ExternalLink,
  Sparkles,
  ArrowRight,
  GraduationCap,
  PlusCircle,
  X,
  Layers,
  Briefcase,
  Users,
  Check,
  BookOpen,
  Wallet,
  Video,
  Upload,
  Play,
  FileVideo,
  Trash2,
  DollarSign,
  Globe,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Pencil,
  Save,
} from "lucide-react";
import { LinkedinIcon, InstagramIcon, TwitterIcon } from "../components/SocialIcons";
import EscrowBadge from "../components/EscrowBadge";
import WalletConnectCard from "../components/WalletConnectCard";
import Footer from "../components/Footer";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-24">
        <div className="bg-white rounded-3xl p-8 text-center max-w-sm shadow-xl border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-4">
            <Lock size={26} />
          </div>
          <h2 className="text-slate-900 font-bold text-xl mb-1">Access Restricted</h2>
          <p className="text-slate-500 text-xs sm:text-sm mb-6">
            Please sign in to access your Trust lesson dashboard.
          </p>
          <Link
            to="/login"
            className="w-full inline-block py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-indigo-600 transition-all shadow-md shadow-slate-900/10"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="pt-24 sm:pt-28 pb-12 px-3 sm:px-6 flex-1">
        <div className="max-w-6xl mx-auto animate-fadeInUp">
          {user.role === "mentor" ? (
            <MentorDashboardView user={user} />
          ) : (
            <StudentDashboardView user={user} />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// =============================================================
// MENTOR DASHBOARD VIEW (With Section Navigation & Video Gigs)
// =============================================================
function MentorDashboardView({ user }) {
  const { courses, addCourse, portfolios, addPortfolioItem, deletePortfolioItem, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview"); // overview | courses | wallet | portfolio

  // Gig Creation Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [gigTitle, setGigTitle] = useState("");
  const [gigCategory, setGigCategory] = useState("Coding");
  const [gigPrice, setGigPrice] = useState("150");
  const [gigDuration, setGigDuration] = useState("4 Weeks (4 Milestones)");
  const [gigDescription, setGigDescription] = useState("");
  const [gigLevel, setGigLevel] = useState("All levels");
  const [gigColor, setGigColor] = useState("indigo");
  const [milestonesInput, setMilestonesInput] = useState([
    { title: "Milestone 1: Kickoff & Assessment", amount: 50 },
    { title: "Milestone 2: Execution & Code Auditing", amount: 50 },
    { title: "Milestone 3: Final Delivery & Review", amount: 50 },
  ]);

  // Video Upload State (Mandatory)
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [videoError, setVideoError] = useState("");

  // In-App Portfolio Form State
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [projectGithub, setProjectGithub] = useState("");
  const [projectTags, setProjectTags] = useState("React, Solidity, Web3");

  // Handle Video Upload Selection
  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if video file
    if (!file.type.startsWith("video/")) {
      setVideoError("Please select a valid video file (MP4, WebM, MOV).");
      return;
    }

    setVideoError("");
    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);
  };

  const handleRemoveVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
  };

  const handleAddMilestone = () => {
    setMilestonesInput((prev) => [
      ...prev,
      { title: `Milestone ${prev.length + 1}: Deliverable Review`, amount: 40 },
    ]);
  };

  const handleUpdateMilestone = (index, field, value) => {
    setMilestonesInput((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveMilestone = (index) => {
    if (milestonesInput.length <= 1) return;
    setMilestonesInput((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublishGig = async (e) => {
    e.preventDefault();
    if (!gigTitle.trim() || !gigDescription.trim()) {
      alert("Please fill in the gig title and description.");
      return;
    }

    // Mandatory video upload validation
    if (!videoFile && !videoPreviewUrl) {
      setVideoError("A video intro is mandatory. Please upload an intro video for this gig.");
      return;
    }

    const newGig = {
      id: `gig-${Date.now()}`,
      title: gigTitle,
      mentorName: user.name,
      mentorEmail: user.email,
      category: gigCategory,
      price: Number(gigPrice) || 120,
      duration: gigDuration,
      description: gigDescription,
      level: gigLevel,
      color: gigColor,
      milestones: milestonesInput,
      hasVideoIntro: true,
      videoFileName: videoFile?.name || "gig_intro.mp4",
      videoDuration: "02:00",
      videoUrl: videoPreviewUrl, // Excluded from DB schema, preserved in memory
    };

    await addCourse(newGig);

    // Reset Form
    setGigTitle("");
    setGigDescription("");
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setShowCreateModal(false);
    setActiveTab("courses");
  };

  // Add Portfolio Item
  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    if (!projectTitle.trim() || !projectDescription.trim()) {
      alert("Please provide project title and description.");
      return;
    }

    await addPortfolioItem({
      title: projectTitle,
      description: projectDescription,
      projectUrl,
      githubUrl: projectGithub,
      tags: projectTags.split(",").map((t) => t.trim()).filter(Boolean),
    });

    setProjectTitle("");
    setProjectDescription("");
    setProjectUrl("");
    setProjectGithub("");
    setShowAddProjectModal(false);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-6">
      {/* Mentor Workspace Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs flex items-center gap-1">
              <Shield size={13} /> Verified Mentor Hub
            </span>
          </div>
          <h1 className="text-slate-900 font-extrabold text-2xl sm:text-3xl">
            {user.name}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {user.domain || "Web3 & Software Engineering Mentorship"}
          </p>
        </div>

        {/* Quick Gig Creation Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>Create New Gig</span>
        </button>
      </div>

      {/* Mentor Section Sub-Navbar */}
      <div className="flex items-center gap-1 sm:gap-2 p-1 bg-slate-100/80 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "overview"
              ? "bg-white text-purple-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers size={14} />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "courses"
              ? "bg-white text-purple-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BookOpen size={14} />
          <span>Courses & Gigs</span>
        </button>

        <button
          onClick={() => setActiveTab("wallet")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "wallet"
              ? "bg-white text-purple-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Wallet size={14} />
          <span>Escrow Wallet</span>
        </button>

        <button
          onClick={() => setActiveTab("portfolio")}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "portfolio"
              ? "bg-white text-purple-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Briefcase size={14} />
          <span>Portfolio & Bio</span>
        </button>
      </div>

      {/* SECTION 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <WalletConnectCard />

          {/* Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5">
              <TrendingUp size={18} className="text-indigo-600 mb-1" />
              <p className="text-indigo-900/60 text-xs font-semibold">Monthly Earnings</p>
              <p className="text-indigo-950 font-extrabold text-2xl mt-1">$2,480</p>
              <p className="text-emerald-600 font-semibold text-[11px] mt-1">+18% vs last month</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5">
              <Lock size={18} className="text-amber-600 mb-1" />
              <p className="text-amber-900/60 text-xs font-semibold">In Escrow Pool</p>
              <p className="text-amber-950 font-extrabold text-2xl mt-1">$540</p>
              <p className="text-amber-700/80 text-[11px] mt-1">4 sessions pending</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5">
              <Sparkles size={18} className="text-emerald-600 mb-1" />
              <p className="text-emerald-900/60 text-xs font-semibold">Reputation Score</p>
              <p className="text-emerald-950 font-extrabold text-2xl mt-1">99 / 100</p>
              <p className="text-emerald-700/80 text-[11px] mt-1">Top 1% Mentor Rating</p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-purple-50 border border-slate-200 rounded-2xl p-5">
              <Clock size={18} className="text-purple-600 mb-1" />
              <p className="text-slate-500 text-xs font-semibold">Hourly Rate</p>
              <p className="text-slate-900 font-extrabold text-2xl mt-1">${user.hourlyRate || "35"}</p>
              <p className="text-purple-600 font-semibold text-[11px] mt-1">Adjustable in settings</p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Published Courses & Gigs</h4>
                <p className="text-slate-500 text-xs mt-0.5">{courses.length} packages active on marketplace</p>
              </div>
              <button
                onClick={() => setActiveTab("courses")}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors"
              >
                Manage Gigs
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Portfolio Showcase</h4>
                <p className="text-slate-500 text-xs mt-0.5">{portfolios.length} projects documented on your profile</p>
              </div>
              <button
                onClick={() => setActiveTab("portfolio")}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
              >
                Write Portfolio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: COURSES & GIGS (With Mandatory Video) */}
      {activeTab === "courses" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-slate-900 font-extrabold text-lg">My Active Gigs & Courses</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Packages with video verification available for students to book.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Create New Gig</span>
            </button>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-300 hover:shadow-sm transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        {course.category}
                      </span>
                      <span className="text-sm font-extrabold text-slate-900">${course.price}</span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base mb-1.5">{course.title}</h3>
                    <p className="text-slate-600 text-xs line-clamp-2 mb-3">{course.description}</p>

                    {/* Video Badge / Preview */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                          <FileVideo size={14} />
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold text-xs">
                            {course.videoFileName || "Intro Video Preview.mp4"}
                          </p>
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={10} /> Video Verified
                          </span>
                        </div>
                      </div>

                      {course.videoUrl && (
                        <a
                          href={course.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 flex items-center gap-1"
                        >
                          <Play size={11} />
                          <span>Watch</span>
                        </a>
                      )}
                    </div>

                    {/* Milestones count */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-2 border-t border-slate-200">
                      <span>{course.duration}</span>
                      <span>•</span>
                      <span>{course.milestones?.length || 3} Escrow Milestones</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <p className="text-slate-800 font-bold text-sm">You have not published any gigs yet</p>
              <p className="text-slate-500 text-xs mt-1 mb-4">
                Publish a milestone-based gig with video intro to start accepting student bookings.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Create First Gig
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: ESCROW WALLET */}
      {activeTab === "wallet" && (
        <div className="space-y-6">
          <WalletConnectCard />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <p className="text-emerald-900/60 text-xs font-semibold">Available for Payout</p>
              <p className="text-emerald-950 font-extrabold text-3xl mt-1">$1,940.00</p>
              <p className="text-emerald-700 text-[11px] mt-1 font-medium">Auto-disbursable to Arbitrum wallet</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
              <p className="text-amber-900/60 text-xs font-semibold">Locked in Escrow</p>
              <p className="text-amber-950 font-extrabold text-3xl mt-1">$540.00</p>
              <p className="text-amber-700 text-[11px] mt-1 font-medium">Released on milestone confirmations</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
              <p className="text-indigo-900/60 text-xs font-semibold">Lifetime Earnings</p>
              <p className="text-indigo-950 font-extrabold text-3xl mt-1">$8,320.00</p>
              <p className="text-indigo-700 text-[11px] mt-1 font-medium">100% On-chain record</p>
            </div>
          </div>

          {/* Transaction Ledger */}
          <div>
            <h3 className="font-extrabold text-slate-900 text-base mb-3">Escrow Disbursements & Releases</h3>
            <div className="space-y-2.5">
              {[
                { id: "tx-1", student: "Alex Chen", gig: "Arbitrum Audit Sprint", amount: "$150.00", status: "Released", date: "Today", tx: "0x8fa...92a" },
                { id: "tx-2", student: "Maria Gonzalez", gig: "Solidity Mentorship", amount: "$70.00", status: "Released", date: "Yesterday", tx: "0x3c1...b01" },
                { id: "tx-3", student: "David Kim", gig: "Fullstack SaaS Milestone 1", amount: "$50.00", status: "Locked", date: "3 days ago", tx: "0xee4...691" },
              ].map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{item.gig}</p>
                    <p className="text-slate-500 text-[11px]">Student: {item.student} • {item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-900">{item.amount}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === "Released" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: PORTFOLIO & BIO */}
      {activeTab === "portfolio" && (
        <div className="space-y-6">
          {/* Profile Overview */}
          <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
            <h3 className="font-extrabold text-slate-900 text-base mb-1">Mentor Bio & Social Credentials</h3>
            <p className="text-slate-600 text-xs mb-4 leading-relaxed">{user.bio || "Hands-on, project-based mentorship."}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                  <LinkedinIcon className="w-3.5 h-3.5 fill-current" />
                  <span>LinkedIn Profile</span>
                </a>
              )}
              {user.twitter && (
                <a href={user.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                  <TwitterIcon className="w-3.5 h-3.5 fill-current" />
                  <span>X / Twitter</span>
                </a>
              )}
              {user.portfolio && (
                <a href={user.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                  <Globe size={13} />
                  <span>External Portfolio</span>
                </a>
              )}
            </div>
          </div>

          {/* In-App Portfolio Writer */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">In-App Portfolio Showcase</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Write and showcase projects directly inside your Trust lesson profile.
              </p>
            </div>
            <button
              onClick={() => setShowAddProjectModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Add Portfolio Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolios.map((proj) => (
              <div key={proj.id} className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-purple-300 transition-colors">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-extrabold text-slate-900 text-base">{proj.title}</h4>
                    <button
                      onClick={() => deletePortfolioItem(proj.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed mb-3">{proj.description}</p>

                  {/* Tech stack tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.tags?.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-xs font-semibold">
                  {proj.projectUrl && (
                    <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline flex items-center gap-1">
                      <span>Live Demo</span>
                      <ArrowUpRight size={12} />
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-slate-600 hover:underline flex items-center gap-1">
                      <span>Repository</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE GIG MODAL (With Mandatory Video Upload) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full my-8 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-slate-900 font-extrabold text-xl">Create New Gig / Course</h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Package your knowledge with mandatory video intro and escrow milestones.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePublishGig} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Gig Title *</label>
                <input
                  type="text"
                  required
                  value={gigTitle}
                  onChange={(e) => setGigTitle(e.target.value)}
                  placeholder="e.g. Fullstack Web3 Smart Contract Audit Sprint"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">Category</label>
                  <select
                    value={gigCategory}
                    onChange={(e) => setGigCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs"
                  >
                    <option value="Coding">Coding & Software</option>
                    <option value="Web3 & Crypto">Web3 & Crypto</option>
                    <option value="Design">UI/UX & Product Design</option>
                    <option value="Career">Career & Mentorship</option>
                    <option value="AI & Data">AI & Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">Total Price ($USD) *</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={gigPrice}
                    onChange={(e) => setGigPrice(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={gigDescription}
                  onChange={(e) => setGigDescription(e.target.value)}
                  placeholder="Explain what the student will build, outcomes, and code reviews..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs"
                />
              </div>

              {/* MANDATORY VIDEO UPLOAD SECTION */}
              <div className="p-4 bg-purple-50/70 rounded-2xl border-2 border-dashed border-purple-300">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-900 font-extrabold text-xs flex items-center gap-1.5">
                    <Video size={15} className="text-purple-600" />
                    <span>Mandatory Video Intro Upload *</span>
                  </label>
                  <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    Required
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mb-3">
                  Upload an intro or overview video showing what you will teach. Students verify your communication style before booking.
                </p>

                {videoPreviewUrl ? (
                  <div className="space-y-2">
                    <video
                      controls
                      src={videoPreviewUrl}
                      className="w-full h-44 rounded-xl bg-black object-cover shadow-inner"
                    />
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-bold text-purple-900 truncate max-w-[200px]">
                        {videoFile?.name || "gig_video.mp4"}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        className="text-rose-600 hover:text-rose-700 font-bold text-[11px]"
                      >
                        Remove / Replace Video
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="flex flex-col items-center justify-center p-6 border border-purple-200 bg-white rounded-xl cursor-pointer hover:bg-purple-50/50 transition-colors">
                      <Upload size={24} className="text-purple-500 mb-2" />
                      <span className="text-xs font-bold text-purple-900">Click to upload video file</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">MP4, WebM, MOV supported</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {videoError && (
                  <p className="text-rose-600 text-[11px] font-bold mt-2 flex items-center gap-1">
                    <AlertTriangle size={12} /> {videoError}
                  </p>
                )}
              </div>

              {/* Milestones */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-700 font-bold text-xs">Escrow Milestones</label>
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="text-purple-600 hover:text-purple-800 text-xs font-bold"
                  >
                    + Add Milestone
                  </button>
                </div>
                <div className="space-y-2">
                  {milestonesInput.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => handleUpdateMilestone(idx, "title", e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 text-xs"
                      />
                      <div className="flex items-center gap-1 bg-slate-100 px-2 py-1.5 rounded-lg">
                        <span className="text-slate-500 text-xs font-bold">$</span>
                        <input
                          type="number"
                          value={m.amount}
                          onChange={(e) => handleUpdateMilestone(idx, "amount", Number(e.target.value))}
                          className="w-12 bg-transparent text-slate-900 font-bold text-xs"
                        />
                      </div>
                      {milestonesInput.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Publish Verified Gig
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PORTFOLIO MODAL */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-purple-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-slate-900 font-extrabold text-lg">Add Portfolio Project</h3>
              <button onClick={() => setShowAddProjectModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPortfolio} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Arbitrum Multi-Sig Escrow Protocol"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Project Summary & Impact *</label>
                <textarea
                  required
                  rows={3}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="What was built, technical hurdles, and outcomes..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://myproject.app"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">GitHub / Code URL</label>
                  <input
                    type="url"
                    value={projectGithub}
                    onChange={(e) => setProjectGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={projectTags}
                  onChange={(e) => setProjectTags(e.target.value)}
                  placeholder="Solidity, Arbitrum, React, TypeScript"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// STUDENT DASHBOARD VIEW (With Section Navigation)
// =============================================================
function StudentDashboardView({ user }) {
  const { sessions, updateSessionStatus } = useAuth();
  const [activeTab, setActiveTab] = useState("overview"); // overview | courses | wallet | profile

  const handleConfirmDone = (sessionId) => {
    updateSessionStatus(sessionId, "released");
  };

  const handleReportProblem = (sessionId) => {
    updateSessionStatus(sessionId, "disputed");
  };

  const activeEscrowAmount = sessions
    .filter((s) => s.status === "locked" || s.status === "in-session")
    .reduce((sum, s) => sum + (Number(s.price) || 0), 0);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-6">
      {/* Student Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1">
              <GraduationCap size={13} /> Student Workspace
            </span>
          </div>
          <h1 className="text-slate-900 font-extrabold text-2xl sm:text-3xl">
            Welcome back, {user.name}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Track your active learning milestones and escrow deposit protection.
          </p>
        </div>

        <Link
          to="/explore"
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-purple-600 transition-all flex items-center gap-2 shadow-sm"
        >
          <span>Explore Mentors & Gigs</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Student Section Sub-Navbar */}
      <div className="flex items-center gap-1 sm:gap-2 p-1 bg-slate-100/80 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "overview"
              ? "bg-white text-emerald-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers size={14} />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "courses"
              ? "bg-white text-emerald-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BookOpen size={14} />
          <span>My Courses ({sessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("wallet")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "wallet"
              ? "bg-white text-emerald-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Wallet size={14} />
          <span>Escrow Wallet</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "profile"
              ? "bg-white text-emerald-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users size={14} />
          <span>Profile</span>
        </button>
      </div>

      {/* STUDENT TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <WalletConnectCard />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5">
              <p className="text-indigo-900/60 text-xs font-semibold">Active Bookings</p>
              <p className="text-indigo-950 font-extrabold text-3xl mt-1">{sessions.length}</p>
              <p className="text-indigo-700/70 text-[11px] mt-1">Sessions & gigs underway</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5">
              <p className="text-amber-900/60 text-xs font-semibold">Funds Secured in Escrow</p>
              <p className="text-amber-950 font-extrabold text-3xl mt-1">${activeEscrowAmount}</p>
              <p className="text-amber-700/70 text-[11px] mt-1">Released only upon confirmation</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5">
              <p className="text-emerald-900/60 text-xs font-semibold">Escrow Protection</p>
              <p className="text-emerald-950 font-extrabold text-3xl mt-1">100% Protected</p>
              <p className="text-emerald-700/70 text-[11px] mt-1">Auto-mediated resolution pool</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Review Enrolled Milestones</h4>
              <p className="text-slate-500 text-xs mt-0.5">Check progress and confirm deliverables for your mentor.</p>
            </div>
            <button
              onClick={() => setActiveTab("courses")}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
            >
              View Enrolled
            </button>
          </div>
        </div>
      )}

      {/* STUDENT TAB 2: MY COURSES */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-900 font-extrabold text-lg">My Booked Sessions & Gigs</h2>
            <Link to="/explore" className="text-emerald-600 hover:text-emerald-700 text-xs font-bold">
              + Browse Marketplace
            </Link>
          </div>

          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {s.type === "course" ? "Milestone Gig" : "1-on-1 Session"}
                        </span>
                        <h3 className="text-slate-900 font-bold text-base">{s.skill}</h3>
                      </div>
                      <p className="text-slate-600 text-xs mt-1">
                        Mentor: <span className="font-semibold text-indigo-600">{s.mentor}</span>
                      </p>
                    </div>
                    <EscrowBadge status={s.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar size={13} className="text-indigo-600" />
                      {s.date}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock size={13} className="text-indigo-600" />
                      {s.time}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      ${s.price} Total Escrow
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-1">
                    {["Locked", "In Progress", "Released"].map((step, idx) => {
                      const steps = ["locked", "in-session", "released", "disputed"];
                      const currentIdx = steps.indexOf(s.status);
                      const isActive = idx <= (currentIdx === 3 ? 2 : currentIdx);
                      return (
                        <div key={step} className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full ${
                              isActive
                                ? s.status === "released"
                                  ? "bg-emerald-500"
                                  : "bg-indigo-600"
                                : "bg-transparent"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase">
                    <span>1. Escrow Deposited</span>
                    <span>2. Deliverables Underway</span>
                    <span>3. Verified & Released</span>
                  </div>

                  {/* Action Buttons */}
                  {(s.status === "locked" || s.status === "in-session") && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => handleConfirmDone(s.id)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <CheckCircle size={14} />
                        Confirm Goals Completed & Release Escrow
                      </button>
                      <button
                        onClick={() => handleReportProblem(s.id)}
                        className="px-4 py-2.5 rounded-xl bg-white text-rose-600 font-semibold text-xs border border-rose-200 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <AlertTriangle size={14} />
                        Open Dispute
                      </button>
                    </div>
                  )}

                  {s.status === "released" && (
                    <p className="text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle size={14} />
                      Milestone verified complete. Funds released to mentor.
                    </p>
                  )}

                  {s.status === "disputed" && (
                    <p className="text-rose-700 text-xs font-bold flex items-center gap-1.5">
                      <AlertTriangle size={14} />
                      Dispute escalated to Trust lesson decentralized jury.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <p className="text-slate-800 font-bold text-sm">No active bookings yet</p>
              <p className="text-slate-500 text-xs mt-1 mb-4">
                Explore expert mentors and enroll in milestone gigs with escrow protection.
              </p>
              <Link
                to="/explore"
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs inline-block hover:bg-purple-600 transition-colors"
              >
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>
      )}

      {/* STUDENT TAB 3: ESCROW WALLET */}
      {activeTab === "wallet" && (
        <div className="space-y-6">
          <WalletConnectCard />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
              <p className="text-amber-900/60 text-xs font-semibold">Active Escrow Deposits</p>
              <p className="text-amber-950 font-extrabold text-3xl mt-1">${activeEscrowAmount}</p>
              <p className="text-amber-700 text-[11px] mt-1 font-medium">Locked safely until your explicit confirmation</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <p className="text-emerald-900/60 text-xs font-semibold">Smart Contract Guarantee</p>
              <p className="text-emerald-950 font-extrabold text-3xl mt-1">100% Refundable</p>
              <p className="text-emerald-700 text-[11px] mt-1 font-medium">Full refund if mentor fails milestone terms</p>
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-slate-900 text-base mb-3">Deposit & Release Ledger</h3>
            <div className="space-y-2.5">
              {sessions.map((s) => (
                <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{s.skill}</p>
                    <p className="text-slate-500 text-[11px]">Mentor: {s.mentor} • {s.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-900">${s.price}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.status === "released" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {s.status === "released" ? "Released" : "Escrow Locked"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT TAB 4: PROFILE */}
      {activeTab === "profile" && (
        <StudentProfileEditor user={user} sessions={sessions} />
      )}
    </div>
  );
}

function StudentProfileEditor({ user, sessions }) {
  const { updateUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formName, setFormName] = useState(user.name || "");
  const [formBio, setFormBio] = useState(user.bio || "");
  const [formDomain, setFormDomain] = useState(user.domain || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateUserProfile({ name: formName, bio: formBio, domain: formDomain });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header Card */}
      <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
          {user.name?.[0]?.toUpperCase() || "S"}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-slate-900 text-lg">{user.name}</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Learner
            </span>
            {saved && (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold animate-fadeIn">
                Profile saved
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-0.5">{user.email}</p>
          <p className="text-slate-400 text-[11px] mt-1">Joined Trust lesson • {user.joinedDate || "September 2026"}</p>
        </div>

        <button
          onClick={() => setEditing((e) => !e)}
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Pencil size={13} />
          <span>{editing ? "Cancel Edit" : "Edit Profile"}</span>
        </button>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 animate-slideDown">
          <h4 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
            Edit Your Profile
          </h4>

          <div>
            <label className="block text-slate-700 font-bold text-xs mb-1">Display Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold text-xs mb-1">Learning Goals / Bio</label>
            <textarea
              rows={3}
              value={formBio}
              onChange={(e) => setFormBio(e.target.value)}
              placeholder="Describe your learning goals, interests, and what you hope to achieve..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold text-xs mb-1">Primary Learning Domain</label>
            <select
              value={formDomain}
              onChange={(e) => setFormDomain(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs"
            >
              <option value="Frontend & Web Engineering">Frontend & Web Engineering</option>
              <option value="Web3 & Smart Contracts">Web3 & Smart Contracts</option>
              <option value="UI/UX & Product Design">UI/UX & Product Design</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Career & Leadership Coaching">Career & Leadership Coaching</option>
              <option value="Mobile App Development">Mobile App Development</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Save size={13} />
            <span>Save Profile</span>
          </button>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
          <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
            <Sparkles size={14} className="text-purple-600" />
            <span>Learning Focus Areas</span>
          </h4>
          <p className="text-slate-500 text-xs mb-3">{formDomain || user.domain || "Not set yet"}</p>
          <div className="flex flex-wrap gap-2">
            {["Smart Contracts", "Fullstack React", "AI Engineering", "Product Design"].map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
          <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
            <Award size={14} className="text-emerald-600" />
            <span>Milestone Credentials</span>
          </h4>
          <p className="text-emerald-700 font-extrabold text-2xl mt-1">
            {sessions.filter((s) => s.status === "released").length}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Verified learning milestones recorded on Arbitrum.
          </p>
        </div>
      </div>

      {formBio && (
        <div className="p-5 bg-white rounded-2xl border border-slate-200 animate-fadeIn">
          <h4 className="font-bold text-slate-900 text-sm mb-2">About Me</h4>
          <p className="text-slate-600 text-xs leading-relaxed">{formBio}</p>
        </div>
      )}
    </div>
  );
}
