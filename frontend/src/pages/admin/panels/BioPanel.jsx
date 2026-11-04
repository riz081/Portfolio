import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { Field, Input, Textarea, Button, Card, Row, ErrorText, SuccessText, SectionTitle } from '../ui';
import Uploader from '../Uploader';

export default function BioPanel() {
  const [bio, setBio] = useState(null);
  const [rolesText, setRolesText] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/bio').then((r) => {
      const b = r.data || {};
      setBio(b);
      setRolesText((b.roles || []).join(', '));
    });
  }, []);

  const set = (k) => (e) => setBio((p) => ({ ...p, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      const payload = {
        ...bio,
        roles: rolesText.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await api.put('/admin/bio', payload);
      setMsg('Bio tersimpan');
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!bio) return <span style={{ color: '#b1b2b3' }}>Memuat…</span>;

  return (
    <Card as="form" onSubmit={save} style={{ maxWidth: 720 }}>
      <SectionTitle>Profil</SectionTitle>
      <Row>
        <Field style={{ flex: '1 1 240px' }}>Nama<Input value={bio.name} onChange={set('name')} /></Field>
        <Field style={{ flex: '1 1 240px' }}>Roles (pisahkan koma)<Input value={rolesText} onChange={(e) => setRolesText(e.target.value)} /></Field>
      </Row>
      <Field>Deskripsi<Textarea value={bio.description} onChange={set('description')} /></Field>
      <Row>
        <Field style={{ flex: '1 1 240px' }}>GitHub<Input value={bio.github} onChange={set('github')} /></Field>
        <Field style={{ flex: '1 1 240px' }}>Resume URL<Input value={bio.resume} onChange={set('resume')} /></Field>
      </Row>
      <Row>
        <Field style={{ flex: '1 1 240px' }}>LinkedIn<Input value={bio.linkedin} onChange={set('linkedin')} /></Field>
        <Field style={{ flex: '1 1 240px' }}>Instagram<Input value={bio.insta} onChange={set('insta')} /></Field>
      </Row>
      <Row>
        <Field style={{ flex: '1 1 240px' }}>Facebook<Input value={bio.facebook} onChange={set('facebook')} /></Field>
      </Row>
      <Field>Foto profil
        <Uploader value={bio.avatar_url} onChange={(url) => setBio((p) => ({ ...p, avatar_url: url }))} folder="bio" />
      </Field>
      {msg && <SuccessText>{msg}</SuccessText>}
      {err && <ErrorText>{err}</ErrorText>}
      <Row><Button type="submit" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan'}</Button></Row>
    </Card>
  );
}