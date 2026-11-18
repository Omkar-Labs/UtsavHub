import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import LandingHero from "./components/LandingHero";
import HomeShowcase from "./components/HomeShowcase";
import ExploreEvents from "./components/ExploreEvents";
import TeamSync from "./components/TeamSync";
import TicketPass from "./components/TicketPass";
import AdminGate from "./components/AdminGate";
import AuthModal from "./components/AuthModal";
import CreateEventModal from "./components/CreateEventModal";
import { initialEvents, initialTeams, initialTickets } from "./data/mockData";
import { eventsApi } from "./api/events";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./context/ToastContext";
import { Loader2 } from "lucide-react";

export default function App() {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("home");
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [teams, setTeams] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState("Student");
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);

  // Fetch all live events from backend
  const fetchAllEvents = useCallback(async () => {
    try {
      setIsLoadingEvents(true);
      const res = await eventsApi.getAll();
      if (res.success && Array.isArray(res.events) && res.events.length > 0) {
        setEvents(res.events);
      } else {
        // Fallback to initial events template if database is completely empty initially
        setEvents(initialEvents);
      }
    } catch (err) {
      console.warn("Backend events fetch fallback:", err.message);
      setEvents(initialEvents);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  // Adjust activeTab when user logs in or role is changed
  useEffect(() => {
    if (user) {
      if (user.role === "Admin" && (activeTab === "home" || activeTab === "teamsync" || activeTab === "tickets")) {
        setActiveTab("admin_dashboard");
      } else if (user.role === "Student" && (activeTab === "admin_dashboard" || activeTab === "admin_scanner")) {
        setActiveTab("home");
      }
    }
  }, [user]);

  // Handle Login Success Callback
  const handleLoginSuccess = (userData) => {
    if (userData.role === "Admin") {
      setActiveTab("admin_dashboard");
    } else {
      setActiveTab("home");
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    showToast("You have been signed out.", "info", "Logged Out");
    setActiveTab("home");
  };

  // Handle successful registration of an event
  const handleRegisterSuccess = (ticket) => {
    if (ticket) {
      setTickets((prev) => [ticket, ...prev]);
    }
    fetchAllEvents();
    setActiveTab("tickets");
  };

  // Handle newly published event from CreateEventModal
  const handleAddEvent = (newEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    fetchAllEvents();
    setActiveTab("explore");
  };

  // RBAC Navigation Guard
  const handleTabChange = (tabId) => {
    if (user?.role === "Student" && (tabId === "admin_dashboard" || tabId === "admin_scanner")) {
      setActiveTab("home");
      return;
    }
    if (user?.role === "Admin" && (tabId === "teamsync" || tabId === "tickets")) {
      setActiveTab("admin_dashboard");
      return;
    }
    setActiveTab(tabId);
  };

  // Session Initialization Loader
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center text-[#18181B]">
        <Loader2 className="w-10 h-10 text-[#E11D48] animate-spin mb-4" />
        <span className="font-headline font-bold text-lg tracking-wider text-[#18181B]">UtsavHub</span>
        <span className="text-xs text-[#71717A] mt-1">Verifying secure student &amp; admin session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#18181B] selection:bg-[#FFE4E6] selection:text-[#E11D48]">
      {/* 1. FIRST TIME / GUEST EXPERIENCE */}
      {!isAuthenticated ? (
        <LandingHero
          onStudentAuth={() => {
            setAuthModalRole("Student");
            setIsAuthModalOpen(true);
          }}
          onAdminAuth={() => {
            setAuthModalRole("Admin");
            setIsAuthModalOpen(true);
          }}
          onExploreGuest={() => {
            setAuthModalRole("Student");
            setIsAuthModalOpen(true);
          }}
        />
      ) : (
        /* 2. AUTHENTICATED EXPERIENCE (RBAC DRIVEN) */
        <>
          <Navbar
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            user={user}
            onOpenAuth={() => {
              setAuthModalRole(user.role);
              setIsAuthModalOpen(true);
            }}
            onOpenCreateEvent={() => setIsCreateEventModalOpen(true)}
            onLogout={handleLogout}
          />

          <main className="flex-1">
            {/* STUDENT VIEWS */}
            {user?.role === "Student" && (
              <>
                {activeTab === "home" && (
                  <HomeShowcase
                    events={events}
                    onSelectEvent={() => setActiveTab("explore")}
                    onNavigate={(tab) => handleTabChange(tab)}
                  />
                )}

                {activeTab === "explore" && (
                  <ExploreEvents
                    events={events}
                    user={user}
                    onRegisterSuccess={handleRegisterSuccess}
                    onNavigateToTeamSync={() => setActiveTab("teamsync")}
                  />
                )}

                {activeTab === "teamsync" && (
                  <TeamSync events={events} user={user} />
                )}

                {activeTab === "tickets" && (
                  <TicketPass tickets={tickets} user={user} />
                )}
              </>
            )}

            {/* ADMIN / ORGANIZER VIEWS */}
            {user?.role === "Admin" && (
              <>
                {activeTab === "admin_dashboard" && (
                  <AdminGate events={events} viewMode="dashboard" user={user} />
                )}

                {activeTab === "admin_scanner" && (
                  <AdminGate events={events} viewMode="scanner" user={user} />
                )}

                {activeTab === "explore" && (
                  <ExploreEvents
                    events={events}
                    user={user}
                    onRegisterSuccess={handleRegisterSuccess}
                    onNavigateToTeamSync={() => setActiveTab("teamsync")}
                  />
                )}
              </>
            )}
          </main>
        </>
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={authModalRole}
        onLoginSuccess={handleLoginSuccess}
      />

      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        onAddEvent={handleAddEvent}
        user={user}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#09090B] py-6 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-headline text-sm tracking-wide">UtsavHub</span>
            <span>•</span>
            <span>Collegiate Event &amp; Squad Platform</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
            <span>ICS 354 Mini Project</span>
            <span>•</span>
            <span>Dept. of CSE, IET Lucknow</span>
            <span>•</span>
            <span className="text-violet-400 font-medium">Domain-Protected Network</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
