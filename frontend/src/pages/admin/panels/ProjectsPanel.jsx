import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { Field, Input, Textarea, Button, Card, Row, ErrorText, SuccessText } from '../ui';
import Uploader from '../Uploader';

const emptyMember = { name: '', img_url: '', github_url: '', linkedin_url: '' };
const empty = {
  title: '', date: '', description: '', image_url: '', category: 'fullstack developer',
  github_url: '', webapp_url: '', featured: false, sort: 0, tags: '', members: [],
};

const CATEGORIES = ['all', 'ui/ux', 'frontend developer', 'mobile frontend', 'backend developer', 'fullstack developer'];

export default function ProjectsPanel() {
  const [items, setItems] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/projects').then((r) => setItems(r.data)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [k]: val }));
  };

  const startNew = () => { setEditingId(null); setForm(empty); setMsg(''); setErr(''); };
  const startEdit = (it) => {
    setEditingId(it.id);
    setForm({
      ...empty,
      ...it,
      tags: (it.tags || []).map((t) => t.name).join(', '),
      members: (it.members || []).map((m) => ({ name: m.name, img_url: m.img_url, github_url: m.github_url, linkedin_url: m.linkedin_url })),
    });
    setMsg(''); setErr('');
  };

  // members
  const setMember = (idx) => (k) => (e) =>
    setForm((p) => ({ ...p, members: p.members.map((m, i) => (i === idx ? { ...m, [k]: e.target.value } : m)) }));
  const addMember = () => setForm((p) => ({ ...p, members: [...p.members, { ...emptyMember }] }));
  const removeMember = (idx) => setForm((p) => ({ ...p, members: p.members.filter((_, i) => i !== idx) }));

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr(''); setMsg('');
    const payload = {
      ...form,
      sort: Number(form.sort) || 0,
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) await api.put(`/admin/projects/${editingId}`, payload);
      else await api.post('/admin/projects', payload);
      setMsg('Tersimpan'); load(); startNew();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const del = async (id) => {
    if (!confirm('Hapus proyek ini?')) return;
    try { await api.del(`/admin/projects/${id}`); load(); } catch (e) { setErr(e.message); }
  };

  if (items === null) return <span style={{ color: '#b1b2b3' }}>Memuat…</span>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card as="form" onSubmit={save} style={{ maxWidth: 880 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <strong>{editingId ? 'Edit proyek' : 'Proyek baru'}</strong>
          <Button kind="ghost" type="button" onClick={startNew}>Reset</Button>
        </Row>
        <Row>
          <Field style={{ flex: 2 }}>Judul<Input value={form.title} onChange={set('title')} /></Field>
          <Field style={{ flex: 1 }}>Tanggal<Input value={form.date} onChange={set('date')} placeholder="Jan 2026" /></Field>
          <Field style={{ flex: 1 }}>
            Kategori
            <select value={form.category} onChange={set('category')} style={{ padding: '10px 12px', borderRadius: 8, background: '#1C1E27', color: '#F2F3F4', border: '1px solid #444' }}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </Row>
        <Field>Deskripsi<Textarea value={form.description} onChange={set('description')} /></Field>
        <Row>
          <Field style={{ flex: 1 }}>Tags (pisahkan koma)<Input value={form.tags} onChange={set('tags')} /></Field>
          <Field style={{ flex: 1 }}>GitHub URL<Input value={form.github_url} onChange={set('github_url')} /></Field>
          <Field style={{ flex: 1 }}>Webapp URL<Input value={form.webapp_url} onChange={set('webapp_url')} /></Field>
        </Row>
        <Row>
          <Field style={{ flex: 1 }}>Gambar
            <Uploader value={form.image_url} onChange={(u) => setForm((p) => ({ ...p, image_url: u }))} folder="projects" />
          </Field>
          <Field style={{ flex: 1, maxWidth: 120 }}>Urutan<Input type="number" value={form.sort} onChange={set('sort')} /></Field>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', paddingBottom: 10 }}>
            <input type="checkbox" checked={form.featured} onChange={set('featured')} />
            <span>Featured</span>
          </label>
        </Row>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <strong>Anggota</strong>
            <Button kind="ghost" type="button" onClick={addMember}>+ Tambah anggota</Button>
          </Row>
          {form.members.map((m, idx) => (
            <div key={idx} style={{ border: '1px solid #444', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Row>
                <Field style={{ flex: 2 }}>Nama<Input value={m.name} onChange={setMember(idx)('name')} /></Field>
                <Field style={{ flex: 2 }}>GitHub<Input value={m.github_url} onChange={setMember(idx)('github_url')} /></Field>
                <Field style={{ flex: 2 }}>LinkedIn<Input value={m.linkedin_url} onChange={setMember(idx)('linkedin_url')} /></Field>
                <Button kind="danger" onClick={() => removeMember(idx)} style={{ alignSelf: 'flex-end' }}>X</Button>
              </Row>
              <Uploader value={m.img_url} onChange={(u) => setForm((p) => ({ ...p, members: p.members.map((x, i) => (i === idx ? { ...x, img_url: u } : x)) }))} folder="members" />
            </div>
          ))}
        </div>

        {msg && <SuccessText>{msg}</SuccessText>}
        {err && <ErrorText>{err}</ErrorText>}
        <Row><Button type="submit" disabled={busy || !form.title}>{busy ? 'Menyimpan…' : 'Simpan'}</Button></Row>
      </Card>

      {items.map((it) => (
        <Card key={it.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {it.image_url && <img src={it.image_url} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6 }} />}
            <div>
              <strong>{it.title}</strong>
              <div style={{ color: '#b1b2b3', fontSize: 13 }}>{it.category} · {it.date}</div>
            </div>
          </div>
          <Row>
            <Button onClick={() => startEdit(it)}>Edit</Button>
            <Button kind="danger" onClick={() => del(it.id)}>Hapus</Button>
          </Row>
        </Card>
      ))}
    </div>
  );
}