import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { Field, Input, Textarea, Button, Card, Row, ErrorText, SuccessText } from '../ui';
import Uploader from '../Uploader';

const empty = { role: '', company: '', date: '', desc: '', img_url: '', doc_url: '', skills: '', sort: 0 };

export default function ExperiencesPanel() {
  const [items, setItems] = useState(null);
  const [editingId, setEditingId] = useState(null); // null = new
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/experiences').then((r) => setItems(r.data)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const startNew = () => { setEditingId(null); setForm(empty); setMsg(''); setErr(''); };
  const startEdit = (it) => {
    setEditingId(it.id);
    setForm({ ...it, skills: (it.skills || []).join(', ') });
    setMsg(''); setErr('');
  };

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr(''); setMsg('');
    const payload = {
      ...form,
      sort: Number(form.sort) || 0,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) await api.put(`/admin/experiences/${editingId}`, payload);
      else await api.post('/admin/experiences', payload);
      setMsg('Tersimpan'); load(); startNew();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const del = async (id) => {
    if (!confirm('Hapus pengalaman ini?')) return;
    try { await api.del(`/admin/experiences/${id}`); load(); } catch (e) { setErr(e.message); }
  };

  if (items === null) return <span style={{ color: '#b1b2b3' }}>Memuat…</span>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card as="form" onSubmit={save} style={{ maxWidth: 800 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <strong>{editingId ? 'Edit pengalaman' : 'Pengalaman baru'}</strong>
          <Button kind="ghost" type="button" onClick={startNew}>Reset</Button>
        </Row>
        <Row>
          <Field style={{ flex: 2 }}>Role<Input value={form.role} onChange={set('role')} /></Field>
          <Field style={{ flex: 2 }}>Perusahaan<Input value={form.company} onChange={set('company')} /></Field>
          <Field style={{ flex: 1 }}>Periode<Input value={form.date} onChange={set('date')} placeholder="Feb 2023 - Mei 2023" /></Field>
        </Row>
        <Field>Deskripsi<Textarea value={form.desc} onChange={set('desc')} /></Field>
        <Field>Skills (pisahkan koma)<Input value={form.skills} onChange={set('skills')} /></Field>
        <Row>
          <Field style={{ flex: 1 }}>Gambar
            <Uploader value={form.img_url} onChange={(u) => setForm((p) => ({ ...p, img_url: u }))} folder="experiences" />
          </Field>
          <Field style={{ flex: 1 }}>URL Dokumen<Input value={form.doc_url} onChange={set('doc_url')} placeholder="https://..." /></Field>
        </Row>
        <Field style={{ flex: 1, maxWidth: 120 }}>Urutan<Input type="number" value={form.sort} onChange={set('sort')} /></Field>
        {msg && <SuccessText>{msg}</SuccessText>}
        {err && <ErrorText>{err}</ErrorText>}
        <Row><Button type="submit" disabled={busy || !form.role}>{busy ? 'Menyimpan…' : 'Simpan'}</Button></Row>
      </Card>

      {items.map((it) => (
        <Card key={it.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong>{it.role}</strong>
            <div style={{ color: '#b1b2b3', fontSize: 13 }}>{it.company} · {it.date}</div>
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