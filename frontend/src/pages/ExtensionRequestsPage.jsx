import { useEffect, useState } from "react";
import { Check, Forward, Plus, X } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/useAuth";

const blankForm = {
  rndProgram: "",
  requestedCompletionDate: "",
  reason: "",
  recoveryPlan: ""
};

function ExtensionRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [requestResponse, programResponse] = await Promise.all([
        api.get("/extension-requests"),
        api.get("/rnd-programs")
      ]);
      setRequests(requestResponse.data || []);
      setPrograms(programResponse.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load extension requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { Promise.resolve().then(load); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/extension-requests", form);
      setForm(blankForm);
      setOpen(false);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit extension request.");
    } finally {
      setSaving(false);
    }
  };

  const act = async (request, action, decision) => {
    const comment = window.prompt(
      action === "review" ? `${decision === "approve" ? "Approval" : "Rejection"} comment (required):` : "Forwarding comment (optional):",
      ""
    );
    if (comment === null || (action === "review" && !comment.trim())) return;
    try {
      await api.post(`/extension-requests/${request._id}/${action}`, {
        comment: comment.trim(),
        ...(decision ? { decision } : {})
      });
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update extension request.");
    }
  };

  const eligiblePrograms = programs.filter((program) => ["ACTIVE", "LAPSED"].includes(program.status));
  const title = user?.role === "employee" ? "My extension requests" : "Extension requests";
  const description = user?.role === "employee"
    ? "Request additional time for projects you lead."
    : "Review additional-time requests from project leaders.";

  return (
    <div className="reference-page">
      <div className="page-heading">
        <div><span className="section-kicker">Deadline management</span><h1>{title}</h1><p>{description}</p></div>
        {user?.role === "employee" && <button className="primary-button" onClick={() => setOpen(true)}><Plus size={17} /> Request extension</button>}
      </div>
      {error && !open && <p className="error-message page-alert">{error}</p>}
      <section className="data-card"><div className="table-scroll"><table><thead><tr><th>Project</th><th>Current deadline</th><th>Requested deadline</th><th>Progress</th><th>Status</th><th className="actions-heading">Actions</th></tr></thead>
        <tbody>{loading ? <tr><td colSpan="6" className="table-state">Loading extension requests...</td></tr> : requests.length === 0 ? <tr><td colSpan="6" className="table-state">No extension requests found.</td></tr> : requests.map((request) => <tr key={request._id}><td><strong className="table-primary">{request.rndProgram?.title || "Unknown project"}</strong><span className="table-secondary">{request.requestedBy?.email || "Unknown requester"}</span></td><td>{new Date(request.currentCompletionDate).toLocaleDateString()}</td><td>{new Date(request.requestedCompletionDate).toLocaleDateString()}</td><td>{request.currentCompletionPercentage}%</td><td><span className={`status-pill status-${request.status.toLowerCase()}`}>{request.status.replaceAll("_", " ")}</span></td><td className="row-actions">{user?.role === "admin" && request.status === "REQUESTED" && <button className="table-action workflow" onClick={() => act(request, "forward")} title="Forward for director review" aria-label="Forward for director review"><Forward size={16} /></button>}{user?.role === "director_pnd" && request.status === "UNDER_REVIEW" && <><button className="table-action workflow approve" onClick={() => act(request, "review", "approve")} title="Approve extension" aria-label="Approve extension"><Check size={16} /></button><button className="table-action workflow reject" onClick={() => act(request, "review", "reject")} title="Reject extension" aria-label="Reject extension"><X size={16} /></button></>}</td></tr>)}</tbody>
      </table></div></section>
      {open && <div className="modal-backdrop"><section className="modal-card wide-modal" role="dialog" aria-modal="true"><div className="modal-header"><div><span className="section-kicker">Deadline management</span><h2>Request project extension</h2></div><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close dialog"><X size={20} /></button></div>{error && <p className="error-message">{error}</p>}<form onSubmit={submit} className="modal-form"><div className="form-grid"><label className="field-label full-field">Project<select value={form.rndProgram} onChange={(event) => setForm({ ...form, rndProgram: event.target.value })} required><option value="">Select active or lapsed project</option>{eligiblePrograms.map((program) => <option key={program._id} value={program._id}>{program.title} ({program.status})</option>)}</select></label><label className="field-label full-field">Requested completion date<input type="date" value={form.requestedCompletionDate} onChange={(event) => setForm({ ...form, requestedCompletionDate: event.target.value })} required /></label><label className="field-label full-field">Reason<textarea rows={4} value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} required /></label><label className="field-label full-field">Recovery plan<textarea rows={4} value={form.recoveryPlan} onChange={(event) => setForm({ ...form, recoveryPlan: event.target.value })} required /></label></div><div className="modal-actions"><button type="button" className="outline-button" onClick={() => setOpen(false)}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Submitting..." : "Submit request"}</button></div></form></section></div>}
    </div>
  );
}

export default ExtensionRequestsPage;
