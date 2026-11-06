import React, { useState } from 'react'
import styled from 'styled-components';
import ProjectCard from '../Cards/ProjectCard'
import { usePortfolio } from '../../context/PortfolioContext'
import { c } from '../../utils/Themes'
import { Section } from '../ui'

const FILTERS = [
    { value: 'mobile frontend', label: 'Mobile' },
    { value: 'frontend developer', label: 'Web' },
    { value: 'fullstack developer', label: 'Full stack' },
    { value: 'backend developer', label: 'Backend' },
    { value: 'ui/ux', label: 'UI/UX' },
];

const FilterGroup = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 4px 8px;
    margin-bottom: 32px;
`;

const FilterButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 44px;
    min-height: 44px;
    padding: 8px 14px;
    background: ${({ $active, theme }) => ($active ? theme.raised : 'transparent')};
    border: 1px solid ${({ $active, theme }) => ($active ? theme.accent : theme.line)};
    border-radius: 6px;
    color: ${c('text')};
    font-weight: 500;
    cursor: pointer;
    transition: border-color 180ms ease, background-color 180ms ease;

    &:hover {
        border-color: ${c('accent')};
    }
`;

const Count = styled.span`
    color: ${c('muted')};
    font-size: 14px;
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 48px 32px;

    @media (max-width: 640px) {
        grid-template-columns: minmax(0, 1fr);
        gap: 40px;
    }
`;

const EmptyState = styled.p`
    padding: 48px 0;
    color: ${c('muted')};
`;

const Projects = ({ openModal, setOpenModal }) => {
    const { data } = usePortfolio();
    const projects = data?.projects || [];
    const [toggle, setToggle] = useState('all');

    const filters = [
        { value: 'all', label: 'All', count: projects.length },
        ...FILTERS
            .map((filter) => ({
                ...filter,
                count: projects.filter((item) => item.category === filter.value).length,
            }))
            .filter((filter) => filter.count > 0),
    ];
    const visibleProjects = toggle === 'all'
        ? projects
        : projects.filter((item) => item.category === toggle);

    return (
        <Section
            id="projects"
            title="Work"
            lede="Apps and platforms I've shipped. Each diagram shows the layers of the stack I worked on."
        >
            <FilterGroup role="group" aria-label="Filter projects by category">
                {filters.map(({ value, label, count }) => (
                    <FilterButton
                        key={value}
                        type="button"
                        $active={toggle === value}
                        aria-pressed={toggle === value}
                        onClick={() => setToggle(value)}
                    >
                        {label} <Count>{count}</Count>
                    </FilterButton>
                ))}
            </FilterGroup>
            <p className="sr-only" aria-live="polite">
                {visibleProjects.length} {visibleProjects.length === 1 ? 'project' : 'projects'} shown
            </p>
            {visibleProjects.length === 0 ? (
                <EmptyState>No projects to show yet.</EmptyState>
            ) : (
                <CardGrid>
                    {visibleProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            openModal={openModal}
                            setOpenModal={setOpenModal}
                        />
                    ))}
                </CardGrid>
            )}
        </Section>
    )
}

export default Projects
