import { useRef, useState } from 'react';
import styled from 'styled-components';
import { api } from '../../api/client';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const Preview = styled.img`
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  background: ${({ theme }) => theme.bgLight};
  border: 1px solid ${({ theme }) => theme.text_secondary + '44'};
`;

const Hint = styled.span`
  color: ${({ theme }) => theme.text_secondary};
  font-size: 12px;
  word-break: break-all;
`;

const isImageUrl = (url) => /\.(jpe?g|png|webp|gif|svg)$/i.test(url || '');

export default function Uploader({ value, onChange, folder = 'misc', accept = 'image/*' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isImage = accept.includes('image');
  const actionLabel = isImage ? 'Upload gambar' : 'Upload file';

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const res = await api.upload(file, folder);
      onChange(res.data?.url ?? '');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Wrapper>
      {value && isImageUrl(value) && <Preview src={value} alt="preview" />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          style={{
            padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'var(--primary, #854CE6)', color: '#fff', fontWeight: 600,
          }}
        >
          {busy ? 'Mengunggah…' : value ? `Ganti ${isImage ? 'gambar' : 'file'}` : actionLabel}
        </button>
        <Hint>{value ? value : `belum ada ${isImage ? 'gambar' : 'file'}`}</Hint>
        {error && <span style={{ color: '#ff6b6b', fontSize: 12 }}>{error}</span>}
      </div>
      <input ref={inputRef} type="file" accept={accept} hidden onChange={handleFile} />
    </Wrapper>
  );
}