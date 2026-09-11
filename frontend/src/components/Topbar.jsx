import { Bell, Menu, LogOut } from "lucide-react";
import { useAuth } from "../context/useAuth";

function Topbar({ onMenu }) {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button>
      <div className="topbar-context"><span className="topbar-kicker">PCSIR / Research administration</span><span className="topbar-title">Research project management</span></div>
      <div className="topbar-actions">
        <button className="icon-button" aria-label="Notifications"><Bell size={19} /></button>
        <div className="user-menu"><div className="avatar">{(user?.email || "A").charAt(0).toUpperCase()}</div><div className="user-details"><strong>{user?.employee?.name || "Administrator"}</strong><span>{user?.email}</span></div></div>
        <button className="logout-button" onClick={logout}><LogOut size={17} /> <span>Sign out</span></button>
      </div>
    </header>
  );
}

export default Topbar;
