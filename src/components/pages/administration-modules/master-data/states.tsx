"use client";

import { useEffect, useState } from "react";
import Datatable from "@/core/common/dataTable";
import Link from "next/link";

const StatesComponent = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [abbreviation, setAbbreviation] = useState("");
    const [editing, setEditing] = useState<any | null>(null);
    const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

    // Reusable modal hide helper (robust against missing bootstrap API)
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
                    } catch (cleanupErr) { console.debug('[states] hideModal cleanup', cleanupErr); }
                    resolve();
                };

                try {
                    if (bs && bs.Modal) {
                        // @ts-ignore
                        const inst = bs.Modal.getInstance(modalEl) ?? bs.Modal.getOrCreateInstance?.(modalEl) ?? new bs.Modal(modalEl);
                        const onHidden = () => { try { modalEl.removeEventListener('hidden.bs.modal', onHidden); } catch (_) { }; finish(); };
                        modalEl.addEventListener('hidden.bs.modal', onHidden);
                        try { inst?.hide?.(); } catch (hideErr) { console.debug('[states] bootstrap hide threw', hideErr); }
                        setTimeout(() => finish(), 600);
                        return;
                    }
                } catch (err) {
                    console.debug('[states] bootstrap modal hide failed', err);
                }

                finish();
            } catch (e) {
                console.debug('[states] hideModalById error', e);
                resolve();
            }
        });
    };

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
            setTimeout(() => { toast.classList.remove('show'); try { toast.remove(); } catch (_) { } }, 4000);
        } catch (e) {
            // fallback
            // eslint-disable-next-line no-alert
            alert(message);
        }
    };

    const fetchStates = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/states');
            const json = await res.json();
            setData(json.states || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStates(); }, []);

    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            const res = await fetch('/api/states', { method: 'POST', headers, body: JSON.stringify({ name, abbreviation }) });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            setName('');
            setAbbreviation('');
            try { await hideModalById('add_state'); } catch (_) { }
            await fetchStates();
            showToast('State added', 'success');
        } catch (err: any) {
            showToast(err.message || 'Failed to add state', 'danger');
        }
    };

    const openEdit = (row: any) => {
        setEditing(row);
        setName(row.name || '');
        setAbbreviation(row.abbreviation ?? '');
        try {
            const modalEl = document.getElementById('edit_state');
            const bs = (window as any).bootstrap;
            if (modalEl && bs && bs.Modal) {
                bs.Modal.getOrCreateInstance(modalEl).show();
                return;
            }
            if (modalEl) {
                modalEl.classList.add('show');
                (modalEl as any).style.display = 'block';
                document.body.classList.add('modal-open');
            }
        } catch (e) { }
    };

    const handleEdit = async (e: any) => {
        e.preventDefault();
        if (!editing?.id) return showToast('No editing state', 'danger');
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            const res = await fetch('/api/states', { method: 'PATCH', headers, body: JSON.stringify({ action: 'edit', stateId: editing.id, name, abbreviation }) });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            setEditing(null); setName('');
            setAbbreviation('');
            try { await hideModalById('edit_state'); } catch (_) { }
            await fetchStates();
            showToast('State updated', 'success');
        } catch (err: any) {
            showToast(err.message || 'Failed to update state', 'danger');
        }
    };

    const handleDelete = async (row: any) => {
        const ok = confirm('Delete this state? This is a soft delete.');
        if (!ok) return;
        try {
            const res = await fetch('/api/states', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'soft_delete', stateId: row.id }) });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            await fetchStates();
            showToast('State deleted', 'success');
        } catch (err: any) { showToast(err.message || 'Failed to delete state', 'danger'); }
    };

    const handleToggleActive = async (record: any) => {
        const id = record?.id;
        if (!id) return showToast('State id missing', 'danger');
        const current = !!record?.is_active;
        const ok = confirm(`Are you sure you want to ${current ? 'deactivate' : 'activate'} this state?`);
        if (!ok) return;
        try {
            setLoadingIds(prev => ({ ...prev, [id]: true }));
            const res = await fetch('/api/states', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggle_active', stateId: id, isActive: !current }) });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            await fetchStates();
            showToast(current ? 'State deactivated' : 'State activated', 'success');
        } catch (err: any) {
            showToast(err.message || 'Failed to update state status', 'danger');
        } finally {
            setLoadingIds(prev => { const c = { ...prev }; delete c[id]; return c; });
        }
    };

    const columns = [
        { title: 'State', dataIndex: 'name' },
        { title: 'Abbreviation', dataIndex: 'abbreviation' },
        {
            title: 'Status', dataIndex: 'is_active', render: (_: any, record: any) => {
                const isActive = !!record?.is_active;
                const id = record?.id;
                const isLoading = !!(id && loadingIds[id]);
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
            title: 'Actions', render: (_: any, record: any) => {
                const id = record?.id;
                const isLoading = !!(id && loadingIds[id]);
                if (isLoading) {
                    return <div><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span></div>;
                }
                return (
                    <div className="action-item">
                        <a href="#" onClick={(e) => e.preventDefault()} data-bs-toggle="dropdown"><i className="ti ti-dots-vertical" /></a>
                        <ul className="dropdown-menu p-2">
                            <li><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); openEdit(record); }}>Edit</a></li>
                            <li><a href="#" className="dropdown-item text-danger" onClick={async (e) => { e.preventDefault(); await handleDelete(record); }}>Delete</a></li>
                        </ul>
                    </div>
                );
            }
        }
    ];

    return (
        <>
            <div className="page-wrapper">
                <div className="content">
                    <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                        <h4 className="fw-bold mb-0">States <span className="badge badge-soft-primary">Total: {data.length}</span></h4>
                        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add_state">Add State</button>
                    </div>
                    <div className="table-responsive">
                        <Datatable columns={columns} dataSource={data} Selection={false} searchText={""} />
                    </div>
                </div>
            </div>

            <div id="add_state" className="modal fade">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header"><h4 className="modal-title">New State</h4><button type="button" className="btn-close" data-bs-dismiss="modal" /></div>
                        <form onSubmit={handleAdd}>
                            <div className="modal-body">
                                <div className="mb-3"><label className="form-label">State Name</label><input className="form-control" value={name} onChange={e => setName(e.target.value)} /></div>
                                <div className="mb-3"><label className="form-label">Abbreviation</label><input className="form-control" value={abbreviation} onChange={e => setAbbreviation(e.target.value)} maxLength={3} /></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-white border" data-bs-dismiss="modal" onClick={() => { try { hideModalById('add_state'); } catch (_) { } }}>Cancel</button><button type="submit" className="btn btn-primary">Add</button></div>
                        </form>
                    </div>
                </div>
            </div>

            <div id="edit_state" className="modal fade">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header"><h4 className="modal-title">Edit State</h4><button type="button" className="btn-close" data-bs-dismiss="modal" /></div>
                        <form onSubmit={handleEdit}>
                            <div className="modal-body">
                                <div className="mb-3"><label className="form-label">State Name</label><input className="form-control" value={name} onChange={e => setName(e.target.value)} /></div>
                                <div className="mb-3"><label className="form-label">Abbreviation</label><input className="form-control" value={abbreviation} onChange={e => setAbbreviation(e.target.value)} maxLength={3} /></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-white border" data-bs-dismiss="modal" onClick={() => { try { hideModalById('edit_state'); } catch (_) { } }}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StatesComponent;
