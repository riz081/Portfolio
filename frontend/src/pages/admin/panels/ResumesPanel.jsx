import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { Field, Input, Textarea, Button, Card, Row, ErrorText, SuccessText, Muted } from '../ui';
import Uploader from '../Uploader';

const empty = {
  title: '',
  role: '',
  description: '',
  file_url: '',
  external_url: '',
  source_type: 'upload',
  file_size: 0,
  sort: 0,
  is_active: true,
};

const documentURL = (item) => (item.source_type === 'upload' ? item.file_url : item.external_url);

export default function ResumesPanel() {
  const [items, setItems] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/admin/resumes')
    .then((r) => setItems(r.data || []))
    .catch((e) => setErr(e.message));

  useEffect(() => { load(); }, []);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const startNew = () => {
    setEditingId(null);
    setForm({ ...empty });
    setMsg('');
    setErr('');
  };
  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...empty, ...item });
    setMsg('');
    setErr('');
  };

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setErr('');
    setMsg('');
    const payload = {
      ...form,
      sort: Number(form.sort) || 0,
      file_url: form.source_type === 'upload' ? form.file_url : '',
      external_url: form.source_type === 'external' ? form.external_url : '',
      file_size: form.source_type === 'upload' ? form.file_size : 0,
    };
    try {
      if (editingId) await api.put(`/admin/resumes/${editingId}`, payload);
      else await api.post('/admin/resumes', payload);
      setMsg('Resume tersimpan');
      setEditingId(null);
      setForm({ ...empty });
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const del = async (id) => {
    if (!confirm('Hapus dokumen resume ini? File yang sudah diunggah tetap tersimpan di storage.')) return;
    try {
      await api.del(`/admin/resumes/${id}`);
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  if (items === null) return <span style={{ color: '#b1b2b3' }}>Memuat…</span>;

  const hasDocument = form.source_type === 'upload' ? form.file_url : form.external_url;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card as="form" onSubmit={save} style={{ maxWidth: 820 }}>
        <strong>{editingId ? 'Edit resume' : 'Resume baru'}</strong>
        <Row>
          <Field style={{ flex: '2 1 300px' }}>
            Judul
            <Input value={form.title} onChange={set('title')} placeholder="CV — DevOps Engineer" required />
          </Field>
          <Field style={{ flex: '1 1 220px' }}>
            Role/kategori
            <Input value={form.role} onChange={set('role')} placeholder="DevOps Engineer" />
          </Field>
        </Row>
        <Field>
          Deskripsi singkat
          <Textarea value={form.description} onChange={set('description')} placeholder="Docker, Jenkins, Linux VPS, CI/CD, and Nginx." />
        </Field>
        <Row>
          <Field style={{ flex: '1 1 220px' }}>
            Sumber dokumen
            <select
              value={form.source_type}
              onChange={set('source_type')}
              style={{ padding: '10px 12px', borderRadius: 8, background: '#18191f', color: '#fff', border: '1px solid #6b728055' }}
            >
              <option value="upload">Upload PDF ke storage</option>
              <option value="external">URL eksternal</option>
            </select>
          </Field>
          <Field style={{ width: 120 }}>
            Urutan
            <Input type="number" value={form.sort} onChange={set('sort')} />
          </Field>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 28, color: '#b1b2b3', fontSize: 13 }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
            />
            Tampilkan publik
          </label>
        </Row>
        {form.source_type === 'upload' ? (
          <Field>
            File PDF
            <Uploader
              value={form.file_url}
              onChange={(url, meta) => setForm((prev) => ({ ...prev, file_url: url, file_size: meta.size || 0 }))}
              folder="resume"
              accept="application/pdf,.pdf"
              kind="resume"
            />
          </Field>
        ) : (
          <Field>
            URL eksternal
            <Input
              type="url"
              value={form.external_url}
              onChange={set('external_url')}
              placeholder="https://docs.google.com/document/d/.../export?format=pdf"
            />
            <Muted>Untuk Google Docs, gunakan URL export PDF agar pengunjung dapat mengunduh langsung.</Muted>
          </Field>
        )}
        {msg && <SuccessText>{msg}</SuccessText>}
        {err && <ErrorText>{err}</ErrorText>}
        <Row>
          <Button type="submit" disabled={busy || !form.title || !hasDocument}>
            {busy ? 'Menyimpan…' : 'Simpan'}
          </Button>
          {editingId && <Button type="button" kind="secondary" onClick={startNew}>Batal</Button>}
        </Row>
      </Card>

      {items.length === 0 && <Muted>Belum ada dokumen resume.</Muted>}
      {items.map((item) => (
        <Card key={item.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ minWidth: 0 }}>
            <strong>{item.title}</strong>
            <div style={{ color: '#b1b2b3', fontSize: 13 }}>
              {item.role || 'Tanpa kategori'} · {item.source_type === 'upload' ? 'PDF storage' : 'URL eksternal'} · urutan {item.sort}
            </div>
            <div style={{ color: item.is_active ? '#4ade80' : '#ffb86c', fontSize: 12 }}>
              {item.is_active ? 'Publik' : 'Nonaktif'}
            </div>
          </div>
          <Row>
            <Button as="a" href={documentURL(item)} target="_blank" rel="noopener noreferrer" kind="secondary">Buka</Button>
            <Button type="button" onClick={() => startEdit(item)}>Edit</Button>
            <Button type="button" kind="danger" onClick={() => del(item.id)}>Hapus</Button>
          </Row>
        </Card>
      ))}
    </div>
  );
}
