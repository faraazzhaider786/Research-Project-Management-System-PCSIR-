import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Banknote, BookOpen, Building2, ClipboardList, FlaskConical, Landmark, Microscope, RefreshCw, Users } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/useAuth";

const metrics = [
  { key: "programs", label: "R&D programs", endpoint: "/rnd-programs", icon: FlaskConical, color: "violet", link: "/rnd-programs" },
  { key: "employees", label: "Employees", endpoint: "/employees", icon: Users, color: "blue", link: "/employees" },
  { key: "complexes", label: "Complexes", endpoint: "/complexes", icon: Building2, color: "teal", link: "/complexes" },
  { key: "labs", label: "Labs", endpoint: "/labs", icon: Microscope, color: "orange", link: "/labs" },
  { key: "centers", label: "Centers", endpoint: "/centers", icon: Landmark, color: "rose", link: "/centers" },
  { key: "fields", label: "Fields of study", endpoint: "/fields-of-study", icon: BookOpen, color: "green", link: "/fields-of-study" },
  { key: "agencies", label: "Funding agencies", endpoint: "/funding-agencies", icon: Banknote, color: "violet", link: "/funding-agencies" },
  { key: "psdp", label: "PSDP projects", endpoint: "/psdp-projects", icon: ClipboardList, color: "green", link: "/psdp-projects" }
];

function DashboardPage() {
  const { user } = useAuth();
  const roleCopy = {
    admin: {
      title: "Good morning, administrator.",
      description: "Here's what's happening across your research portfolio.",
      welcomeTitle: "Keep your research pipeline moving.",
      welcomeDescription: "Create a program, update reference data, or review the latest records from one place.",
      summaryTitle: "Portfolio snapshot",
      summaryDescription: "All R&D programs across the institution."
    },
    employee: {
      title: "Your research dashboard",
      description: "Track the projects you lead or contribute to.",
      welcomeTitle: "Keep your projects moving.",
      welcomeDescription: "Review your active research work and the latest project details.",
      summaryTitle: "Your project snapshot",
      summaryDescription: "Projects where you are a leader or associate."
    },
    director_pnd: {
      title: "P&D review dashboard",
      description: "Review projects submitted to the P&D directorate.",
      welcomeTitle: "Review the submission queue.",
      welcomeDescription: "Submitted projects are collected here for your directorate's review.",
      summaryTitle: "Submitted review queue",
      summaryDescription: "Projects currently awaiting P&D review."
    },
    director_rd: {
      title: "R&D review dashboard",
      description: "Review projects forwarded for final R&D directorate review.",
      welcomeTitle: "Complete the final review.",
      welcomeDescription: "Forwarded projects are collected here for final R&D directorate review.",
      summaryTitle: "Forwarded review queue",
      summaryDescription: "Projects currently awaiting final R&D review."
    }
  }[user?.role] || {
    title: "Research project dashboard",
    description: "Review the R&D projects available to your role.",
    welcomeTitle: "Keep your research pipeline moving.",
    welcomeDescription: "Review the latest records from your research workspace.",
    summaryTitle: "Project snapshot",
    summaryDescription: "R&D projects available to your role."
  };
  const [counts, setCounts] = useState({});
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCounts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const responses = await Promise.all(metrics.map((metric) => api.get(metric.endpoint)));
      const programData = Array.isArray(responses[0].data) ? responses[0].data : [];
      setPrograms(programData);
      setCounts(Object.fromEntries(responses.map((response, index) => [metrics[index].key, Array.isArray(response.data) ? response.data.length : 0])));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load live dashboard totals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadCounts);
  }, [loadCounts]);

  const statusCounts = programs.reduce((summary, program) => {
    const status = program.status || "DRAFT";
    summary[status] = (summary[status] || 0) + 1;
    return summary;
  }, {});

  return (
    <div className="dashboard-page">
      <div className="page-heading dashboard-heading">
        <div><span className="section-kicker">Overview</span><h1>{roleCopy.title}</h1><p>{roleCopy.description}</p></div>
        <button className="outline-button" onClick={loadCounts} disabled={loading}><RefreshCw size={16} className={loading ? "spin" : ""} /> {loading ? "Refreshing" : "Refresh data"}</button>
      </div>
      {error && <p className="error-message page-alert">{error}</p>}
      <section className="metric-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return <Link className="metric-card" to={metric.link} key={metric.key}><div className={`metric-icon ${metric.color}`}><Icon size={20} /></div><div className="metric-main"><span>{metric.label}</span><strong>{loading ? "—" : counts[metric.key] ?? 0}</strong></div><ArrowUpRight className="metric-arrow" size={18} /></Link>;
        })}
      </section>
      <section className="dashboard-lower">
        <div className="welcome-card"><div><span className="section-kicker light">Research operations</span><h2>{roleCopy.welcomeTitle}</h2><p>{roleCopy.welcomeDescription}</p><Link className="light-button" to="/rnd-programs">View R&D programs <ArrowUpRight size={16} /></Link></div><div className="welcome-graphic"><FlaskConical size={100} strokeWidth={0.7} /></div></div>
        <div className="quick-card"><span className="section-kicker">R&amp;D programs</span><h3>{roleCopy.summaryTitle}</h3><p className="summary-description">{roleCopy.summaryDescription}</p><div className="program-summary-count"><strong>{loading ? "—" : programs.length}</strong><span>visible programs</span></div><div className="status-summary">{Object.entries(statusCounts).map(([status, count]) => <span key={status}><strong>{count}</strong> {status.replaceAll("_", " ").toLowerCase()}</span>)}</div><div className="quick-links"><Link to="/rnd-programs">Open project list <ArrowUpRight size={14} /></Link>{user?.role === "admin" && <><Link to="/employees"><Users size={16} /> Employees <ArrowUpRight size={14} /></Link><Link to="/psdp-projects"><ClipboardList size={16} /> PSDP projects <ArrowUpRight size={14} /></Link></>}</div></div>
      </section>
      <section className="data-card dashboard-projects-card"><div className="table-toolbar"><div><span className="section-kicker">Latest records</span><h3 className="dashboard-list-title">{roleCopy.summaryTitle}</h3></div><Link className="outline-button" to="/rnd-programs">View all <ArrowUpRight size={14} /></Link></div><div className="dashboard-project-list">{loading ? <p className="table-state">Loading projects...</p> : programs.length === 0 ? <p className="table-state">No projects are currently available.</p> : programs.slice(0, 5).map((program) => <Link to="/rnd-programs" className="dashboard-project-row" key={program._id}><span><strong>{program.title}</strong><small>{program.projectLeader?.name || "Unassigned leader"}</small></span><span className={`status-pill status-${(program.status || "DRAFT").toLowerCase()}`}>{(program.status || "DRAFT").replaceAll("_", " ")}</span><ArrowUpRight size={15} /></Link>)}</div></section>
    </div>
  );
}

export default DashboardPage;
