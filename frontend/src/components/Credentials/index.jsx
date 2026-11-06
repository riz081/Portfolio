import React from 'react'
import styled from 'styled-components'
import { LuAward, LuGraduationCap } from 'react-icons/lu'
import { usePortfolio } from '../../context/PortfolioContext'
import { c } from '../../utils/Themes'
import { Section } from '../ui'

const Group = styled.div`
  & + & {
    margin-top: 48px;
  }
`;

const GroupTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-family: ${c('fontDisplay')};
  font-size: 18px;
  font-weight: 650;

  svg {
    color: ${c('muted')};
  }
`;

const List = styled.ul`
  list-style: none;
`;

const Item = styled.li`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 2px 24px;
  padding: 16px 0;
  border-top: 1px solid ${c('line')};

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Name = styled.p`
  font-weight: 600;
`;

const When = styled.p`
  color: ${c('muted')};
  font-size: 15px;
  white-space: nowrap;
`;

const Detail = styled.p`
  grid-column: 1;
  color: ${c('muted')};
`;

const Note = styled.p`
  grid-column: 1;
  margin-top: 4px;
  color: ${c('accent')};
  font-size: 15px;
`;

const Credentials = () => {
  const { data } = usePortfolio();
  const certifications = data?.certifications || [];
  const education = data?.education || [];
  return (
    <Section
      id="credentials"
      title="Credentials"
      lede="Formal training in Android mobile security, and my degree."
    >
      <Group>
        <GroupTitle><LuAward aria-hidden="true" /> Certifications</GroupTitle>
        <List>
          {certifications.map((cert) => (
            <Item key={cert.id ?? cert.title}>
              <Name>{cert.title}</Name>
              <When>{cert.date}</When>
              <Detail>{cert.issuer}</Detail>
              {cert.credential && <Note>{cert.credential}</Note>}
            </Item>
          ))}
        </List>
      </Group>
      <Group>
        <GroupTitle><LuGraduationCap aria-hidden="true" /> Education</GroupTitle>
        <List>
          {education.map((item) => (
            <Item key={item.id ?? item.school}>
              <Name>{item.school}</Name>
              <When>{item.date}</When>
              <Detail>{item.degree}</Detail>
              {item.grade && <Detail>Grade: {item.grade}</Detail>}
              {item.desc && <Detail style={{ marginTop: 8 }}>{item.desc}</Detail>}
            </Item>
          ))}
        </List>
      </Group>
    </Section>
  )
}

export default Credentials
