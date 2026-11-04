import styled from 'styled-components';
import { usePortfolio } from '../context/PortfolioContext';

const Center = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 24px;
  background-color: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
`;

const SkeletonBlock = styled.div`
  width: 100%;
  max-width: 420px;
  height: 18px;
  border-radius: 8px;
  background: linear-gradient(90deg, #26263a 25%, #34344d 50%, #26263a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  & + & { margin-top: 12px; }
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: ${({ theme }) => theme.primary};
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

function LoadingView() {
  return (
    <Center>
      <SkeletonBlock style={{ width: '240px', height: '36px' }} />
      <SkeletonBlock />
      <SkeletonBlock />
      <SkeletonBlock />
      <SkeletonBlock style={{ width: '300px' }} />
    </Center>
  );
}

function ErrorView({ retry }) {
  return (
    <Center>
      <div style={{ fontSize: '42px' }}>⚠️</div>
      <h2>Gagal memuat konten</h2>
      <p style={{ color: '#b1b2b3', textAlign: 'center' }}>
        Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi.
      </p>
      <RetryButton onClick={retry}>Coba lagi</RetryButton>
    </Center>
  );
}

export default function StatusGate({ children }) {
  const { status, reload } = usePortfolio();
  if (status === 'error') return <ErrorView retry={reload} />;
  if (status === 'loading') return <LoadingView />;
  return children;
}