import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="portal-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-panel">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  );
}

export default Layout;
