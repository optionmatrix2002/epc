"use client";

import { useEffect, useState } from "react";
import Datatable from "@/core/common/dataTable";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";
import CommonSelect from "@/core/common/common-select/commonSelect";
import { StatusActive } from "@/core/common/selectOption";
import ImageWithBasePath from "@/core/imageWithBasePath";

const UsersComponent = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [roleOptions, setRoleOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [rolesMap, setRolesMap] = useState<Record<string, string>>({});
    const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [editEmail, setEditEmail] = useState("");
    const [editName, setEditName] = useState("");
    const [editRole, setEditRole] = useState("");
    const [resetUserId, setResetUserId] = useState<string | null>(null);
    const [resetPassword, setResetPassword] = useState("");
    const [resetConfirm, setResetConfirm] = useState("");
    const [resetShowPassword, setResetShowPassword] = useState(false);
    const [resetShowConfirm, setResetShowConfirm] = useState(false);

    // Lightweight toast helper (uses Bootstrap classes if available). Appends to body.
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
            // auto remove
            setTimeout(() => { toast.classList.remove('show'); try { toast.remove(); } catch (_) { } }, 4000);
        } catch (e) {
            // fallback to alert if DOM manipulation fails
            // eslint-disable-next-line no-alert
            alert(message);
        }
    };

    const hideModalById = async (id: string) => {
        return new Promise<void>((resolve) => {
            try {
                const modalEl = document.getElementById(id);
                // @ts-ignore
                const bs = (window as any).bootstrap;
                if (!modalEl) return resolve();

                let resolved = false;
                const finish = () => {
                    if (resolved) return;
                    resolved = true;
                    // final cleanup to be safe
                    try {
                        modalEl.classList.remove('show');
                        (modalEl as any).style.display = 'none';
                        modalEl.setAttribute('aria-hidden', 'true');
                        modalEl.removeAttribute('aria-modal');
                        modalEl.querySelectorAll('.show').forEach(el => el.classList.remove('show'));
                        try { document.body.classList.remove('modal-open'); (document.body as any).style.overflow = ''; (document.body as any).style.paddingRight = ''; } catch (_) { }
                        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
                        try { const ev = new Event('hidden.bs.modal'); modalEl.dispatchEvent(ev); } catch (_) { }
                    } catch (cleanupErr) { console.debug('[users] hideModal cleanup', cleanupErr); }
                    resolve();
                };

                // If Bootstrap Modal API is available, call hide and wait for the hidden event
                try {
                    if (bs && bs.Modal) {
                        // @ts-ignore
                        const inst = bs.Modal.getInstance(modalEl) ?? bs.Modal.getOrCreateInstance?.(modalEl) ?? new bs.Modal(modalEl);
                        // listen once for hidden event
                        const onHidden = () => { try { modalEl.removeEventListener('hidden.bs.modal', onHidden); } catch (_) { }; finish(); };
                        // Some bootstrap versions dispatch 'hidden.bs.modal' as a CustomEvent
                        modalEl.addEventListener('hidden.bs.modal', onHidden);
                        // call hide (if instance exists)
                        try { inst?.hide?.(); } catch (hideErr) { console.debug('[users] bootstrap hide threw', hideErr); }
                        // fallback timeout in case event doesn't fire
                        setTimeout(() => finish(), 600);
                        return;
                    }
                } catch (err) {
                    console.debug('[users] bootstrap modal hide failed', err);
                }

                // No bootstrap available — perform DOM cleanup and resolve
                finish();
            } catch (e) {
                console.debug('[users] hideModalById error', e);
                resolve();
            }
        });
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // By default show Admin users from profiles table
            const res = await fetch('/api/users?userType=Admin');
            const json = await res.json();
            setData(json.users || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoleOptions = async (userType: string) => {
        try {
            const res = await fetch(`/api/roles?userType=${encodeURIComponent(userType)}`);
            const json = await res.json();
            const list = json.roles || [];
            // Filter strictly by user_type / userType (defensive: support both keys)
            const filtered = list.filter((r: any) => {
                const rt = (r.user_type ?? r.userType ?? r.usertype ?? '').toString().toLowerCase();
                return rt === (userType || '').toString().toLowerCase();
            });
            const finalList = filtered.length ? filtered : [];
            const opts = finalList.map((r: any) => ({ label: r.role_name, value: String(r.id) }));
            const map: Record<string, string> = {};
            finalList.forEach((r: any) => { map[String(r.id)] = r.role_name; });
            setRoleOptions(opts);
            setRolesMap(map);
        } catch (e) {
            console.error('[users] fetchRoleOptions', e);
        }
    };

    useEffect(() => { fetchUsers(); }, []);
    useEffect(() => { fetchRoleOptions('Admin'); }, []);

    const columns = [
        { title: 'Name', dataIndex: 'user_metadata.name', render: (val: any, record: any) => record.user_metadata?.name ?? record.email },
        { title: 'Email', dataIndex: 'email' },
        {
            title: 'Role', dataIndex: 'user_metadata.role', render: (val: any, record: any) => {
                const roleId = record?.admin?.role_id ?? record?.profile?.role_id ?? record?.user_metadata?.role_id ?? record?.role_id;
                if (roleId && rolesMap[String(roleId)]) return rolesMap[String(roleId)];
                return record.profile?.user_type ?? val ?? 'User';
            }
        },
        {
            title: 'Status', dataIndex: 'admin.is_active', render: (_: any, record: any) => {
                const isActive = record?.admin?.is_active ?? false;
                const userId = record?.id ?? record?.user?.id ?? record?.user?.user?.id;
                const isLoading = !!(userId && loadingIds[userId]);
                // Make the badge clickable to toggle active/inactive
                return (
                    <span
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggleActive(record); } }}
                        onClick={async (e) => { e.preventDefault(); await handleToggleActive(record); }}
                        className={`badge ${isActive ? 'badge-soft-success' : 'badge-soft-danger'} border ${isActive ? 'border-success' : 'border-danger'} px-2 py-1 fs-13 fw-medium`}
                        style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                        aria-disabled={isLoading}
                    >
                        {isLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : (isActive ? 'Active' : 'Inactive')}
                    </span>
                );
            }
        },

        {
            title: 'Actions', render: (v: any, r: any) => {
                const userId = r?.id ?? r?.user?.id ?? r?.user?.user?.id;
                const isLoading = !!(userId && loadingIds[userId]);
                if (isLoading) {
                    return <div><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span></div>;
                }
                return (
                    <div className="action-item">
                        <a href="#" onClick={(e) => e.preventDefault()} data-bs-toggle="dropdown"><i className="ti ti-dots-vertical" /></a>
                        <ul className="dropdown-menu p-2">
                            <li><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleEditOpen(r); }}>Edit</a></li>
                            <li><a href="#" className="dropdown-item text-danger" onClick={async (e) => { e.preventDefault(); await handleSoftDelete(r); }}>Delete</a></li>
                        </ul>
                    </div>
                );
            }
        }
        ,
        {
            title: 'Reset Password', render: (v: any, r: any) => {
                const userId = r?.id ?? r?.user?.id ?? r?.user?.user?.id;
                return (
                    <div>
                        <a href="#" className="text-primary" onClick={(e) => { e.preventDefault(); handleResetOpen(r); }} title="Reset Password"><i className="ti ti-key" /></a>
                    </div>
                );
            }
        }
    ];

    const handleResetOpen = (record: any) => {
        const userId = record?.id ?? record?.user?.id ?? record?.user?.user?.id ?? null;
        setResetUserId(userId);
        setResetPassword('');
        setResetConfirm('');
        try {
            const modalEl = document.getElementById('reset_password');
            // @ts-ignore
            const bs = (window as any).bootstrap;
            if (modalEl && bs && bs.Modal) {
                // @ts-ignore
                const inst = bs.Modal.getOrCreateInstance(modalEl) ?? new bs.Modal(modalEl);
                inst.show();
                return;
            }
            if (modalEl) {
                modalEl.classList.add('show');
                (modalEl as any).style.display = 'block';
                document.body.classList.add('modal-open');
                if (!document.querySelector('.modal-backdrop')) {
                    const backdrop = document.createElement('div');
                    backdrop.className = 'modal-backdrop fade show';
                    document.body.appendChild(backdrop);
                }
            }
        } catch (e) { console.debug('[users] handleResetOpen error', e); }
    };

    const handleResetSubmit = async (e: any) => {
        e.preventDefault();
        const userId = resetUserId;
        if (!userId) return showToast('User id missing', 'danger');
        if (!resetPassword || resetPassword.length < 6) return showToast('Password must be at least 6 characters', 'danger');
        if (resetPassword !== resetConfirm) return showToast('Passwords do not match', 'danger');
        try {
            setLoadingIds(prev => ({ ...prev, [userId]: true }));
            const headers: any = { 'Content-Type': 'application/json' };
            const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
                ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
                : undefined;
            if (adminSecret) headers['x-admin-secret'] = adminSecret;
            const res = await fetch('/api/users', { method: 'PATCH', headers, body: JSON.stringify({ action: 'reset_password', userId, password: resetPassword }) });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            try { await hideModalById('reset_password'); } catch (_) { }
            setResetUserId(null);
            setResetPassword('');
            setResetConfirm('');
            await fetchUsers();
            showToast('Password reset successfully', 'success');
        } catch (e: any) {
            showToast(e.message || 'Failed to reset password', 'danger');
        } finally {
            if (userId) setLoadingIds(prev => { const c = { ...prev }; delete c[userId]; return c; });
        }
    };

    const handleAddUser = async (e: any) => {
        e.preventDefault();
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            // If you need to provide an admin secret from the client for local/dev,
            // expose it explicitly as NEXT_PUBLIC_ADMIN_API_SECRET (not recommended for prod).
            // Use a typeof check to avoid runtime ReferenceError when `process` is not defined.
            const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
                ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
                : undefined;
            if (adminSecret) {
                headers['x-admin-secret'] = adminSecret;
            }
            const res = await fetch('/api/users', {
                method: 'POST',
                headers,
                body: JSON.stringify({ email, name, role: rolesMap[role] || role, role_id: role || null, userType: 'Admin' })
            });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            // close modal and refresh (use Bootstrap modal API safely)
            try {
                await hideModalById('add_user');
            } catch (e) {
                console.debug('[users] hide add_user failed', e);
            }

            // After modal is closed, clear the inputs and refresh list
            setEmail(''); setName(''); setRole('');
            await fetchUsers();
            // Optionally send magic link to user via client supabase or instruct admin to send
            // Show success feedback and refresh the list
            showToast('User created. A confirmation email (magic link) was requested.', 'success');
        } catch (err: any) {
            showToast(err.message || 'Failed to add user', 'danger');
        }
    };

    const handleToggleActive = async (record: any) => {
        const userId = record?.id ?? record?.user?.id ?? record?.user?.user?.id;
        const current = record?.admin?.is_active ?? true;
        if (!userId) return alert('User id missing');
        const ok = confirm(`Are you sure you want to ${current ? 'deactivate' : 'activate'} this admin?`);
        if (!ok) return;
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
                ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
                : undefined;
            if (adminSecret) headers['x-admin-secret'] = adminSecret;
            setLoadingIds(prev => ({ ...prev, [userId]: true }));
            const res = await fetch('/api/users', { method: 'PATCH', headers, body: JSON.stringify({ action: 'toggle_active', userId, isActive: !current }) });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            await fetchUsers();
            setLoadingIds(prev => { const c = { ...prev }; delete c[userId]; return c; });
        } catch (e: any) {
            setLoadingIds(prev => { const c = { ...prev }; if (userId) delete c[userId]; return c; });
            alert(e.message || 'Failed to update active state');
        }
    };

    const handleSoftDelete = async (record: any) => {
        const userId = record?.id ?? record?.user?.id ?? record?.user?.user?.id;
        if (!userId) return alert('User id missing');
        const ok = confirm('Are you sure you want to delete this admin? This is a soft delete.');
        if (!ok) return;
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
                ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
                : undefined;
            if (adminSecret) headers['x-admin-secret'] = adminSecret;
            setLoadingIds(prev => ({ ...prev, [userId]: true }));
            const res = await fetch('/api/users', { method: 'PATCH', headers, body: JSON.stringify({ action: 'soft_delete', userId }) });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            await fetchUsers();
            setLoadingIds(prev => { const c = { ...prev }; delete c[userId]; return c; });
        } catch (e: any) {
            setLoadingIds(prev => { const c = { ...prev }; if (userId) delete c[userId]; return c; });
            alert(e.message || 'Failed to delete admin');
        }
    };

    const handleEditOpen = (record: any) => {
        const userId = record?.id ?? record?.user?.id ?? record?.user?.user?.id ?? record?.id;
        setEditingUser({ id: userId, record });
        setEditEmail(record?.email ?? '');
        setEditName(record?.user_metadata?.name ?? '');
        // try to pick a stored role_id if present, fallback to existing role text
        const detectedRoleId = record?.admin?.role_id ?? record?.profile?.role_id ?? record?.user_metadata?.role_id ?? record?.role_id ?? null;
        setEditRole(detectedRoleId ? String(detectedRoleId) : (record?.user_metadata?.role ?? ''));
        try {
            console.debug('[users] handleEditOpen', { userId, record });
            const modalEl = document.getElementById('edit_user');
            // @ts-ignore
            const bs = (window as any).bootstrap;

            // First: hide any open dropdowns to avoid dropdown staying above the modal or blocking interaction
            try {
                const openMenus = Array.from(document.querySelectorAll('.dropdown-menu.show')) as HTMLElement[];
                openMenus.forEach(menu => {
                    const toggle = menu.parentElement?.querySelector('[data-bs-toggle="dropdown"]') as HTMLElement | null;
                    if (bs && bs.Dropdown && toggle) {
                        try {
                            // @ts-ignore
                            const dropInst = bs.Dropdown.getInstance(toggle) ?? new bs.Dropdown(toggle);
                            dropInst.hide?.();
                        } catch (ddErr) {
                            // fallback to removing classes
                            menu.classList.remove('show');
                            toggle.classList.remove('show');
                        }
                    } else {
                        // No bootstrap available; best-effort remove classes
                        menu.classList.remove('show');
                        const toggle = menu.parentElement?.querySelector('[data-bs-toggle="dropdown"]');
                        toggle?.classList?.remove('show');
                    }
                });
            } catch (err) {
                console.debug('[users] hide dropdowns failed', err);
            }

            // Now show modal using Bootstrap Modal API when available
            if (modalEl) {
                try {
                    if (bs && bs.Modal) {
                        // Prefer getOrCreateInstance then show immediately
                        // @ts-ignore
                        const inst = bs.Modal.getOrCreateInstance(modalEl) ?? new bs.Modal(modalEl);
                        inst.show();
                        console.debug('[users] shown modal via bootstrap.Modal');
                        return;
                    }
                } catch (innerErr) {
                    console.debug('[users] bootstrap.Modal show failed', innerErr);
                }

                // DOM fallback: remove stale backdrops, add modal classes and display it
                try {
                    // remove any existing backdrops to avoid stacking
                    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
                    modalEl.classList.add('show');
                    (modalEl as any).style.display = 'block';
                    document.body.classList.add('modal-open');
                    if (!document.querySelector('.modal-backdrop')) {
                        const backdrop = document.createElement('div');
                        backdrop.className = 'modal-backdrop fade show';
                        document.body.appendChild(backdrop);
                    }
                    console.debug('[users] shown modal via DOM fallback');
                    return;
                } catch (domErr) {
                    console.error('[users] DOM fallback to show modal failed', domErr);
                }
            } else {
                console.error('[users] edit_user modal element not found');
            }
        } catch (e) {
            console.error('[users] handleEditOpen error', e);
        }
    };

    const handleEditSubmit = async (e: any) => {
        e.preventDefault();
        if (!editingUser?.id) return alert('No editing user');
        const userId = editingUser.id;
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
                ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
                : undefined;
            if (adminSecret) headers['x-admin-secret'] = adminSecret;
            setLoadingIds(prev => ({ ...prev, [userId]: true }));
            const res = await fetch('/api/users', { method: 'PATCH', headers, body: JSON.stringify({ action: 'edit', userId, email: editEmail, name: editName, role: rolesMap[editRole] || editRole, role_id: editRole || null }) });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            try {
                await hideModalById('edit_user');
            } catch (ee) { console.debug('[users] hide edit_user failed', ee); }
            setEditingUser(null);
            await fetchUsers();
            setLoadingIds(prev => { const c = { ...prev }; delete c[userId]; return c; });
            showToast('User updated Success', 'success');
        } catch (e: any) {
            setLoadingIds(prev => { const c = { ...prev }; if (userId) delete c[userId]; return c; });
            showToast(e.message || 'Failed to update user', 'danger');
        }
    };



    return (
        <>
            <div className="page-wrapper">
                <div className="content">
                    <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                        <div className="flex-grow-1"><h4 className="fw-bold mb-0">Users</h4></div>
                        <div className="text-end d-flex">
                            <Link href="#" className="btn btn-primary ms-2 fs-13 btn-md" data-bs-toggle="modal" data-bs-target="#add_user">
                                <i className="ti ti-plus me-1" /> New User
                            </Link>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <Datatable columns={columns} dataSource={data} Selection={false} searchText={""} />
                    </div>
                </div>
            </div>

            <div id="reset_password" className="modal fade">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="text-dark modal-title fw-bold">Reset Password</h4>
                            <button type="button" className="btn-close btn-close-modal custom-btn-close" data-bs-dismiss="modal" aria-label="Close"><i className="ti ti-x" /></button>
                        </div>
                        <form onSubmit={handleResetSubmit}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">New Password</label>
                                    <div className="input-group">
                                        <input type={resetShowPassword ? 'text' : 'password'} className="form-control" value={resetPassword} onChange={e => setResetPassword(e.target.value)} />
                                        <button type="button" className="btn btn-light border" onClick={() => setResetShowPassword(s => !s)} aria-label="Toggle password visibility">
                                            <i className={resetShowPassword ? 'ti ti-eye-off' : 'ti ti-eye'} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Confirm Password</label>
                                    <div className="input-group">
                                        <input type={resetShowConfirm ? 'text' : 'password'} className="form-control" value={resetConfirm} onChange={e => setResetConfirm(e.target.value)} />
                                        <button type="button" className="btn btn-light border" onClick={() => setResetShowConfirm(s => !s)} aria-label="Toggle confirm password visibility">
                                            <i className={resetShowConfirm ? 'ti ti-eye-off' : 'ti ti-eye'} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer d-flex align-items-center gap-1">
                                <button type="button" className="btn btn-white border" data-bs-dismiss="modal" onClick={() => { try { hideModalById('reset_password'); } catch (_) { } }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Set Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>



            <div id="edit_user" className="modal fade">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="text-dark modal-title fw-bold">Edit User</h4>
                            <button type="button" className="btn-close btn-close-modal custom-btn-close" data-bs-dismiss="modal" aria-label="Close"><i className="ti ti-x" /></button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-body">
                                <div className="mb-3"><label className="form-label">Name</label><input className="form-control" value={editName} onChange={e => setEditName(e.target.value)} /></div>
                                <div className="mb-3"><label className="form-label">Email</label><input className="form-control" value={editEmail} onChange={e => setEditEmail(e.target.value)} /></div>
                                <div className="mb-0">
                                    <label className="form-label">Role</label>
                                    <select className="form-control" value={editRole} onChange={e => setEditRole(e.target.value)}>
                                        <option value="">Select role</option>
                                        {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer d-flex align-items-center gap-1">
                                <button type="button" className="btn btn-white border" data-bs-dismiss="modal" onClick={() => { try { hideModalById('edit_user'); } catch (_) { } }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div id="add_user" className="modal fade">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="text-dark modal-title fw-bold">New User</h4>
                            <button type="button" className="btn-close btn-close-modal custom-btn-close" data-bs-dismiss="modal" aria-label="Close"><i className="ti ti-x" /></button>
                        </div>
                        <form onSubmit={handleAddUser}>
                            <div className="modal-body">
                                <div className="mb-3"><label className="form-label">Name</label><input className="form-control" value={name} onChange={e => setName(e.target.value)} /></div>
                                <div className="mb-3"><label className="form-label">Email</label><input className="form-control" value={email} onChange={e => setEmail(e.target.value)} /></div>
                                <div className="mb-3">
                                    <label className="form-label">Role</label>
                                    <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
                                        <option value="">Select role</option>
                                        {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>

                            </div>
                            <div className="modal-footer d-flex align-items-center gap-1">
                                <button type="button" className="btn btn-white border" data-bs-dismiss="modal" onClick={() => { try { hideModalById('add_user'); } catch (_) { } }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add New User</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default UsersComponent;
