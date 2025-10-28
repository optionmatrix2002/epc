"use client";

import Datatable from "@/core/common/dataTable";
import { all_routes } from "../../../../../routes/all_routes";
import Link from "next/link";
import CommonSelect from "@/core/common/common-select/commonSelect";
import { StatusActive } from "@/core/common/selectOption";
import ImageWithBasePath from "@/core/imageWithBasePath";
import { useState, useEffect } from "react";

const RolesAndPermissionsComponent = () => {
  const userTypeOptions = [
    { label: "Admin", value: "Admin" },
    { label: "Patient", value: "Patient" },
    { label: "Provider", value: "Provider" },
    { label: "Nurse", value: "Nurse" },
    { label: "Technician", value: "Technician" },
  ];

  // start with an empty roles list; we'll load from the server on mount
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleType, setNewRoleType] = useState(userTypeOptions[0]);
  // Toast helpers (copied from other modules)
  const ensureToastContainer = () => {
    let container = document.getElementById('global_toast_container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'global_toast_container';
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      document.body.appendChild(container);
    }
    return container;
  };

  const showToast = (message: string, type: 'success' | 'danger' | 'info' = 'success') => {
    try {
      const container = ensureToastContainer();
      const toast = document.createElement('div');
      const variantClass = type === 'success' ? 'text-bg-success' : type === 'danger' ? 'text-bg-danger' : 'text-bg-info';
      toast.className = `toast align-items-center ${variantClass} border-0 mb-2 show`;
      toast.role = 'alert';
      toast.ariaLive = 'assertive';
      toast.ariaAtomic = 'true';
      toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button></div>`;
      const closeBtn = toast.querySelector('.btn-close') as HTMLElement | null;
      closeBtn?.addEventListener('click', () => { toast.remove(); });
      container.appendChild(toast);
      setTimeout(() => { toast.classList.remove('show'); try { toast.remove(); } catch (_) { } }, 4000);
    } catch (e) {
      // fallback
      // eslint-disable-next-line no-alert
      alert(message);
    }
  };

  // Safe JSON parser for fetch responses (copied)
  const parseJSONSafe = async (res: Response): Promise<any> => {
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      if (txt && /^\s*<!doctype html>|^\s*<html/i.test(txt) || contentType.includes('text/html')) {
        const titleMatch = txt.match(/<title>(.*?)<\/title>/i);
        const short = titleMatch ? titleMatch[1].trim() : `HTTP ${res.status} ${res.statusText || ''}`;
        try { console.debug('[roles] server returned HTML:', txt.slice(0, 2000)); } catch (_) { }
        throw new Error(short || `Request failed with status ${res.status}`);
      }
      const plain = txt ? txt.trim().slice(0, 500) : `Request failed with status ${res.status}`;
      throw new Error(plain);
    }
    if (contentType.includes('application/json')) {
      try { return await res.json(); } catch (err) { const txt = await res.text().catch(() => ''); console.debug('[roles] invalid JSON response body:', txt.slice(0, 300)); throw new Error('Invalid JSON response'); }
    }
    const txt = await res.text().catch(() => '');
    if (txt && /^\s*<!doctype html>|^\s*<html/i.test(txt) || contentType.includes('text/html')) {
      const titleMatch = txt.match(/<title>(.*?)<\/title>/i);
      const short = titleMatch ? titleMatch[1].trim() : `Unexpected HTML response (status ${res.status || 'unknown'})`;
      console.debug('[roles] unexpected HTML response body preview:', txt.slice(0, 1000));
      throw new Error(short);
    }
    throw new Error('Expected JSON response but received non-JSON content');
  };

  const hideModalById = async (id: string) => {
    return new Promise<void>((resolve) => {
      try {
        const modalEl = document.getElementById(id);
        // @ts-ignore
        const bs = (window as any).bootstrap;
        if (!modalEl) return resolve();
        let resolved = false;
        const finish = () => { if (resolved) return; resolved = true; try { modalEl.classList.remove('show'); (modalEl as any).style.display = 'none'; modalEl.setAttribute('aria-hidden', 'true'); modalEl.removeAttribute('aria-modal'); modalEl.querySelectorAll('.show').forEach(el => el.classList.remove('show')); try { document.body.classList.remove('modal-open'); (document.body as any).style.overflow = ''; (document.body as any).style.paddingRight = ''; } catch (_) { } document.querySelectorAll('.modal-backdrop').forEach(b => b.remove()); try { const ev = new Event('hidden.bs.modal'); modalEl.dispatchEvent(ev); } catch (_) { } } catch (cleanupErr) { console.debug('[roles] hideModal cleanup', cleanupErr); } resolve(); };
        try {
          if (bs && bs.Modal) {
            // @ts-ignore
            const inst = bs.Modal.getInstance(modalEl) ?? bs.Modal.getOrCreateInstance?.(modalEl) ?? new bs.Modal(modalEl);
            const onHidden = () => { try { modalEl.removeEventListener('hidden.bs.modal', onHidden); } catch (_) { }; finish(); };
            modalEl.addEventListener('hidden.bs.modal', onHidden);
            try { inst?.hide?.(); } catch (hideErr) { console.debug('[roles] bootstrap hide threw', hideErr); }
            setTimeout(() => finish(), 600);
            return;
          }
        } catch (err) { console.debug('[roles] bootstrap modal hide failed', err); }
        finish();
      } catch (e) { console.debug('[roles] hideModalById error', e); resolve(); }
    });
  };

  // fetch roles from server
  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      const json = await parseJSONSafe(res);
      setRoles((json?.roles || []).map((r: any) => ({ id: r.id, Role: r.role_name, Created_On: r.created_at ? new Date(r.created_at).toLocaleDateString() : '', Status: r.is_active ? 'Active' : 'Inactive', User_Type: r.user_type })));
    } catch (e: any) {
      console.error('[roles] fetchRoles error', e);
      showToast(e.message || 'Failed to load roles', 'danger');
    }
  };

  useEffect(() => { fetchRoles(); }, []);
  const columns = [
    {
      title: "Role",
      dataIndex: "Role",
      sorter: (a: any, b: any) => a.Role.length - b.Role.length,
    },
    {
      title: "User Type",
      dataIndex: "User_Type",
      sorter: (a: any, b: any) => (a.User_Type || "").length - (b.User_Type || "").length,
    },
    {
      title: "Created On",
      dataIndex: "Created_On",
      sorter: (a: any, b: any) => a.Created_On.length - b.Created_On.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string, record: any) => (
        <span
          className={`badge ${text === "Active" ? "badge-soft-success" : "badge-soft-danger"}  border ${text === "Active" ? "border-success" : "border-danger"} border-success px-2 py-1 fs-13 fw-medium`}
        >
          {text}
        </span>
      ),
    },
    {
      title: "",
      render: (_: any, record: any) => (
        <Link
          href={`${all_routes.permissions}?role=${encodeURIComponent(record.Role || "")}\u0026type=${encodeURIComponent(record.User_Type || "")}`}
          className="btn btn-white border text-dark"
        >
          <i className="ti ti-shield-half me-1" />
          Permissions
        </Link>
      ),
    },
    {
      title: "",
      render: (_: any, record: any) => (
        <div className="action-item">
          <Link href="#" data-bs-toggle="dropdown">
            <i className="ti ti-dots-vertical" />
          </Link>
          <ul className="dropdown-menu p-2">
            <li>
              <Link
                href="#"
                className="dropdown-item d-flex align-items-center"
                data-bs-toggle="modal"
                data-bs-target="#edit_role"
                onClick={() => setSelectedRole(record)}
              >
                Edit
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="dropdown-item d-flex align-items-center"
                data-bs-toggle="modal"
                data-bs-target="#delete_role"
                onClick={() => setSelectedRole(record)}
              >
                Delete
              </Link>
            </li>
          </ul>
        </div>
      ),
      sorter: (a: any, b: any) => a.Status.length - b.Status.length,
    },
  ];

  const handleAddRole = (e: any) => {
    e.preventDefault();
    (async () => {
      try {
        const headers: any = { 'Content-Type': 'application/json' };
        const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
          ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
          : undefined;
        if (adminSecret) headers['x-admin-secret'] = adminSecret;

        const res = await fetch('/api/roles', { method: 'POST', headers, body: JSON.stringify({ role_name: newRoleName, user_type: newRoleType?.value || 'Admin' }) });
        const json = await parseJSONSafe(res);
        if (json?.error) throw new Error(json.error);
        try { await hideModalById('add_role'); } catch (_) { }
        setNewRoleName(''); setNewRoleType(userTypeOptions[0]);
        await fetchRoles();
        showToast('Role created', 'success');
      } catch (e: any) {
        showToast(e.message || 'Failed to add role', 'danger');
      }
    })();
  };

  const handleSaveEdit = (e: any) => {
    e.preventDefault();
    (async () => {
      try {
        if (!selectedRole) return;
        const headers: any = { 'Content-Type': 'application/json' };
        const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
          ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
          : undefined;
        if (adminSecret) headers['x-admin-secret'] = adminSecret;
        const res = await fetch('/api/roles', { method: 'PATCH', headers, body: JSON.stringify({ action: 'edit', roleId: selectedRole.id, role_name: selectedRole.Role, user_type: selectedRole.User_Type, is_active: selectedRole.Status }) });
        const json = await parseJSONSafe(res);
        if (json?.error) throw new Error(json.error);
        try { await hideModalById('edit_role'); } catch (_) { }
        setSelectedRole(null);
        await fetchRoles();
        showToast('Role updated', 'success');
      } catch (e: any) {
        showToast(e.message || 'Failed to update role', 'danger');
      }
    })();
  };

  const handleDelete = () => {
    (async () => {
      try {
        if (!selectedRole) return;
        const headers: any = { 'Content-Type': 'application/json' };
        const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
          ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
          : undefined;
        if (adminSecret) headers['x-admin-secret'] = adminSecret;
        const res = await fetch('/api/roles', { method: 'PATCH', headers, body: JSON.stringify({ action: 'soft_delete', roleId: selectedRole.id }) });
        const json = await parseJSONSafe(res);
        if (json?.error) throw new Error(json.error);
        try { await hideModalById('delete_role'); } catch (_) { }
        setSelectedRole(null);
        await fetchRoles();
        showToast('Role deleted', 'success');
      } catch (e: any) {
        showToast(e.message || 'Failed to delete role', 'danger');
      }
    })();
  };

  const toggleStatus = (r: any) => {
    setRoles(roles.map(role => (role.id === r.id ? { ...role, Status: role.Status === "Active" ? "Inactive" : "Active" } : role)));
  };

  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content">
          {/* Start Page Header */}
          <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
            <div className="flex-grow-1">
              <h4 className="fw-bold mb-0">Roles</h4>
            </div>
            <div className="text-end d-flex">
              <Link
                href="#"
                className="btn btn-primary ms-2 fs-13 btn-md"
                data-bs-toggle="modal"
                data-bs-target="#add_role"
              >
                <i className="ti ti-plus me-1" />
                New Role
              </Link>
            </div>
          </div>
          {/* End Page Header */}
          <div className="table-responsive">
            <Datatable
              columns={columns}
              dataSource={roles}
              Selection={false}
              searchText={""}
            />
          </div>
        </div>
        {/* End Content */}
        {/* Footer Start */}
        <div className="footer text-center bg-white p-2 border-top">
          <p className="text-dark mb-0">
            2025 ©
            <Link href="#" className="link-primary">
              EMR
            </Link>
            , All Rights Reserved
          </p>
        </div>
        {/* Footer End */}
      </div>
      {/* ========================
			End Page Content
		========================= */}

      {/* Start Add Modal */}
      <div id="add_role" className="modal fade">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="text-dark modal-title fw-bold">New Role</h4>
              <button
                type="button"
                className="btn-close btn-close-modal custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form onSubmit={handleAddRole}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    Role<span className="text-danger ms-1">*</span>
                  </label>
                  <input type="text" className="form-control" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} />
                </div>
                <div className="mb-0">
                  <label className="form-label">User Type<span className="text-danger ms-1">*</span></label>
                  <select className="form-control" value={newRoleType.value} onChange={(e) => setNewRoleType(userTypeOptions.find(u => u.value === e.target.value) || userTypeOptions[0])}>
                    {userTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer d-flex align-items-center gap-1">
                <button
                  type="button"
                  className="btn btn-white border"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add New Role
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* End Add Modal */}
      {/* Start Add Modal */}
      <div id="edit_role" className="modal fade">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="text-dark modal-title fw-bold">Edit Role</h4>
              <button
                type="button"
                className="btn-close btn-close-modal custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    Role<span className="text-danger ms-1">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedRole?.Role ?? ""}
                    onChange={(e) => setSelectedRole({ ...selectedRole, Role: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">User Type<span className="text-danger ms-1">*</span></label>
                  <select className="form-control" value={selectedRole?.User_Type ?? userTypeOptions[0].value} onChange={(e) => setSelectedRole({ ...selectedRole, User_Type: e.target.value })}>
                    {userTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-0">
                  <label className="form-label">
                    Status<span className="text-danger ms-1">*</span>
                  </label>
                  <select className="form-control" value={selectedRole?.Status ?? "Active"} onChange={(e) => setSelectedRole({ ...selectedRole, Status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer d-flex align-items-center gap-1">
                <button
                  type="button"
                  className="btn btn-white border"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* End Add Modal */}
      {/* Start Delete Modal  */}
      <div className="modal fade" id="delete_role">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-body text-center position-relative z-1">
              <ImageWithBasePath
                src="assets/img/bg/delete-modal-bg-01.png"
                alt=""
                className="img-fluid position-absolute top-0 start-0 z-n1"
              />
              <ImageWithBasePath
                src="assets/img/bg/delete-modal-bg-02.png"
                alt=""
                className="img-fluid position-absolute bottom-0 end-0 z-n1"
              />
              <div className="mb-3">
                <span className="avatar avatar-lg bg-danger text-white">
                  <i className="ti ti-trash fs-24" />
                </span>
              </div>
              <h5 className="fw-bold mb-1">Delete Confirmation</h5>
              <p className="mb-3">Are you sure want to delete?</p>
              <div className="d-flex justify-content-center">
                <Link
                  href="javascript:void(0);"
                  className="btn btn-light position-relative z-1 me-3"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <button type="button" onClick={handleDelete} className="btn btn-danger position-relative z-1">
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Delete Modal  */}

    </>
  );
};

export default RolesAndPermissionsComponent;
