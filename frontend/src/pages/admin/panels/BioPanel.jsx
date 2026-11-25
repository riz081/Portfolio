import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { Field, Input, Textarea, Button, Card, Row, ErrorText, SuccessText, SectionTitle } from '../ui';
import Uploader from '../Uploader';

export default function BioPanel() {
  const [bio, setBio] = useState(null);
  const [rolesText, setRolesText] = useState('');
  const [headlineText, setHeadlineText] = useState('');
  const [proofText, setProofText] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/bio').then((r) => {
      const b = r.data || {};
      setBio(b);
      setRolesText((b.roles || []).join(', '));
      setHeadlineText(b.headline || '');
      setProofText((b.proof || []).join('\n'));
    });
  }, []);

  const set = (k) => (e) => setBio((p) => ({ ...p, [k]: e.target.value }));

  const setResume = (index, key, value) => setBio((p) => ({
    ...p,
    resumes: (p.resumes || []).map((doc, i) => (i === index ? { ...doc, [key]: value } : doc)),
  }));

  const addResume = () => setBio((p) => ({
    ...p,
    resumes: [...(p.resumes || []), { title: '', url: '' }],
  }));

  const removeResume = (index) => setBio((p) => ({
    ...p,
    resumes: (p.resumes || []).filter((_, i) => i !== index),
  }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      const payload = {
        ...bio,
        roles: rolesText.split(',').map((s) => s.trim()).filter(Boolean),
        headline: headlineText,
        proof: proofText.split('\n').map((s) => s.trim()).filter(Boolean),
        resumes: (bio.resumes || []).filter((doc) => doc.title && doc.url),
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
      <Field>Headline hero (satu baris per potongan, maks. 2–3 baris)
        <Textarea rows={3} value={headlineText} onChange={(e) => setHeadlineText(e.target.value)} placeholder={'I build the whole stack,\nthen try to break it.'} />
      </Field>
      <Field>Bukti (satu per baris)
        <Textarea rows={3} value={proofText} onChange={(e) => setProofText(e.target.value)} placeholder={'9+ production projects\n3 apps live on Google Play'} />
      </Field>
      <Row>
        <Field style={{ flex: '1 1 240px' }}>Email<Input value={bio.email || ''} onChange={set('email')} /></Field>
        <Field style={{ flex: '1 1 240px' }}>GitHub<Input value={bio.github} onChange={set('github')} /></Field>
      </Row>
      <Row>
        <Field style={{ flex: '1 1 240px' }}>Resume lama (fallback)<Input value={bio.resume || ''} onChange={set('resume')} /></Field>
      </Row>
      <Row>
        <Field style={{ flex: '1 1 240px' }}>LinkedIn<Input value={bio.linkedin} onChange={set('linkedin')} /></Field>
        <Field style={{ flex: '1 1 240px' }}>Instagram<Input value={bio.insta} onChange={set('insta')} /></Field>
      </Row>
      <Row>
        <Field style={{ flex: '1 1 240px' }}>Facebook<Input value={bio.facebook} onChange={set('facebook')} /></Field>
      </Row>
      <Field>Daftar resume (link Google Docs / file PDF yang diunggah)
        {(bio.resumes || []).map((doc, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, border: '1px solid #2a2d34', borderRadius: 8, marginBottom: 8 }}>
            <Row>
              <Field style={{ flex: '1 1 200px' }}>Judul<Input value={doc.title} onChange={(e) => setResume(index, 'title', e.target.value)} placeholder="CV — DevOps Engineer" /></Field>
              <Field style={{ flex: '2 1 320px' }}>URL<Input value={doc.url} onChange={(e) => setResume(index, 'url', e.target.value)} placeholder="https://docs.google.com/... atau hasil upload" /></Field>
              <Field>
                &nbsp;
                <button
                  type="button"
                  onClick={() => removeResume(index)}
                  style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #ff6b6b', background: 'transparent', color: '#ff6b6b', fontWeight: 600, cursor: 'pointer' }}
                >
                  Hapus
                </button>
              </Field>
            </Row>
            <Uploader
              value={doc.url}
              onChange={(url) => setResume(index, 'url', url)}
              folder="resume"
              accept=".pdf,.doc,.docx,application/pdf"
            />
          </div>
        ))}
        <Button type="button" onClick={addResume}>+ Tambah dokumen</Button>
      </Field>
      <Field>Foto profil
        <Uploader value={bio.avatar_url} onChange={(url) => setBio((p) => ({ ...p, avatar_url: url }))} folder="bio" />
      </Field>
      {msg && <SuccessText>{msg}</SuccessText>}
      {err && <ErrorText>{err}</ErrorText>}
      <Row><Button type="submit" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan'}</Button></Row>
    </Card>
  );
}