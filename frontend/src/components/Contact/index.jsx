import React, { useRef } from 'react'
import styled from 'styled-components'
import emailjs from '@emailjs/browser';
import { Snackbar } from '@mui/material';
import { LuMail, LuSend } from 'react-icons/lu'
import { SiGithub } from 'react-icons/si'
import { FaLinkedinIn } from 'react-icons/fa'
import { usePortfolio } from '../../context/PortfolioContext'
import { c } from '../../utils/Themes'
import { Button, Reveal, Section } from '../ui'

const PUBLIC_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;

const FIELDS = [
  { name: 'from_email', label: 'Your email', type: 'email', autoComplete: 'email' },
  { name: 'from_name', label: 'Your name', type: 'text', autoComplete: 'name' },
  { name: 'subject', label: 'Subject', type: 'text', autoComplete: 'off', wide: true },
  { name: 'message', label: 'Message', multiline: true, wide: true },
];

const validateField = (name, value) => {
  const trimmed = value.trim();
  if (name === 'from_email') {
    if (!trimmed) return 'Enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address, like name@example.com.';
    return '';
  }
  if (!trimmed) {
    if (name === 'from_name') return 'Enter your name.';
    return name === 'subject' ? 'Enter a subject.' : 'Enter a message.';
  }
  return '';
};

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;
  max-width: 720px;

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  grid-column: ${({ $wide }) => ($wide ? '1 / -1' : 'auto')};

  @media (max-width: 560px) {
    grid-column: auto;
  }
`;

const Label = styled.label`
  font-size: 15px;
  font-weight: 500;
`;

const controlStyles = ({ theme }) => `
  width: 100%;
  min-height: 48px;
  padding: 11px 14px;
  background: ${theme.surface};
  border: 1px solid ${theme.line};
  border-radius: 6px;
  color: ${theme.text};
  font-size: 16px;
  transition: border-color 180ms ease;

  &:hover {
    border-color: ${theme.muted};
  }
  &:focus {
    border-color: ${theme.accent};
  }
  &[aria-invalid="true"] {
    border-color: ${theme.danger};
  }
`;

const Input = styled.input`${controlStyles}`;
const Textarea = styled.textarea`
  ${controlStyles}
  resize: vertical;
`;

const FieldError = styled.p`
  font-size: 15px;
  color: ${c('danger')};
`;

const Footer = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;

  @media (max-width: 560px) {
    grid-column: auto;
  }
`;

const SendError = styled.p`
  flex-basis: 100%;
  color: ${c('danger')};
`;

const Direct = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 24px;
  margin-top: 36px;
  padding-top: 20px;
  max-width: 720px;
  border-top: 1px solid ${c('line')};
  list-style: none;

  a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    color: ${c('text')};
    text-decoration: none;
    transition: color 180ms ease;
  }
  a:hover {
    color: ${c('accent')};
  }
`;

const Contact = () => {
  const { data } = usePortfolio();
  const Bio = data?.bio || {};
  const [open, setOpen] = React.useState(false);
  const [sendFailed, setSendFailed] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const form = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    const elements = form.current.elements;
    const nextErrors = {};
    FIELDS.forEach(({ name }) => {
      const message = validateField(name, elements[name].value);
      if (message) nextErrors[name] = message;
    });
    setErrors(nextErrors);
    const firstInvalid = FIELDS.find(({ name }) => nextErrors[name]);
    if (firstInvalid) {
      elements[firstInvalid.name].focus();
      return;
    }

    setSendFailed(false);
    setSending(true);
    emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        form.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        setOpen(true);
        form.current.reset();
        setErrors({});
      }, (error) => {
        console.error(error?.text ?? error);
        setSendFailed(true);
      })
      .finally(() => setSending(false));
  }

  const handleBlur = ({ target: { name, value } }) => {
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Once a field is flagged, clear the message as soon as the input is fixed.
  const handleChange = ({ target: { name, value } }) => {
    setErrors((prev) => (prev[name] ? { ...prev, [name]: validateField(name, value) } : prev));
  };

  return (
    <Section
      id="contact"
      title="Contact"
      lede="Write to me about a role, a project, or a mobile app you want security tested. All fields are required."
    >
      <Reveal>
      <Form ref={form} onSubmit={handleSubmit} noValidate>
        {FIELDS.map(({ name, label, multiline, wide, ...inputProps }) => {
          const Control = multiline ? Textarea : Input;
          const error = errors[name];
          return (
            <FieldGroup key={name} $wide={wide}>
              <Label htmlFor={name}>{label}</Label>
              <Control
                id={name}
                name={name}
                required
                rows={multiline ? 5 : undefined}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${name}-error` : undefined}
                onBlur={handleBlur}
                onChange={handleChange}
                {...inputProps}
              />
              {error && <FieldError id={`${name}-error`}>{error}</FieldError>}
            </FieldGroup>
          );
        })}
        <Footer>
          <Button as="button" type="submit" disabled={sending} style={{ border: 'none' }}>
            <LuSend aria-hidden="true" /> {sending ? 'Sending…' : 'Send message'}
          </Button>
          {sendFailed && (
            <SendError role="alert">
              Your message wasn't sent. Try again, or contact me on LinkedIn.
            </SendError>
          )}
        </Footer>
      </Form>
      </Reveal>
      <Reveal>
      <Direct>
        {PUBLIC_EMAIL && (
          <li><a href={`mailto:${PUBLIC_EMAIL}`}><LuMail aria-hidden="true" /> {PUBLIC_EMAIL}</a></li>
        )}
        {Bio.linkedin && (
          <li><a href={Bio.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedinIn aria-hidden="true" /> LinkedIn</a></li>
        )}
        {Bio.github && (
          <li><a href={Bio.github} target="_blank" rel="noopener noreferrer"><SiGithub aria-hidden="true" /> GitHub</a></li>
        )}
      </Direct>
      </Reveal>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        message="Message sent."
      />
    </Section>
  )
}

export default Contact
