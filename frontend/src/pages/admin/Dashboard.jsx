import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from './auth';
import BioPanel from './panels/BioPanel';
import SkillsPanel from './panels/SkillsPanel';
import ExperiencesPanel from './panels/ExperiencesPanel';
import EducationPanel from './panels/EducationPanel';
import ProjectsPanel from './panels/ProjectsPanel';
import CertificationsPanel from './panels/CertificationsPanel';

const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
`;

const Sidebar = styled.aside`
  width: 220px;
  background: ${({ theme }) => theme.card};
  border-right: 1px solid ${({ theme }) => theme.text_secondary + '22'};
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  gap: 4px;
  @media (max-width: 768px) { width: 70px; }
`;

const Brand = styled.div`
  font-weight: 700;
  font-size: 18px;
  padding: 0 8px 16px;
  color: ${({ theme }) => theme.primary};
`;

const NavItem = styled.button`
  text-align: left;
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  background: ${({ active, theme }) => (active ? theme.primary : 'transparent')};
  color: ${({ active, theme }) => (active ? '#fff' : theme.text_secondary)};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  &:hover { background: ${({ active, theme }) => (active ? theme.primary : theme.bgLight)}; }
`;

const Main = styled.main`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PANELS = {
  bio: { label: 'Bio', component: BioPanel },
  skills: { label: 'Skills', component: SkillsPanel },
  experiences: { label: 'Experiences', component: ExperiencesPanel },
  education: { label: 'Education', component: EducationPanel },
  projects: { label: 'Projects', component: ProjectsPanel },
  certifications: { label: 'Certifications', component: CertificationsPanel },
};

export default function Dashboard() {
  const [panel, setPanel] = useState('projects');
  const { logout } = useAuth();
  const Active = PANELS[panel].component;

  return (
    <Layout>
      <Sidebar>
        <Brand>Portfolio CMS</Brand>
        {Object.entries(PANELS).map(([key, p]) => (
          <NavItem key={key} active={panel === key} onClick={() => setPanel(key)}>
            {p.label}
          </NavItem>
        ))}
        <div style={{ flex: 1 }} />
        <NavItem as={Link} to="/" style={{ textDecoration: 'none' }}>← Lihat situs</NavItem>
        <NavItem onClick={logout}>Logout</NavItem>
      </Sidebar>
      <Main>
        <Header>
          <h1 style={{ fontSize: 22, margin: 0 }}>{PANELS[panel].label}</h1>
        </Header>
        <Active />
      </Main>
    </Layout>
  );
}