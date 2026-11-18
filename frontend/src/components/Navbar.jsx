import React, { useState } from "react";
import {
  Menu,
  X,
  PlusCircle,
  LogOut,
  Sparkles,
  Home,
  Compass,
  UserPlus,
  Ticket,
  LayoutDashboard,
  QrCode,
  CalendarCheck,
} from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onOpenCreateEvent,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Strict RBAC Navigation Items
  const studentNavItems = [
    { id: "home", label: "Home Feed", icon: Home },
    { id: "explore", label: "Explore Events", icon: Compass },
    { id: "teamsync", label: "Team Maker", icon: UserPlus },
    { id: "tickets", label: "My Tickets", icon: Ticket },
  ];

  const adminNavItems = [
    { id: "admin_dashboard", label: "Admin Console", icon: LayoutDashboard },
    { id: "admin_scanner", label: "Gate Scanner", icon: QrCode },
    { id: "explore", label: "Event Operations", icon: CalendarCheck },
  ];

  const currentNavItems = user?.role === "Admin" ? adminNavItems : studentNavItems;

  return (
    <header className="sticky top-0 z-50 bg-[#161412]/95 backdrop-blur-md border-b-2 border-[#2c2824]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0"
          onClick={() => setActiveTab(user?.role === "Admin" ? "admin_dashboard" : "home")}
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#ff4d2e]/15 border-2 border-[#ff4d2e]/40 flex items-center justify-center text-[#ff4d2e] shadow-md">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-headline text-lg sm:text-2xl font-extrabold tracking-tight text-[#fcfaf6]">
                Utsav<span className="text-[#ff4d2e]">Hub</span>
              </span>
              <span
                className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider ${
                  user?.role === "Admin"
                    ? "bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40"
                    : "bg-[#ff4d2e]/20 text-[#ff4d2e] border border-[#ff4d2e]/40"
                }`}
              >
                {user?.role === "Admin" ? "ADMIN" : "COLLEGIATE"}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-stone-400 hidden sm:block truncate max-w-[200px]">
              {user?.college || "IET Lucknow"} • {user?.role === "Admin" ? "Gate Operations" : "Student Circuit"}
            </span>
          </div>
        </div>

        {/* Center: Desktop / Tablet Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-[#23201c] p-1.5 rounded-2xl border-2 border-[#38332d] shadow-inner">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3.5 xl:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? user?.role === "Admin"
                      ? "bg-[#f59e0b] text-stone-950 font-extrabold shadow-sm"
                      : "bg-[#ff4d2e] text-white shadow-sm"
                    : "text-stone-300 hover:text-white hover:bg-[#2c2824]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Admin Publish Event Button (Visible on sm+) */}
          {user?.role === "Admin" && (
            <button
              onClick={onOpenCreateEvent}
              className="hidden md:flex items-center gap-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-stone-950 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-extrabold shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Event</span>
            </button>
          )}

          {/* User Profile Pill */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 sm:gap-2 bg-[#23201c] hover:bg-[#2c2824] p-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl border sm:border-2 border-[#38332d] transition-colors text-left"
          >
            <div
              className={`w-7 h-7 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                user?.role === "Admin"
                  ? "bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40"
                  : "bg-[#ff4d2e]/20 text-[#ff4d2e] border border-[#ff4d2e]/40"
              }`}
            >
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold text-stone-200 leading-tight truncate max-w-[110px]">
                {user?.name || "User"}
              </span>
              <span className="text-[10px] text-[#f59e0b] font-mono leading-tight truncate max-w-[110px]">
                {user?.role} • {user?.branch || user?.designation || "Campus"}
              </span>
            </div>
          </button>

          {/* Logout button */}
          <button
            onClick={onLogout}
            title="Log out"
            className="p-1.5 sm:p-2 rounded-xl bg-[#23201c] text-stone-400 hover:text-white hover:bg-[#2c2824] border border-[#38332d] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile / Tablet Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-[#23201c] text-stone-300 hover:text-white border border-[#38332d]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1a1815] border-b-2 border-[#2c2824] px-4 py-3 space-y-1.5 shadow-2xl animate-slide-in">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                  isActive
                    ? user?.role === "Admin"
                      ? "bg-[#f59e0b] text-stone-950 font-extrabold"
                      : "bg-[#ff4d2e] text-white"
                    : "text-stone-300 hover:bg-[#23201c]"
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {user?.role === "Admin" && (
            <button
              onClick={() => {
                onOpenCreateEvent();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-stone-950 font-extrabold py-3 rounded-xl text-xs sm:text-sm mt-2 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish New Event</span>
            </button>
          )}

          {/* User Details Pill for Mobile */}
          <div className="pt-2 border-t border-[#2c2824] mt-2 flex items-center justify-between text-[11px] text-stone-400">
            <span>Signed in as: <strong className="text-stone-200">{user?.name}</strong></span>
            <span className="font-mono text-[#f59e0b]">{user?.role}</span>
          </div>
        </div>
      )}
    </header>
  );
}
