import styled from 'styled-components';

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.text_secondary};
`;

export const Input = styled.input`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.text_secondary + '55'};
  background: ${({ theme }) => theme.bgLight};
  color: ${({ theme }) => theme.text_primary};
  font-size: 14px;
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.primary}; }
`;

export const Textarea = styled.textarea`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.text_secondary + '55'};
  background: ${({ theme }) => theme.bgLight};
  color: ${({ theme }) => theme.text_primary};
  font-size: 14px;
  outline: none;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  &:focus { border-color: ${({ theme }) => theme.primary}; }
`;

export const Button = styled.button`
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  background: ${({ kind = 'primary', theme }) =>
    kind === 'primary' ? theme.primary : kind === 'danger' ? '#e5484d' : theme.bgLight};
  color: ${({ theme }) => theme.white};
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.text_secondary + '22'};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const Row = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
`;

export const SectionTitle = styled.h2`
  font-size: 20px;
  color: ${({ theme }) => theme.text_primary};
  margin: 0;
`;

export const Muted = styled.span`
  color: ${({ theme }) => theme.text_secondary};
  font-size: 13px;
`;

export const ErrorText = styled.p`
  color: #ff6b6b;
  font-size: 13px;
  margin: 0;
`;

export const SuccessText = styled.p`
  color: #4ade80;
  font-size: 13px;
  margin: 0;
`;