import React from "react";
import { Link as LinkR } from "react-router-dom"
import styled from "styled-components"
import { DiCssdeck } from "react-icons/di"
import { FaBars, FaTimes } from "react-icons/fa"

const GITHUB_URL = "https://github.com/riz081";

const NAV_ITEMS = [
    { href: "#about", label: "About" },
    { href: "#skills", label: "Skills" },
    { href: "#experience", label: "Experience" },
    { href: "#projects", label: "Projects" },
    { href: "#certifications", label: "Certifications" },
    { href: "#education", label: "Education" },
    { href: "#contact", label: "Contact" },
];

const Nav = styled.header`
    background-color: ${({theme}) => theme.card_light};
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    position: sticky;
    top: 0;
    z-index: 10;
`;
const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  z-index: 1;
  width: 100%;
  padding: 0 24px;
  max-width: 1200px;
`;

const NavLogo = styled(LinkR)`
    width: 80%;
    padding: 0 6px;
    display: flex;
    justify-content: start;
    align-items: center;
    text-decoration: none;
    @media (max-width: 640px) {
      padding: 0 0px;
  }
`;

const MobileToggle = styled.button`
    display: none;
    @media screen and (max-width: 768px) {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        padding: 0;
        background: transparent;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: ${({ theme }) => theme.text_primary};
    }
`;

const NavItems = styled.ul`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 32px;
    list-style: none;

    @media screen and (max-width: 768px) {
        display: none;
    }
`;

const NavLink = styled.a`
    color: ${({ theme }) => theme.text_primary};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    &:hover {
      color: ${({ theme }) => theme.text_accent};
    }

    &[aria-current="location"] {
      color: ${({ theme }) => theme.text_accent};
      border-bottom: 2px solid ${({ theme }) => theme.text_accent};
    }
`;

const ButtonContainer = styled.div`
  width: 80%;
  height: 100%;
  display: flex;
  justify-content: end;
  align-items: center;
  padding: 0 6px;
  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const GithubButton = styled.a`
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    color: ${({ theme }) => theme.text_accent};
    border: 1.8px solid ${({ theme }) => theme.primary};
    border-radius: 20px;
    padding: 8px 20px;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    &:hover {
        background-color: ${({ theme }) => theme.primary};
        color: ${({ theme }) => theme.white};
    }
`;

const MobileGithubButton = styled(GithubButton)`
    align-self: flex-start;
    min-height: 44px;
    margin-top: 8px;
    background-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.white};
`;

const Span = styled.div`
    padding: 0 4px;
    font-weight: bold;
    font-size: 18px;
`;

const MobileMenu = styled.nav`
    position: absolute;
    top: 80px;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    padding: 12px 24px 24px;
    background: ${({ theme }) => theme.card_light};
    border-radius: 0 0 20px 20px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);

    @media screen and (min-width: 769px) {
        display: none;
    }
`;

const MobileMenuLink = styled.a`
    display: flex;
    align-items: center;
    min-height: 44px;
    color: ${({ theme }) => theme.text_primary};
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease-in-out;
    &:hover {
        color: ${({ theme }) => theme.text_accent};
    }
    &[aria-current="location"] {
        color: ${({ theme }) => theme.text_accent};
        font-weight: 700;
    }
`;

// Tracks which section crosses the vertical middle of the viewport.
const useActiveSection = () => {
    const [activeId, setActiveId] = React.useState(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveId(entry.target.id);
                });
            },
            { rootMargin: "-50% 0px -50% 0px" }
        );
        NAV_ITEMS.forEach(({ href }) => {
            const section = document.querySelector(href);
            if (section) observer.observe(section);
        });
        return () => observer.disconnect();
    }, []);

    return activeId;
};

const Navbar = () => {
    const [open, setOpen] = React.useState(false);
    const activeId = useActiveSection();
    const toggleRef = React.useRef(null);

    React.useEffect(() => {
        if (!open) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setOpen(false);
                toggleRef.current?.focus();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open]);

    const closeMenu = () => setOpen(false);

    return (
        <Nav>
            <NavContainer aria-label="Main">
                <NavLogo to='/'>
                    <div style={{ display: "flex", alignItems: "center", color: "white", cursor: 'pointer' }}>
                        <DiCssdeck size="3rem" /> <Span>Portfolio</Span>
                    </div>
                </NavLogo>
                <MobileToggle
                    ref={toggleRef}
                    type="button"
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    onClick={() => setOpen((prev) => !prev)}
                >
                    {open ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
                </MobileToggle>
                <NavItems>
                    {NAV_ITEMS.map(({ href, label }) => (
                        <li key={href}>
                            <NavLink href={href} aria-current={activeId === href.slice(1) ? "location" : undefined}>{label}</NavLink>
                        </li>
                    ))}
                </NavItems>
                <ButtonContainer>
                    <GithubButton href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                        Github Profile
                    </GithubButton>
                </ButtonContainer>
            </NavContainer>
            {open && (
                <MobileMenu id="mobile-menu" aria-label="Mobile">
                    {NAV_ITEMS.map(({ href, label }) => (
                        <MobileMenuLink
                            key={href}
                            href={href}
                            aria-current={activeId === href.slice(1) ? "location" : undefined}
                            onClick={closeMenu}
                        >
                            {label}
                        </MobileMenuLink>
                    ))}
                    <MobileGithubButton
                        href={GITHUB_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeMenu}
                    >
                        Github Profile
                    </MobileGithubButton>
                </MobileMenu>
            )}
        </Nav>
    )
}

export default Navbar
