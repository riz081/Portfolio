import React from 'react'
import styled from 'styled-components'
import { c } from '../../utils/Themes'
import useInView from '../../hooks/useInView'
import StackDiagram, { layersForProject } from '../StackDiagram'

const Cover = styled.div`
    position: relative;
    aspect-ratio: 5 / 3;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 20px;
    background: ${c('surface')};
    border: 1px solid ${c('line')};
    border-radius: 6px;
    overflow: hidden;
    transition: border-color 200ms ease;

    img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 420ms ${c('ease')};
    }
`;

// The ::after layer stretches the button over the card, so the whole card
// stays clickable while keyboard and screen reader users get a real button.
const OpenButton = styled.button`
    padding: 0;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: color 180ms ease;

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 6px;
    }
    &:focus-visible {
        outline: none;
    }
    &:focus-visible::after {
        outline: 2px solid ${c('accent')};
        outline-offset: 4px;
    }
`;

const Card = styled.article`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 14px;

    &:hover ${Cover}, &:focus-within ${Cover} {
        border-color: ${c('accent')};
    }
    &:hover ${OpenButton} {
        color: ${c('accent')};
    }
    &:hover .plate, &:focus-within .plate {
        --spread: 38px;
    }
    &:hover ${Cover} img, &:focus-within ${Cover} img {
        transform: scale(1.03);
    }
`;

const Heading = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
`;

const Title = styled.h3`
    font-family: ${c('fontDisplay')};
    font-size: 22px;
    font-weight: 650;
    line-height: 1.2;
    letter-spacing: -0.01em;
`;

const Date = styled.p`
    flex-shrink: 0;
    color: ${c('muted')};
    font-size: 14px;
`;

const Description = styled.p`
    color: ${c('muted')};
`;

const Tags = styled.p`
    font-size: 14px;
`;

const ProjectCards = ({ project, setOpenModal }) => {
    const [ref, inView] = useInView();
    const [imageFailed, setImageFailed] = React.useState(false);
    const device = project.category?.includes('mobile') ? 'mobile' : 'web';
    return (
        <Card>
            <Cover ref={ref}>
                {project.image_url && !imageFailed ? (
                    <img
                        src={project.image_url}
                        alt={`${project.title} preview`}
                        loading="lazy"
                        decoding="async"
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <StackDiagram
                        active={layersForProject(project)}
                        device={device}
                        title={project.title}
                        open={inView}
                    />
                )}
            </Cover>
            <Heading>
                <Title>
                    <OpenButton type="button" onClick={() => setOpenModal({ state: true, project })}>
                        {project.title}
                    </OpenButton>
                </Title>
                <Date>{project.date}</Date>
            </Heading>
            <Description>{project.description}</Description>
            {project.tags?.length > 0 && (
                <Tags>{project.tags.map((tag) => tag.name).join(', ')}</Tags>
            )}
        </Card>
    )
}

export default ProjectCards
