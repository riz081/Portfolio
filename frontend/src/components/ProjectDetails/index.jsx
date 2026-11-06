import { CloseRounded, GitHub, LinkedIn } from '@mui/icons-material';
import { Modal } from '@mui/material';
import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
width: 100%;
height: 100%;
position: absolute;
top: 0;
left: 0;
background-color: #000000a7;
display: flex;
align-items: top;
justify-content: center;
overflow-y: scroll;
transition: all 0.5s ease;
&:focus {
    outline: none;
}
`;

const Wrapper = styled.div`
max-width: 800px;
width: 100%;
border-radius: 16px;
margin: 50px 12px;
height: min-content;
background-color: ${({ theme }) => theme.card};
color: ${({ theme }) => theme.text_primary};
padding: 20px;
display: flex;
flex-direction: column;
position: relative;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 4px;
    right: 8px;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: ${({ theme }) => theme.text_primary};
    cursor: pointer;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
  margin: 8px 44px 0px 6px;
  @media only screen and (max-width: 600px) {
      font-size: 24px;
      margin: 6px 44px 0px 6px;
  }
`;

const Date = styled.div`
    font-size: 16px;
    margin: 2px 6px;
    font-weight: 400;
    color: ${({ theme }) => theme.text_secondary};
    @media only screen and (max-width: 768px){
        font-size: 12px;
    }
`



const Desc = styled.div`
    font-size: 16px;
    font-weight: 400;
    color: ${({ theme }) => theme.text_primary};
    margin: 8px 6px;
    @media only screen and (max-width: 600px) {
        font-size: 14px;
        margin: 6px 6px;
    }
`;

const Image = styled.img`
    width: 100%;
    object-fit: cover;
    border-radius: 12px;
    margin-top: 30px;
    box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.3);
`;

const Label = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: ${({ theme }) => theme.text_primary};
    margin: 8px 6px;
    @media only screen and (max-width: 600px) {
        font-size: 16px;
        margin: 8px 6px;
    }
`;

const Tags = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin: 8px 0px;
    @media only screen and (max-width: 600px) {
        margin: 4px 0px;
    }
`;

const Tag = styled.div`
    font-size: 14px;
    font-weight: 400;
    color: ${({ theme }) => theme.text_accent};
    margin: 4px;
    padding: 4px 8px;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.primary + 20};
    @media only screen and (max-width: 600px) {
        font-size: 12px;
    }
`;

const Members = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex-wrap: wrap;
    margin: 12px 6px;
    @media only screen and (max-width: 600px) {
        margin: 4px 6px;
    }
`;

const Member = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const MemberImage = styled.img`
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 50%;
    margin-bottom: 4px;
    box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.3);
    @media only screen and (max-width: 600px) {
        width: 32px;
        height: 32px;
    }
`;

const MemberName = styled.div`
    font-size: 16px;
    font-weight: 500;
    width: 200px;
    color: ${({ theme }) => theme.text_primary};
    @media only screen and (max-width: 600px) {
        font-size: 14px;
    }
`;


const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    margin: 12px 0px;
    gap: 12px;
`;

const Button = styled.a`
    width: 100%;
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    color: ${({ theme }) => theme.text_primary};
    padding: 12px 16px;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.primary};
    cursor: pointer;
    text-decoration: none;
    transition: all 0.5s ease;
    &:hover {
        background-color: ${({ theme }) => theme.primary + 99};
    }
    ${({ $dull, theme }) => $dull && `
        background-color: ${theme.bgLight};
        color: ${theme.text_secondary};
        &:hover {
            background-color: ${theme.bg + 99};
        }
    `}
    @media only screen and (max-width: 600px) {
        font-size: 12px;
    }
`;


const index = ({ openModal, setOpenModal }) => {
    const project = openModal?.project;
    const close = () => setOpenModal({ state: false, project: null });
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
                        <CloseRounded />
                    </CloseButton>
                    {project?.image_url && <Image src={project?.image_url} alt={`${project.title} preview`} />}
                    <Title id="project-dialog-title">{project?.title}</Title>
                    <Date>{project.date}</Date>
                    <Tags>
                        {project?.tags.map((tag) => (
                            <Tag key={tag.id ?? tag.name}>{tag.name}</Tag>
                        ))}
                    </Tags>
                    <Desc id="project-dialog-description">{project?.description}</Desc>
                    {project?.members?.length > 0 && (
                        <>
                            <Label>Members</Label>
                            <Members>
                                {project?.members.map((member) => (
                                    <Member key={member.id ?? member.name}>
                                        <MemberImage src={member.img_url} alt="" />
                                        <MemberName>{member.name}</MemberName>
                                        <a href={member.github_url} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on GitHub`} style={{textDecoration: 'none', color: 'inherit'}}>
                                            <GitHub />
                                        </a>
                                        <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on LinkedIn`} style={{textDecoration: 'none', color: 'inherit'}}>
                                            <LinkedIn />
                                        </a>
                                    </Member>
                                ))}
                            </Members>
                        </>
                    )}
                    {(project?.github_url || project?.webapp_url) && (
                        <ButtonGroup>
                            {project.github_url && (
                                <Button $dull href={project.github_url} target="_blank" rel="noopener noreferrer">View Code</Button>
                            )}
                            {project.webapp_url && (
                                <Button href={project.webapp_url} target="_blank" rel="noopener noreferrer">View Live App</Button>
                            )}
                        </ButtonGroup>
                    )}
                </Wrapper>
            </Container>

        </Modal>
    )
}

export default index