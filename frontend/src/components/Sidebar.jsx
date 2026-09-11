import {
  Banknote,
  BookOpen,
  Building2,
  CalendarClock,
  ChevronLeft,
  ClipboardList,
  FlaskConical,
  Landmark,
  LayoutDashboard,
  Microscope,
  UserCog,
  Users
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { navGroups } from "../config/resources";
import { useAuth } from "../context/useAuth";

const icons = { Banknote, BookOpen, Building2, CalendarClock, ClipboardList, FlaskConical, Landmark, LayoutDashboard, Microscope, UserCog, Users };

function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  return (
    <>
      {open && <button className="sidebar-overlay" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-symbol">P</div>
          <div><strong>PCSIR</strong><span>Research portal</span></div>
          <button className="icon-button sidebar-close" onClick={onClose} aria-label="Close navigation"><ChevronLeft size={18} /></button>
        </div>
        <nav>
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-label">{group.label}</p>
              {group.links.filter((link) => !link.adminOnly || user?.role === "admin").map((link) => {
                const Icon = icons[link.icon];
                return (
                  <NavLink key={link.to} to={link.to} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                    <Icon size={18} strokeWidth={1.8} /> <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer"><span className="online-dot" /> API services connected</div>
      </aside>
    </>
  );
}

export default Sidebar;
