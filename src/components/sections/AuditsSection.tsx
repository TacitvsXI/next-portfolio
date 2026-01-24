'use client';

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaShieldAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { audits } from '@/data/content';
import Image from 'next/image';

const AuditsContainer = styled.section`
  padding: 8rem 2rem;
  position: relative;
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled(motion.h2)`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, rgb(115, 74, 253) 0%, rgb(49, 164, 253) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SectionDescription = styled(motion.p)`
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto 3rem;
`;

const AuditsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const AuditCard = styled(motion.a)`
  background: rgba(10, 10, 20, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(49, 164, 253, 0.3);
  box-shadow: 0 0 15px rgba(49, 164, 253, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
  text-decoration: none;
  display: block;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      rgb(115, 74, 253) 0%, 
      rgb(49, 164, 253) 50%, 
      rgb(115, 74, 253) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 0 25px rgba(49, 164, 253, 0.25), 0 10px 40px rgba(0, 0, 0, 0.3);
    border-color: rgba(115, 74, 253, 0.5);
    
    &::before {
      opacity: 1;
    }
  }
`;

const PreviewContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(15, 15, 25, 1) 0%, rgba(10, 10, 20, 1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    background: linear-gradient(to top, rgba(10, 10, 20, 0.95), transparent);
    pointer-events: none;
  }
`;

const PreviewImage = styled.div`
  position: relative;
  width: 80%;
  height: 160px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease;
  
  ${AuditCard}:hover & {
    transform: scale(1.02);
  }
`;

const ViewBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(115, 74, 253, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  z-index: 2;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  svg {
    font-size: 0.6rem;
  }
`;

const CardContent = styled.div`
  padding: 1.25rem;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(115, 74, 253, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    color: rgb(115, 74, 253);
    font-size: 1rem;
  }
`;

const CardTitleArea = styled.div`
  flex: 1;
  min-width: 0;
`;

const AuditTitle = styled.h3`
  font-size: 1.1rem;
  color: white;
  margin-bottom: 0.2rem;
  line-height: 1.3;
  font-weight: 600;
`;

const ProtocolName = styled.p`
  font-size: 0.8rem;
  color: rgb(49, 164, 253);
  font-weight: 500;
`;

const AuditDate = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  display: block;
  margin-top: 0.15rem;
`;

const AuditDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  line-height: 1.55;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SeverityBar = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
`;

const SeverityBadge = styled.span<{ $type: 'critical' | 'high' | 'medium' | 'low' | 'informational' }>`
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  
  ${({ $type }) => {
    const colors = {
      critical: { bg: 'rgba(220, 53, 69, 0.2)', text: '#ff6b7a' },
      high: { bg: 'rgba(255, 138, 76, 0.2)', text: '#ff9f5a' },
      medium: { bg: 'rgba(255, 193, 7, 0.2)', text: '#ffc947' },
      low: { bg: 'rgba(40, 167, 69, 0.2)', text: '#5dd879' },
      informational: { bg: 'rgba(49, 164, 253, 0.15)', text: 'rgba(49, 164, 253, 0.9)' }
    };
    return `
      background: ${colors[$type].bg};
      color: ${colors[$type].text};
    `;
  }}
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const Tag = styled.span`
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

export default function AuditsSection() {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <AuditsContainer id="audits" ref={ref}>
      <ContentWrapper>
        <SectionTitle
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="cyberpunk-section-title cyberpunk-title-md"
          data-text="Security.Audit_Reports"
          data-mobile-text="Audits"
        >
          Security.Audit_Reports
        </SectionTitle>
        
        <SectionDescription
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Smart contract security audits and vulnerability assessments. 
          Click on any report to view the full PDF documentation.
        </SectionDescription>
        
        <AuditsGrid
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {audits.map((audit) => (
            <AuditCard 
              key={audit.id} 
              variants={itemVariants} 
              className="cyberpunk-card"
              href={audit.pdfPath}
              target="_blank"
              rel="noopener noreferrer"
            >
              <PreviewContainer>
                <ViewBadge>
                  <FaExternalLinkAlt /> PDF
                </ViewBadge>
                <PreviewImage>
                  <Image
                    src={audit.previewImage}
                    alt={`${audit.title} preview`}
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'top' }}
                  />
                </PreviewImage>
              </PreviewContainer>
              
              <CardContent>
                <CardHeader>
                  <IconWrapper>
                    <FaShieldAlt />
                  </IconWrapper>
                  <CardTitleArea>
                    <AuditTitle>{audit.title}</AuditTitle>
                    <ProtocolName>{audit.protocol}</ProtocolName>
                    <AuditDate>{audit.date}</AuditDate>
                  </CardTitleArea>
                </CardHeader>
                
                <AuditDescription>{audit.description}</AuditDescription>
                
                {audit.severity && (
                  <SeverityBar>
                    {audit.severity.critical && audit.severity.critical > 0 && (
                      <SeverityBadge $type="critical">
                        {audit.severity.critical} Critical
                      </SeverityBadge>
                    )}
                    {audit.severity.high && audit.severity.high > 0 && (
                      <SeverityBadge $type="high">
                        {audit.severity.high} High
                      </SeverityBadge>
                    )}
                    {audit.severity.medium && audit.severity.medium > 0 && (
                      <SeverityBadge $type="medium">
                        {audit.severity.medium} Medium
                      </SeverityBadge>
                    )}
                    {audit.severity.low && audit.severity.low > 0 && (
                      <SeverityBadge $type="low">
                        {audit.severity.low} Low
                      </SeverityBadge>
                    )}
                    {audit.severity.informational && audit.severity.informational > 0 && (
                      <SeverityBadge $type="informational">
                        {audit.severity.informational} Info
                      </SeverityBadge>
                    )}
                  </SeverityBar>
                )}
                
                {audit.tags && audit.tags.length > 0 && (
                  <TagsContainer>
                    {audit.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </TagsContainer>
                )}
              </CardContent>
            </AuditCard>
          ))}
        </AuditsGrid>
      </ContentWrapper>
    </AuditsContainer>
  );
}
