"use client";
import React, { useEffect, useState, useMemo } from 'react'; // Import useMemo
import Link from 'next/link';
import Datatable from '@/core/common/dataTable';
import ImageWithBasePath from '@/core/imageWithBasePath';
import { all_routes } from '../../../../routes/all_routes';
import SearchInput from '@/core/common/dataTable/dataTableSearch';

const PatientsComponent = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [editingPatient, setEditingPatient] = useState<any | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editDob, setEditDob] = useState("");
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
  const [resetPatientId, setResetPatientId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetShowPassword, setResetShowPassword] = useState(false);
  const [resetShowConfirm, setResetShowConfirm] = useState(false);

  // New states for submit button loading and filter
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [searchText, setSearchText] = useState<string>("");

  // Toast helpers
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

  // Safe JSON parser for fetch responses
  const parseJSONSafe = async (res: Response): Promise<any> => {
    const contentType = res.headers.get('content-type') || '';
    // Non-OK responses: read text and surface a meaningful error
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      // If server returned HTML (e.g. Next.js 404/500 page), avoid throwing the whole document into the console.
      if (txt && /^\s*<!doctype html>|^\s*<html/i.test(txt) || contentType.includes('text/html')) {
        // Try to extract a short title/message from the HTML if present
        const titleMatch = txt.match(/<title>(.*?)<\/title>/i);
        const short = titleMatch ? titleMatch[1].trim() : `HTTP ${res.status} ${res.statusText || ''}`;
        // log full body to debug (non-fatal) but throw a concise error message
        try { console.debug('[patients] server returned HTML:', txt.slice(0, 2000)); } catch (_) { }
        throw new Error(short || `Request failed with status ${res.status}`);
      }
      // For other non-JSON error responses, return a concise message rather than the full body
      const plain = txt ? txt.trim().slice(0, 500) : `Request failed with status ${res.status}`;
      throw new Error(plain);
    }
    // Expect JSON
    if (contentType.includes('application/json')) {
      try {
        return await res.json();
      } catch (err) {
        const txt = await res.text().catch(() => '');
        const short = txt ? (txt.trim().slice(0, 300)) : String(err);
        console.debug('[patients] invalid JSON response body:', short);
        throw new Error('Invalid JSON response');
      }
    }
    // If not JSON, surface a short preview of the response to help debugging (e.g. HTML 404 page)
    const txt = await res.text().catch(() => '');
    if (txt && /^\s*<!doctype html>|^\s*<html/i.test(txt) || contentType.includes('text/html')) {
      const titleMatch = txt.match(/<title>(.*?)<\/title>/i);
      const short = titleMatch ? titleMatch[1].trim() : `Unexpected HTML response (status ${res.status || 'unknown'})`;
      console.debug('[patients] unexpected HTML response body preview:', txt.slice(0, 1000));
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
          } catch (cleanupErr) { console.debug('[patients] hideModal cleanup', cleanupErr); }
          resolve();
        };

        try {
          if (bs && bs.Modal) {
            // @ts-ignore
            const inst = bs.Modal.getInstance(modalEl) ?? bs.Modal.getOrCreateInstance?.(modalEl) ?? new bs.Modal(modalEl);
            const onHidden = () => { try { modalEl.removeEventListener('hidden.bs.modal', onHidden); } catch (_) { }; finish(); };
            modalEl.addEventListener('hidden.bs.modal', onHidden);
            try { inst?.hide?.(); } catch (hideErr) { console.debug('[patients] bootstrap hide threw', hideErr); }
            setTimeout(() => finish(), 600);
            return;
          }
        } catch (err) {
          console.debug('[patients] bootstrap modal hide failed', err);
        }

        finish();
      } catch (e) {
        console.debug('[patients] hideModalById error', e);
        resolve();
      }
    });
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patients?userType=Patient');
      const json = await parseJSONSafe(res);
      setData(json.users || json.patients || []);
    } catch (e) {
      console.error('[patients] fetchPatients error', e);
      showToast((e as Error).message || 'Failed to load patients', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); fetchStatesAndCities(); }, []);

  const fetchStatesAndCities = async () => {
    try {
      const [sRes, cRes] = await Promise.all([fetch('/api/states'), fetch('/api/cities')]);
      const sJson = await sRes.json().catch(() => ({}));
      const cJson = await cRes.json().catch(() => ({}));
      setStates(sJson.states || []);
      setCities(cJson.cities || []);
    } catch (e) {
      console.debug('[patients] failed to load states/cities', e);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'user_metadata.name', render: (val: any, record: any) => record.user_metadata?.name ?? record.email },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Address', dataIndex: 'patient.address', render: (v: any, r: any) => r?.patient?.address ?? '' },
    { title: 'Zip', dataIndex: 'patient.zip', render: (v: any, r: any) => r?.patient?.zip ?? '' },
    {
      title: 'State', dataIndex: 'patient.state_id', render: (v: any, r: any) => {
        const sid = r?.patient?.state_id ?? null;
        const st = states.find(s => String(s.id) === String(sid));
        return st ? st.name : (r?.patient?.state_name ?? '');
      }
    },
    {
      title: 'City', dataIndex: 'patient.city_id', render: (v: any, r: any) => {
        const cid = r?.patient?.city_id ?? null;
        const ct = cities.find(c => String(c.id) === String(cid));
        return ct ? ct.name : (r?.patient?.city_name ?? '');
      }
    },

    {
      title: 'DOB', dataIndex: 'date_of_birth', render: (val: any, record: any) => {
        // prefer top-level record.date_of_birth (your table), then application row / profile / metadata
        const dob = record?.date_of_birth ?? record?.patient?.date_of_birth ?? record?.profile?.date_of_birth ?? record?.user_metadata?.date_of_birth ?? record?.user_metadata?.dob ?? '';
        return dob ? String(dob) : '';
      }
    },
    {
      title: 'Status', dataIndex: 'patient.is_active', render: (_: any, record: any) => {
        // Prefer patient-specific application row, fall back to admin row. Default to true.
        const isActive = record?.patient?.is_active ?? record?.admin?.is_active ?? true;
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

  // Derived state for form validation
  const isAddFormValid = useMemo(() => {
    return !!(name && email && dob && addStateId && addCityId && addAddress && addZip);
  }, [name, email, dob, addStateId, addCityId, addAddress, addZip]);

  const isEditFormValid = useMemo(() => {
    return !!(editingPatient && editName && editEmail && editDob && editStateId && editCityId && editAddress && editZip);
  }, [editingPatient, editName, editEmail, editDob, editStateId, editCityId, editAddress, editZip]);

  const isResetFormValid = useMemo(() => {
    return !!(resetPassword && resetPassword.length >= 6 && resetPassword === resetConfirm);
  }, [resetPassword, resetConfirm]);


  const handleResetOpen = (record: any) => {
    const userId = record?.id ?? record?.user?.id ?? record?.user?.user?.id ?? null;
    setResetPatientId(userId);
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
    } catch (e) { console.debug('[patients] handleResetOpen error', e); }
  };

  const handleResetSubmit = async (e: any) => {
    e.preventDefault();
    const userId = resetPatientId;
    if (!userId) return showToast('Patient id missing', 'danger');

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
      const res = await fetch('/api/patients', { method: 'PATCH', headers, body: JSON.stringify({ action: 'reset_password', patientId: userId, password: resetPassword }) });
      const json = await parseJSONSafe(res);
      if (json?.error) throw new Error(json.error);
      try { await hideModalById('reset_password'); } catch (_) { }
      setResetPatientId(null);
      setResetPassword('');
      setResetConfirm('');
      await fetchPatients();
      showToast('Password reset successfully', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to reset password', 'danger');
    } finally {
      if (userId) setLoadingIds(prev => { const c = { ...prev }; delete c[userId]; return c; });
    }
  };

  const handleAddPatient = async (e: any) => {
    e.preventDefault();

    if (!isAddFormValid) {
      showToast('Please fill out all required fields.', 'danger');
      return;
    }

    setIsAddingPatient(true);
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
        ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
        : undefined;
      if (adminSecret) {
        headers['x-admin-secret'] = adminSecret;
      }
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, name, date_of_birth: dob, userType: 'Patient', address: addAddress, zip: addZip, state_id: addStateId, city_id: addCityId })
      });
      const json = await parseJSONSafe(res);
      if (json?.error) throw new Error(json.error);
      try {
        await hideModalById('add_patient');
      } catch (e) {
        console.debug('[patients] hide add_patient failed', e);
      }
      setEmail(''); setName(''); setDob(''); setAddAddress(''); setAddZip(''); setAddStateId(null); setAddCityId(null);
      await fetchPatients();
      showToast('Patient added successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add patient', 'danger');
    } finally {
      setIsAddingPatient(false);
    }
  };

  const handleToggleActive = async (record: any) => {
    const userId = record?.id ?? record?.user?.id ?? record?.user?.user?.id;
    // Use patient application row first, then admin, default to true
    const current = record?.patient?.is_active ?? record?.admin?.is_active ?? true;
    if (!userId) return alert('Patient id missing');
    const ok = confirm(`Are you sure you want to ${current ? 'deactivate' : 'activate'} this patient?`);
    if (!ok) return;
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
        ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
        : undefined;
      if (adminSecret) headers['x-admin-secret'] = adminSecret;
      setLoadingIds(prev => ({ ...prev, [userId]: true }));
      const res = await fetch('/api/patients', { method: 'PATCH', headers, body: JSON.stringify({ action: 'toggle_active', patientId: userId, isActive: !current }) });
      const json = await parseJSONSafe(res);
      if (json?.error) throw new Error(json.error);
      await fetchPatients();
      setLoadingIds(prev => { const c = { ...prev }; delete c[userId]; return c; });
    } catch (e: any) {
      setLoadingIds(prev => { const c = { ...prev }; if (userId) delete c[userId]; return c; });
      alert(e.message || 'Failed to update active state');
    }
  };

  const handleSoftDelete = async (record: any) => {
    const userId = record?.id ?? record?.user?.id ?? record?.user?.user?.id;
    if (!userId) return alert('Patient id missing');
    const ok = confirm('Are you sure you want to delete this patient? This is a soft delete.');
    if (!ok) return;
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
        ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
        : undefined;
      if (adminSecret) headers['x-admin-secret'] = adminSecret;
      setLoadingIds(prev => ({ ...prev, [userId]: true }));
      const res = await fetch('/api/patients', { method: 'PATCH', headers, body: JSON.stringify({ action: 'soft_delete', patientId: userId }) });
      const json = await parseJSONSafe(res);
      if (json?.error) throw new Error(json.error);
      await fetchPatients();
      showToast('Patient deleted successfully', 'success');
      setLoadingIds(prev => { const c = { ...prev }; delete c[userId]; return c; });
    } catch (e: any) {
      setLoadingIds(prev => { const c = { ...prev }; if (userId) delete c[userId]; return c; });
      alert(e.message || 'Failed to delete patient');
    }
  };

  const handleEditOpen = (record: any) => {
    const userId = record?.id ?? record?.user?.id ?? record?.user?.user?.id ?? record?.id;
    setEditingPatient({ id: userId, record });
    setEditEmail(record?.email ?? '');
    setEditName(record?.user_metadata?.name ?? '');

    setEditDob(record?.user_metadata?.date_of_birth ?? record?.user_metadata?.dob ?? record?.profile?.date_of_birth ?? record?.patient?.date_of_birth ?? '');
    setEditAddress(record?.patient?.address ?? '');
    setEditZip(record?.patient?.zip ?? '');
    setEditStateId(record?.patient?.state_id ?? null);
    setEditCityId(record?.patient?.city_id ?? null);
    try {
      console.debug('[patients] handleEditOpen', { userId, record });
      const modalEl = document.getElementById('edit_patient');
      // @ts-ignore
      const bs = (window as any).bootstrap;

      try {
        const openMenus = Array.from(document.querySelectorAll('.dropdown-menu.show')) as HTMLElement[];
        openMenus.forEach(menu => {
          const toggle = menu.parentElement?.querySelector('[data-bs-toggle="dropdown"]') as HTMLElement | null;
          if (bs && bs.Dropdown && toggle) {
            try { /* @ts-ignore */ bs.Dropdown.getInstance(toggle)?.hide?.(); } catch (ddErr) { try { bs.Dropdown.getOrCreateInstance?.(toggle)?.hide?.(); } catch (_) { } }
          } else {
            menu.classList.remove('show');
            const toggle = menu.parentElement?.querySelector('[data-bs-toggle="dropdown"]');
            toggle?.classList?.remove('show');
          }
        });
      } catch (err) {
        console.debug('[patients] hide dropdowns failed', err);
      }

      if (modalEl) {
        try {
          if (bs && bs.Modal) {
            // @ts-ignore
            const inst = bs.Modal.getOrCreateInstance(modalEl) ?? new bs.Modal(modalEl);
            inst.show();
            return;
          }
        } catch (innerErr) {
          console.debug('[patients] bootstrap.Modal show failed', innerErr);
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
          return;
        } catch (domErr) {
          console.error('[patients] DOM fallback to show modal failed', domErr);
        }
      } else {
        console.error('[patients] edit_patient modal element not found');
      }
    } catch (e) {
      console.error('[patients] handleEditOpen error', e);
    }
  };

  const handleEditSubmit = async (e: any) => {
    e.preventDefault();

    if (!isEditFormValid) {
      showToast('Please fill out all required fields.', 'danger');
      return;
    }

    if (!editingPatient?.id) return alert('No editing patient');
    const userId = editingPatient.id;
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      const adminSecret = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_ADMIN_API_SECRET)
        ? (process as any).env.NEXT_PUBLIC_ADMIN_API_SECRET
        : undefined;
      if (adminSecret) headers['x-admin-secret'] = adminSecret;
      setLoadingIds(prev => ({ ...prev, [userId]: true }));
      const res = await fetch('/api/patients', { method: 'PATCH', headers, body: JSON.stringify({ action: 'edit', patientId: userId, email: editEmail, name: editName, date_of_birth: editDob, address: editAddress, zip: editZip, state_id: editStateId, city_id: editCityId }) });
      const json = await parseJSONSafe(res);
      if (json?.error) throw new Error(json.error);
      try {
        await hideModalById('edit_patient');
      } catch (ee) { console.debug('[patients] hide edit_patient failed', ee); }
      setEditingPatient(null);
      setEditDob('');
      setEditAddress(''); setEditZip(''); setEditStateId(null); setEditCityId(null);
      await fetchPatients();
      setLoadingIds(prev => { const c = { ...prev }; delete c[userId]; return c; });
      showToast('Patient updated successfully', 'success');
    } catch (e: any) {
      setLoadingIds(prev => { const c = { ...prev }; if (userId) delete c[userId]; return c; });
      showToast(e.message || 'Failed to update patient', 'danger');
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Determine loading state for edit/reset buttons
  const isEditing = !!(editingPatient && loadingIds[editingPatient.id]);
  const isResetting = !!(resetPatientId && loadingIds[resetPatientId]);

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
            <div className="flex-grow-1">
              <h4 className="fw-bold mb-0">
                Patients
                <span className="badge badge-soft-primary fw-medium border py-1 px-2 border-primary fs-13 ms-1">
                  Total Patients : {data.length}
                </span>
              </h4>
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
              <a href="#" className="btn btn-primary ms-2 fs-13 btn-md" onClick={(e) => { e.preventDefault(); const modalEl = document.getElementById('add_patient'); try { const bs = (window as any).bootstrap; if (modalEl && bs && bs.Modal) { bs.Modal.getOrCreateInstance(modalEl).show(); return; } if (modalEl) { modalEl.classList.add('show'); (modalEl as any).style.display = 'block'; document.body.classList.add('modal-open'); if (!document.querySelector('.modal-backdrop')) { const backdrop = document.createElement('div'); backdrop.className = 'modal-backdrop fade show'; document.body.appendChild(backdrop); } } } catch (err) { console.debug('[patients] open add_patient', err); } }}>
                <i className="ti ti-plus me-1" />
                New Patient
              </a>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between flex-wrap">
            <div>
              <div className="search-set mb-3">
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <div className="table-search d-flex align-items-center mb-0">
                    <div className="search-input">
                      <SearchInput value={searchText} onChange={handleSearch} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex table-dropdown mb-3 right-content align-items-center flex-wrap row-gap-3">
              {/* keep existing filters/sort controls if desired */}
            </div>
          </div>

          <div className="table-responsive">
            <Datatable columns={columns} dataSource={data} Selection={false} searchText={searchText} />
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

          <div id="edit_patient" className="modal fade">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="text-dark modal-title fw-bold">Edit Patient</h4>
                  <button type="button" className="btn-close btn-close-modal custom-btn-close" data-bs-dismiss="modal" aria-label="Close"><i className="ti ti-x" /></button>
                </div>
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-body">
                    <div className="mb-3"><label className="form-label">Name <span className="text-danger">*</span></label><input type="text" className="form-control" value={editName} onChange={e => setEditName(e.target.value)} /></div>
                    <div className="mb-3"><label className="form-label">Email <span className="text-danger">*</span></label><input type="email" className="form-control" value={editEmail} onChange={e => setEditEmail(e.target.value)} /></div>
                    <div className="mb-3"><label className="form-label">Date of Birth <span className="text-danger">*</span></label><input type="date" className="form-control" value={editDob} onChange={e => setEditDob(e.target.value)} /></div>

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
                    <button type="button" className="btn btn-white border" data-bs-dismiss="modal" onClick={() => { try { hideModalById('edit_patient'); } catch (_) { } }}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={!isEditFormValid || isEditing}>
                      {isEditing ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Update Patient'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div id="add_patient" className="modal fade">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="text-dark modal-title fw-bold">Add Patient</h4>
                  <button type="button" className="btn-close btn-close-modal custom-btn-close" data-bs-dismiss="modal" aria-label="Close"><i className="ti ti-x" /></button>
                </div>
                <form onSubmit={handleAddPatient}>
                  <div className="modal-body">
                    <div className="mb-3"><label className="form-label">Name <span className="text-danger">*</span></label><input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} /></div>
                    <div className="mb-3"><label className="form-label">Email <span className="text-danger">*</span></label><input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} /></div>
                    <div className="mb-3"><label className="form-label">Date of Birth <span className="text-danger">*</span></label><input type="date" className="form-control" value={dob} onChange={e => setDob(e.target.value)} /></div>

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
                    <button type="button" className="btn btn-white border" data-bs-dismiss="modal" onClick={() => { try { hideModalById('add_patient'); } catch (_) { } }}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={!isAddFormValid || isAddingPatient}>
                      {isAddingPatient ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Add Patient'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>
        <div className="footer text-center bg-white p-2 border-top">
          <p className="text-dark mb-0">
            2025 ©
            <Link href="#" className="link-primary">
              EMR
            </Link>
            , All Rights Reserved
          </p>
        </div>
      </div>
    </>
  );
};

export default PatientsComponent;