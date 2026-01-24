'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { recommendations } from '@/data/content';

// Styled components with classic theme matching other sections
const RecommendationsContainer = styled.section`
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
`;

const SectionDescription = styled(motion.p)`
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto 3rem;
`;

const SliderContainer = styled.div`
  position: relative;
  max-width: 900px;
  margin: 0 auto;
`;

const RecommendationCard = styled(motion.div)`
  background: rgba(25, 25, 25, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const QuoteIcon = styled.div`
  position: absolute;
  top: 30px;
  left: 30px;
  font-size: 4rem;
  opacity: 0.1;
  color: rgb(115, 74, 253);
`;

const RecommendationText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 30px;
  font-style: italic;
  position: relative;
  z-index: 1;
  text-align: left;
  
  /* Handle line breaks in the text */
  white-space: pre-line;
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    flex-wrap: nowrap; /* Prevent wrapping on small screens */
    gap: 12px;
  }
`;

const ProfileImageContainer = styled.div`
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgb(115, 74, 253);
  box-shadow: 0 0 15px rgba(115, 74, 253, 0.5);
  flex-shrink: 0; /* Prevent image from shrinking */
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    min-width: 60px; /* Ensure fixed width on mobile */
    min-height: 60px; /* Ensure fixed height on mobile */
  }
`;

const ProfileDetails = styled.div`
  text-align: left;
  margin-left: 15px;
`;

const Name = styled.h4`
  margin: 0;
  font-size: 1.2rem;
  color: white;
`;

const Position = styled.p`
  margin: 5px 0 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
`;

const Connection = styled.p`
  margin: 5px 0 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
`;

const LinkedInBadge = styled.div`
  display: flex;
  align-items: center;
  margin-top: 25px;
  
  svg {
    color: #0077b5;
    font-size: 1.5rem;
    margin-right: 10px;
  }
  
  span {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
  }
`;

const ReferenceLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
  padding: 10px 16px;
  background: rgba(115, 74, 253, 0.1);
  border: 1px solid rgba(115, 74, 253, 0.3);
  border-radius: 8px;
  color: rgb(115, 74, 253);
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(115, 74, 253, 0.2);
    border-color: rgba(115, 74, 253, 0.5);
    transform: translateY(-2px);
  }
  
  svg {
    font-size: 1rem;
  }
`;

const ReferenceNote = styled.p`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
  margin-top: 8px;
  margin-left: 4px;
`;

const NavigationButton = styled.button<{ direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => props.direction === 'left' ? 'left: -60px;' : 'right: -60px;'}
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 5;
  
  &:hover {
    background: rgba(115, 74, 253, 0.1);
    color: rgb(115, 74, 253);
    border-color: rgba(115, 74, 253, 0.3);
  }
  
  &:focus {
    outline: none;
  }
  
  @media (max-width: 992px) {
    display: none; /* Hide arrows on mobile */
  }
`;

const ProgressDots = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
  
  @media (max-width: 992px) {
    margin-top: 20px;
  }
`;

const Dot = styled.div<{ $active: boolean }>`
  width: ${props => props.$active ? '14px' : '10px'};
  height: ${props => props.$active ? '14px' : '10px'};
  border-radius: 50%;
  background: ${props => props.$active ? 'rgb(115, 74, 253)' : 'rgba(255, 255, 255, 0.1)'};
  margin: 0 6px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  @media (max-width: 992px) {
    width: ${props => props.$active ? '18px' : '14px'};
    height: ${props => props.$active ? '18px' : '14px'};
    margin: 0 10px;
  }
  
  &:hover {
    background: ${props => props.$active ? 'rgb(115, 74, 253)' : 'rgba(115, 74, 253, 0.3)'};
  }
`;

export default function RecommendationsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? recommendations.length - 1 : prevIndex - 1
    );
  };
  
  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === recommendations.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };
  
  // Update the image error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const fallbackImage = recommendations[currentIndex].fallbackImage;
    
    if (fallbackImage) {
      target.src = fallbackImage;
    } else {
      // Use a random placeholder as last resort
      target.src = `https://randomuser.me/api/portraits/men/${(currentIndex + 30)}.jpg`;
    }
  };
  
  return (
    <RecommendationsContainer id="recommendations" ref={ref}>
      <ContentWrapper>
        <SectionTitle
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="cyberpunk-section-title cyberpunk-title-md"
          data-text="Validate.Professional_Endorsements"
          data-mobile-text="Endorsements"
        >
          Validate.Professional_Endorsements
        </SectionTitle>
        
        <SectionDescription
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          What colleagues and clients say about my work and collaboration
        </SectionDescription>
        
        <SliderContainer>
          <NavigationButton 
            direction="left" 
            onClick={handlePrev}
            aria-label="Previous recommendation"
          >
            <FaQuoteLeft />
          </NavigationButton>
          
          <AnimatePresence mode="wait">
            <RecommendationCard
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <QuoteIcon>
                <FaQuoteLeft />
              </QuoteIcon>
              
              <RecommendationText>
                {recommendations[currentIndex].text}
              </RecommendationText>
              
              <ProfileInfo>
                {recommendations[currentIndex].image && (
                  <ProfileImageContainer>
                    <Image
                      src={recommendations[currentIndex].image}
                      alt={recommendations[currentIndex].name}
                      fill
                      sizes="(max-width: 768px) 60px, 70px"
                      style={{ 
                        objectFit: 'cover',
                        borderRadius: '50%' /* Ensure the image itself is also circular */
                      }}
                      onError={handleImageError}
                    />
                  </ProfileImageContainer>
                )}
                <ProfileDetails>
                  <Name>{recommendations[currentIndex].name}</Name>
                  <Position>{recommendations[currentIndex].position}</Position>
                  <Connection>{recommendations[currentIndex].connection}</Connection>
                </ProfileDetails>
              </ProfileInfo>
              
              <LinkedInBadge>
                <FaQuoteRight />
                <span>
                  {recommendations[currentIndex].connection === "Personal testimonial from investor" 
                    ? `Personal Conversation · ${recommendations[currentIndex].date}`
                    : recommendations[currentIndex].connection.includes("Genuine client comments")
                    ? `Social Media Comments · ${recommendations[currentIndex].date}`
                    : `LinkedIn Recommendation · ${recommendations[currentIndex].date}`
                  }
                </span>
              </LinkedInBadge>
              
              {recommendations[currentIndex].link && (
                <>
                  <ReferenceLink 
                    href={recommendations[currentIndex].link!.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    {recommendations[currentIndex].link!.title}
                  </ReferenceLink>
                  <ReferenceNote>
                    * SLON is my previous Twitter account used for TA market analysis back in time
                  </ReferenceNote>
                </>
              )}
            </RecommendationCard>
          </AnimatePresence>
          
          <NavigationButton 
            direction="right" 
            onClick={handleNext}
            aria-label="Next recommendation"
          >
            <FaQuoteRight />
          </NavigationButton>
          
          <ProgressDots>
            {recommendations.map((_, index) => (
              <Dot 
                key={index} 
                $active={index === currentIndex} 
                onClick={() => handleDotClick(index)}
              />
            ))}
          </ProgressDots>
        </SliderContainer>
      </ContentWrapper>
    </RecommendationsContainer>
  );
} 