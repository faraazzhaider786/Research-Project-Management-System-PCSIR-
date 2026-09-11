import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, Forward, History, Plus, Search, Send, Trash2, X } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/useAuth";

const sources = ["PSDP Project", "RD&I of PCSIR", "SGF", "In-house R&D", "Collaborative Research", "Other Funding Agency", "Any other Program"];
const endpoints = { employees: "/employees", complexes: "/complexes", labs: "/labs", centers: "/centers", fields: "/fields-of-study", agencies: "/funding-agencies", psdp: "/psdp-projects" };

const blankForm = {
  title: "", rndType: "national", sourceOfRND: "", complex: "", lab: "", center: "", projectLeader: "", associates: [], fieldsOfStudy: [],
  year: new Date().getFullYear(), duration: "", scheduledCompletionDate: "", background: "", objective: "", researchHighlights: "",
  presentStatus: "", targetsNextFiscalYear: "", collaborators: "", keywords: "", fundingAgency: "", fundsAllocatedDetails: "",
  psdpProject: "", socioEconomicOutcome: "", graphicalAbstract: ""
};

const idOf = (value) => (typeof value === "object" && value ? value._id : value);
const idsOf = (values) => (values || []).map(idOf).filter(Boolean);
const nameOf = (value) => (typeof value === "object" && value ? value.name : value) || "—";
const dateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

function FormField({ label, name, value, onChange, type = "text", required, options, multiple, full }) {
  const handleChange = (event) => onChange(name, multiple ? Array.from(event.target.selectedOptions, (option) => option.value) : event.target.value);
  return <label className={`field-label ${full ? "full-field" : ""}`}>{label}{type === "textarea" ? <textarea rows={3} value={value} onChange={handleChange} required={required} /> : options ? <select value={value} onChange={handleChange} required={required} multiple={multiple}>{!multiple && <option value="">Select {label.toLowerCase()}</option>}{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input type={type} value={value} onChange={handleChange} required={required} />}</label>;
}

function EmployeeMultiSelect({ value, options, projectLeader, onChange }) {
  const selectedNames = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);
  const availableOptions = options.filter((option) => option.value !== projectLeader);

  return (
    <div className="field-label full-field">
      <span>Associates</span>
      <details className="employee-picker">
        <summary>
          {selectedNames.length
            ? `${selectedNames.length} associate${selectedNames.length === 1 ? "" : "s"} selected`
            : "Select associates from employees"}
        </summary>
        <div className="employee-picker-menu">
          {availableOptions.length === 0 ? (
            <span className="picker-empty">No other employees available.</span>
          ) : (
            availableOptions.map((option) => (
              <label className="picker-option" key={option.value}>
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={(event) => {
                    const nextValue = event.target.checked
                      ? [...value, option.value]
                      : value.filter((id) => id !== option.value);
                    onChange("associates", nextValue);
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))
          )}
        </div>
      </details>
      {selectedNames.length > 0 && (
        <span className="field-help">Selected: {selectedNames.join(", ")}</span>
      )}
    </div>
  );
}

function RndProgramsPage() {
  const { user } = useAuth();
  const canManage = user?.role === "admin";
  const canDelete = user?.role === "admin";
  const roleCopy = {
    admin: {
      heading: "R&D programs",
      description: "Create, track and maintain the institution's research programs."
    },
    employee: {
      heading: "My R&D projects",
      description: "View projects where you are the project leader or an associate."
    },
    director_pnd: {
      heading: "Submitted R&D projects",
      description: "Review projects currently submitted for P&D directorate review."
    },
    director_rd: {
      heading: "Forwarded R&D projects",
      description: "Review projects forwarded for final R&D directorate review."
    }
  }[user?.role] || {
    heading: "R&D programs",
    description: "View the R&D programs available to your role."
  };
  const [programs, setPrograms] = useState([]);
  const [refs, setRefs] = useState({ employees: [], complexes: [], labs: [], centers: [], fields: [], agencies: [], psdp: [] });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const [historyProgram, setHistoryProgram] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [detailProgram, setDetailProgram] = useState(null);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const response = await api.get("/rnd-programs");
      setPrograms(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load R&D programs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(loadPrograms);
    Promise.all(Object.entries(endpoints).map(([key, endpoint]) => api.get(endpoint).then((response) => [key, response.data])))
      .then((entries) => setRefs((current) => ({ ...current, ...Object.fromEntries(entries) })))
      .catch((requestError) => setError(requestError.response?.data?.message || "Reference data could not be loaded."));
  }, []);

  const options = useMemo(() => ({
    employees: refs.employees.map((item) => ({ value: item._id, label: `${item.name} (${item.employeeId})` })),
    complexes: refs.complexes.map((item) => ({ value: item._id, label: `${item.name} (${item.code})` })),
    labs: refs.labs.filter((item) => !form.complex || idOf(item.complex) === form.complex).map((item) => ({ value: item._id, label: `${item.name} (${item.code})` })),
    centers: refs.centers.map((item) => ({ value: item._id, label: `${item.name} (${item.code})` })),
    fields: refs.fields.map((item) => ({ value: item._id, label: item.name })),
    agencies: refs.agencies.map((item) => ({ value: item._id, label: item.name })),
    psdp: refs.psdp.map((item) => ({ value: item._id, label: `${item.referenceNumber} — ${item.title}` }))
  }), [refs, form.complex]);

  const visiblePrograms = programs.filter((program) => {
    const text = `${program.title} ${program.rndId || ""} ${program.status || ""} ${nameOf(program.projectLeader)}`.toLowerCase();
    return text.includes(query.toLowerCase().trim());
  });

  const updateField = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const openCreate = () => { setEditing(null); setForm({ ...blankForm, year: new Date().getFullYear() }); setError(""); setModalOpen(true); };
  const openEdit = (program) => {
    setEditing(program);
    setForm({
      ...blankForm, ...program, complex: idOf(program.complex), lab: idOf(program.lab), center: idOf(program.center), projectLeader: idOf(program.projectLeader),
      associates: idsOf(program.associates), fieldsOfStudy: idsOf(program.fieldsOfStudy), fundingAgency: idOf(program.fundingAgency), psdpProject: idOf(program.psdpProject),
      scheduledCompletionDate: dateInput(program.scheduledCompletionDate), keywords: (program.keywords || []).join(", ")
    });
    setError(""); setModalOpen(true);
  };

  const saveProgram = async (event) => {
    event.preventDefault();
    setSaving(true); setError("");
    const payload = { ...form, year: Number(form.year), duration: Number(form.duration), keywords: form.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean) };
    delete payload.status;
    delete payload.rndId;
    ["center", "associates", "fieldsOfStudy", "fundingAgency", "psdpProject", "background", "objective", "researchHighlights", "presentStatus", "targetsNextFiscalYear", "collaborators", "fundsAllocatedDetails", "socioEconomicOutcome", "graphicalAbstract"].forEach((field) => {
      if (payload[field] === "" || (Array.isArray(payload[field]) && payload[field].length === 0)) delete payload[field];
    });
    try {
      if (editing) await api.put(`/rnd-programs/${editing._id}`, payload);
      else await api.post("/rnd-programs", payload);
      setModalOpen(false); await loadPrograms();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save this R&D program.");
    } finally { setSaving(false); }
  };

  const deleteProgram = async (program) => {
    if (!window.confirm(`Delete “${program.title}”?`)) return;
    try { await api.delete(`/rnd-programs/${program._id}`); await loadPrograms(); } catch (requestError) { setError(requestError.response?.data?.message || "Unable to delete this program."); }
  };

  const workflowActions = (program) => {
    const actions = [];
    if (user?.role === "admin" && ["DRAFT", "OBJECTED"].includes(program.status)) {
      actions.push({ action: "submit", label: "Submit", icon: Send, required: false });
    }
    if (user?.role === "director_pnd" && program.status === "SUBMITTED") {
      actions.push({ action: "forward", label: "Forward", icon: Forward, required: true });
      actions.push({ action: "object", label: "Object", icon: Eye, required: true });
      actions.push({ action: "reject", label: "Reject", icon: X, required: true });
    }
    if (user?.role === "director_rd" && program.status === "FORWARDED") {
      actions.push({ action: "approve", label: "Approve", icon: Send, required: true });
      actions.push({ action: "object", label: "Object", icon: Eye, required: true });
      actions.push({ action: "reject", label: "Reject", icon: X, required: true });
    }
    return actions;
  };

  const runWorkflowAction = async (program, workflow) => {
    const promptLabel = workflow.required ? `${workflow.label} comment (required):` : `${workflow.label} comment (optional):`;
    const comment = window.prompt(promptLabel, "");
    if (comment === null) return;
    if (workflow.required && !comment.trim()) {
      setError("A comment is required for this workflow action.");
      return;
    }
    try {
      setError("");
      await api.post(`/rnd-programs/${program._id}/${workflow.action}`, { comment: comment.trim() });
      await loadPrograms();
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Unable to ${workflow.label.toLowerCase()} this program.`);
    }
  };

  const openHistory = async (program) => {
    setHistoryProgram(program);
    setHistory([]);
    setHistoryLoading(true);
    try {
      const response = await api.get(`/rnd-programs/${program._id}/history`);
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load approval history.");
      setHistoryProgram(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  const listNames = (values) => (
    values?.length ? values.map((value) => nameOf(value)).join(", ") : "—"
  );

  return (
    <div className="reference-page programs-page">
      <div className="page-heading"><div><span className="section-kicker">Research portfolio</span><h1>{roleCopy.heading}</h1><p>{roleCopy.description}</p></div>{canManage && <button className="primary-button" onClick={openCreate}><Plus size={17} /> New program</button>}</div>
      {error && !modalOpen && <p className="error-message page-alert">{error}</p>}
      <section className="data-card"><div className="table-toolbar"><div className="record-count"><strong>{programs.length}</strong> programs</div><div className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search programs..." /></div></div>
        <div className="table-scroll"><table><thead><tr><th>Program</th><th>Type</th><th>Organization</th><th>Leader</th><th>Year</th><th>Status</th><th className="actions-heading">Actions</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="7" className="table-state">Loading programs...</td></tr> : visiblePrograms.length === 0 ? <tr><td colSpan="7" className="table-state">No programs found.</td></tr> : visiblePrograms.map((program) => <tr key={program._id}><td><strong className="table-primary">{program.title}</strong><span className="table-secondary">{program.rndId || "No official ID"}</span></td><td><span className="type-pill">{program.rndType}</span></td><td>{nameOf(program.complex)}</td><td>{nameOf(program.projectLeader)}</td><td>{program.year}</td><td><span className={`status-pill status-${(program.status || "DRAFT").toLowerCase()}`}>{(program.status || "DRAFT").replace("_", " ")}</span></td><td className="row-actions"><button className="table-action view" onClick={() => setDetailProgram(program)} aria-label="View application details" title="View application details"><Eye size={16} /></button><button className="table-action history" onClick={() => openHistory(program)} aria-label="View approval history" title="View approval history"><History size={16} /></button>{workflowActions(program).map((workflow) => <button key={workflow.action} className={`table-action workflow ${workflow.action}`} onClick={() => runWorkflowAction(program, workflow)} aria-label={workflow.label} title={workflow.label}><workflow.icon size={16} /></button>)}{canManage && <button className="table-action edit" onClick={() => openEdit(program)} aria-label="Edit program"><Edit3 size={16} /></button>}{canDelete && <button className="table-action delete" onClick={() => deleteProgram(program)} aria-label="Delete program"><Trash2 size={16} /></button>}</td></tr>)}
        </tbody></table></div></section>
      {modalOpen && <div className="modal-backdrop"><section className="modal-card wide-modal" role="dialog" aria-modal="true" aria-labelledby="program-dialog-title"><div className="modal-header"><div><span className="section-kicker">{editing ? "Edit program" : "New program"}</span><h2 id="program-dialog-title">{editing ? "Update R&D program" : "Create R&D program"}</h2></div><button className="icon-button" onClick={() => setModalOpen(false)} aria-label="Close dialog"><X size={20} /></button></div>{error && <p className="error-message">{error}</p>}<form onSubmit={saveProgram} className="modal-form"><h3 className="form-section-title">Program identity</h3><div className="form-grid"><FormField label="Program title" name="title" value={form.title} onChange={updateField} required full /><FormField label="R&D type" name="rndType" value={form.rndType} onChange={updateField} required options={[{ value: "national", label: "National" }, { value: "international", label: "International" }]} /><FormField label="Source of R&D" name="sourceOfRND" value={form.sourceOfRND} onChange={updateField} required options={sources.map((value) => ({ value, label: value }))} /></div>
          <h3 className="form-section-title">Organization and people</h3><div className="form-grid"><FormField label="Complex" name="complex" value={form.complex} onChange={updateField} required options={options.complexes} /><FormField label="Laboratory" name="lab" value={form.lab} onChange={updateField} required options={options.labs} /><FormField label="Center" name="center" value={form.center} onChange={updateField} options={options.centers} /><FormField label="Project leader" name="projectLeader" value={form.projectLeader} onChange={updateField} required options={options.employees} /><EmployeeMultiSelect value={form.associates} options={options.employees} projectLeader={form.projectLeader} onChange={updateField} /><FormField label="Fields of study" name="fieldsOfStudy" value={form.fieldsOfStudy} onChange={updateField} options={options.fields} multiple /></div>
          <h3 className="form-section-title">Schedule</h3><div className="form-grid"><FormField label="Starting year" name="year" value={form.year} onChange={updateField} type="number" required /><FormField label="Duration (months)" name="duration" value={form.duration} onChange={updateField} type="number" required /><FormField label="Scheduled completion" name="scheduledCompletionDate" value={form.scheduledCompletionDate} onChange={updateField} type="date" required /></div>
          <h3 className="form-section-title">Research details</h3><div className="form-grid"><FormField label="Background" name="background" value={form.background} onChange={updateField} type="textarea" full /><FormField label="Objective" name="objective" value={form.objective} onChange={updateField} type="textarea" full /><FormField label="Research highlights" name="researchHighlights" value={form.researchHighlights} onChange={updateField} type="textarea" full /><FormField label="Present status" name="presentStatus" value={form.presentStatus} onChange={updateField} type="textarea" /><FormField label="Targets next fiscal year" name="targetsNextFiscalYear" value={form.targetsNextFiscalYear} onChange={updateField} type="textarea" /><FormField label="Collaborators" name="collaborators" value={form.collaborators} onChange={updateField} /><FormField label="Keywords (comma separated)" name="keywords" value={form.keywords} onChange={updateField} /></div>
          <h3 className="form-section-title">Funding and outcomes</h3><div className="form-grid"><FormField label="Funding agency" name="fundingAgency" value={form.fundingAgency} onChange={updateField} options={options.agencies} /><FormField label="PSDP project" name="psdpProject" value={form.psdpProject} onChange={updateField} options={options.psdp} /><FormField label="Funds allocated details" name="fundsAllocatedDetails" value={form.fundsAllocatedDetails} onChange={updateField} type="textarea" full /><FormField label="Socio-economic outcome" name="socioEconomicOutcome" value={form.socioEconomicOutcome} onChange={updateField} type="textarea" full /><FormField label="Graphical abstract (URL)" name="graphicalAbstract" value={form.graphicalAbstract} onChange={updateField} /></div>
          <div className="modal-actions"><button type="button" className="outline-button" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Create program"}</button></div>
        </form></section></div>}
      {detailProgram && <div className="modal-backdrop"><section className="modal-card wide-modal details-modal" role="dialog" aria-modal="true" aria-labelledby="details-dialog-title"><div className="modal-header"><div><span className="section-kicker">Application details</span><h2 id="details-dialog-title">{detailProgram.title}</h2></div><button className="icon-button" onClick={() => setDetailProgram(null)} aria-label="Close application details"><X size={20} /></button></div><div className="details-status"><span className={`status-pill status-${(detailProgram.status || "DRAFT").toLowerCase()}`}>{(detailProgram.status || "DRAFT").replaceAll("_", " ")}</span>{detailProgram.rndId && <strong>{detailProgram.rndId}</strong>}</div><div className="details-grid"><div><span>R&D type</span><strong>{detailProgram.rndType}</strong></div><div><span>Source</span><strong>{detailProgram.sourceOfRND}</strong></div><div><span>Project leader</span><strong>{nameOf(detailProgram.projectLeader)}</strong></div><div><span>Associates</span><strong>{listNames(detailProgram.associates)}</strong></div><div><span>Complex</span><strong>{nameOf(detailProgram.complex)}</strong></div><div><span>Laboratory</span><strong>{nameOf(detailProgram.lab)}</strong></div><div><span>Center</span><strong>{nameOf(detailProgram.center)}</strong></div><div><span>Fields of study</span><strong>{listNames(detailProgram.fieldsOfStudy)}</strong></div><div><span>Year / duration</span><strong>{detailProgram.year} / {detailProgram.duration} months</strong></div><div><span>Completion date</span><strong>{detailProgram.scheduledCompletionDate ? new Date(detailProgram.scheduledCompletionDate).toLocaleDateString() : "—"}</strong></div><div><span>Funding agency</span><strong>{nameOf(detailProgram.fundingAgency)}</strong></div><div><span>PSDP project</span><strong>{detailProgram.psdpProject?.title || "—"}</strong></div></div><div className="details-copy"><div><span>Background</span><p>{detailProgram.background || "—"}</p></div><div><span>Objective</span><p>{detailProgram.objective || "—"}</p></div><div><span>Research highlights</span><p>{detailProgram.researchHighlights || "—"}</p></div><div><span>Expected outcome</span><p>{detailProgram.socioEconomicOutcome || "—"}</p></div><div><span>Targets next fiscal year</span><p>{detailProgram.targetsNextFiscalYear || "—"}</p></div><div><span>Collaborators</span><p>{detailProgram.collaborators || "—"}</p></div></div></section></div>}
      {historyProgram && <div className="modal-backdrop"><section className="modal-card history-modal" role="dialog" aria-modal="true" aria-labelledby="history-dialog-title"><div className="modal-header"><div><span className="section-kicker">Approval trail</span><h2 id="history-dialog-title">{historyProgram.title}</h2></div><button className="icon-button" onClick={() => setHistoryProgram(null)} aria-label="Close history"><X size={20} /></button></div>{historyLoading ? <p className="table-state">Loading approval history...</p> : history.length === 0 ? <p className="table-state">No workflow actions recorded yet.</p> : <div className="history-list">{history.map((entry) => <article className="history-entry" key={entry._id}><div><strong>{entry.action}</strong><span>{entry.previousStatus.replaceAll("_", " ")} → {entry.newStatus.replaceAll("_", " ")}</span></div><time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time><p>{entry.comment || "No comment provided."}</p><small>{entry.performedBy?.email || "Unknown user"}</small></article>)}</div>}</section></div>}
    </div>
  );
}

export default RndProgramsPage;
