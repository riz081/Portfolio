import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from './auth';
import { Field, Input, Button, Card, ErrorText, SectionTitle } from './ui';

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.bg};
`;

const Box = styled(Card)`
  width: 100%;
  max-width: 360px;
  padding: 32px;
  gap: 18px;
`;

export default function Login() {
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Login gagal');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <Box as="form" onSubmit={submit}>
        <SectionTitle>Admin CMS</SectionTitle>
        <span style={{ color: '#b1b2b3', fontSize: 13 }}>Masuk untuk mengelola konten portfolio</span>
        <Field>
          Username
          <Input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </Field>
        <Field>
          Password
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <ErrorText>{error}</ErrorText>}
        <Button type="submit" disabled={busy || !username || !password}>
          {busy ? 'Masuk…' : 'Masuk'}
        </Button>
        <Link to="/" style={{ fontSize: 13, color: '#b1b2b3', textAlign: 'center' }}>
          ← Kembali ke situs
        </Link>
      </Box>
    </Page>
  );
}