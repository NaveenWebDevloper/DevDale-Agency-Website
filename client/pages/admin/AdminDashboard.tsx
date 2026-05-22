import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BUDGET_RANGES, PROJECT_TYPES } from "../Book";
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Clock,
  Users,
  Database,
  Bell,
  LogOut,
  Search,
  Download,
  Filter,
  Plus,
  Trash2,
  Edit3,
  TrendingUp,
  Briefcase,
  DollarSign,
  Award,
  AlertCircle,
  Video,
  X,
  Check,
  ChevronRight,
  Shield,
  Clock3,
  CalendarDays,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// Interfaces
interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEAM_MEMBER";
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Navigation: "dashboard" | "bookings" | "leads" | "services" | "availability" | "team" | "logs"
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  
  // Data States
  const [metrics, setMetrics] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modular Component States
  // Bookings list states
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingFilterStatus, setBookingFilterStatus] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingsPagination, setBookingsPagination] = useState<any>({ page: 1, pages: 1 });
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: "", timeSlot: "", reason: "" });
  const [cancelReason, setCancelReason] = useState("");

  // CRM Leads states
  const [leads, setLeads] = useState<any[]>([]);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadFilterStatus, setLeadFilterStatus] = useState("");
  const [leadsPagination, setLeadsPagination] = useState<any>({ page: 1, pages: 1 });
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<any>(null);
  const [leadNotesText, setLeadNotesText] = useState("");
  const [showManualLeadModal, setShowManualLeadModal] = useState(false);
  const [manualLeadData, setManualLeadData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    budgetRange: "",
    projectType: "",
  });

  // Services states
  const [services, setServices] = useState<any[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedServiceForEdit, setSelectedServiceForEdit] = useState<any>(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: "",
    duration: 30,
    price: 0,
    meetingType: "Google Meet",
    colorTag: "indigo",
    bufferTime: 15,
    description: "",
    isEnabled: true,
  });

  // Availability & Blocked dates states
  const [availabilitySetup, setAvailabilitySetup] = useState<any>(null);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");

  // Team states
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamFormData, setTeamFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "TEAM_MEMBER",
  });

  // System Logs states
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [logsPagination, setLogsPagination] = useState<any>({ page: 1, pages: 1 });

  // Verification & Auto redirection
  useEffect(() => {
    const token = localStorage.getItem("devdale_token");
    const userStr = localStorage.getItem("devdale_user");
    if (!token || !userStr) {
      toast.error("Please login to proceed.");
      navigate("/admin/login");
      return;
    }
    setCurrentUser(JSON.parse(userStr));
  }, [navigate]);

  // General Dashboard loader
  const loadDashboardData = async () => {
    const token = localStorage.getItem("devdale_token");
    if (!token) return;

    try {
      const res = await fetch("/api/analytics/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Dashboard fetch failed.");
      const data = await res.json();
      setMetrics(data.metrics);
      setCharts(data.charts);
      setUpcomingMeetings(data.upcomingMeetings || []);
      setRecentActivity(data.recentActivity || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Notification Loader
  const loadNotifications = async () => {
    const token = localStorage.getItem("devdale_token");
    if (!token) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadNotifications(data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dispatchers & Actions
  const handleMarkAllNotificationsRead = async () => {
    const token = localStorage.getItem("devdale_token");
    if (!token) return;
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Notification tray cleared.");
        loadNotifications();
      }
    } catch (err) {
      toast.error("Failed to clear notifications.");
    }
  };

  // Unified Data Loading Hook on activeTab
  useEffect(() => {
    if (!currentUser) return;
    
    setLoading(true);
    
    const loadTabSpecificData = async () => {
      const token = localStorage.getItem("devdale_token");
      if (!token) return;

      try {
        if (activeTab === "dashboard") {
          await loadDashboardData();
          await loadNotifications();
        } 
        else if (activeTab === "bookings") {
          const res = await fetch(
            `/api/bookings?status=${bookingFilterStatus}&search=${bookingSearch}&page=${bookingsPagination.page}&limit=10`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          setBookings(data.bookings || []);
          setBookingsPagination(data.pagination || { page: 1, pages: 1 });
        } 
        else if (activeTab === "leads") {
          const res = await fetch(
            `/api/leads?status=${leadFilterStatus}&search=${leadSearch}&page=${leadsPagination.page}&limit=10`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          setLeads(data.leads || []);
          setLeadsPagination(data.pagination || { page: 1, pages: 1 });
        } 
        else if (activeTab === "services") {
          const res = await fetch("/api/services?all=true", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setServices(data.services || []);
        } 
        else if (activeTab === "availability") {
          const setupRes = await fetch("/api/availability/setup", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const setupData = await setupRes.json();
          setAvailabilitySetup(setupData.availability);

          const blockedRes = await fetch("/api/availability/blocked-dates", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const blockedData = await blockedRes.json();
          setBlockedDates(blockedData.blockedDates || []);
        } 
        else if (activeTab === "team") {
          const res = await fetch("/api/team", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setTeamMembers(data.team || []);
        } 
        else if (activeTab === "logs") {
          const res = await fetch(`/api/activity-logs?page=${logsPagination.page}&limit=20`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setAuditLogs(data.logs || []);
          setLogsPagination(data.pagination || { page: 1, pages: 1 });
        }
      } catch (err) {
        toast.error("Failed to load section data.");
      } finally {
        setLoading(false);
      }
    };

    loadTabSpecificData();
  }, [activeTab, bookingFilterStatus, bookingSearch, bookingsPagination.page, leadFilterStatus, leadSearch, leadsPagination.page, logsPagination.page, currentUser]);

  // Log out helper
  const handleLogout = async () => {
    const token = localStorage.getItem("devdale_token");
    const refresh = localStorage.getItem("devdale_refresh");
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });
    } catch (err) {}
    localStorage.clear();
    toast.success("Secure session terminated.");
    navigate("/admin/login");
  };

  // CSV Export Trigger
  const handleCSVExport = () => {
    const token = localStorage.getItem("devdale_token");
    if (!token) return;
    window.open(`/api/bookings/export?token=${token}`, "_blank");
    toast.success("CSV spreadsheet download dispatched.");
  };

  // Reschedule Action
  const handleRescheduleSubmit = async () => {
    if (!selectedBookingDetails || !rescheduleData.date || !rescheduleData.timeSlot) {
      toast.error("Schedule variables required.");
      return;
    }
    const token = localStorage.getItem("devdale_token");
    try {
      const res = await fetch(`/api/bookings/${selectedBookingDetails._id}/reschedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: rescheduleData.date,
          timeSlot: rescheduleData.timeSlot,
          rescheduleReason: rescheduleData.reason,
        }),
      });
      if (!res.ok) throw new Error("Slot unavailable or reschedule failed.");
      toast.success("briefing rescheduled successfully!");
      setShowRescheduleModal(false);
      setSelectedBookingDetails(null);
      // Reload active tab
      setActiveTab("dashboard");
      setTimeout(() => setActiveTab("bookings"), 10);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Cancellation Action
  const handleCancelSubmit = async () => {
    if (!selectedBookingDetails) return;
    const token = localStorage.getItem("devdale_token");
    try {
      const res = await fetch(`/api/bookings/${selectedBookingDetails._id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cancellationReason: cancelReason }),
      });
      if (!res.ok) throw new Error("Cancellation request failed.");
      toast.success("Briefing cancelled successfully.");
      setShowCancelModal(false);
      setSelectedBookingDetails(null);
      setActiveTab("dashboard");
      setTimeout(() => setActiveTab("bookings"), 10);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // CRM Lead Updates
  const handleLeadStatusChange = async (leadId: string, status: string) => {
    const token = localStorage.getItem("devdale_token");
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Prospect status updated: ${status}`);
        // Reload leads list
        setLeads(leads.map((l) => (l._id === leadId ? { ...l, status } : l)));
        if (selectedLeadDetails && selectedLeadDetails._id === leadId) {
          const detailed = await res.json();
          setSelectedLeadDetails(detailed.lead);
        }
      }
    } catch (err) {
      toast.error("Failed to update CRM status.");
    }
  };

  // CRM Lead note appends
  const handleAddLeadNote = async () => {
    if (!selectedLeadDetails || !leadNotesText) return;
    const token = localStorage.getItem("devdale_token");
    try {
      const res = await fetch(`/api/leads/${selectedLeadDetails._id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note: leadNotesText }),
      });
      if (res.ok) {
        toast.success("Note appended to history.");
        const data = await res.json();
        setSelectedLeadDetails(data.lead);
        setLeadNotesText("");
      }
    } catch (err) {
      toast.error("Failed to append note.");
    }
  };

  // CRM Lead manual capture
  const handleManualLeadCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("devdale_token");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(manualLeadData),
      });
      if (res.ok) {
        toast.success("manual lead capture successfully.");
        setShowManualLeadModal(false);
        setManualLeadData({
          name: "",
          email: "",
          phone: "",
          company: "",
          message: "",
          budgetRange: "",
          projectType: "",
        });
        // refresh leads tab
        setActiveTab("dashboard");
        setTimeout(() => setActiveTab("leads"), 10);
      }
    } catch (err) {
      toast.error("Manual capture failed.");
    }
  };

  // Services CRUD Action
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("devdale_token");
    const method = selectedServiceForEdit ? "PUT" : "POST";
    const endpoint = selectedServiceForEdit
      ? `/api/services/${selectedServiceForEdit._id}`
      : "/api/services";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(serviceFormData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Service save failed.");
      }

      toast.success("Service catalog updated.");
      setShowServiceModal(false);
      setSelectedServiceForEdit(null);
      // Reload services list
      setActiveTab("dashboard");
      setTimeout(() => setActiveTab("services"), 10);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Availability schedule setup update
  const handleAvailabilitySetupSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("devdale_token");
    try {
      const res = await fetch("/api/availability/setup", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timezone: availabilitySetup.timezone,
          workingDays: availabilitySetup.workingDays,
          bookingLimitsPerDay: availabilitySetup.bookingLimitsPerDay,
        }),
      });
      if (res.ok) {
        toast.success("Availability limits and timezones saved.");
      }
    } catch (err) {
      toast.error("Failed to update availability configs.");
    }
  };

  // Provision holiday date blockout
  const handleBlockedDateCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate) return;
    const token = localStorage.getItem("devdale_token");
    try {
      const res = await fetch("/api/availability/blocked-dates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: newBlockDate, reason: newBlockReason, isGlobal: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Blocked date creation failed.");
      }
      toast.success("Calendar blocked date configured.");
      setNewBlockDate("");
      setNewBlockReason("");
      // reload blocked list
      const blockedRes = await fetch("/api/availability/blocked-dates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blockedData = await blockedRes.json();
      setBlockedDates(blockedData.blockedDates || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Release blocked date
  const handleBlockedDateDelete = async (blockId: string) => {
    const token = localStorage.getItem("devdale_token");
    try {
      const res = await fetch(`/api/availability/blocked-dates/${blockId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Blocked date released.");
        setBlockedDates(blockedDates.filter((b) => b._id !== blockId));
      }
    } catch (err) {
      toast.error("Failed to release blocked date.");
    }
  };

  // Workload team onboarding
  const handleTeamOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("devdale_token");
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(teamFormData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Team registration failed.");
      }
      toast.success(`Onboarded ${teamFormData.name} successfully.`);
      setShowTeamModal(false);
      setTeamFormData({ name: "", email: "", password: "", role: "TEAM_MEMBER" });
      // reload team tab
      setActiveTab("dashboard");
      setTimeout(() => setActiveTab("team"), 10);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Offboard team member
  const handleTeamMemberDelete = async (memberId: string) => {
    if (memberId === currentUser?.id) {
      toast.error("You cannot delete your own account.");
      return;
    }
    const token = localStorage.getItem("devdale_token");
    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Team member successfully offboarded.");
        setTeamMembers(teamMembers.filter((t) => t._id !== memberId));
      }
    } catch (err) {
      toast.error("Failed to offboard team member.");
    }
  };

  // Color Mapping helpers
  const getColorTagClass = (color: string) => {
    const maps: Record<string, string> = {
      emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      zinc: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    };
    return maps[color] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  };

  const getLeadStatusClass = (status: string) => {
    const maps: Record<string, string> = {
      New: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Contacted: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      Qualified: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      "Proposal Sent": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      Won: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      Lost: "bg-red-500/10 text-red-400 border-red-500/20",
      Archived: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    };
    return maps[status] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex select-none selection:bg-white selection:text-black">
      {/* Background blurs */}
      <div className="absolute top-[5%] left-[10%] w-[350px] h-[350px] bg-zinc-900/5 rounded-full blur-[100px] pointer-events-none" />

      {/* 1. SIDEBAR */}
      <aside className="w-64 border-r border-zinc-900 bg-neutral-950/70 backdrop-blur-md flex flex-col justify-between shrink-0 relative z-20">
        <div>
          {/* Header branding */}
          <div className="h-16 px-6 border-b border-zinc-900 flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-white" />
            <span className="text-sm font-black tracking-widest text-white uppercase">DEVDALE OS</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 border border-zinc-800 rounded bg-zinc-900/50 text-zinc-500">
              V1.0
            </span>
          </div>

          {/* Tab Navigation links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-white text-black font-semibold shadow-md shadow-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Control Panel
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                activeTab === "bookings"
                  ? "bg-white text-black font-semibold shadow-md shadow-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
              }`}
            >
              <Calendar className="w-4 h-4" /> Briefings
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                activeTab === "leads"
                  ? "bg-white text-black font-semibold shadow-md shadow-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
              }`}
            >
              <Briefcase className="w-4 h-4" /> CRM Leads
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                activeTab === "services"
                  ? "bg-white text-black font-semibold shadow-md shadow-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
              }`}
            >
              <Layers className="w-4 h-4" /> Service Catalog
            </button>
            <button
              onClick={() => setActiveTab("availability")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                activeTab === "availability"
                  ? "bg-white text-black font-semibold shadow-md shadow-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
              }`}
            >
              <Clock className="w-4 h-4" /> Availability Setup
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                activeTab === "team"
                  ? "bg-white text-black font-semibold shadow-md shadow-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
              }`}
            >
              <Users className="w-4 h-4" /> Workload Team
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                activeTab === "logs"
                  ? "bg-white text-black font-semibold shadow-md shadow-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
              }`}
            >
              <Database className="w-4 h-4" /> Audit Trails
            </button>
          </nav>
        </div>

        {/* Footer profile log out */}
        <div className="p-4 border-t border-zinc-900">
          <div className="flex justify-between items-center gap-3 bg-zinc-900/30 border border-zinc-900 p-3 rounded-xl mb-3">
            <div className="overflow-hidden">
              <span className="text-xs font-bold block text-white truncate">
                {currentUser?.name || "DevDale Admin"}
              </span>
              <span className="text-[10px] font-medium text-zinc-500 uppercase block tracking-wider mt-0.5">
                {currentUser?.role || "ADMIN"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900/55 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> END SECURE SESSION
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB */}
      <div className="flex-1 flex flex-col min-w-0 bg-neutral-950 overflow-y-auto">
        {/* HEADER BAR */}
        <header className="h-16 border-b border-zinc-900 bg-neutral-950/40 backdrop-blur-md px-8 flex justify-between items-center shrink-0 sticky top-0 z-10">
          <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1.5">
            <span>AGENCY OS</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
            <span className="text-white">{activeTab.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Real-time Notifications Bell indicator */}
            <button
              onClick={() => {
                setShowNotificationDrawer(!showNotificationDrawer);
                loadNotifications();
              }}
              className="p-2 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-400 hover:text-white bg-zinc-950/30 transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-black font-bold text-[9px] flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* NOTIFICATION DRAWER VIEW PANEL */}
        {showNotificationDrawer && (
          <div className="bg-zinc-950 border-b border-zinc-900 p-6 flex flex-col gap-4 relative z-30 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 animate-bounce" /> Real-time System Alerts
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleMarkAllNotificationsRead}
                  className="text-xs px-2.5 py-1 border border-zinc-800 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                >
                  Mark all read
                </button>
                <button
                  onClick={() => setShowNotificationDrawer(false)}
                  className="p-1 text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="max-h-[250px] overflow-y-auto pr-2 space-y-2.5">
              {notifications.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-6 font-light">No new system alerts.</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-3 rounded-lg border text-xs flex justify-between items-center ${
                      n.isRead
                        ? "border-zinc-900 bg-zinc-950 text-zinc-500"
                        : "border-zinc-800 bg-zinc-900/20 text-zinc-200"
                    }`}
                  >
                    <div>
                      <strong className="block text-white font-semibold">{n.title}</strong>
                      <span className="block mt-0.5 font-light">{n.message}</span>
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={async () => {
                          const token = localStorage.getItem("devdale_token");
                          await fetch(`/api/notifications/${n._id}`, {
                            method: "PATCH",
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          loadNotifications();
                        }}
                        className="p-1 rounded border border-zinc-800 hover:border-white transition-colors cursor-pointer text-zinc-400 hover:text-white"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* WORKSPACE CONTENT AREA */}
        <div className="flex-1 p-8">
          <AnimatePresence mode="wait">
            
            {/* VIEW A: CONTROL DASHBOARD CONTROL PANEL */}
            {activeTab === "dashboard" && metrics && charts && (
              <m.div
                key="tab-dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* 1. Six metrics cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5">
                    <span className="text-zinc-500 text-[10px] tracking-wider uppercase block font-bold">
                      REVENUE PIPELINE
                    </span>
                    <span className="text-xl md:text-2xl font-black block mt-2 text-white">
                      ${metrics.revenuePipeline.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5">
                    <span className="text-zinc-500 text-[10px] tracking-wider uppercase block font-bold">
                      TOTAL BOOKINGS
                    </span>
                    <span className="text-xl md:text-2xl font-black block mt-2 text-white">
                      {metrics.totalBookings}
                    </span>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5">
                    <span className="text-zinc-500 text-[10px] tracking-wider uppercase block font-bold">
                      TODAY BRIEFINGS
                    </span>
                    <span className="text-xl md:text-2xl font-black block mt-2 text-white">
                      {metrics.todaysMeetings}
                    </span>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5">
                    <span className="text-zinc-500 text-[10px] tracking-wider uppercase block font-bold">
                      PENDING LEADS
                    </span>
                    <span className="text-xl md:text-2xl font-black block mt-2 text-white">
                      {metrics.pendingLeads}
                    </span>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5">
                    <span className="text-zinc-500 text-[10px] tracking-wider uppercase block font-bold">
                      CONVERSION RATE
                    </span>
                    <span className="text-xl md:text-2xl font-black block mt-2 text-white">
                      {metrics.conversionRate}%
                    </span>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5">
                    <span className="text-zinc-500 text-[10px] tracking-wider uppercase block font-bold">
                      MONTHLY VELOCITY
                    </span>
                    <span className="text-xl md:text-2xl font-black block mt-2 text-white flex items-center gap-1">
                      {metrics.monthlyGrowth >= 0 ? "+" : ""}
                      {metrics.monthlyGrowth}%
                    </span>
                  </div>
                </div>

                {/* 2. Charts blocks (Recharts) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Bookings / Leads monthly area trend */}
                  <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6 lg:col-span-2">
                    <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-6">
                      Briefings & CRM Prospect Volume Trends (6 Months)
                    </h3>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={charts.monthlyTrends}>
                          <defs>
                            <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" stroke="#3f3f46" fontSize={11} />
                          <YAxis stroke="#3f3f46" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#18181b" }} />
                          <Area type="monotone" dataKey="bookings" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" name="Meetings Booked" />
                          <Area type="monotone" dataKey="leads" stroke="#71717a" strokeWidth={1.5} fillOpacity={0} name="Leads Captured" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Service demand distribution pie chart */}
                  <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6">
                    <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-6">
                      Core Service Shares
                    </h3>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={charts.serviceDemand}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {charts.serviceDemand.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#ffffff" : "#3f3f46"} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#18181b" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* 3. Upcoming briefings & logs tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Briefings checklist */}
                  <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
                        Upcoming Briefings Schedule
                      </h3>
                      <button
                        onClick={() => setActiveTab("bookings")}
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        All Briefs <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-3.5">
                      {upcomingMeetings.length === 0 ? (
                        <p className="text-xs text-zinc-500 py-12 text-center font-light">No upcoming briefings.</p>
                      ) : (
                        upcomingMeetings.map((b) => (
                          <div
                            key={b._id}
                            className="p-4 border border-zinc-900 hover:border-zinc-800 rounded-xl bg-zinc-950/40 flex justify-between items-center"
                          >
                            <div>
                              <strong className="text-sm block text-white">{b.customerName}</strong>
                              <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-1 font-light">
                                <Clock className="w-3 h-3" /> {new Date(b.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })} at {b.timeSlot}
                              </span>
                            </div>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 border rounded border-zinc-800 bg-zinc-900">
                              {b.serviceId?.name || "Service"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent system logs */}
                  <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
                        Recent System Audits
                      </h3>
                      <button
                        onClick={() => setActiveTab("logs")}
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        Full Audits <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {recentActivity.length === 0 ? (
                        <p className="text-xs text-zinc-500 py-12 text-center font-light">No logged activity logs.</p>
                      ) : (
                        recentActivity.map((log) => (
                          <div key={log._id} className="text-xs border-b border-zinc-900 pb-2.5 last:border-0 flex justify-between items-start gap-4">
                            <div>
                              <strong className="text-zinc-300 font-medium block">{log.action}</strong>
                              <span className="text-[10px] text-zinc-500 block font-light mt-0.5">
                                User: {log.userId?.name || "Guest System Flow"}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-600 font-light">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </m.div>
            )}

            {/* VIEW B: BOOKINGS SPREADSHEET MANAGER */}
            {activeTab === "bookings" && (
              <m.div
                key="tab-bookings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Filters tools */}
                <div className="bg-zinc-900/20 border border-zinc-900 p-5 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex flex-1 items-center gap-3 relative max-w-sm">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3" />
                    <input
                      type="text"
                      placeholder="Search Client Name / Email / Org..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-xs outline-none focus:border-white transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-3.5">
                    <select
                      value={bookingFilterStatus}
                      onChange={(e) => setBookingFilterStatus(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs outline-none"
                    >
                      <option value="">All Statuses</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Pending">Pending</option>
                      <option value="Rescheduled">Rescheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={handleCSVExport}
                      className="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 hover:border-white rounded-lg text-xs font-bold bg-zinc-950 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV SPREADSHEET
                    </button>
                  </div>
                </div>

                {/* Table list */}
                <div className="bg-zinc-900/10 border border-zinc-900 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-900/30 border-b border-zinc-900 text-zinc-500 text-[10px] tracking-wider uppercase font-bold">
                        <th className="p-4">Customer Name</th>
                        <th className="p-4">Service Brief</th>
                        <th className="p-4">Schedule Date</th>
                        <th className="p-4">Time Slot</th>
                        <th className="p-4">CRM Class</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-zinc-500 font-light">
                            No briefing logs located matching query parameters.
                          </td>
                        </tr>
                      ) : (
                        bookings.map((b) => (
                          <tr key={b._id} className="border-b border-zinc-900 hover:bg-zinc-900/10 transition-colors">
                            <td className="p-4">
                              <strong className="block text-white font-semibold">{b.customerName}</strong>
                              <span className="text-[10px] text-zinc-500 block font-light mt-0.5">{b.customerEmail}</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 border rounded text-[10px] font-bold ${getColorTagClass(b.serviceId?.colorTag)}`}>
                                {b.serviceId?.name || "Service Deleted"}
                              </span>
                            </td>
                            <td className="p-4 font-light text-zinc-300">
                              {new Date(b.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                timeZone: "UTC",
                              })}
                            </td>
                            <td className="p-4 text-white font-semibold flex items-center gap-1.5 mt-2.5">
                              <Clock className="w-3.5 h-3.5 text-zinc-600" /> {b.timeSlot} (UTC)
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black tracking-wider uppercase ${getLeadStatusClass(b.status)}`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedBookingDetails(b)}
                                className="px-3 py-1.5 border border-zinc-800 hover:border-white hover:bg-zinc-950/40 rounded text-[10px] font-bold transition-colors cursor-pointer text-zinc-300"
                              >
                                View / Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Pagination strip */}
                  {bookingsPagination.pages > 1 && (
                    <div className="p-4 border-t border-zinc-900 bg-zinc-950/20 flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-light">Page {bookingsPagination.page} of {bookingsPagination.pages}</span>
                      <div className="flex gap-2">
                        <button
                          disabled={bookingsPagination.page === 1}
                          onClick={() => setBookingsPagination({ ...bookingsPagination, page: bookingsPagination.page - 1 })}
                          className="px-3 py-1.5 border border-zinc-800 hover:border-white rounded transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer text-xs"
                        >
                          Prev
                        </button>
                        <button
                          disabled={bookingsPagination.page === bookingsPagination.pages}
                          onClick={() => setBookingsPagination({ ...bookingsPagination, page: bookingsPagination.page + 1 })}
                          className="px-3 py-1.5 border border-zinc-800 hover:border-white rounded transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer text-xs"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Single Booking view inspector drawer */}
                {selectedBookingDetails && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50">
                    <m.div
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      className="w-full max-w-lg bg-zinc-950 border-l border-zinc-900 p-8 flex flex-col justify-between overflow-y-auto"
                    >
                      <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                          <h3 className="text-sm font-black uppercase tracking-wider">Appointment Specs</h3>
                          <button
                            onClick={() => setSelectedBookingDetails(null)}
                            className="p-1 rounded hover:bg-zinc-900/50 cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-4 text-xs">
                          <div>
                            <span className="text-zinc-500 uppercase tracking-widest block font-bold text-[9px]">Client Profile</span>
                            <strong className="text-base text-white block mt-1">{selectedBookingDetails.customerName}</strong>
                            <span className="text-zinc-400 block mt-0.5">{selectedBookingDetails.customerEmail}</span>
                            {selectedBookingDetails.customerCompany && (
                              <span className="text-zinc-400 block mt-0.5">Org: {selectedBookingDetails.customerCompany}</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-y border-zinc-900 py-4">
                            <div>
                              <span className="text-zinc-500 uppercase tracking-widest block font-bold text-[9px]">Target Date</span>
                              <span className="text-white font-medium block mt-1">
                                {new Date(selectedBookingDetails.date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  timeZone: "UTC",
                                })}
                              </span>
                            </div>
                            <div>
                              <span className="text-zinc-500 uppercase tracking-widest block font-bold text-[9px]">Time Slot</span>
                              <span className="text-white font-semibold block mt-1">{selectedBookingDetails.timeSlot} (UTC)</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-zinc-500 uppercase tracking-widest block font-bold text-[9px]">Budget range</span>
                              <span className="text-white font-medium block mt-1">{selectedBookingDetails.budgetRange || "Not specified"}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 uppercase tracking-widest block font-bold text-[9px]">Project Type</span>
                              <span className="text-white font-medium block mt-1">{selectedBookingDetails.projectType || "Not specified"}</span>
                            </div>
                          </div>

                          {selectedBookingDetails.googleMeetLink && (
                            <div className="border border-zinc-900 bg-zinc-950 p-4 rounded-xl flex justify-between items-center">
                              <div>
                                <span className="text-zinc-500 font-bold block text-[9px] uppercase tracking-wider">Access Coordinates</span>
                                <span className="text-white font-medium truncate block max-w-[200px] mt-0.5">
                                  {selectedBookingDetails.googleMeetLink}
                                </span>
                              </div>
                              <a
                                href={selectedBookingDetails.googleMeetLink}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded bg-white text-black font-bold text-[10px] hover:bg-zinc-200 transition-colors flex items-center gap-1"
                              >
                                <Video className="w-3 h-3" /> JOIN
                              </a>
                            </div>
                          )}

                          <div>
                            <span className="text-zinc-500 uppercase tracking-widest block font-bold text-[9px]">Notes Captured</span>
                            <p className="text-zinc-300 bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg mt-1 font-light leading-relaxed">
                              {selectedBookingDetails.notes || "No client notes entered."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Operations buttons */}
                      <div className="space-y-2.5 pt-6 border-t border-zinc-900 mt-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowRescheduleModal(true)}
                            className="flex-1 py-3 border border-zinc-800 hover:border-white bg-zinc-950 transition-colors text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => setShowCancelModal(true)}
                            className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-900/20 text-zinc-300 transition-colors text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Cancel Session
                          </button>
                        </div>
                        <button
                          onClick={async () => {
                            if (confirm("Delete permanently?")) {
                              const token = localStorage.getItem("devdale_token");
                              await fetch(`/api/bookings/${selectedBookingDetails._id}`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              toast.success("Booking record erased.");
                              setSelectedBookingDetails(null);
                              setActiveTab("dashboard");
                              setTimeout(() => setActiveTab("bookings"), 10);
                            }
                          }}
                          className="w-full py-3 bg-red-950 border border-red-900/50 hover:bg-red-900/20 text-red-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Erase Record
                        </button>
                      </div>
                    </m.div>
                  </div>
                )}

                {/* Sub-modal: Reschedule booking */}
                {showRescheduleModal && selectedBookingDetails && (
                  <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider">Update Briefing Schedule</h3>
                      
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-zinc-500 font-bold mb-1">NEW DATE (YYYY-MM-DD)</label>
                          <input
                            type="date"
                            value={rescheduleData.date}
                            onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 font-bold mb-1">TIME SLOT (HH:MM)</label>
                          <input
                            type="text"
                            placeholder="14:30"
                            value={rescheduleData.timeSlot}
                            onChange={(e) => setRescheduleData({ ...rescheduleData, timeSlot: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 font-bold mb-1">CHANGE MOTIVE</label>
                          <textarea
                            placeholder="Operational shifts..."
                            value={rescheduleData.reason}
                            onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white resize-none"
                            rows={2}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          onClick={() => setShowRescheduleModal(false)}
                          className="px-3 py-1.5 border border-zinc-800 rounded text-xs"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleRescheduleSubmit}
                          className="px-4 py-1.5 bg-white text-black font-bold rounded text-xs"
                        >
                          Apply Schedule
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-modal: Cancel booking */}
                {showCancelModal && selectedBookingDetails && (
                  <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-red-400">Cancel briefing session</h3>
                      
                      <div>
                        <label className="block text-zinc-500 text-xs font-bold mb-1">CANCELLATION REASON</label>
                        <textarea
                          placeholder="Client schedule conflicts..."
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white resize-none"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          onClick={() => setShowCancelModal(false)}
                          className="px-3 py-1.5 border border-zinc-800 rounded text-xs"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleCancelSubmit}
                          className="px-4 py-1.5 bg-red-900 hover:bg-red-800 text-white font-bold rounded text-xs"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </m.div>
            )}

            {/* VIEW C: CRM PROSPECT PIPELINE MANAGER */}
            {activeTab === "leads" && (
              <m.div
                key="tab-leads"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* CRM Controls header */}
                <div className="bg-zinc-900/20 border border-zinc-900 p-5 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex flex-1 items-center gap-3 relative max-w-sm">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3" />
                    <input
                      type="text"
                      placeholder="Search Prospect, email, org..."
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-xs outline-none focus:border-white transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={leadFilterStatus}
                      onChange={(e) => setLeadFilterStatus(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs outline-none"
                    >
                      <option value="">All CRM Stages</option>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                    </select>

                    <button
                      onClick={() => setShowManualLeadModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white text-black font-bold rounded-lg text-xs hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> CAPTURE LEAD
                    </button>
                  </div>
                </div>

                {/* CRM List grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leads.length === 0 ? (
                    <div className="col-span-full bg-zinc-900/10 border border-zinc-900 border-dashed p-12 text-center text-zinc-500 font-light text-xs">
                      No CRM prospect files located matching active queries.
                    </div>
                  ) : (
                    leads.map((l) => (
                      <div
                        key={l._id}
                        className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-5 hover:border-zinc-800 transition-colors flex flex-col justify-between h-56"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] text-zinc-500 block font-bold uppercase tracking-wider">
                              Score: {l.score} / 100
                            </span>
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase ${getLeadStatusClass(l.status)}`}>
                              {l.status}
                            </span>
                          </div>

                          <strong className="text-base text-white font-bold block truncate">{l.name}</strong>
                          <span className="text-[10px] text-zinc-500 block font-light truncate mt-0.5">{l.email}</span>
                          
                          {l.company && (
                            <span className="text-xs text-zinc-400 block font-semibold mt-2.5">
                              Org: {l.company}
                            </span>
                          )}
                          <p className="text-xs text-zinc-400 font-light truncate mt-2 leading-relaxed">
                            {l.message}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-zinc-900 pt-4 mt-4">
                          <select
                            value={l.status}
                            onChange={(e) => handleLeadStatusChange(l._id, e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-[10px] outline-none"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Proposal Sent">Proposal Sent</option>
                            <option value="Won">Won</option>
                            <option value="Lost">Lost</option>
                            <option value="Archived">Archived</option>
                          </select>

                          <button
                            onClick={() => setSelectedLeadDetails(l)}
                            className="text-xs text-white hover:underline font-bold cursor-pointer"
                          >
                            Inspect Profile →
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Lead inspect drawer detail panel */}
                {selectedLeadDetails && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50">
                    <m.div
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      className="w-full max-w-lg bg-zinc-950 border-l border-zinc-900 p-8 flex flex-col justify-between overflow-y-auto"
                    >
                      <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                          <h3 className="text-sm font-black uppercase tracking-wider">Prospect Profile Sheet</h3>
                          <button
                            onClick={() => setSelectedLeadDetails(null)}
                            className="p-1 rounded hover:bg-zinc-900/50 cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-5 text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <strong className="text-xl text-white font-bold block">{selectedLeadDetails.name}</strong>
                              <span className="text-zinc-500 block mt-0.5">{selectedLeadDetails.email}</span>
                              {selectedLeadDetails.phone && (
                                <span className="text-zinc-500 block mt-0.5">Ph: {selectedLeadDetails.phone}</span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Lead score</span>
                              <span className="text-lg font-black text-white block mt-1">{selectedLeadDetails.score} / 100</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-y border-zinc-900 py-4">
                            <div>
                              <span className="text-zinc-500 uppercase tracking-widest block font-bold text-[9px]">Budget</span>
                              <span className="text-white block font-medium mt-1">{selectedLeadDetails.budgetRange || "Under $5k"}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 uppercase tracking-widest block font-bold text-[9px]">Category</span>
                              <span className="text-white block font-medium mt-1">{selectedLeadDetails.projectType || "General Consultation"}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-zinc-500 uppercase tracking-widest block font-bold text-[9px]">Initial Prospect Inquiry</span>
                            <p className="text-zinc-300 bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg mt-1 font-light leading-relaxed">
                              {selectedLeadDetails.message}
                            </p>
                          </div>

                          {/* Notes timeline list */}
                          <div>
                            <span className="text-zinc-500 uppercase tracking-widest block font-bold text-[9px] mb-2.5">Pipeline Timeline</span>
                            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
                              {selectedLeadDetails.activityTimeline?.map((act: any, index: number) => (
                                <div key={index} className="p-3 border border-zinc-900 bg-zinc-950/30 rounded-lg text-[11px]">
                                  <div className="flex justify-between items-center mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                    <span>{act.action}</span>
                                    <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-zinc-300 font-light">{act.note}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Append note */}
                          <div className="space-y-2 pt-2 border-t border-zinc-900">
                            <span className="text-zinc-500 uppercase tracking-widest block font-bold text-[9px]">Append Operational Note</span>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Write notes to history..."
                                value={leadNotesText}
                                onChange={(e) => setLeadNotesText(e.target.value)}
                                className="flex-1 bg-zinc-950 border border-zinc-900 rounded p-2 text-xs outline-none"
                              />
                              <button
                                onClick={handleAddLeadNote}
                                className="px-3 bg-white text-black font-bold text-xs rounded cursor-pointer"
                              >
                                Add Note
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Deletions for ROOT ADMIN only */}
                      {currentUser?.role === "ADMIN" && (
                        <div className="pt-6 border-t border-zinc-900 mt-6">
                          <button
                            onClick={async () => {
                              if (confirm("Delete permanently from database CRM logs?")) {
                                const token = localStorage.getItem("devdale_token");
                                await fetch(`/api/leads/${selectedLeadDetails._id}`, {
                                  method: "DELETE",
                                  headers: { Authorization: `Bearer ${token}` },
                                });
                                toast.success("CRM Prospect logs erased.");
                                setSelectedLeadDetails(null);
                                setActiveTab("dashboard");
                                setTimeout(() => setActiveTab("leads"), 10);
                              }
                            }}
                            className="w-full py-3 bg-red-950 border border-red-900/50 hover:bg-red-900/20 text-red-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            Erase CRM Prospect Sheet
                          </button>
                        </div>
                      )}
                    </m.div>
                  </div>
                )}

                {/* Sub-modal: Manual Lead Capture form */}
                {showManualLeadModal && (
                  <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                      <h3 className="text-sm font-bold uppercase tracking-wider">Manual CRM Lead Capture</h3>
                      <form onSubmit={handleManualLeadCreate} className="space-y-3.5 text-xs">
                        <div>
                          <label className="block text-zinc-500 font-bold mb-1">PROSPECT NAME *</label>
                          <input
                            type="text"
                            required
                            placeholder="Alex Jones"
                            value={manualLeadData.name}
                            onChange={(e) => setManualLeadData({ ...manualLeadData, name: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 font-bold mb-1">EMAIL ADDRESS *</label>
                          <input
                            type="email"
                            required
                            placeholder="alex@org.com"
                            value={manualLeadData.email}
                            onChange={(e) => setManualLeadData({ ...manualLeadData, email: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 font-bold mb-1">ORGANIZATION</label>
                          <input
                            type="text"
                            placeholder="Alex Corp"
                            value={manualLeadData.company}
                            onChange={(e) => setManualLeadData({ ...manualLeadData, company: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 font-bold mb-1">BUDGET TIER</label>
                          <select
                            value={manualLeadData.budgetRange}
                            onChange={(e) => setManualLeadData({ ...manualLeadData, budgetRange: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                          >
                            <option value="">Select Tier</option>
                            {BUDGET_RANGES.map((r: string) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-zinc-500 font-bold mb-1">CLASSIFICATION</label>
                          <select
                            value={manualLeadData.projectType}
                            onChange={(e) => setManualLeadData({ ...manualLeadData, projectType: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                          >
                            <option value="">Select Category</option>
                            {PROJECT_TYPES.map((p: string) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-zinc-500 font-bold mb-1">OPERATION SCRIBE BRIEF *</label>
                          <textarea
                            required
                            placeholder="Blueprints scopes..."
                            value={manualLeadData.message}
                            onChange={(e) => setManualLeadData({ ...manualLeadData, message: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white resize-none"
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setShowManualLeadModal(false)}
                            className="px-3 py-1.5 border border-zinc-800 rounded text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-white text-black font-bold rounded text-xs"
                          >
                            Log Lead Profile
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </m.div>
            )}

            {/* VIEW D: SERVICE CATALOG CRUD PANEL */}
            {activeTab === "services" && (
              <m.div
                key="tab-services"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header tools */}
                <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                  <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    Agency Offerings Catalog
                  </h3>
                  {currentUser?.role === "ADMIN" && (
                    <button
                      onClick={() => {
                        setSelectedServiceForEdit(null);
                        setServiceFormData({
                          name: "",
                          duration: 30,
                          price: 0,
                          meetingType: "Google Meet",
                          colorTag: "indigo",
                          bufferTime: 15,
                          description: "",
                          isEnabled: true,
                        });
                        setShowServiceModal(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white text-black font-bold rounded-lg text-xs hover:bg-zinc-200 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> ADD SERVICE OFFER
                    </button>
                  )}
                </div>

                {/* Catalog grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service._id}
                      className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-5 hover:border-zinc-800 transition-colors flex flex-col justify-between h-48"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase tracking-wider ${getColorTagClass(service.colorTag)}`}>
                            {service.meetingType}
                          </span>
                          <span className="text-xs font-black text-white">
                            {service.price ? `$${service.price.toLocaleString()}` : "Complimentary"}
                          </span>
                        </div>

                        <strong className="text-base text-white font-bold block">{service.name}</strong>
                        <p className="text-xs text-zinc-400 font-light line-clamp-2 mt-1.5 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-zinc-900 mt-4">
                        <span className="text-[10px] text-zinc-500 font-light">
                          Duration: {service.duration} mins • Buffer: {service.bufferTime} mins
                        </span>
                        
                        <div className="flex gap-2">
                          {currentUser?.role === "ADMIN" && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedServiceForEdit(service);
                                  setServiceFormData({
                                    name: service.name,
                                    duration: service.duration,
                                    price: service.price || 0,
                                    meetingType: service.meetingType,
                                    colorTag: service.colorTag,
                                    bufferTime: service.bufferTime || 15,
                                    description: service.description || "",
                                    isEnabled: service.isEnabled,
                                  });
                                  setShowServiceModal(true);
                                }}
                                className="p-1.5 border border-zinc-800 hover:border-white rounded text-zinc-400 hover:text-white cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm("Delete service permanently?")) {
                                    const token = localStorage.getItem("devdale_token");
                                    await fetch(`/api/services/${service._id}`, {
                                      method: "DELETE",
                                      headers: { Authorization: `Bearer ${token}` },
                                    });
                                    toast.success("Service deleted.");
                                    setServices(services.filter((s) => s._id !== service._id));
                                  }
                                }}
                                className="p-1.5 border border-zinc-800 hover:border-red-400 rounded text-zinc-400 hover:text-red-400 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sub-modal: Service create/edit form */}
                {showServiceModal && (
                  <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider">
                        {selectedServiceForEdit ? "Edit Service Parameters" : "provision Service offering"}
                      </h3>
                      <form onSubmit={handleServiceSubmit} className="space-y-3.5 text-xs">
                        <div>
                          <label className="block text-zinc-500 font-bold mb-1">SERVICE NAME *</label>
                          <input
                            type="text"
                            required
                            placeholder="AI Consulting Call"
                            value={serviceFormData.name}
                            onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-zinc-500 font-bold mb-1">DURATION (MINS) *</label>
                            <input
                              type="number"
                              required
                              value={serviceFormData.duration}
                              onChange={(e) => setServiceFormData({ ...serviceFormData, duration: parseInt(e.target.value) })}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-500 font-bold mb-1">PRICE ($)</label>
                            <input
                              type="number"
                              value={serviceFormData.price}
                              onChange={(e) => setServiceFormData({ ...serviceFormData, price: parseInt(e.target.value) })}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-zinc-500 font-bold mb-1">MEETING TYPE</label>
                            <select
                              value={serviceFormData.meetingType}
                              onChange={(e) => setServiceFormData({ ...serviceFormData, meetingType: e.target.value })}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                            >
                              <option value="Google Meet">Google Meet</option>
                              <option value="Phone">Phone</option>
                              <option value="In Person">In Person</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-zinc-500 font-bold mb-1">COLOR TAG</label>
                            <select
                              value={serviceFormData.colorTag}
                              onChange={(e) => setServiceFormData({ ...serviceFormData, colorTag: e.target.value })}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                            >
                              <option value="indigo">Indigo</option>
                              <option value="emerald">Emerald</option>
                              <option value="rose">Rose</option>
                              <option value="amber">Amber</option>
                              <option value="purple">Purple</option>
                              <option value="zinc">Zinc</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-zinc-500 font-bold mb-1">DESCRIPTION</label>
                          <textarea
                            placeholder="Service guidelines..."
                            value={serviceFormData.description}
                            onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white resize-none"
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setShowServiceModal(false)}
                            className="px-3 py-1.5 border border-zinc-800 rounded text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-white text-black font-bold rounded text-xs"
                          >
                            Save service
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </m.div>
            )}

            {/* VIEW E: AVAILABILITY & BLOCKED CALENDARS SETUP */}
            {activeTab === "availability" && availabilitySetup && (
              <m.div
                key="tab-availability"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Working hours schedule settings */}
                <div className="bg-zinc-900/10 border border-zinc-900 p-6 rounded-2xl space-y-6">
                  <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold border-b border-zinc-900 pb-3">
                    Weekly Working Schedule (Host local)
                  </h3>
                  <form onSubmit={handleAvailabilitySetupSave} className="space-y-6 text-xs">
                    <div>
                      <label className="block text-zinc-500 font-bold mb-1">OPERATIONAL TIMEZONE</label>
                      <input
                        type="text"
                        value={availabilitySetup.timezone}
                        onChange={(e) => setAvailabilitySetup({ ...availabilitySetup, timezone: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 rounded p-2.5 w-full text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-500 font-bold mb-3">DAILY BOOKINGS UPPER LIMIT</label>
                      <input
                        type="number"
                        value={availabilitySetup.bookingLimitsPerDay}
                        onChange={(e) => setAvailabilitySetup({ ...availabilitySetup, bookingLimitsPerDay: parseInt(e.target.value) })}
                        className="bg-zinc-950 border border-zinc-800 rounded p-2.5 w-full text-white outline-none"
                      />
                    </div>

                    <div className="space-y-3.5">
                      <label className="block text-zinc-500 font-bold mb-1">WEEKLY ACTIVE HOURS WINDOWS</label>
                      
                      {availabilitySetup.workingDays?.map((wd: any) => {
                        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        return (
                          <div key={wd.day} className="flex justify-between items-center p-3 border border-zinc-900 bg-zinc-950/40 rounded-lg">
                            <span className="font-semibold">{dayNames[wd.day]}</span>
                            <div className="flex gap-2 items-center">
                              {wd.slots.length === 0 ? (
                                <span className="text-zinc-600 font-light italic">Out of office</span>
                              ) : (
                                wd.slots.map((slot: any, sIdx: number) => (
                                  <div key={sIdx} className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={slot.start}
                                      onChange={(e) => {
                                        const updatedDays = [...availabilitySetup.workingDays];
                                        updatedDays.find((d: any) => d.day === wd.day).slots[sIdx].start = e.target.value;
                                        setAvailabilitySetup({ ...availabilitySetup, workingDays: updatedDays });
                                      }}
                                      className="w-12 bg-zinc-950 border border-zinc-800 text-center rounded py-1"
                                    />
                                    <span className="text-zinc-600">-</span>
                                    <input
                                      type="text"
                                      value={slot.end}
                                      onChange={(e) => {
                                        const updatedDays = [...availabilitySetup.workingDays];
                                        updatedDays.find((d: any) => d.day === wd.day).slots[sIdx].end = e.target.value;
                                        setAvailabilitySetup({ ...availabilitySetup, workingDays: updatedDays });
                                      }}
                                      className="w-12 bg-zinc-950 border border-zinc-800 text-center rounded py-1"
                                    />
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      SAVE WORKING HOURS CONFIGS
                    </button>
                  </form>
                </div>

                {/* Date blockout calendar panel */}
                <div className="bg-zinc-900/10 border border-zinc-900 p-6 rounded-2xl space-y-6">
                  <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold border-b border-zinc-900 pb-3">
                    Holidays & Specific Date Blockouts
                  </h3>
                  
                  <form onSubmit={handleBlockedDateCreate} className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl space-y-3.5 text-xs">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Configure specific block date</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        required
                        value={newBlockDate}
                        onChange={(e) => setNewBlockDate(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 p-2 rounded text-white"
                      />
                      <input
                        type="text"
                        placeholder="Motive / Holiday Name..."
                        value={newBlockReason}
                        onChange={(e) => setNewBlockReason(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 p-2 rounded text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs font-bold transition-all cursor-pointer"
                    >
                      Provision Calendar Block
                    </button>
                  </form>

                  {/* list of blocked dates */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {blockedDates.length === 0 ? (
                      <p className="text-xs text-zinc-600 font-light italic py-12 text-center">No holidays configured.</p>
                    ) : (
                      blockedDates.map((block) => (
                        <div
                          key={block._id}
                          className="p-3 border border-zinc-900 bg-zinc-950/20 rounded-lg flex justify-between items-center text-xs"
                        >
                          <div>
                            <strong className="text-white block font-medium">
                              {new Date(block.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                timeZone: "UTC",
                              })}
                            </strong>
                            {block.reason && <span className="text-[10px] text-zinc-500 block font-light">{block.reason}</span>}
                          </div>
                          <button
                            onClick={() => handleBlockedDateDelete(block._id)}
                            className="p-1.5 border border-zinc-900 hover:border-red-400 rounded text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </m.div>
            )}

            {/* VIEW F: TEAM & STAFF WORKLOAD PANEL */}
            {activeTab === "team" && (
              <m.div
                key="tab-team"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Onboard staff header */}
                <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                  <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    Agency Workload Staff Directory
                  </h3>
                  {currentUser?.role === "ADMIN" && (
                    <button
                      onClick={() => setShowTeamModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white text-black font-bold rounded-lg text-xs hover:bg-zinc-200 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> ONBOARD STAFF
                    </button>
                  )}
                </div>

                {/* Team roster */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member._id}
                      className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-5 hover:border-zinc-800 transition-colors flex flex-col justify-between h-44"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] text-zinc-500 block font-bold uppercase tracking-wider">
                            Workload Sync: Active
                          </span>
                          <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 border rounded border-zinc-800 bg-zinc-900">
                            {member.role}
                          </span>
                        </div>

                        <strong className="text-base text-white font-bold block">{member.name}</strong>
                        <span className="text-xs text-zinc-400 block font-light truncate mt-0.5">{member.email}</span>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-zinc-900 mt-4">
                        <span className="text-[10px] text-zinc-600 font-light">
                          Created: {new Date(member.createdAt).toLocaleDateString()}
                        </span>
                        {currentUser?.role === "ADMIN" && member._id !== currentUser?.id && (
                          <button
                            onClick={() => handleTeamMemberDelete(member._id)}
                            className="p-1.5 border border-zinc-900 hover:border-red-400 rounded text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sub-modal: Onboard team form */}
                {showTeamModal && (
                  <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider">Register Agency Staff Profile</h3>
                      <form onSubmit={handleTeamOnboardSubmit} className="space-y-3.5 text-xs">
                        <div>
                          <label className="block text-zinc-500 font-bold mb-1">STAFF FULL NAME *</label>
                          <input
                            type="text"
                            required
                            placeholder="Sam Miller"
                            value={teamFormData.name}
                            onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 font-bold mb-1">EMAIL ADDRESS *</label>
                          <input
                            type="email"
                            required
                            placeholder="sam@devdale.com"
                            value={teamFormData.email}
                            onChange={(e) => setTeamFormData({ ...teamFormData, email: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 font-bold mb-1">PASSWORD *</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={teamFormData.password}
                            onChange={(e) => setTeamFormData({ ...teamFormData, password: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 font-bold mb-1">ROLE PERMISSIONS</label>
                          <select
                            value={teamFormData.role}
                            onChange={(e) => setTeamFormData({ ...teamFormData, role: e.target.value as any })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                          >
                            <option value="TEAM_MEMBER">TEAM_MEMBER (Staff)</option>
                            <option value="ADMIN">ADMIN (Root Access)</option>
                          </select>
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setShowTeamModal(false)}
                            className="px-3 py-1.5 border border-zinc-800 rounded text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-white text-black font-bold rounded text-xs"
                          >
                            Register Staff
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </m.div>
            )}

            {/* VIEW G: AUDIT TRAILS LOGGER LIST */}
            {activeTab === "logs" && (
              <m.div
                key="tab-logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-zinc-900/10 border border-zinc-900 rounded-2xl overflow-hidden"
              >
                <div className="p-5 border-b border-zinc-900 bg-zinc-900/20">
                  <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
                    Security Operations Audit Trails
                  </h3>
                </div>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-900/30 border-b border-zinc-900 text-zinc-500 text-[10px] tracking-wider uppercase font-bold">
                      <th className="p-4">Operation event</th>
                      <th className="p-4">Workload Operator</th>
                      <th className="p-4">IP Address</th>
                      <th className="p-4">Audit Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-light text-zinc-300">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-zinc-500">No audits located.</td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log._id} className="border-b border-zinc-900 hover:bg-zinc-900/10">
                          <td className="p-4">
                            <strong className="text-white font-semibold">{log.action}</strong>
                            <span className="block text-[10px] text-zinc-500 mt-0.5 truncate max-w-[300px]">
                              {JSON.stringify(log.details)}
                            </span>
                          </td>
                          <td className="p-4">
                            {log.userId ? (
                              <>
                                <strong className="text-zinc-200 font-medium block">{log.userId.name}</strong>
                                <span className="text-[9px] uppercase block tracking-wider mt-0.5 text-zinc-500">
                                  {log.userId.role}
                                </span>
                              </>
                            ) : (
                              <span className="text-zinc-500 italic">Guest Session</span>
                            )}
                          </td>
                          <td className="p-4 font-mono text-[10px] text-zinc-500">{log.ipAddress || "system"}</td>
                          <td className="p-4 text-zinc-400">
                            {new Date(log.createdAt).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination logs */}
                {logsPagination.pages > 1 && (
                  <div className="p-4 border-t border-zinc-900 bg-zinc-950/20 flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-light">Page {logsPagination.page} of {logsPagination.pages}</span>
                    <div className="flex gap-2">
                      <button
                        disabled={logsPagination.page === 1}
                        onClick={() => setLogsPagination({ ...logsPagination, page: logsPagination.page - 1 })}
                        className="px-3 py-1.5 border border-zinc-800 hover:border-white rounded transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer text-xs"
                      >
                        Prev
                      </button>
                      <button
                        disabled={logsPagination.page === logsPagination.pages}
                        onClick={() => setLogsPagination({ ...logsPagination, page: logsPagination.page + 1 })}
                        className="px-3 py-1.5 border border-zinc-800 hover:border-white rounded transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer text-xs"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
