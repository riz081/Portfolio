import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { LuFileText, LuDownload, LuExternalLink } from 'react-icons/lu';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button, Reveal, Section } from '../components/ui';
import { api } from '../api/client';
import { c } from '../utils/Themes';

const Body = styled.div`
  background-color: ${c('ink')};
  color: ${c('text')};
  width: 100%;
  overflow-x: clip;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  margin-bottom: 32px;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${({ $active }) => ($active ? c('accent') : c('line'))};
  border-radius: 999px;
  background: transparent;
  color: ${({ $active }) => ($active ? c('accent') : c('muted'))};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 180ms ease, color 180ms ease;

  &:hover {
    border-color: ${c('accent')};
    color: ${c('accent')};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: ${c('raised')};
  border: 1px solid ${c('line')};
  border-radius: 8px;
  transition: border-color 180ms ease, transform 180ms ease;

  &:hover {
    border-color: ${c('accent')};
    transform: translateY(-2px);
  }
`;

const RoleTag = styled.span`
  align-self: flex-start;
  padding: 4px 10px;
  border: 1px solid ${c('line')};
  border-radius: 999px;
  color: ${c('accent')};
  font-size: 13px;
  font-weight: 600;
`;

const DocTitle = styled.h3`
  font-family: ${c('fontDisplay')};
  font-size: 20px;
  font-weight: 650;
  line-height: 1.2;
`;

const DocDesc = styled.p`
  flex: 1;
  color: ${c('muted')};
  font-size: 15px;
`;

const DocIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${c('muted')};
  font-size: 14px;

  svg {
    color: ${c('accent')};
    font-size: 20px;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Empty = styled.p`
  padding: 32px 0;
  color: ${c('muted')};
`;

const urlOf = (doc) => (doc.source_type === 'upload' ? doc.file_url : doc.external_url);

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(value));
};

const ResumePage = () => {
  const [docs, setDocs] = useState(null);
  const [error, setError] = useState('');
  const [role, setRole] = useState('all');

  useEffect(() => {
    api.get('/resumes')
      .then((body) => setDocs(body.data || []))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute('content');
    document.title = 'Resumes | Rizqika Ibnu Khattab';
    description?.setAttribute('content', 'Download role-specific DevOps, backend, full-stack, mobile, and security resumes for Rizqika Ibnu Khattab.');
    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.setAttribute('content', previousDescription);
    };
  }, []);

  const roles = [...new Set((docs || []).map((doc) => doc.role).filter(Boolean))];
  const visible = (docs || []).filter((doc) => role === 'all' || doc.role === role);

  return (
    <>
      <Navbar />
      <Body>
        <main id="main" tabIndex={-1}>
          <Section
            id="resumes"
            title="Resumes"
            lede="CV versions tailored to each role. Preview in a browser or download the PDF."
          >
            {error && <Empty role="alert">Could not load resumes: {error}</Empty>}
            {!error && docs === null && <Empty>Loading…</Empty>}
            {!error && docs !== null && docs.length === 0 && (
              <Empty>No resume documents published yet.</Empty>
            )}
            {docs !== null && docs.length > 0 && (
              <>
                {roles.length > 1 && (
                  <FilterGroup role="group" aria-label="Filter resumes by role">
                    {[{ value: 'all', label: 'All' }, ...roles.map((r) => ({ value: r, label: r }))].map(({ value, label }) => (
                      <FilterButton
                        key={value}
                        type="button"
                        $active={role === value}
                        aria-pressed={role === value}
                        onClick={() => setRole(value)}
                      >
                        {label}
                      </FilterButton>
                    ))}
                  </FilterGroup>
                )}
                {visible.length === 0 ? (
                  <Empty>No resumes for this role yet.</Empty>
                ) : (
                  <Grid>
                    {visible.map((doc) => {
                      const url = urlOf(doc);
                      const isUpload = doc.source_type === 'upload';
                      return (
                        <Reveal key={doc.id}>
                          <Card>
                            {doc.role && <RoleTag>{doc.role}</RoleTag>}
                            <DocTitle>{doc.title}</DocTitle>
                            <DocIcon>
                              <LuFileText aria-hidden="true" />
                              {[isUpload ? 'PDF document' : 'External document', formatSize(doc.file_size), formatDate(doc.updated_at)]
                                .filter(Boolean)
                                .join(' · ')}
                            </DocIcon>
                            {doc.description && <DocDesc>{doc.description}</DocDesc>}
                            <Actions>
                              <Button href={url} target="_blank" rel="noopener noreferrer">
                                <LuExternalLink aria-hidden="true" /> {isUpload ? 'Preview' : 'Open'}
                              </Button>
                              {isUpload && (
                                <Button $variant="secondary" href={url} download>
                                  <LuDownload aria-hidden="true" /> Download
                                </Button>
                              )}
                            </Actions>
                          </Card>
                        </Reveal>
                      );
                    })}
                  </Grid>
                )}
              </>
            )}
          </Section>
        </main>
        <Footer />
      </Body>
    </>
  );
};

export default ResumePage;
