import React, { useState } from 'react';

export default function Navbar({ activeTab, setActiveTab, user, onOpenAuth, onOpenCreateEvent, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Strict RBAC Navigation Items
  const studentNavItems = [
    { id: 'home', label: 'Home Feed', icon: 'home' },
    { id: 'explore', label: 'Explore Events', icon: 'explore' },
    { id: 'teamsync', label: 'Team Maker', icon: 'group_add' },
    { id: 'tickets', label: 'My Tickets', icon: 'confirmation_number' },
  ];

  const adminNavItems = [
    { id: 'admin_dashboard', label: 'Admin Console', icon: 'dashboard' },
    { id: 'admin_scanner', label: 'Gate Scanner', icon: 'qr_code_scanner' },
    { id: 'explore', label: 'Event Operations', icon: 'event_available' },
  ];

  const currentNavItems = user.role === 'Admin' ? adminNavItems : studentNavItems;

  return (
    <header className="sticky top-0 z-50 bg-[#161412]/95 backdrop-blur-md border-b-2 border-[#2c2824]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveTab(user.role === 'Admin' ? 'admin_dashboard' : 'home')}
        >
          <div className="w-11 h-11 rounded-2xl bg-[#ff4d2e]/15 border-2 border-[#ff4d2e]/40 flex items-center justify-center text-[#ff4d2e] shadow-md">
            <span className="material-symbols-outlined text-2xl font-black">celebration</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline text-2xl font-extrabold tracking-tight text-[#fcfaf6]">
                Utsav<span className="text-[#ff4d2e]">Hub</span>
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                user.role === 'Admin'
                  ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                  : 'bg-[#ff4d2e]/20 text-[#ff4d2e] border border-[#ff4d2e]/40'
              }`}>
                {user.role === 'Admin' ? 'ADMIN' : 'COLLEGIATE'}
              </span>
            </div>
            <span className="text-[11px] font-medium text-stone-400 hidden sm:block">
              {user.college || 'IET Lucknow'} • {user.role === 'Admin' ? 'Gate Operations' : 'Student Circuit'}
            </span>
          </div>
        </div>

        {/* Center: RBAC Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-[#23201c] p-1.5 rounded-2xl border-2 border-[#38332d] shadow-inner">
          {currentNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? user.role === 'Admin'
                      ? 'bg-[#f59e0b] text-stone-950 font-extrabold shadow-sm'
                      : 'bg-[#ff4d2e] text-white shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-[#2c2824]'
                }`}
              >
                <span className="material-symbols-outlined text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Admin Exclusive: Post Event */}
          {user.role === 'Admin' && (
            <button
              onClick={onOpenCreateEvent}
              className="hidden sm:flex items-center gap-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-stone-950 px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>Publish Event</span>
            </button>
          )}

          {/* User Profile Pill */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 bg-[#23201c] hover:bg-[#2c2824] px-3.5 py-1.5 rounded-2xl border-2 border-[#38332d] transition-colors text-left"
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
              user.role === 'Admin'
                ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                : 'bg-[#ff4d2e]/20 text-[#ff4d2e] border border-[#ff4d2e]/40'
            }`}>
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold text-stone-200 leading-tight truncate max-w-[120px]">
                {user.name}
              </span>
              <span className="text-[10px] text-[#f59e0b] font-mono leading-tight">
                {user.role} • {user.branch || user.designation || 'Campus'}
              </span>
            </div>
          </button>

          {/* Logout button */}
          <button
            onClick={onLogout}
            title="Log out"
            className="p-2 rounded-xl bg-[#23201c] text-stone-400 hover:text-white hover:bg-[#2c2824] border border-[#38332d] transition-colors"
          >
            <span className="material-symbols-outlined text-base">logout</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#23201c] text-stone-300 hover:text-white border border-[#38332d]"
          >
            <span className="material-symbols-outlined text-xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1a1815] border-b-2 border-[#2c2824] px-4 py-3 space-y-1">
          {currentNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  isActive
                    ? user.role === 'Admin'
                      ? 'bg-[#f59e0b] text-stone-950 font-extrabold'
                      : 'bg-[#ff4d2e] text-white'
                    : 'text-stone-300 hover:bg-[#23201c]'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
          {user.role === 'Admin' && (
            <button
              onClick={() => {
                onOpenCreateEvent();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#f59e0b] text-stone-950 font-extrabold py-2.5 rounded-xl text-sm mt-2"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              <span>Publish Event</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
