import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Map, Route, ArrowLeftRight, Home, Menu, X, ZoomIn, HelpCircle, Trophy, Shield, LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLaunch } from "../contexts/LaunchContext";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/map", label: "Map", icon: Map },
  { to: "/route", label: "Routes", icon: Route },
  { to: "/compare", label: "Compare", icon: ArrowLeftRight },
  { to: "/forensic", label: "Forensic", icon: ZoomIn },
  { to: "/faq", label: "FAQ", icon: HelpCircle },
  { to: "/leaderboard", label: "Board", icon: Trophy },
];

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { user, logout, openAuth } = useAuth();
  const { isLaunched } = useLaunch();

  const handleLogout = () => { logout(); setUserMenu(false); };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#050505]/90 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" data-testid="navbar-logo" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF007F] to-[#00E5FF] flex items-center justify-center text-xs font-heading font-bold shadow-[0_0_10px_rgba(255,0,127,0.6)]">
            HJ
          </div>
          <div className="hidden sm:block">
            <p className="font-heading text-white text-sm leading-none group-hover:text-[#FF007F] transition-colors">Honest John's</p>
            <p className="font-accent text-[#FFE600] text-xs">Travel Agency™</p>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-0.5">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              data-testid={`navbar-link-${label.toLowerCase()}`}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-body transition-all duration-200 ${
                location.pathname === to
                  ? "bg-[#FF007F]/20 text-[#FF007F] border border-[#FF007F]/40"
                  : "text-gray-300 hover:text-white hover:bg-white/5"}`}>
              <Icon size={12} />{label}
            </Link>
          ))}
        </div>

        {/* Right side — LIVE badge or star rating */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
          {isLaunched && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full animate-pulse"
              style={{ background: "rgba(57,255,20,0.15)", border: "1px solid rgba(57,255,20,0.5)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14]" />
              <span className="font-heading text-[#39FF14] text-xs tracking-wider" data-testid="live-badge">🎮 NOW LIVE!</span>
            </div>
          )}
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenu(!userMenu)} data-testid="user-menu-btn"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:bg-white/5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-heading text-white"
                  style={{ background: `${user.avatar_color}30`, border: `1.5px solid ${user.avatar_color}` }}>
                  {(user.display_name || user.username || "?").slice(0, 2).toUpperCase()}
                </div>
                <span className="font-body text-white text-xs max-w-[80px] truncate">{user.display_name || user.username}</span>
                {user.role === "admin" && (
                  <span className="text-[8px] px-1 py-0.5 rounded bg-[#FFE600]/20 text-[#FFE600] font-heading">ADMIN</span>
                )}
              </button>
              {userMenu && (
                <div className="absolute right-0 top-full mt-2 w-44 glass-panel py-1 rounded-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.6)" }}>
                  {user.role === "admin" && (
                    <Link to="/moderation" onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-body text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                      <Shield size={12} className="text-[#FF007F]" />Moderation Panel
                    </Link>
                  )}
                  <Link to="/leaderboard" onClick={() => setUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-body text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                    <Trophy size={12} className="text-[#FFE600]" />My Ranking
                  </Link>
                  <Link to="/profile" onClick={() => setUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-body text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                    <User size={12} className="text-[#00E5FF]" />My Profile
                  </Link>
                  <div className="border-t border-white/10 my-1" />
                  <button onClick={handleLogout} data-testid="logout-btn"
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-body text-gray-300 hover:text-[#FF007F] hover:bg-white/5 transition-colors w-full text-left">
                    <LogOut size={12} />Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={openAuth} data-testid="nav-login-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading transition-all"
              style={{ background: "rgba(255,0,127,0.15)", border: "1px solid rgba(255,0,127,0.4)", color: "#FF007F" }}>
              <User size={12} />Join
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="lg:hidden text-white p-2" onClick={() => setOpen(!open)} data-testid="navbar-mobile-toggle">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[#0a0a14] border-t border-white/10 px-4 py-3">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
                  location.pathname === to ? "bg-[#FF007F]/20 text-[#FF007F]" : "text-gray-300 hover:bg-white/5"}`}>
                <Icon size={14} />{label}
              </Link>
            ))}
          </div>
          <div className="border-t border-white/10 pt-3">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-heading text-white"
                    style={{ background: `${user.avatar_color}30`, border: `1.5px solid ${user.avatar_color}` }}>
                    {(user.display_name || user.username || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-white text-sm font-body">{user.display_name || user.username}</span>
                  {user.role === "admin" && <Link to="/moderation" onClick={() => setOpen(false)}
                    className="text-xs px-1.5 py-0.5 rounded bg-[#FFE600]/20 text-[#FFE600]">Admin</Link>}
                </div>
                <button onClick={handleLogout} className="text-gray-500 text-sm font-body flex items-center gap-1">
                  <LogOut size={13} />Logout
                </button>
              </div>
            ) : (
              <button onClick={() => { openAuth(); setOpen(false); }}
                className="w-full btn-primary py-2 text-sm" data-testid="mobile-login-btn">
                Join Honest John's
              </button>
            )}
          </div>
        </div>
      )}
      {userMenu && <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />}
    </nav>
  );
}
