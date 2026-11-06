import React from 'react'
import styled from 'styled-components'
import { usePortfolio } from '../../context/PortfolioContext'

const Container = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
  align-items: center;
  padding: 0px 0px 60px 0px;
`

const Wrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  width: 100%;
  max-width: 1100px;
  gap: 16px;
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
`

const Desc = styled.div`
  font-size: 18px;
  text-align: center;
  max-width: 600px;
  color: ${({ theme }) => theme.text_secondary};
  @media (max-width: 768px) {
    font-size: 16px;
  }
`

const Grid = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
`

const Card = styled.div`
  width: 100%;
  max-width: 340px;
  background: ${({ theme }) => theme.card};
  border: 0.1px solid #854CE6;
  box-shadow: rgba(23, 92, 230, 0.15) 0px 4px 24px;
  border-radius: 16px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
  line-height: 1.4;
`

const Issuer = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text_secondary};
`

const Date = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text_secondary + 'cc'};
`

const Badge = styled.div`
  align-self: flex-start;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_accent};
  background: ${({ theme }) => theme.primary + '22'};
  padding: 4px 10px;
  border-radius: 20px;
`

const Certifications = () => {
  const { data } = usePortfolio();
  const certifications = data?.certifications || [];
  return (
    <Container id="certifications" aria-labelledby="certifications-title">
      <Wrapper>
        <Title id="certifications-title">Certifications</Title>
        <Desc>Formal credentials in Android mobile security and penetration testing.</Desc>
        <Grid>
          {certifications.map((c) => (
            <Card key={c.id}>
              <CardTitle>{c.title}</CardTitle>
              <Issuer>{c.issuer}</Issuer>
              <Date>{c.date}</Date>
              {c.credential && <Badge>{c.credential}</Badge>}
            </Card>
          ))}
        </Grid>
      </Wrapper>
    </Container>
  )
}

export default Certifications