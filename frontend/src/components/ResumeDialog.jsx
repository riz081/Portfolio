import { Modal } from '@mui/material';
import styled, { keyframes } from 'styled-components';
import { LuX, LuFileText, LuExternalLink } from 'react-icons/lu';
import { c } from '../utils/Themes';

const enter = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const Container = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  overflow-y: auto;
  background-color: rgba(8, 12, 20, 0.72);

  &:focus {
    outline: none;
  }
`;

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 560px;
  height: min-content;
  margin: auto 16px;
  padding: 24px;
  background-color: ${c('raised')};
  border: 1px solid ${c('line')};
  border-radius: 8px;
  color: ${c('text')};
  animation: ${enter} 220ms ${c('ease')} both;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: ${c('muted')};
  font-size: 22px;
  cursor: pointer;
  transition: color 180ms ease;

  &:hover {
    color: ${c('accent')};
  }
`;

const Title = styled.h2`
  margin-right: 44px;
  font-family: ${c('fontDisplay')};
  font-size: 26px;
  font-weight: 650;
  line-height: 1.15;
`;

const Lede = styled.p`
  margin-top: 6px;
  color: ${c('muted')};
  font-size: 15px;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  list-style: none;
`;

const DocLink = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: ${c('surface')};
  border: 1px solid ${c('line')};
  border-radius: 6px;
  color: ${c('text')};
  text-decoration: none;
  transition: border-color 180ms ease, transform 180ms ease;

  &:hover {
    border-color: ${c('accent')};
    transform: translateY(-1px);
  }

  svg:first-child {
    flex: none;
    color: ${c('accent')};
  }

  span {
    flex: 1;
    min-width: 0;
    font-weight: 600;
  }

  svg:last-child {
    flex: none;
    color: ${c('muted')};
    font-size: 15px;
  }
`;

const ResumeDialog = ({ docs, onClose }) => (
  <Modal open onClose={onClose}>
    <Container
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-dialog-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Wrapper>
        <CloseButton type="button" aria-label="Close resume list" onClick={onClose}>
          <LuX aria-hidden="true" />
        </CloseButton>
        <Title id="resume-dialog-title">Resumes</Title>
        <Lede>Pick a version to view or download.</Lede>
        <List>
          {docs.map((doc) => (
            <li key={doc.url}>
              <DocLink href={doc.url} target="_blank" rel="noopener noreferrer">
                <LuFileText aria-hidden="true" />
                <span>{doc.title}</span>
                <LuExternalLink aria-hidden="true" />
              </DocLink>
            </li>
          ))}
        </List>
      </Wrapper>
    </Container>
  </Modal>
);

export default ResumeDialog;
