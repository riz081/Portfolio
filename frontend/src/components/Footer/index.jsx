import styled from 'styled-components';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import { usePortfolio } from '../../context/PortfolioContext';

const FooterContainer = styled.div`
  width: 100%;
  padding: 2rem 0;
  display: flex;
  justify-content: center;
  //background: linear-gradient(100.26deg, rgba(0, 102, 255, 0.05) 42.33%, rgba(150, 0, 225, 0.05) 127.07%);
`;


const FooterWrapper = styled.footer`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  padding: 1rem;
  color: ${({ theme }) => theme.text_primary};
`;

const Logo = styled.p`
  font-weight: 600;
  font-size: 20px;
  color: ${({ theme }) => theme.text_accent};
`;

const Nav = styled.nav`
  width: 100%;
  max-width: 800px;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: row;
  gap: 2rem;
  justify-content: center;
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    text-align: center;
    font-size: 12px;
  }
`;

const NavLink = styled.a`
color: ${({ theme }) => theme.text_primary};
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  text-decoration: none;
  font-size: 1.2rem;
  transition: color 0.2s ease-in-out;
  &:hover {
    color: ${({ theme }) => theme.text_accent};
  }
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SocialMediaIcons = styled.div`
  display: flex;
  margin-top: 1rem;
`;

const SocialMediaIcon = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: 0 0.25rem;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text_primary};
  transition: color 0.2s ease-in-out;
  &:hover {
    color: ${({ theme }) => theme.text_accent};
  }
`;

const Copyright = styled.p`
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text_secondary};
  text-align: center;
`;

const Footer = () => {
  const { data } = usePortfolio();
  const Bio = data?.bio || {};
  const socialLinks = [
    { href: Bio.github, label: 'GitHub', Icon: GitHubIcon },
    { href: Bio.linkedin, label: 'LinkedIn', Icon: LinkedInIcon },
    { href: Bio.facebook, label: 'Facebook', Icon: FacebookIcon },
    { href: Bio.insta, label: 'Instagram', Icon: InstagramIcon },
  ].filter(({ href }) => href);
  return (
    <FooterContainer>
      <FooterWrapper>
        <Logo>Rizqika Ibnu K</Logo>
        <Nav aria-label="Footer">
          <NavLink href="#about">About</NavLink>
          <NavLink href="#skills">Skills</NavLink>
          <NavLink href="#experience">Experience</NavLink>
          <NavLink href="#projects">Projects</NavLink>
          <NavLink href="#certifications">Certifications</NavLink>
          <NavLink href="#education">Education</NavLink>
          <NavLink href="#contact">Contact</NavLink>
        </Nav>
        <SocialMediaIcons>
          {socialLinks.map(({ href, label, Icon }) => (
            <SocialMediaIcon key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
              <Icon />
            </SocialMediaIcon>
          ))}
        </SocialMediaIcons>
        <Copyright>
          &copy; {new Date().getFullYear()} Rizqika Ibnu K. All rights reserved.
        </Copyright>

      </FooterWrapper>
    </FooterContainer>
  );
}

export default Footer;