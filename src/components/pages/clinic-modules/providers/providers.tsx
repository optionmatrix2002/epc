"use client";

import { useEffect, useState, useMemo } from "react"; // Import useMemo
import Datatable from "@/core/common/dataTable";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";
import CommonSelect from "@/core/common/common-select/commonSelect";
import { StatusActive } from "@/core/common/selectOption";
import ImageWithBasePath from "@/core/imageWithBasePath";

const ProvidersComponent = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [editEmail, setEditEmail] = useState("");
    const [editName, setEditName] = useState("");
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
    const [isAddingProvider, setIsAddingProvider] = useState(false);
    const [searchText, setSearchText] = useState("");

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
                    } catch (cleanupErr) { console.debug('[providers] hideModal cleanup', cleanupErr); }
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
                        try { inst?.hide?.(); } catch (hideErr) { console.debug('[providers] bootstrap hide threw', hideErr); }
                        // fallback timeout in case event doesn't fire
                        setTimeout(() => finish(), 600);
                        return;
                    }
                } catch (err) {
                    console.debug('[providers] bootstrap modal hide failed', err);
                }

                // No bootstrap available — perform DOM cleanup and resolve
                finish();
            } catch (e) {
                console.debug('[providers] hideModalById error', e);
                resolve();
            }
        });
    };

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/providers?userType=Provider');
            const json = await res.json();
            setData(json.users || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProviders(); fetchStatesAndCities(); }, []);

    const fetchStatesAndCities = async () => {
        try {
            const [sRes, cRes] = await Promise.all([fetch('/api/states'), fetch('/api/cities')]);
            const sJson = await sRes.json().catch(() => ({}));
            const cJson = await cRes.json().catch(() => ({}));
            setStates(sJson.states || []);
            setCities(cJson.cities || []);
        } catch (e) {
            console.debug('[providers] failed to load states/cities', e);
        }
    };

    const columns = [
        { title: 'Name', dataIndex: 'user_metadata.name', render: (val: any, record: any) => record.user_metadata?.name ?? record.email },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Address', dataIndex: 'provider.address', render: (v: any, r: any) => r?.provider?.address ?? '' },
        { title: 'Zip', dataIndex: 'provider.zip', render: (v: any, r: any) => r?.provider?.zip ?? '' },
        { title: 'State', dataIndex: 'provider.state_id', render: (v: any, r: any) => { const sid = r?.provider?.state_id ?? null; const st = states.find(s => String(s.id) === String(sid)); return st ? st.name : (r?.provider?.state_name ?? ''); } },
        { title: 'City', dataIndex: 'provider.city_id', render: (v: any, r: any) => { const cid = r?.provider?.city_id ?? null; const ct = cities.find(c => String(c.id) === String(cid)); return ct ? ct.name : (r?.provider?.city_name ?? ''); } },

        {
            title: 'Status', dataIndex: 'provider.is_active', render: (_: any, record: any) => {
                const isActive = record?.provider?.is_active ?? false;
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

    // Derived state for form validation
    const isAddFormValid = useMemo(() => {
        return !!(name && email && addStateId && addCityId && addAddress && addZip);
    }, [name, email, addStateId, addCityId, addAddress, addZip]);

    const isEditFormValid = useMemo(() => {
        return !!(editingUser && editName && editEmail && editStateId && editCityId && editAddress && editZip);
    }, [editingUser, editName, editEmail, editStateId, editCityId, editAddress, editZip]);

    const isResetFormValid = useMemo(() => {
        return !!(resetPassword && resetPassword.length >= 6 && resetPassword === resetConfirm);
    }, [resetPassword, resetConfirm]);

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
        } catch (e) { console.debug('[providers] handleResetOpen error', e); }
    };

    const handleResetSubmit = async (e: any) => {
        e.preventDefault();
        const userId = resetUserId;
        if (!userId) return showToast('Provider id missing', 'danger');

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
            const res = await fetch('/api/providers', { method: 'PATCH', headers, body: JSON.stringify({ action: 'reset_password', patientId: userId, password: resetPassword }) });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            try { await hideModalById('reset_password'); } catch (_) { }
            setResetUserId(null);
            setResetPassword('');
            setResetConfirm('');
            await fetchProviders();
            showToast('Password reset successfully', 'success');
        } catch (e: any) {
            showToast(e.message || 'Failed to reset password', 'danger');
        } finally {
            if (userId) setLoadingIds(prev => { const c = { ...prev }; delete c[userId]; return c; });
        }
    };

    const handleAddProvider = async (e: any) => {
        e.preventDefault();

        if (!isAddFormValid) {
            showToast('Please fill out all required fields.', 'danger');
            return;
        }

        setIsAddingProvider(true);
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
                ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
                : undefined;
            if (adminSecret) {
                headers['x-admin-secret'] = adminSecret;
            }
            const res = await fetch('/api/providers', {
                method: 'POST',
                headers,
                body: JSON.stringify({ email, name, userType: 'Provider', address: addAddress, zip: addZip, state_id: addStateId, city_id: addCityId })
            });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            // close modal and refresh (use Bootstrap modal API safely)
            try {
                await hideModalById('add_user');
            } catch (e) {
                console.debug('[providers] hide add_user failed', e);
            }

            // After modal is closed, clear the inputs and refresh list
            setEmail(''); setName(''); setAddAddress(''); setAddZip(''); setAddStateId(null); setAddCityId(null);
            await fetchProviders();
            showToast('Provider created. A confirmation email (magic link) was requested.', 'success');
        } catch (err: any) {
            showToast(err.message || 'Failed to add provider', 'danger');
        } finally {
            setIsAddingProvider(false);
        }
    };

    const handleToggleActive = async (record: any) => {
        const userId = record?.id ?? record?.user?.id ?? record?.user?.user?.id;
        const current = record?.provider?.is_active ?? true;
        if (!userId) return alert('Provider id missing');
        const ok = confirm(`Are you sure you want to ${current ? 'deactivate' : 'activate'} this provider?`);
        if (!ok) return;
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
                ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
                : undefined;
            if (adminSecret) headers['x-admin-secret'] = adminSecret;
            setLoadingIds(prev => ({ ...prev, [userId]: true }));
            const res = await fetch('/api/providers', { method: 'PATCH', headers, body: JSON.stringify({ action: 'toggle_active', patientId: userId, isActive: !current }) });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            await fetchProviders();
            setLoadingIds(prev => { const c = { ...prev }; delete c[userId]; return c; });
        } catch (e: any) {
            setLoadingIds(prev => { const c = { ...prev }; if (userId) delete c[userId]; return c; });
            alert(e.message || 'Failed to update active state');
        }
    };

    const handleSoftDelete = async (record: any) => {
        const userId = record?.id ?? record?.user?.id ?? record?.user?.user?.id;
        if (!userId) return alert('Provider id missing');
        const ok = confirm('Are you sure you want to delete this provider? This is a soft delete.');
        if (!ok) return;
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
                ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
                : undefined;
            if (adminSecret) headers['x-admin-secret'] = adminSecret;
            setLoadingIds(prev => ({ ...prev, [userId]: true }));
            const res = await fetch('/api/providers', { method: 'PATCH', headers, body: JSON.stringify({ action: 'soft_delete', patientId: userId }) });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            await fetchProviders();
            setLoadingIds(prev => { const c = { ...prev }; delete c[userId]; return c; });
        } catch (e: any) {
            setLoadingIds(prev => { const c = { ...prev }; if (userId) delete c[userId]; return c; });
            alert(e.message || 'Failed to delete provider');
        }
    };

    const handleEditOpen = (record: any) => {
        const userId = record?.id ?? record?.user?.id ?? record?.user?.user?.id ?? record?.id;
        setEditingUser({ id: userId, record });
        setEditEmail(record?.email ?? '');
        setEditName(record?.user_metadata?.name ?? '');
        setEditAddress(record?.provider?.address ?? '');
        setEditZip(record?.provider?.zip ?? '');
        setEditStateId(record?.provider?.state_id ?? null);
        setEditCityId(record?.provider?.city_id ?? null);
        try {
            console.debug('[providers] handleEditOpen', { userId, record });
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
                console.debug('[providers] hide dropdowns failed', err);
            }

            // Now show modal using Bootstrap Modal API when available
            if (modalEl) {
                try {
                    if (bs && bs.Modal) {
                        // Prefer getOrCreateInstance then show immediately
                        // @ts-ignore
                        const inst = bs.Modal.getOrCreateInstance(modalEl) ?? new bs.Modal(modalEl);
                        inst.show();
                        console.debug('[providers] shown modal via bootstrap.Modal');
                        return;
                    }
                } catch (innerErr) {
                    console.debug('[providers] bootstrap.Modal show failed', innerErr);
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
                    console.debug('[providers] shown modal via DOM fallback');
                    return;
                } catch (domErr) {
                    console.error('[providers] DOM fallback to show modal failed', domErr);
                }
            } else {
                console.error('[providers] edit_user modal element not found');
            }
        } catch (e) {
            console.error('[providers] handleEditOpen error', e);
        }
    };

    const handleEditSubmit = async (e: any) => {
        e.preventDefault();

        if (!isEditFormValid) {
            showToast('Please fill out all required fields.', 'danger');
            return;
        }

        if (!editingUser?.id) return alert('No editing provider');
        const userId = editingUser.id;
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
                ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
                : undefined;
            if (adminSecret) headers['x-admin-secret'] = adminSecret;
            setLoadingIds(prev => ({ ...prev, [userId]: true }));
            const res = await fetch('/api/providers', { method: 'PATCH', headers, body: JSON.stringify({ action: 'edit', patientId: userId, email: editEmail, name: editName, address: editAddress, zip: editZip, state_id: editStateId, city_id: editCityId }) });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            try {
                await hideModalById('edit_user');
            } catch (ee) { console.debug('[providers] hide edit_user failed', ee); }
            setEditingUser(null);
            await fetchProviders();
            setLoadingIds(prev => { const c = { ...prev }; delete c[userId]; return c; });
            showToast('Provider updated Success', 'success');
        } catch (e: any) {
            setLoadingIds(prev => { const c = { ...prev }; if (userId) delete c[userId]; return c; });
            showToast(e.message || 'Failed to update provider', 'danger');
        }
    };

    // Determine loading state for edit/reset buttons
    const isEditing = !!(editingUser && loadingIds[editingUser.id]);
    const isResetting = !!(resetUserId && loadingIds[resetUserId]);


    return (
        <>
            <div className="page-wrapper">
                <div className="content">
                    <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                        <div className="flex-grow-1"><h4 className="fw-bold mb-0">Providers <span className="badge badge-soft-primary fw-medium border py-1 px-2 border-primary fs-13 ms-1">
                            Total Providers : {data.length}
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
                                <i className="ti ti-plus me-1" /> New Provider
                            </Link>
                        </div>
                    </div>
                    <div className="table-responsive">
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
                            <h4 className="text-dark modal-title fw-bold">Edit Provider</h4>
                            <button type="button" className="btn-close btn-close-modal custom-btn-close" data-bs-dismiss="modal" aria-label="Close"><i className="ti ti-x" /></button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-body">
                                <div className="mb-3"><label className="form-label">Name <span className="text-danger">*</span></label><input className="form-control" value={editName} onChange={e => setEditName(e.target.value)} /></div>
                                <div className="mb-3"><label className="form-label">Email <span className="text-danger">*</span></label><input className="form-control" value={editEmail} onChange={e => setEditEmail(e.target.value)} /></div>

                                <div className="row">
                                    <div className="col-6 mb-3">
                                        <label className="form-label">State <span className="text-danger">*</span></label>
                                        <select className="form-select" value={editStateId ?? ''} onChange={e => { setEditStateId(e.target.value ? Number(e.target.value) : null); setEditCityId(null); }}>
                                            <option value="">-- Select State --</option>
                                            {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label className="form-label">City <span className="text-danger">*</span></label>
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
                            <h4 className="text-dark modal-title fw-bold">New Provider</h4>
                            <button type="button" className="btn-close btn-close-modal custom-btn-close" data-bs-dismiss="modal" aria-label="Close"><i className="ti ti-x" /></button>
                        </div>
                        <form onSubmit={handleAddProvider}>
                            <div className="modal-body">
                                <div className="mb-3"><label className="form-label">Name <span className="text-danger">*</span></label><input className="form-control" value={name} onChange={e => setName(e.target.value)} /></div>
                                <div className="mb-3"><label className="form-label">Email <span className="text-danger">*</span></label><input className="form-control" value={email} onChange={e => setEmail(e.target.value)} /></div>

                                <div className="row">
                                    <div className="col-6 mb-3">
                                        <label className="form-label">State <span className="text-danger">*</span></label>
                                        <select className="form-select" value={addStateId ?? ''} onChange={e => { setAddStateId(e.target.value ? Number(e.target.value) : null); setAddCityId(null); }}>
                                            <option value="">-- Select State --</option>
                                            {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label className="form-label">City <span className="text-danger">*</span></label>
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
                                <button type="submit" className="btn btn-primary" disabled={!isAddFormValid || isAddingProvider}>
                                    {isAddingProvider ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Add New Provider'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProvidersComponent;