import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/hanken-grotesk';
import './App.css';
import styled, { ThemeProvider } from "styled-components";
import { useState } from "react";
import { theme, adminTheme, c } from "./utils/Themes"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/HeroSection';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Credentials from './components/Credentials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ProjectDetails from './components/ProjectDetails'
import StatusGate from './components/StatusGate'
import AdminApp from './pages/admin/AdminApp'

const Body = styled.div`
  background-color: ${c('ink')};
  color: ${c('text')};
  width: 100%;
  overflow-x: clip;
`

function MainSite() {
  const [openModal, setOpenModal] = useState({ state: false, project: null });
  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      <Navbar />
      <Body>
        <main id="main" tabIndex={-1}>
          <Hero />
          <Projects openModal={openModal} setOpenModal={setOpenModal} />
          <Experience />
          <Skills />
          <Credentials />
          <Contact />
        </main>
        <Footer />
        {openModal.state &&
          <ProjectDetails openModal={openModal} setOpenModal={setOpenModal} />
        }
      </Body>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={
          <ThemeProvider theme={adminTheme}>
            <AdminApp />
          </ThemeProvider>
        } />
        <Route path="*" element={
          <ThemeProvider theme={theme}>
            <StatusGate>
              <MainSite />
            </StatusGate>
          </ThemeProvider>
        } />
      </Routes>
    </Router>
  );
}

export default App;
