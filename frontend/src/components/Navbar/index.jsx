import React from "react";
import styled, { keyframes } from "styled-components"
import { LuMenu, LuX } from "react-icons/lu"
import { SiGithub } from "react-icons/si"
import { c } from "../../utils/Themes"

const GITHUB_URL = "https://github.com/riz081";

const NAV_ITEMS = [
    { href: "#projects", label: "Work" },
    { href: "#experience", label: "Experience" },
    { href: "#skills", label: "Skills" },
    { href: "#credentials", label: "Credentials" },
    { href: "#contact", label: "Contact" },
];

const navIn = keyframes`
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
`;

const Nav = styled.header`
    animation: ${navIn} 500ms ${c('easeEnter')} both;
    position: sticky;
    top: 0;
    z-index: 10;
    height: ${c('navHeight')};
    background-color: ${c('ink')};
    border-bottom: 1px solid ${c('line')};
    color: ${c('text')};
`;

const NavContainer = styled.nav`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    height: 100%;
    max-width: 1320px;
    margin: 0 auto;
    padding: 0 32px;

    @media (max-width: 768px) {
        padding: 0 12px 0 20px;
    }
`;

const Logo = styled.a`
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    color: ${c('text')};
    font-family: ${c('fontDisplay')};
    font-weight: 650;
    font-size: 18px;
    letter-spacing: -0.01em;
    text-decoration: none;

    svg {
        transition: transform 280ms ${c('ease')};
    }
    &:hover svg {
        transform: translateY(-2px);
    }
`;

const NavItems = styled.ul`
    display: flex;
    align-items: center;
    gap: 8px;
    list-style: none;

    @media (max-width: 768px) {
        display: none;
    }
`;

const NavLink = styled.a`
    position: relative;
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 12px;
    color: ${c('muted')};
    font-weight: 500;
    text-decoration: none;
    transition: color 180ms ease;

    &::after {
        content: '';
        position: absolute;
        left: 12px;
        right: 12px;
        bottom: 6px;
        height: 2px;
        background: ${c('accent')};
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 240ms ${c('ease')};
    }

    &:hover {
        color: ${c('text')};
    }
    &:hover::after,
    &[aria-current="location"]::after {
        transform: scaleX(1);
    }
    &[aria-current="location"] {
        color: ${c('text')};
    }
`;

const GithubLink = styled.a`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 12px;
    color: ${c('text')};
    font-weight: 500;
    text-decoration: none;
    transition: color 180ms ease;

    &:hover {
        color: ${c('accent')};
    }

    @media (max-width: 768px) {
        display: none;
    }
`;

const MobileToggle = styled.button`
    display: none;
    @media (max-width: 768px) {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        background: transparent;
        border: none;
        border-radius: 6px;
        color: ${c('text')};
        font-size: 24px;
        cursor: pointer;
    }
`;

const MobileMenu = styled.nav`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    padding: 8px 20px 20px;
    background: ${c('ink')};
    border-bottom: 1px solid ${c('line')};

    @media (min-width: 769px) {
        display: none;
    }
`;

const MobileMenuLink = styled.a`
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 48px;
    color: ${c('text')};
    font-size: 18px;
    font-weight: 500;
    text-decoration: none;

    &[aria-current="location"] {
        color: ${c('accent')};
    }
`;

// Tracks which section crosses the vertical middle of the viewport.
const useActiveSection = () => {
    const [activeId, setActiveId] = React.useState(null);

    React.useEffect(() => {
        const hero = document.getElementById("top");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target === hero ? null : entry.target.id);
                    }
                });
            },
            { rootMargin: "-50% 0px -50% 0px" }
        );
        if (hero) observer.observe(hero);
        NAV_ITEMS.forEach(({ href }) => {
            const section = document.querySelector(href);
            if (section) observer.observe(section);
        });
        return () => observer.disconnect();
    }, []);

    return activeId;
};

export const LogoMark = () => (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 18.5 28 24 16 29.5 4 24Z" stroke="#A3B0BF" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 10.5 28 16 16 21.5 4 16Z" fill="#101826" stroke="#EDF1F5" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 2.5 28 8 16 13.5 4 8Z" fill="#854CE6" stroke="#854CE6" strokeWidth="2" strokeLinejoin="round" />
    </svg>
);

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
                <Logo href="#top">
                    <LogoMark />
                    Rizqika Ibnu K
                </Logo>
                <NavItems>
                    {NAV_ITEMS.map(({ href, label }) => (
                        <li key={href}>
                            <NavLink href={href} aria-current={activeId === href.slice(1) ? "location" : undefined}>{label}</NavLink>
                        </li>
                    ))}
                </NavItems>
                <GithubLink href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                    <SiGithub aria-hidden="true" /> GitHub
                </GithubLink>
                <MobileToggle
                    ref={toggleRef}
                    type="button"
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    onClick={() => setOpen((prev) => !prev)}
                >
                    {open ? <LuX aria-hidden="true" /> : <LuMenu aria-hidden="true" />}
                </MobileToggle>
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
                    <MobileMenuLink href={GITHUB_URL} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
                        <SiGithub aria-hidden="true" /> GitHub
                    </MobileMenuLink>
                </MobileMenu>
            )}
        </Nav>
    )
}

export default Navbar
