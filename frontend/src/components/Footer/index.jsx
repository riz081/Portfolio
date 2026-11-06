import styled from 'styled-components';
import { SiGithub } from 'react-icons/si';
import { FaLinkedinIn } from 'react-icons/fa';
import { usePortfolio } from '../../context/PortfolioContext';
import { c } from '../../utils/Themes';
import { IconLink } from '../ui';

const FooterRoot = styled.footer`
  border-top: 1px solid ${c('line')};
`;

const FooterInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 1320px;
  margin: 0 auto;
  padding: 20px 32px;
  color: ${c('muted')};
  font-size: 15px;

  @media (max-width: 900px) {
    padding: 16px 20px;
  }
`;

const Social = styled.div`
  display: flex;
`;

const Footer = () => {
  const { data } = usePortfolio();
  const Bio = data?.bio || {};
  return (
    <FooterRoot>
      <FooterInner>
        <p>&copy; {new Date().getFullYear()} {Bio.name}</p>
        <Social>
          {Bio.github && (
            <IconLink href={Bio.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <SiGithub aria-hidden="true" />
            </IconLink>
          )}
          {Bio.linkedin && (
            <IconLink href={Bio.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedinIn aria-hidden="true" />
            </IconLink>
          )}
        </Social>
      </FooterInner>
    </FooterRoot>
  );
}

export default Footer;
