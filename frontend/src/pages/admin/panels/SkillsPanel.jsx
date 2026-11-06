import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { Field, Input, Button, Card, Row, ErrorText, SuccessText } from '../ui';
import Uploader from '../Uploader';

function GroupEditor({ group, onDelete }) {
  const [title, setTitle] = useState(group.title || '');
  const [sort, setSort] = useState(group.sort ?? 0);
  const [items, setItems] = useState((group.skills || []).map((s, i) => ({
    id: s.id, name: s.name || '', image_url: s.image_url || '', sort: s.sort ?? i + 1,
  })));
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const setItem = (idx) => (k) => (e) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [k]: e.target.value } : it)));
  };
  const setItemUrl = (idx) => (url) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, image_url: url } : it)));
  };
  const addItem = () => setItems((p) => [...p, { name: '', image_url: '', sort: p.length + 1 }]);
  const removeItem = (idx) => setItems((p) => p.filter((_, i) => i !== idx));

  const save = async () => {
    setBusy(true); setErr(''); setMsg('');
    try {
      const payload = { title, sort: Number(sort) || 0, skills: items.map((it) => ({ name: it.name, image_url: it.image_url, sort: Number(it.sort) || 0 })) };
      if (group.id) { await api.put(`/admin/skills/${group.id}`, payload); }
      setMsg('Tersimpan');
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <Card>
      <Row>
        <Field style={{ flex: 2 }}>Judul kelompok<Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field style={{ flex: 1 }}>Urutan<Input type="number" value={sort} onChange={(e) => setSort(e.target.value)} /></Field>
      </Row>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((it, idx) => (
          <div key={idx} style={{ border: '1px solid #444', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Row>
              <Field style={{ flex: 2 }}>Nama skill<Input value={it.name} onChange={setItem(idx)('name')} /></Field>
              <Field style={{ flex: 1 }}>Urutan<Input type="number" value={it.sort} onChange={setItem(idx)('sort')} /></Field>
              <Button kind="danger" onClick={() => removeItem(idx)} style={{ alignSelf: 'flex-end' }}>Hapus</Button>
            </Row>
            <Uploader value={it.image_url} onChange={setItemUrl(idx)} folder="skills" />
          </div>
        ))}
      </div>
      <Row>
        <Button kind="ghost" onClick={addItem}>+ Tambah skill</Button>
        <Button onClick={save} disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan group'}</Button>
        {group.id && <Button kind="danger" onClick={() => onDelete(group.id)}>Hapus group</Button>}
      </Row>
      {msg && <SuccessText>{msg}</SuccessText>}
      {err && <ErrorText>{err}</ErrorText>}
    </Card>
  );
}

export default function SkillsPanel() {
  const [groups, setGroups] = useState(null);
  const [err, setErr] = useState('');

  const load = () => api.get('/skills').then((r) => setGroups(r.data)).catch((e) => setErr(e.message));

  useEffect(() => { load(); }, []);

  const addGroup = async () => {
    try {
      await api.post('/admin/skills', { title: 'New group', sort: (groups?.length || 0) + 1, skills: [] });
      load();
    } catch (e) { setErr(e.message); }
  };
  const delGroup = async (id) => {
    if (!confirm('Hapus kelompok ini beserta skill-nya?')) return;
    try { await api.del(`/admin/skills/${id}`); load(); } catch (e) { setErr(e.message); }
  };

  if (groups === null) return <span style={{ color: '#b1b2b3' }}>Memuat…</span>;
  if (err) return <ErrorText>{err}</ErrorText>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Button onClick={addGroup}>+ Tambah kelompok skill</Button>
      {groups.map((g) => <GroupEditor key={g.id} group={g} onDelete={delGroup} />)}
    </div>
  );
}