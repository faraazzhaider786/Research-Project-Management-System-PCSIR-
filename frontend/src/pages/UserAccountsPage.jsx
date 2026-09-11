import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2, X } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/useAuth";

const roles = [
  { value: "employee", label: "Employee" },
  { value: "admin", label: "Admin / Lab admin" },
  { value: "director_pnd", label: "Director P&D" },
  { value: "director_rd", label: "Director R&D" }
];

const blankForm = {
  employee: "",
  email: "",
  password: "",
  role: "employee",
  isActive: true
};

function UserAccountsPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(blankForm);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [userResponse, employeeResponse] = await Promise.all([
        api.get("/users"),
        api.get("/employees")
      ]);
      setUsers(userResponse.data);
      setEmployees(employeeResponse.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load user accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadData);
  }, [loadData]);

  const availableEmployees = useMemo(() => {
    const linkedEmployeeIds = new Set(
      users.map((account) => account.employee?._id).filter(Boolean)
    );
    return employees.filter(
      (employee) =>
        editing?.employee?._id === employee._id ||
        !linkedEmployeeIds.has(employee._id)
    );
  }, [employees, editing, users]);

  const filteredUsers = users.filter((account) => {
    const text = `${account.email} ${account.role} ${
      account.employee?.name || ""
    } ${account.employee?.employeeId || ""}`.toLowerCase();
    return text.includes(query.toLowerCase().trim());
  });

  const openCreate = () => {
    setEditing(null);
    setForm(blankForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (account) => {
    setEditing(account);
    setForm({
      employee: account.employee?._id || "",
      email: account.email,
      password: "",
      role: account.role,
      isActive: account.isActive
    });
    setError("");
    setModalOpen(true);
  };

  const saveAccount = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      if (editing) {
        delete payload.employee;
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editing._id}`, payload);
      } else {
        await api.post("/users", payload);
      }
      setModalOpen(false);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save account.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async (account) => {
    if (!window.confirm(`Delete the login account for ${account.email}?`)) return;
    try {
      await api.delete(`/users/${account._id}`);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete account.");
    }
  };

  if (user?.role !== "admin") {
    return <p className="error-message page-alert">Only administrators can manage login accounts.</p>;
  }

  return (
    <div className="reference-page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">Administration</span>
          <h1>User accounts</h1>
          <p>Give existing employees secure login access and assign their system role.</p>
        </div>
        <button className="primary-button" onClick={openCreate}>
          <Plus size={17} /> Create account
        </button>
      </div>
      {error && !modalOpen && <p className="error-message page-alert">{error}</p>}
      <section className="data-card">
        <div className="table-toolbar">
          <div className="record-count"><strong>{users.length}</strong> accounts</div>
          <div className="search-box">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search accounts..." />
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Employee</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="5" className="table-state">Loading accounts...</td></tr> : filteredUsers.length === 0 ? <tr><td colSpan="5" className="table-state">No accounts found.</td></tr> : filteredUsers.map((account) => (
                <tr key={account._id}>
                  <td><strong className="table-primary">{account.employee?.name || "Unlinked"}</strong><span className="table-secondary">{account.employee?.employeeId || "—"}</span></td>
                  <td>{account.email}</td>
                  <td><span className="type-pill">{account.role.replace("_", " ")}</span></td>
                  <td><span className={`status-pill ${account.isActive ? "status-active" : "status-rejected"}`}>{account.isActive ? "Active" : "Inactive"}</span></td>
                  <td className="row-actions"><button className="table-action edit" onClick={() => openEdit(account)} aria-label="Edit account"><Edit3 size={16} /></button>{account._id !== user.id && <button className="table-action delete" onClick={() => deleteAccount(account)} aria-label="Delete account"><Trash2 size={16} /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {modalOpen && (
        <div className="modal-backdrop">
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title">
            <div className="modal-header"><div><span className="section-kicker">{editing ? "Edit account" : "New account"}</span><h2 id="account-dialog-title">{editing ? "Update login account" : "Create login account"}</h2></div><button className="icon-button" onClick={() => setModalOpen(false)} aria-label="Close dialog"><X size={20} /></button></div>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={saveAccount} className="modal-form">
              <div className="form-grid">
                {!editing && <label className="field-label full-field">Employee<select value={form.employee} onChange={(event) => setForm({ ...form, employee: event.target.value })} required><option value="">Select employee</option>{availableEmployees.map((employee) => <option key={employee._id} value={employee._id}>{employee.name} ({employee.employeeId})</option>)}</select></label>}
                <label className="field-label">Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
                <label className="field-label">Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} required>{roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
                <label className="field-label full-field">Password{editing && <span className="field-help">Leave blank to keep the current password.</span>}<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required={!editing} minLength="8" /></label>
                {editing && <label className="field-label checkbox-label"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Account is active</label>}
              </div>
              <div className="modal-actions"><button type="button" className="outline-button" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Create account"}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default UserAccountsPage;
