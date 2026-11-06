import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { Field, Input, Button, Card, Row, ErrorText, SuccessText } from '../ui';

const empty = { title: '', issuer: '', date: '', credential: '', credential_url: '', sort: 0 };

export default function CertificationsPanel() {
  const [items, setItems] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/certifications').then((r) => setItems(r.data)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const startNew = () => { setEditingId(null); setForm(empty); setMsg(''); setErr(''); };
  const startEdit = (it) => { setEditingId(it.id); setForm({ ...it }); setMsg(''); setErr(''); };

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr(''); setMsg('');
    const payload = { ...form, sort: Number(form.sort) || 0 };
    try {
      if (editingId) await api.put(`/admin/certifications/${editingId}`, payload);
      else await api.post('/admin/certifications', payload);
      setMsg('Tersimpan'); load(); startNew();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const del = async (id) => {
    if (!confirm('Hapus sertifikat ini?')) return;
    try { await api.del(`/admin/certifications/${id}`); load(); } catch (e) { setErr(e.message); }
  };

  if (items === null) return <span style={{ color: '#b1b2b3' }}>Memuat…</span>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card as="form" onSubmit={save} style={{ maxWidth: 800 }}>
        <strong>{editingId ? 'Edit sertifikat' : 'Sertifikat baru'}</strong>
        <Field>Judul<Input value={form.title} onChange={set('title')} /></Field>
        <Row>
          <Field style={{ flex: 1 }}>Penerbit (issuer)<Input value={form.issuer} onChange={set('issuer')} /></Field>
          <Field style={{ flex: 1 }}>Tanggal<Input value={form.date} onChange={set('date')} placeholder="Jan 2026" /></Field>
        </Row>
        <Row>
          <Field style={{ flex: 1 }}>Keterangan (skor/masa berlaku)<Input value={form.credential} onChange={set('credential')} /></Field>
          <Field style={{ flex: 1, maxWidth: 120 }}>Urutan<Input type="number" value={form.sort} onChange={set('sort')} /></Field>
        </Row>
        <Field>URL kredensial (opsional)<Input value={form.credential_url} onChange={set('credential_url')} /></Field>
        {msg && <SuccessText>{msg}</SuccessText>}
        {err && <ErrorText>{err}</ErrorText>}
        <Row><Button type="submit" disabled={busy || !form.title}>{busy ? 'Menyimpan…' : 'Simpan'}</Button></Row>
      </Card>

      {items.map((it) => (
        <Card key={it.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong>{it.title}</strong>
            <div style={{ color: '#b1b2b3', fontSize: 13 }}>{it.issuer} · {it.date}</div>
            {it.credential && <div style={{ color: '#854CE6', fontSize: 12 }}>{it.credential}</div>}
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