
import React from 'react'
import styled from 'styled-components'
import { useRef } from 'react';
import emailjs from '@emailjs/browser';
import { Snackbar } from '@mui/material';

const Container = styled.section`
display: flex;
flex-direction: column;
justify-content: center;
position: relative;
z-index: 1;
align-items: center;
@media (max-width: 960px) {
    padding: 0px;
}
`

const Wrapper = styled.div`
position: relative;
display: flex;
justify-content: space-between;
align-items: center;
flex-direction: column;
width: 100%;
max-width: 1350px;
padding: 0px 0px 80px 0px;
gap: 12px;
@media (max-width: 960px) {
    flex-direction: column;
}
`

const Title = styled.h2`
font-size: 42px;
text-align: center;
font-weight: 600;
margin-top: 20px;
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
        margin-top: 12px;
        font-size: 16px;
    }
`;


const ContactForm = styled.form`
  width: 95%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.card};
  padding: 32px;
  border-radius: 16px;
  box-shadow: rgba(23, 92, 230, 0.15) 0px 4px 24px;
  margin-top: 28px;
  gap: 12px;
`

const ContactTitle = styled.div`
  font-size: 24px;
  margin-bottom: 6px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
`

const Hint = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.text_secondary};
`

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text_primary};
`

const ContactInput = styled.input`
  width: 100%;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.text_secondary};
  font-size: 18px;
  color: ${({ theme }) => theme.text_primary};
  border-radius: 12px;
  padding: 12px 16px;
  &:focus {
    border: 1px solid ${({ theme }) => theme.primary};
  }
  &[aria-invalid="true"] {
    border-color: #fca5a5;
  }
`

const ContactInputMessage = styled.textarea`
  width: 100%;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.text_secondary};
  font-size: 18px;
  color: ${({ theme }) => theme.text_primary};
  border-radius: 12px;
  padding: 12px 16px;
  &:focus {
    border: 1px solid ${({ theme }) => theme.primary};
  }
  &[aria-invalid="true"] {
    border-color: #fca5a5;
  }
`

const ContactButton = styled.input`
  width: 100%;
  text-decoration: none;
  text-align: center;
  background: ${({ theme }) => theme.primary};
  padding: 13px 16px;
  margin-top: 2px;
  border-radius: 12px;
  border: none;
  color: ${({ theme }) => theme.white};
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`




const FieldError = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: #fca5a5;
`

const SendError = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: #fca5a5;
`

const FIELDS = [
  { name: 'from_email', label: 'Your email', type: 'email', autoComplete: 'email' },
  { name: 'from_name', label: 'Your name', type: 'text', autoComplete: 'name' },
  { name: 'subject', label: 'Subject', type: 'text', autoComplete: 'off' },
  { name: 'message', label: 'Message', multiline: true },
];

const validateField = (name, value) => {
  const trimmed = value.trim();
  if (name === 'from_email') {
    if (!trimmed) return 'Enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address, like name@example.com.';
    return '';
  }
  if (!trimmed) {
    const label = FIELDS.find((field) => field.name === name).label.toLowerCase();
    return `Enter ${label === 'message' ? 'a message' : label === 'subject' ? 'a subject' : label}.`;
  }
  return '';
};

const Contact = () => {

  //hooks
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
      .then((result) => {
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
    <Container id="contact" aria-labelledby="contact-title">
      <Wrapper>
        <Title id="contact-title">Contact</Title>
        <Desc>Feel free to reach out to me for any questions or opportunities!</Desc>
        <ContactForm ref={form} onSubmit={handleSubmit} noValidate>
          <ContactTitle>Email Me</ContactTitle>
          <Hint>All fields are required.</Hint>
          {FIELDS.map(({ name, label, multiline, ...inputProps }) => {
            const Control = multiline ? ContactInputMessage : ContactInput;
            const error = errors[name];
            return (
              <FieldGroup key={name}>
                <Label htmlFor={name}>{label}</Label>
                <Control
                  id={name}
                  name={name}
                  required
                  rows={multiline ? 4 : undefined}
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
          <ContactButton type="submit" value={sending ? 'Sending…' : 'Send'} disabled={sending} />
          {sendFailed && (
            <SendError role="alert">
              Your message couldn't be sent. Please try again, or reach out on LinkedIn.
            </SendError>
          )}
        </ContactForm>
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={()=>setOpen(false)}
          message="Email sent successfully!"
        />
      </Wrapper>
    </Container>
  )
}

export default Contact
