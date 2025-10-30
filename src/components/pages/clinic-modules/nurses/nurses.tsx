"use client";

import { useEffect, useState, useMemo } from "react"; // Added useMemo
import Datatable from "@/core/common/dataTable";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";
import CommonSelect from "@/core/common/common-select/commonSelect";
import { StatusActive } from "@/core/common/selectOption";
import ImageWithBasePath from "@/core/imageWithBasePath";

const NursesComponent = () => {
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
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [addAddress, setAddAddress] = useState("");
    const [addZip, setAddZip] = useState("");
    const [addStateId, setAddStateId] = useState<number | null>(null);
    const [addCityId, setAddCityId] = useState<number | null>(null);
    const [editAddress, setEditAddress] = useState("");
    const [editZip, setEditZip] = useState("");
    const [editStateId, setEditStateId] = useState<number | null>(null);
    const [editCityId, setEditCityId] = useState<number | null>(null);
    const [resetUserId, setResetUserId] = useState<string | null>(null);
    const [resetPassword, setResetPassword] = useState("");
    const [resetConfirm, setResetConfirm] = useState("");
    const [resetShowPassword, setResetShowPassword] = useState(false);
    const [resetShowConfirm, setResetShowConfirm] = useState(false);

    // New states for submit button loading and filter
    const [isAddingNurse, setIsAddingNurse] = useState(false);
    const [searchText, setSearchText] = useState("");

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
                    try {
                        modalEl.classList.remove('show');
                        (modalEl as any).style.display = 'none';
                        modalEl.setAttribute('aria-hidden', 'true');
                        modalEl.removeAttribute('aria-modal');
                        modalEl.querySelectorAll('.show').forEach(el => el.classList.remove('show'));
                        try { document.body.classList.remove('modal-open'); (document.body as any).style.overflow = ''; (document.body as any).style.paddingRight = ''; } catch (_) { }
                        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
                        try { const ev = new Event('hidden.bs.modal'); modalEl.dispatchEvent(ev); } catch (_) { }
                    } catch (cleanupErr) { console.debug('[nurses] hideModal cleanup', cleanupErr); }
                    resolve();
                };

                try {
                    if (bs && bs.Modal) {
                        // @ts-ignore
                        const inst = bs.Modal.getInstance(modalEl) ?? bs.Modal.getOrCreateInstance?.(modalEl) ?? new bs.Modal(modalEl);
                        const onHidden = () => { try { modalEl.removeEventListener('hidden.bs.modal', onHidden); } catch (_) { }; finish(); };
                        modalEl.addEventListener('hidden.bs.modal', onHidden);
                        try { inst?.hide?.(); } catch (hideErr) { console.debug('[nurses] bootstrap hide threw', hideErr); }
                        setTimeout(() => finish(), 600);
                        return;
                    }
                } catch (err) {
                    console.debug('[nurses] bootstrap modal hide failed', err);
                }

                finish();
            } catch (e) {
                console.debug('[nurses] hideModalById error', e);
                resolve();
            }
        });
    };

    const fetchNurses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/nurses?userType=Nurse');
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
            console.error('[nurses] fetchRoleOptions', e);
        }
    };

    useEffect(() => { fetchNurses(); fetchStatesAndCities(); }, []);
    useEffect(() => { fetchRoleOptions('Nurse'); }, []);

    const fetchStatesAndCities = async () => {
        try {
            const [sRes, cRes] = await Promise.all([fetch('/api/states'), fetch('/api/cities')]);
            const sJson = await sRes.json().catch(() => ({}));
            const cJson = await cRes.json().catch(() => ({}));
            setStates(sJson.states || []);
            setCities(cJson.cities || []);
        } catch (e) {
            console.debug('[nurses] failed to load states/cities', e);
        }
    };

    const columns = [
        { title: 'Name', dataIndex: 'user_metadata.name', render: (val: any, record: any) => record.user_metadata?.name ?? record.email },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Address', dataIndex: 'nurse.address', render: (v: any, r: any) => r?.nurse?.address ?? '' },
        { title: 'Zip', dataIndex: 'nurse.zip', render: (v: any, r: any) => r?.nurse?.zip ?? '' },
        { title: 'State', dataIndex: 'nurse.state_id', render: (v: any, r: any) => { const sid = r?.nurse?.state_id ?? null; const st = states.find(s => String(s.id) === String(sid)); return st ? st.name : (r?.nurse?.state_name ?? ''); } },
        { title: 'City', dataIndex: 'nurse.city_id', render: (v: any, r: any) => { const cid = r?.nurse?.city_id ?? null; const ct = cities.find(c => String(c.id) === String(cid)); return ct ? ct.name : (r?.nurse?.city_name ?? ''); } },
        {
            title: 'Role', dataIndex: 'user_metadata.role', render: (val: any, record: any) => {
                const roleId = record?.nurse?.role_id ?? record?.profile?.role_id ?? record?.user_metadata?.role_id ?? record?.role_id;
                if (roleId && rolesMap[String(roleId)]) return rolesMap[String(roleId)];
                return record.profile?.user_type ?? val ?? 'User';
            }
        },
        {
            title: 'Status', dataIndex: 'nurse.is_active', render: (_: any, record: any) => {
                const isActive = record?.nurse?.is_active ?? false;
                const userId = record?.id ?? record?.user?.id ?? record?.user?.user?.id;
                const isLoading = !!(userId && loadingIds[userId]);
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
        } catch (e) { console.debug('[nurses] handleResetOpen error', e); }
    };

    // Derived state for form validation
    const isAddFormValid = useMemo(() => {
        return !!(name && email && role && addStateId && addCityId && addAddress && addZip);
    }, [name, email, role, addStateId, addCityId, addAddress, addZip]);

    const isEditFormValid = useMemo(() => {
        return !!(editingUser && editName && editEmail && editRole && editStateId && editCityId && editAddress && editZip);
    }, [editingUser, editName, editEmail, editRole, editStateId, editCityId, editAddress, editZip]);

    const isResetFormValid = useMemo(() => {
        return !!(resetPassword && resetPassword.length >= 6 && resetPassword === resetConfirm);
    }, [resetPassword, resetConfirm]);


    const handleResetSubmit = async (e: any) => {
        e.preventDefault();
        const userId = resetUserId;
        if (!userId) return showToast('Nurse id missing', 'danger');

        if (!isResetFormValid) {
            if (!resetPassword || resetPassword.length < 6) return showToast('Password must be at least 6 characters', 'danger');
            if (resetPassword !== resetConfirm) return showToast('Passwords do not match', 'danger');
            return;
        }

        try {
            setLoadingIds(prev => ({ ...prev, [userId]: true }));
            const headers: any = { 'Content-Type': 'application/json' };
            const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
                ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
                : undefined;
            if (adminSecret) headers['x-admin-secret'] = adminSecret;
            const res = await fetch('/api/nurses', { method: 'PATCH', headers, body: JSON.stringify({ action: 'reset_password', patientId: userId, password: resetPassword }) });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            try { await hideModalById('reset_password'); } catch (_) { }
            setResetUserId(null);
            setResetPassword('');
            setResetConfirm('');
            await fetchNurses();
            showToast('Password reset successfully', 'success');
        } catch (e: any) {
            showToast(e.message || 'Failed to reset password', 'danger');
        } finally {
            if (userId) setLoadingIds(prev => { const c = { ...prev }; delete c[userId]; return c; });
        }
    };

    const handleAddNurse = async (e: any) => {
        e.preventDefault();

        // Mandatory field check
        if (!isAddFormValid) {
            showToast('Please fill out all required fields.', 'danger');
            return;
        }

        setIsAddingNurse(true); // Show loader
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
                ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
                : undefined;
            if (adminSecret) {
                headers['x-admin-secret'] = adminSecret;
            }
            const res = await fetch('/api/nurses', {
                method: 'POST',
                headers,
                body: JSON.stringify({ email, name, role: rolesMap[role] || role, role_id: role || null, userType: 'Nurse', address: addAddress, zip: addZip, state_id: addStateId, city_id: addCityId })
            });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            try {
                await hideModalById('add_user');
            } catch (e) {
                console.debug('[nurses] hide add_user failed', e);
            }

            setEmail(''); setName(''); setRole('');
            setAddAddress(''); setAddZip(''); setAddStateId(null); setAddCityId(null);
            await fetchNurses();
            showToast('Nurse created. A confirmation email (magic link) was requested.', 'success');
        } catch (err: any) {
            showToast(err.message || 'Failed to add nurse', 'danger');
        } finally {
            setIsAddingNurse(false); // Hide loader
        }
    };

    const handleToggleActive = async (record: any) => {
        const userId = record?.id ?? record?.user?.id ?? record?.user?.user?.id;
        const current = record?.nurse?.is_active ?? true;
        if (!userId) return alert('Nurse id missing');
        const ok = confirm(`Are you sure you want to ${current ? 'deactivate' : 'activate'} this nurse?`);
        if (!ok) return;
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
                ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
                : undefined;
            if (adminSecret) headers['x-admin-secret'] = adminSecret;
            setLoadingIds(prev => ({ ...prev, [userId]: true }));
            const res = await fetch('/api/nurses', { method: 'PATCH', headers, body: JSON.stringify({ action: 'toggle_active', patientId: userId, isActive: !current }) });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            await fetchNurses();
            setLoadingIds(prev => { const c = { ...prev }; delete c[userId]; return c; });
        } catch (e: any) {
            setLoadingIds(prev => { const c = { ...prev }; if (userId) delete c[userId]; return c; });
            alert(e.message || 'Failed to update active state');
        }
    };

    const handleSoftDelete = async (record: any) => {
        const userId = record?.id ?? record?.user?.id ?? record?.user?.user?.id;
        if (!userId) return alert('Nurse id missing');
        const ok = confirm('Are you sure you want to delete this nurse? This is a soft delete.');
        if (!ok) return;
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
                ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
                : undefined;
            if (adminSecret) headers['x-admin-secret'] = adminSecret;
            setLoadingIds(prev => ({ ...prev, [userId]: true }));
            const res = await fetch('/api/nurses', { method: 'PATCH', headers, body: JSON.stringify({ action: 'soft_delete', patientId: userId }) });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            await fetchNurses();
            setLoadingIds(prev => { const c = { ...prev }; delete c[userId]; return c; });
        } catch (e: any) {
            setLoadingIds(prev => { const c = { ...prev }; if (userId) delete c[userId]; return c; });
            alert(e.message || 'Failed to delete nurse');
        }
    };

    const handleEditOpen = (record: any) => {
        const userId = record?.id ?? record?.user?.id ?? record?.user?.user?.id ?? record?.id;
        setEditingUser({ id: userId, record });
        setEditEmail(record?.email ?? '');
        setEditName(record?.user_metadata?.name ?? '');
        // prefer stored role_id for select, fallback to legacy role string
        const detectedRoleId = record?.nurse?.role_id ?? record?.profile?.role_id ?? record?.user_metadata?.role_id ?? record?.role_id ?? null;
        setEditRole(detectedRoleId ? String(detectedRoleId) : (record?.user_metadata?.role ?? ''));
        setEditAddress(record?.nurse?.address ?? '');
        setEditZip(record?.nurse?.zip ?? '');
        setEditStateId(record?.nurse?.state_id ?? null);
        setEditCityId(record?.nurse?.city_id ?? null);
        try {
            console.debug('[nurses] handleEditOpen', { userId, record });
            const modalEl = document.getElementById('edit_user');
            // @ts-ignore
            const bs = (window as any).bootstrap;

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
                            menu.classList.remove('show');
                            toggle.classList.remove('show');
                        }
                    } else {
                        menu.classList.remove('show');
                        const toggle = menu.parentElement?.querySelector('[data-bs-toggle="dropdown"]');
                        toggle?.classList?.remove('show');
                    }
                });
            } catch (err) {
                console.debug('[nurses] hide dropdowns failed', err);
            }

            if (modalEl) {
                try {
                    if (bs && bs.Modal) {
                        // @ts-ignore
                        const inst = bs.Modal.getOrCreateInstance(modalEl) ?? new bs.Modal(modalEl);
                        inst.show();
                        console.debug('[nurses] shown modal via bootstrap.Modal');
                        return;
                    }
                } catch (innerErr) {
                    console.debug('[nurses] bootstrap.Modal show failed', innerErr);
                }

                try {
                    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
                    modalEl.classList.add('show');
                    (modalEl as any).style.display = 'block';
                    document.body.classList.add('modal-open');
                    if (!document.querySelector('.modal-backdrop')) {
                        const backdrop = document.createElement('div');
                        backdrop.className = 'modal-backdrop fade show';
                        document.body.appendChild(backdrop);
                    }
                    console.debug('[nurses] shown modal via DOM fallback');
                    return;
                } catch (domErr) {
                    console.error('[nurses] DOM fallback to show modal failed', domErr);
                }
            } else {
                console.error('[nurses] edit_user modal element not found');
            }
        } catch (e) {
            console.error('[nurses] handleEditOpen error', e);
        }
    };

    const handleEditSubmit = async (e: any) => {
        e.preventDefault();

        // Mandatory field check
        if (!isEditFormValid) {
            showToast('Please fill out all required fields.', 'danger');
            return;
        }

        if (!editingUser?.id) return alert('No editing nurse');
        const userId = editingUser.id;
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
                ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
                : undefined;
            if (adminSecret) headers['x-admin-secret'] = adminSecret;
            setLoadingIds(prev => ({ ...prev, [userId]: true }));
            const res = await fetch('/api/nurses', { method: 'PATCH', headers, body: JSON.stringify({ action: 'edit', patientId: userId, email: editEmail, name: editName, role: rolesMap[editRole] || editRole, role_id: editRole || null, address: editAddress, zip: editZip, state_id: editStateId, city_id: editCityId }) });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            try {
                await hideModalById('edit_user');
            } catch (ee) { console.debug('[nurses] hide edit_user failed', ee); }
            setEditingUser(null);
            await fetchNurses();
            setLoadingIds(prev => { const c = { ...prev }; delete c[userId]; return c; });
            showToast('Nurse updated Success', 'success');
        } catch (e: any) {
            setLoadingIds(prev => { const c = { ...prev }; if (userId) delete c[userId]; return c; });
            showToast(e.message || 'Failed to update nurse', 'danger');
        }
    };

    // Determine loading state for edit button
    const isEditing = !!(editingUser && loadingIds[editingUser.id]);
    // Determine loading state for reset password button
    const isResetting = !!(resetUserId && loadingIds[resetUserId]);

    return (
        <>
            <div className="page-wrapper">
                <div className="content">
                    <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                        <div className="flex-grow-1"><h4 className="fw-bold mb-0">Nurses <span className="badge badge-soft-primary fw-medium border py-1 px-2 border-primary fs-13 ms-1">
                            Total Nurses : {data.length}
                        </span></h4></div>

                        {/* Filter Input */}
                        <div className="me-2" style={{ minWidth: '220px' }}>
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Filter by name, email..."
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                            />
                        </div>

                        <div className="text-end d-flex">
                            <div className="dropdown me-1">
                                <Link
                                    href="#"
                                    className="btn btn-md fs-14 fw-normal border bg-white rounded text-dark d-inline-flex align-items-center"
                                    data-bs-toggle="dropdown"
                                >
                                    Export
                                    <i className="ti ti-chevron-down ms-2" />
                                </Link>
                                <ul className="dropdown-menu p-2">
                                    <li>
                                        <Link className="dropdown-item" href="#">
                                            Download as PDF
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" href="#">
                                            Download as Excel
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* <div className="bg-white border shadow-sm rounded px-1 pb-0 text-center d-flex align-items-center justify-content-center">
                                ... (grid/list view toggle)
                            </div> */}
                            <Link href="#" className="btn btn-primary ms-2 fs-13 btn-md" data-bs-toggle="modal" data-bs-target="#add_user">
                                <i className="ti ti-plus me-1" /> New Nurse
                            </Link>
                        </div>
                    </div>
                    <div className="table-responsive">
                        {/* Pass searchText to Datatable */}
                        <Datatable columns={columns} dataSource={data} Selection={false} searchText={searchText} />
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
                                    <label className="form-label">New Password <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <input type={resetShowPassword ? 'text' : 'password'} className="form-control" value={resetPassword} onChange={e => setResetPassword(e.target.value)} />
                                        <button type="button" className="btn btn-light border" onClick={() => setResetShowPassword(s => !s)} aria-label="Toggle password visibility">
                                            <i className={resetShowPassword ? 'ti ti-eye-off' : 'ti ti-eye'} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Confirm Password <span className="text-danger">*</span></label>
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
                                {/* Submit button with loader and disabled state */}
                                <button type="submit" className="btn btn-primary" disabled={!isResetFormValid || isResetting}>
                                    {isResetting ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Set Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>


            <div id="edit_user" className="modal fade">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="text-dark modal-title fw-bold">Edit Nurse</h4>
                            <button type="button" className="btn-close btn-close-modal custom-btn-close" data-bs-dismiss="modal" aria-label="Close"><i className="ti ti-x" /></button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-6 mb-3"><label className="form-label">Name <span className="text-danger">*</span></label><input className="form-control" value={editName} onChange={e => setEditName(e.target.value)} /></div>
                                    <div className="col-6 mb-3"><label className="form-label">Email <span className="text-danger">*</span></label><input className="form-control" value={editEmail} onChange={e => setEditEmail(e.target.value)} /></div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Role <span className="text-danger">*</span></label>
                                    {/* Use form-select for dropdown arrow */}
                                    <select className="form-select" value={editRole} onChange={e => setEditRole(e.target.value)}>
                                        <option value="">Select role</option>
                                        {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                                <div className="row">
                                    <div className="col-6 mb-3">
                                        <label className="form-label">State <span className="text-danger">*</span></label>
                                        {/* Use form-select for dropdown arrow */}
                                        <select className="form-select" value={editStateId ?? ''} onChange={e => { setEditStateId(e.target.value ? Number(e.target.value) : null); setEditCityId(null); }}>
                                            <option value="">-- Select State --</option>
                                            {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label className="form-label">City <span className="text-danger">*</span></label>
                                        {/* Use form-select for dropdown arrow */}
                                        <select className="form-select" value={editCityId ?? ''} onChange={e => setEditCityId(e.target.value ? Number(e.target.value) : null)}>
                                            <option value="">-- Select City --</option>
                                            {(cities || []).filter(c => !editStateId || String(c.state_id) === String(editStateId)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-6 mb-3"><label className="form-label">Address <span className="text-danger">*</span></label><textarea className="form-control" value={editAddress} onChange={e => setEditAddress(e.target.value)} /></div>
                                    <div className="col-6 mb-3"><label className="form-label">Zip <span className="text-danger">*</span></label><input className="form-control" value={editZip} onChange={e => setEditZip(e.target.value)} /></div>
                                </div>
                            </div>
                            <div className="modal-footer d-flex align-items-center gap-1">
                                <button type="button" className="btn btn-white border" data-bs-dismiss="modal" onClick={() => { try { hideModalById('edit_user'); } catch (_) { } }}>Cancel</button>
                                {/* Submit button with loader and disabled state */}
                                <button type="submit" className="btn btn-primary" disabled={!isEditFormValid || isEditing}>
                                    {isEditing ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div id="add_user" className="modal fade">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="text-dark modal-title fw-bold">New Nurse</h4>
                            <button type="button" className="btn-close btn-close-modal custom-btn-close" data-bs-dismiss="modal" aria-label="Close"><i className="ti ti-x" /></button>
                        </div>
                        <form onSubmit={handleAddNurse}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-6 mb-3"><label className="form-label">Name <span className="text-danger">*</span></label><input className="form-control" value={name} onChange={e => setName(e.target.value)} /></div>
                                    <div className="col-6 mb-3"><label className="form-label">Email <span className="text-danger">*</span></label><input className="form-control" value={email} onChange={e => setEmail(e.target.value)} /></div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Role <span className="text-danger">*</span></label>
                                    {/* Use form-select for dropdown arrow */}
                                    <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                                        <option value="">Select role</option>
                                        {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                                <div className="row">
                                    <div className="col-6 mb-3">
                                        <label className="form-label">State <span className="text-danger">*</span></label>
                                        {/* Use form-select for dropdown arrow */}
                                        <select className="form-select" value={addStateId ?? ''} onChange={e => { setAddStateId(e.target.value ? Number(e.target.value) : null); setAddCityId(null); }}>
                                            <option value="">-- Select State --</option>
                                            {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label className="form-label">City <span className="text-danger">*</span></label>
                                        {/* Use form-select for dropdown arrow */}
                                        <select className="form-select" value={addCityId ?? ''} onChange={e => setAddCityId(e.target.value ? Number(e.target.value) : null)}>
                                            <option value="">-- Select City --</option>
                                            {(cities || []).filter(c => !addStateId || String(c.state_id) === String(addStateId)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-6 mb-3"><label className="form-label">Address <span className="text-danger">*</span></label><textarea className="form-control" value={addAddress} onChange={e => setAddAddress(e.target.value)} /></div>
                                    <div className="col-6 mb-3"><label className="form-label">Zip <span className="text-danger">*</span></label><input className="form-control" value={addZip} onChange={e => setAddZip(e.target.value)} /></div>
                                </div>

                            </div>
                            <div className="modal-footer d-flex align-items-center gap-1">
                                <button type="button" className="btn btn-white border" data-bs-dismiss="modal" onClick={() => { try { hideModalById('add_user'); } catch (_) { } }}>Cancel</button>
                                {/* Submit button with loader and disabled state */}
                                <button type="submit" className="btn btn-primary" disabled={!isAddFormValid || isAddingNurse}>
                                    {isAddingNurse ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Add New Nurse'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default NursesComponent;