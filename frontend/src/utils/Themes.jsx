// Public site tokens. Semantic names only: components never use raw hex values.
export const theme = {
  ink: '#101826', // page background
  surface: '#18222F', // raised areas, plate fills
  raised: '#202C3B', // hover states, dialog
  line: '#34445A', // hairlines and borders
  text: '#EDF1F5',
  muted: '#A3B0BF', // secondary text
  primary: '#854CE6', // brand color: button fills and other solid areas
  primaryHover: '#7438DC',
  onPrimary: '#FFFFFF', // text on a primary fill
  accent: '#A78BFA', // primary lightened for text, lines, and focus on dark surfaces
  danger: '#FF9B8A',

  fontDisplay: "'Bricolage Grotesque Variable', 'Hanken Grotesk Variable', sans-serif",
  fontBody: "'Hanken Grotesk Variable', system-ui, sans-serif",

  ease: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
  easeEnter: 'cubic-bezier(0.16, 1, 0.3, 1)', // page-load entrances
  navHeight: '72px',
};

// Reads a token inside a styled-components template: ${c('muted')}
export const c = (token) => (props) => props.theme[token];

// The admin CMS keeps its original look and is not part of the public redesign.
export const adminTheme = {
  bg: '#1C1C27',
  bgLight: '#1C1E27',
  primary: '#854CE6',
  text_primary: '#F2F3F4',
  text_secondary: '#b1b2b3',
  card: '#171721',
  card_light: '#191924',
  button: '#854CE6',
  white: '#FFFFFF',
  black: '#000000',
};
