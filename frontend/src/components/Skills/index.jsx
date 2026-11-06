import React from 'react'
import styled from 'styled-components'
import {
  SiAndroid, SiAngular, SiClaude, SiDart, SiDocker, SiFlutter, SiGit, SiGo, SiJavascript, SiJenkins, SiLaravel,
  SiNestjs, SiNextdotjs, SiOpenjdk, SiOwasp, SiPhp, SiReact, SiSpringboot, SiTypescript,
} from 'react-icons/si'
import {
  LuBinary, LuBrainCircuit, LuCircleDot, LuCode, LuDatabase, LuGitPullRequest, LuKanban,
  LuMessagesSquare, LuScanSearch, LuShieldCheck, LuTerminal, LuWaypoints, LuWorkflow,
} from 'react-icons/lu'
import { usePortfolio } from '../../context/PortfolioContext'
import { c } from '../../utils/Themes'
import { Reveal, Section } from '../ui'

const GROUP_ORDER = ['Security', 'Backend', 'Mobile', 'Frontend', 'Languages', 'DevOps / Workflow', 'AI & Tooling'];

const ICONS = {
  'golang (gin)': SiGo, go: SiGo, 'java (spring boot)': SiSpringboot, nestjs: SiNestjs, laravel: SiLaravel, 'restful api': LuWaypoints,
  flutter: SiFlutter, 'react native': SiReact, 'java (android)': SiAndroid,
  'react.js': SiReact, 'next.js': SiNextdotjs, angular: SiAngular,
  typescript: SiTypescript, javascript: SiJavascript, php: SiPhp, dart: SiDart, java: SiOpenjdk, sql: LuDatabase,
  'owasp mobile top 10': SiOwasp, 'owasp web top 10': SiOwasp, adb: LuTerminal,
  'apk reverse engineering': LuBinary, 'static & dynamic analysis': LuScanSearch, 'api security testing': LuShieldCheck,
  'claude code': SiClaude, opencode: LuCode, 'llm integration': LuBrainCircuit, 'prompt engineering': LuMessagesSquare,
  git: SiGit, 'agile/scrum': LuKanban, 'ci/cd': LuWorkflow, 'ci/cd (jenkins)': SiJenkins, 'code review': LuGitPullRequest, docker: SiDocker,
};

const Group = styled(Reveal)`
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 16px 24px;
  padding: 22px 0;
  border-top: 1px solid ${c('line')};

  &:first-child {
    padding-top: 0;
    border-top: none;
  }

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
  }
`;

const GroupTitle = styled.h3`
  font-family: ${c('fontDisplay')};
  font-size: 18px;
  font-weight: 650;
  line-height: 1.5;
`;

const List = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  list-style: none;
`;

const Item = styled.li`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: color 180ms ease;

  svg, img {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    color: ${({ $emphasis, theme }) => ($emphasis ? theme.accent : theme.muted)};
    transition: color 180ms ease, transform 180ms ${c('ease')};
  }

  &:hover svg {
    color: ${c('accent')};
    transform: translateY(-1px);
  }
`;

function SkillIcon({ name, src }) {
  const Icon = ICONS[name?.toLowerCase()];
  if (Icon) return <Icon aria-hidden="true" />;
  // Skills added in the CMS without a matching icon use their uploaded image.
  if (src) return <img src={src} alt="" loading="lazy" />;
  return <LuCircleDot aria-hidden="true" />;
}

const rank = (title) => {
  const index = GROUP_ORDER.indexOf(title);
  return index === -1 ? GROUP_ORDER.length : index;
};

const Skills = () => {
  const { data } = usePortfolio();
  const groups = [...(data?.skill_groups || [])].sort((a, b) => rank(a.title) - rank(b.title));
  return (
    <Section id="skills" title="Skills">
      {groups.map((group) => (
        <Group key={group.title}>
          <GroupTitle>{group.title}</GroupTitle>
          <List>
            {group.skills.map((skill) => (
              <Item key={skill.name} $emphasis={group.title === 'Security'}>
                <SkillIcon name={skill.name} src={skill.image_url} />
                {skill.name}
              </Item>
            ))}
          </List>
        </Group>
      ))}
    </Section>
  )
}

export default Skills
