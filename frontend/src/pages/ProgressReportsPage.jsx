import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/useAuth";

const blankForm = {
  rndProgram: "",
  reportingPeriod: "",
  percentageComplete: 0,
  workCompleted: "",
  currentActivities: "",
  problemsRisks: "",
  nextPlannedActivities: ""
};

function ProgressReportsPage() {
  const { user } = useAuth();
  const isEmployee = user?.role === "employee";
  const [reports, setReports] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [reportResponse, programResponse] = await Promise.all([
        api.get("/progress-reports"),
        api.get("/rnd-programs")
      ]);
      setReports(reportResponse.data || []);
      setPrograms(programResponse.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load progress reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { Promise.resolve().then(load); }, []);

  const update = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/progress-reports", {
        ...form,
        percentageComplete: Number(form.percentageComplete)
      });
      setForm(blankForm);
      setOpen(false);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit progress report.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="reference-page">
      <div className="page-heading">
        <div><span className="section-kicker">Project delivery</span><h1>Progress reports</h1><p>Track project completion and record the latest research activities.</p></div>
        {isEmployee && <button className="primary-button" onClick={() => setOpen(true)}><Plus size={17} /> New progress report</button>}
      </div>
      {error && !open && <p className="error-message page-alert">{error}</p>}
      <section className="data-card">
        <div className="table-scroll"><table><thead><tr><th>Project</th><th>Reporting period</th><th>Completion</th><th>Work completed</th><th>Submitted</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan="5" className="table-state">Loading progress reports...</td></tr> : reports.length === 0 ? <tr><td colSpan="5" className="table-state">No progress reports found.</td></tr> : reports.map((report) => <tr key={report._id}><td><strong className="table-primary">{report.rndProgram?.title || "Unknown project"}</strong><span className="table-secondary">{report.rndProgram?.rndId || "No official ID"}</span></td><td>{report.reportingPeriod}</td><td><strong>{report.percentageComplete}%</strong></td><td>{report.workCompleted}</td><td>{new Date(report.createdAt).toLocaleDateString()}</td></tr>)}</tbody>
        </table></div>
      </section>
      {open && <div className="modal-backdrop"><section className="modal-card wide-modal" role="dialog" aria-modal="true"><div className="modal-header"><div><span className="section-kicker">Project delivery</span><h2>Submit progress report</h2></div><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close dialog"><X size={20} /></button></div>{error && <p className="error-message">{error}</p>}<form onSubmit={submit} className="modal-form"><div className="form-grid"><label className="field-label full-field">Project<select value={form.rndProgram} onChange={(event) => update("rndProgram", event.target.value)} required><option value="">Select assigned project</option>{programs.map((program) => <option key={program._id} value={program._id}>{program.title}</option>)}</select></label><label className="field-label">Reporting period<input value={form.reportingPeriod} onChange={(event) => update("reportingPeriod", event.target.value)} placeholder="e.g. Q3 2026" required /></label><label className="field-label">Completion percentage<input type="number" min="0" max="100" value={form.percentageComplete} onChange={(event) => update("percentageComplete", event.target.value)} required /></label>{[["workCompleted", "Work completed", true], ["currentActivities", "Current activities"], ["problemsRisks", "Problems or risks"], ["nextPlannedActivities", "Next planned activities"]].map(([name, label, full]) => <label className={`field-label ${full ? "full-field" : ""}`} key={name}>{label}<textarea rows={3} value={form[name]} onChange={(event) => update(name, event.target.value)} required={name === "workCompleted"} /></label>)}</div><div className="modal-actions"><button type="button" className="outline-button" onClick={() => setOpen(false)}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Submitting..." : "Submit report"}</button></div></form></section></div>}
    </div>
  );
}

export default ProgressReportsPage;
