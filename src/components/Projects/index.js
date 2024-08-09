import React from 'react'
import styled from 'styled-components';
import _default from '../../themes/default';
import { useState } from 'react'
import ProjectCard from '../Cards/ProjectCard'
import { projects } from '../../data/constants'

const Container = styled.div`
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

const Title = styled.div`
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
    color: ${({ theme }) => theme.primary};
    font-size: 16px;
    border-radius: 12px;
    font-weight: 500;
    margin: 22px 0px;
    @media (max-width: 768px) {
        font-size: 12px;
    }
`

const ToogleButton = styled.div`
    padding: 8px 18px;
    border-radius: 6px;
    cursor: pointer;
    ${({ active, theme }) =>
        active && `
    background: ${theme.primary + 20};
    `
    }
    &:hover {
        background: ${({ theme }) => theme.primary + 8};
    }
    @media (max-width: 768px) {
        padding: 6px 8px;
        border-radius: 4px;
    }
`
const Divider = styled.div`
    width: 1.5px;
    background: ${({ theme }) => theme.primary};
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

const Projects = () => {
    const [toggle, setToggle] = useState('all');
    return (
      <Container id="projects">
        <Wrapper>
          <Title>Projects</Title>
          <Desc>
            I have worked on a wide range of projects. From web apps to android apps. Here are some of my projects.
          </Desc>
          <ToogleGroup >
            {
                toggle === 'all' ? (
                    <ToogleButton active value="all" onClick={() => setToggle("all")} >
                        ALL
                    </ToogleButton>
                ) : (
                    <ToogleButton valie="all" onClick={() => setToggle("all")}>ALL</ToogleButton>
                )
            }
            <Divider/>
            {
                toggle === "web app" ? (
                    <ToogleButton active onClick={() => setToggle("web app")}>WEB APP'S</ToogleButton>
                ) : (
                    <ToogleButton onClick={() => setToggle("web app")}>
                        WEB APP'S
                    </ToogleButton>
                )
            }
            <Divider/>
            {
                toggle === "mobile app" ? (
                    <ToogleButton active onClick={() => setToggle("mobile app")}>MOBILE APP'S</ToogleButton>
                ) : (
                    <ToogleButton onClick={() => setToggle("mobile app")}>MOBILE APP'S</ToogleButton>
                )
            }            
            <Divider/>
            {
                toggle === "machine learning" ? (
                    <ToogleButton active onClick={() => setToggle("machine learning")}>MACHINE LEARNING</ToogleButton>
                ) : (
                    <ToogleButton onClick={() => setToggle("machine learning")}>MACHINE LEARNING</ToogleButton>
                )
            } 
          </ToogleGroup>
          <CardContainer>
            {toggle === 'all' && projects
              .map((project) => (
                <ProjectCard project={project}/>
              ))}
            {projects
              .filter((item) => item.category == toggle)
              .map((project) => (
                <ProjectCard project={project}/>
            ))}
          </CardContainer>
        </Wrapper>
      </Container>
    )
}

export default Projects
