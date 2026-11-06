import { Modal } from '@mui/material';
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { LuExternalLink, LuX } from 'react-icons/lu'
import { SiGithub } from 'react-icons/si'
import { FaLinkedinIn } from 'react-icons/fa'
import { c } from '../../utils/Themes'
import { Button } from '../ui'
import StackDiagram, { layersForProject } from '../StackDiagram'

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
    max-width: 720px;
    height: min-content;
    margin: 48px 16px;
    padding: 24px;
    background-color: ${c('raised')};
    border: 1px solid ${c('line')};
    border-radius: 8px;
    color: ${c('text')};
    animation: ${enter} 220ms ${c('ease')} both;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: ${c('text')};
    font-size: 22px;
    cursor: pointer;
    transition: color 180ms ease;

    &:hover {
        color: ${c('accent')};
    }
`;

const Cover = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    padding: 16px;
    background: ${c('surface')};
    border-radius: 6px;

    svg {
        max-width: 440px;
    }
`;

const Image = styled.img`
    display: block;
    width: 100%;
    margin-bottom: 20px;
    border-radius: 6px;
    object-fit: cover;
`;

const Title = styled.h2`
    margin-right: 44px;
    font-family: ${c('fontDisplay')};
    font-size: 30px;
    font-weight: 650;
    line-height: 1.15;
    letter-spacing: -0.015em;
`;

const Meta = styled.p`
    margin-top: 6px;
    color: ${c('muted')};
    font-size: 15px;
`;

const Desc = styled.p`
    margin-top: 16px;
`;

const Label = styled.h3`
    margin-top: 24px;
    font-size: 16px;
    font-weight: 650;
`;

const Members = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
    list-style: none;
`;

const Member = styled.li`
    display: flex;
    align-items: center;
    gap: 12px;

    img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
    }

    span {
        flex: 1;
        font-weight: 500;
    }

    a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        color: ${c('muted')};
        font-size: 20px;
    }
    a:hover {
        color: ${c('accent')};
    }
`;

const Links = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 24px;
`;

const ProjectDetails = ({ openModal, setOpenModal }) => {
    const project = openModal?.project;
    const close = () => setOpenModal({ state: false, project: null });
    const device = project?.category?.includes('mobile') ? 'mobile' : 'web';
    return (
        <Modal open={true} onClose={close}>
            <Container
                role="dialog"
                aria-modal="true"
                aria-labelledby="project-dialog-title"
                aria-describedby="project-dialog-description"
                onClick={(event) => {
                    if (event.target === event.currentTarget) close();
                }}
            >
                <Wrapper>
                    <CloseButton type="button" aria-label="Close project details" onClick={close}>
                        <LuX aria-hidden="true" />
                    </CloseButton>
                    {project?.image_url ? (
                        <Image src={project.image_url} alt={`${project.title} preview`} />
                    ) : (
                        <Cover>
                            <StackDiagram active={layersForProject(project)} device={device} title={project?.title} />
                        </Cover>
                    )}
                    <Title id="project-dialog-title">{project?.title}</Title>
                    <Meta>{project?.date}</Meta>
                    <Desc id="project-dialog-description">{project?.description}</Desc>
                    {project?.tags?.length > 0 && (
                        <Meta>{project.tags.map((tag) => tag.name).join(', ')}</Meta>
                    )}
                    {project?.members?.length > 0 && (
                        <>
                            <Label>Members</Label>
                            <Members>
                                {project.members.map((member) => (
                                    <Member key={member.id ?? member.name}>
                                        <img src={member.img_url} alt="" />
                                        <span>{member.name}</span>
                                        {member.github_url && (
                                            <a href={member.github_url} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on GitHub`}>
                                                <SiGithub aria-hidden="true" />
                                            </a>
                                        )}
                                        {member.linkedin_url && (
                                            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on LinkedIn`}>
                                                <FaLinkedinIn aria-hidden="true" />
                                            </a>
                                        )}
                                    </Member>
                                ))}
                            </Members>
                        </>
                    )}
                    {(project?.github_url || project?.webapp_url) && (
                        <Links>
                            {project.webapp_url && (
                                <Button href={project.webapp_url} target="_blank" rel="noopener noreferrer">
                                    <LuExternalLink aria-hidden="true" /> Open live app
                                </Button>
                            )}
                            {project.github_url && (
                                <Button $variant="secondary" href={project.github_url} target="_blank" rel="noopener noreferrer">
                                    <SiGithub aria-hidden="true" /> View code
                                </Button>
                            )}
                        </Links>
                    )}
                </Wrapper>
            </Container>
        </Modal>
    )
}

export default ProjectDetails
