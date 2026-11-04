import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { Field, Input, Textarea, Button, Card, Row, ErrorText, SuccessText } from '../ui';
import Uploader from '../Uploader';

const empty = { school: '', degree: '', date: '', grade: '', desc: '', img_url: '', sort: 0 };

export default function EducationPanel() {
  const [items, setItems] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/education').then((r) => setItems(r.data)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const startNew = () => { setEditingId(null); setForm(empty); setMsg(''); setErr(''); };
  const startEdit = (it) => { setEditingId(it.id); setForm({ ...it }); setMsg(''); setErr(''); };

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr(''); setMsg('');
    const payload = { ...form, sort: Number(form.sort) || 0 };
    try {
      if (editingId) await api.put(`/admin/education/${editingId}`, payload);
      else await api.post('/admin/education', payload);
      setMsg('Tersimpan'); load(); startNew();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const del = async (id) => {
    if (!confirm('Hapus pendidikan ini?')) return;
    try { await api.del(`/admin/education/${id}`); load(); } catch (e) { setErr(e.message); }
  };

  if (items === null) return <span style={{ color: '#b1b2b3' }}>Memuat…</span>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card as="form" onSubmit={save} style={{ maxWidth: 800 }}>
        <strong>{editingId ? 'Edit pendidikan' : 'Pendidikan baru'}</strong>
        <Row>
          <Field style={{ flex: 2 }}>Sekolah<Input value={form.school} onChange={set('school')} /></Field>
          <Field style={{ flex: 2 }}>Gelar<Input value={form.degree} onChange={set('degree')} /></Field>
        </Row>
        <Row>
          <Field style={{ flex: 1 }}>Periode<Input value={form.date} onChange={set('date')} /></Field>
          <Field style={{ flex: 1 }}>Nilai<Input value={form.grade} onChange={set('grade')} /></Field>
        </Row>
        <Field>Deskripsi<Textarea value={form.desc} onChange={set('desc')} /></Field>
        <Row>
          <Field style={{ flex: 1 }}>Logo
            <Uploader value={form.img_url} onChange={(u) => setForm((p) => ({ ...p, img_url: u }))} folder="education" />
          </Field>
          <Field style={{ flex: 1, maxWidth: 120 }}>Urutan<Input type="number" value={form.sort} onChange={set('sort')} /></Field>
        </Row>
        {msg && <SuccessText>{msg}</SuccessText>}
        {err && <ErrorText>{err}</ErrorText>}
        <Row><Button type="submit" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan'}</Button></Row>
      </Card>

      {items.map((it) => (
        <Card key={it.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong>{it.school || it.degree}</strong>
            <div style={{ color: '#b1b2b3', fontSize: 13 }}>{it.degree} · {it.date}</div>
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