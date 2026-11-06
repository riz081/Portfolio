import React from 'react'
import styled from 'styled-components';
import _default from '../../themes/default';
import { useState } from 'react'
import ProjectCard from '../Cards/ProjectCard'
import { usePortfolio } from '../../context/PortfolioContext'

const Container = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
  align-items: center;
`

const Wrapper = styled.div`
  max-width: 1100px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  width: 100%;
  gap: 12px;
  padding: 10px 0 100px 0;

  @media (max-width: 960px) {
      flex-direction: column;
  }
`

const Title = styled.h2`
  font-size: 42px;
  text-align: center;
  font-weight: 600;
  margin-top: 12px;
  color: ${({ theme }) => theme.text_primary};

  @media (max-width: 768px) {
    margin-top: 12px;
    font-size: 32px;
  }
`;

const Desc = styled.div`
  font-size: 18px;
  text-align: center;
  max-width: 600px;
  color: ${({ theme }) => theme.text_secondary};

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ToogleGroup = styled.div`
    display: flex;
    border: 1.5px solid ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.text_accent};
    font-size: 16px;
    border-radius: 12px;
    font-weight: 500;
    margin: 22px 0px;
    flex-wrap: wrap;
    justify-content: center;
    @media (max-width: 768px) {
        font-size: 14px;
    }
`

const ToogleButton = styled.button`
    min-width: 44px;
    min-height: 44px;
    padding: 8px 18px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: inherit;
    font: inherit;
    cursor: pointer;
    ${({ $active, theme }) =>
        $active && `
    background: ${theme.primary + 20};
    `
    }
    &:hover {
        background: ${({ $active, theme }) => theme.primary + ($active ? '20' : '10')};
    }
    @media (max-width: 768px) {
        padding: 6px 8px;
        border-radius: 4px;
    }
`
const Divider = styled.div`
    width: 1.5px;
    background: ${({ theme }) => theme.primary};
    @media (max-width: 768px) {
        display: none;
    }
`

const CardContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 28px;
    flex-wrap: wrap;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 32px;
    grid-auto-rows: minmax(100px, auto);
    @media (max-width: 960px) {
        grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 640px) {
        grid-template-columns: repeat(1, 1fr);
    }
`;

const EmptyState = styled.p`
    padding: 48px 16px;
    font-size: 16px;
    text-align: center;
    color: ${({ theme }) => theme.text_secondary};
`;

const Projects = ({ openModal, setOpenModal }) => {
    const { data } = usePortfolio();
    const projects = data?.projects || [];
    const [toggle, setToggle] = useState('all');
    
    // Define all possible categories
    const allCategories = [
        'ui/ux',
        // 'machine learning',
        'frontend developer',
        'mobile frontend',
        'backend developer',
        'fullstack developer',
    ];
    // Only offer filters that have at least one project behind them
    const categories = [
        'all',
        ...allCategories.filter((category) => projects.some((item) => item.category === category)),
    ];
    const visibleProjects = toggle === 'all'
        ? projects
        : projects.filter((item) => item.category === toggle);

    return (
      <Container id="projects" aria-labelledby="projects-title">
        <Wrapper>
          <Title id="projects-title">Projects</Title>
          <Desc>
            I have worked on various projects across different domains and technologies. Here are some of my projects.
          </Desc>
          <ToogleGroup role="group" aria-label="Filter projects by category">
            {categories.map((category, index) => (
                <React.Fragment key={category}>
                    <ToogleButton
                        type="button"
                        $active={toggle === category}
                        aria-pressed={toggle === category}
                        onClick={() => setToggle(category)}
                    >
                        {category.toUpperCase()}
                    </ToogleButton>
                    {index < categories.length - 1 && <Divider/>}
                </React.Fragment>
            ))}
          </ToogleGroup>
          <p className="sr-only" aria-live="polite">
            {visibleProjects.length} {visibleProjects.length === 1 ? 'project' : 'projects'} shown
          </p>
          {visibleProjects.length === 0 ? (
            <EmptyState>No projects to show yet.</EmptyState>
          ) : (
            <CardContainer>
              {visibleProjects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                />
              ))}
            </CardContainer>
          )}
        </Wrapper>
      </Container>
    )
}

export default Projects