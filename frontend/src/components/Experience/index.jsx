import React from 'react'
import styled from 'styled-components'
import { usePortfolio } from '../../context/PortfolioContext';
import { c } from '../../utils/Themes'
import { Section } from '../ui'

const Timeline = styled.ol`
    list-style: none;
`;

const Item = styled.li`
    position: relative;
    padding: 0 0 44px 28px;
    border-left: 1px solid ${c('line')};

    &:last-child {
        padding-bottom: 0;
    }

    &::before {
        content: '';
        position: absolute;
        left: -6px;
        top: 8px;
        width: 11px;
        height: 11px;
        border-radius: 50%;
        background: ${({ $current, theme }) => ($current ? theme.accent : theme.ink)};
        border: 2px solid ${({ $current, theme }) => ($current ? theme.accent : theme.muted)};
    }
`;

const Heading = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 4px 16px;
`;

const Role = styled.h3`
    font-family: ${c('fontDisplay')};
    font-size: 22px;
    font-weight: 650;
    line-height: 1.25;
    letter-spacing: -0.01em;
`;

const Date = styled.p`
    color: ${c('muted')};
    font-size: 15px;
`;

const Company = styled.p`
    margin-top: 2px;
    font-weight: 500;
`;

const Desc = styled.p`
    margin-top: 12px;
    max-width: 68ch;
    color: ${c('muted')};
`;

const Stack = styled.p`
    margin-top: 10px;
    font-size: 15px;
`;

const Logo = styled.img`
    display: block;
    height: 40px;
    margin-bottom: 10px;
    border-radius: 4px;
`;

const Doc = styled.a`
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: ${c('accent')};
`;

const Experience = () => {
  const { data } = usePortfolio();
  const experiences = data?.experiences || [];
  return (
    <Section id="experience" title="Experience">
        <Timeline>
            {experiences.map((experience) => (
                <Item key={experience.id ?? experience.role} $current={/present/i.test(experience.date || '')}>
                    {experience.img_url && <Logo src={experience.img_url} alt="" loading="lazy" />}
                    <Heading>
                        <Role>{experience.role}</Role>
                        <Date>{experience.date}</Date>
                    </Heading>
                    <Company>{experience.company}</Company>
                    {experience.desc && <Desc>{experience.desc}</Desc>}
                    {experience.skills?.length > 0 && <Stack>{experience.skills.join(', ')}</Stack>}
                    {experience.doc_url && (
                        <Doc href={experience.doc_url} target="_blank" rel="noopener noreferrer">Open supporting document</Doc>
                    )}
                </Item>
            ))}
        </Timeline>
    </Section>
  )
}

export default Experience
