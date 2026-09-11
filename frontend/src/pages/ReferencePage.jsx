import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2, X } from "lucide-react";
import api from "../api/client";
import { referenceResources } from "../config/resources";
import { useAuth } from "../context/useAuth";

const sourceEndpoints = { complexes: "/complexes", labs: "/labs", centers: "/centers" };
const sourceLabels = { complexes: "name", labs: "name", centers: "name" };

function idOf(value) {
  return typeof value === "object" && value !== null ? value._id : value;
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return value.name || value.title || value.code || "—";
  return String(value);
}

function emptyForm(resource) {
  return Object.fromEntries(resource.fields.map((field) => [field.name, ""]));
}

function ReferencePage({ resource: resourceKey }) {
  const resource = referenceResources[resourceKey];
  const { user } = useAuth();
  const canManage = user?.role === "admin";
  const [records, setRecords] = useState([]);
  const [options, setOptions] = useState({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm(resource));
  const [saving, setSaving] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(resource.endpoint);
      setRecords(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Unable to load ${resource.label.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [resource.endpoint, resource.label]);

  useEffect(() => {
    Promise.resolve().then(loadRecords);
    const sources = [...new Set(resource.fields.map((field) => field.source).filter(Boolean))];
    if (sources.length) {
      Promise.all(sources.map((source) => api.get(sourceEndpoints[source]).then((response) => [source, response.data])))
        .then((entries) => setOptions(Object.fromEntries(entries)))
        .catch(() => setError("Some reference options could not be loaded."));
    }
  }, [loadRecords, resource.fields]);

  const filteredRecords = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return records;
    return records.filter((record) => resource.columns.some((column) => displayValue(record[column.key]).toLowerCase().includes(normalized)));
  }, [query, records, resource.columns]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(resource));
    setError("");
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setForm(Object.fromEntries(resource.fields.map((field) => [field.name, idOf(record[field.name]) || ""])));
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...form };
    resource.fields.forEach((field) => {
      if (field.type === "number" && payload[field.name] !== "") payload[field.name] = Number(payload[field.name]);
      if (payload[field.name] === "") delete payload[field.name];
    });
    try {
      if (editing) await api.put(`${resource.endpoint}/${editing._id}`, payload);
      else await api.post(resource.endpoint, payload);
      setModalOpen(false);
      await loadRecords();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save this record.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete ${displayValue(record.name || record.title || record.employeeId)}?`)) return;
    setError("");
    try {
      await api.delete(`${resource.endpoint}/${record._id}`);
      await loadRecords();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete this record.");
    }
  };

  return (
    <div className="reference-page">
      <div className="page-heading">
        <div><span className="section-kicker">Reference data</span><h1>{resource.label}</h1><p>{resource.description}</p></div>
        {canManage && <button className="primary-button" onClick={openCreate}><Plus size={17} /> Add {resource.singular}</button>}
      </div>
      {!canManage && <p className="info-message">You have read-only access to reference data. Contact an administrator to make changes.</p>}
      {error && !modalOpen && <p className="error-message page-alert">{error}</p>}
      <section className="data-card">
        <div className="table-toolbar"><div className="record-count"><strong>{records.length}</strong> records</div><div className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${resource.label.toLowerCase()}...`} /></div></div>
        <div className="table-scroll"><table><thead><tr>{resource.columns.map((column) => <th key={column.key}>{column.label}</th>)}{canManage && <th className="actions-heading">Actions</th>}</tr></thead><tbody>
          {loading ? <tr><td className="table-state" colSpan={resource.columns.length + (canManage ? 1 : 0)}>Loading records...</td></tr> : filteredRecords.length === 0 ? <tr><td className="table-state" colSpan={resource.columns.length + (canManage ? 1 : 0)}>No records found.</td></tr> : filteredRecords.map((record) => <tr key={record._id}>{resource.columns.map((column) => <td key={column.key}>{displayValue(record[column.key])}</td>)}{canManage && <td className="row-actions"><button className="table-action edit" onClick={() => openEdit(record)} aria-label="Edit record"><Edit3 size={16} /></button><button className="table-action delete" onClick={() => handleDelete(record)} aria-label="Delete record"><Trash2 size={16} /></button></td>}</tr>)}
        </tbody></table></div>
      </section>
      {modalOpen && <div className="modal-backdrop"><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="record-dialog-title"><div className="modal-header"><div><span className="section-kicker">{editing ? "Edit record" : "New record"}</span><h2 id="record-dialog-title">{editing ? `Edit ${resource.singular}` : `Add ${resource.singular}`}</h2></div><button className="icon-button" onClick={() => setModalOpen(false)} aria-label="Close dialog"><X size={20} /></button></div>{error && <p className="error-message">{error}</p>}<form onSubmit={handleSubmit} className="modal-form"><div className="form-grid">{resource.fields.map((field) => <label className={`field-label ${field.type === "textarea" ? "full-field" : ""}`} key={field.name}>{field.label}{field.type === "textarea" ? <textarea value={form[field.name]} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} required={field.required} rows={3} /> : field.type === "select" ? <select value={form[field.name]} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} required={field.required}><option value="">Select {field.label.toLowerCase()}</option>{(options[field.source] || []).map((option) => <option key={option._id} value={option._id}>{option[sourceLabels[field.source]]}</option>)}</select> : <input type={field.type || "text"} value={form[field.name]} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} required={field.required} />}</label>)}</div><div className="modal-actions"><button type="button" className="outline-button" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Create record"}</button></div></form></section></div>}
    </div>
  );
}

export default ReferencePage;
