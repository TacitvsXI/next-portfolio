'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useBackground } from '../effects/BackgroundProvider';
import { personalInfo } from '@/data/content';
import { FaCheck, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import emailjs from '@emailjs/browser';
import { trackEvent, setTag, upgradeSession } from '@/utils/analytics';

// EmailJS configuration
const EMAILJS_CONFIG = {
  PUBLIC_KEY: "euQbWXdVM53ytgvXN", 
  SERVICE_ID: "service_f92ejfm",
  TEMPLATE_ID: "template_fg04amn"
};

const ContactContainer = styled.section`
  padding: 8rem 2rem;
  position: relative;
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SectionTitle = styled(motion.h2)`
  font-size: 2.5rem;
  margin-bottom: 4rem;
  text-align: center;
  background: linear-gradient(135deg, rgb(115, 74, 253) 0%, rgb(49, 164, 253) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  grid-column: 1 / -1;
`;

const ContactInfo = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ContactHeading = styled.h3`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: white;
`;

const ContactDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2.5rem;
`;

const ContactMethod = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ContactIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(49, 164, 253, 0.1);
  border: 1px solid rgba(49, 164, 253, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: rgb(49, 164, 253);
  }
`;

const ContactDetail = styled.div`
  flex: 1;
`;

const ContactLabel = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  color: rgba(255, 255, 255, 0.9);
`;

const ContactValue = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  
  a {
    color: #3a86ff;
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: white;
    }
  }
`;

const PGPFingerprint = styled.code`
  display: block;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Courier New', monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  border: 1px solid rgba(115, 74, 253, 0.2);
`;

const PGPLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  
  a {
    color: rgba(115, 74, 253, 0.9);
    text-decoration: none;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    
    &:hover {
      color: rgb(115, 74, 253);
      text-decoration: underline;
    }
    
    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

const SocialLinks = styled(motion.div)`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const SocialLinkWrapper = styled(motion.div)``;

const SocialLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(25, 25, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    background: rgba(58, 134, 255, 0.2);
    border-color: rgba(58, 134, 255, 0.4);
    color: #3a86ff;
    transform: translateY(-3px);
  }
`;

const FormContainer = styled(motion.div)`
  background: rgba(10, 10, 20, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 3rem;
  border: 1px solid rgb(49, 164, 253);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const FormHeading = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: white;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  color: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: rgba(58, 134, 255, 0.5);
    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const TextArea = styled.textarea`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  color: white;
  resize: none;
  min-height: 150px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: rgba(58, 134, 255, 0.5);
    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, rgb(49, 164, 253) 0%, rgb(115, 74, 253) 100%);
  color: white;
  font-weight: 600;
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(49, 164, 253, 0.3);
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(115, 74, 253, 0.4);
    transform: translateY(-3px);
  }
  
  &:disabled {
    background: rgba(49, 164, 253, 0.5);
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled(motion.div)`
  background: rgba(0, 200, 83, 0.1);
  border: 1px solid rgba(0, 200, 83, 0.3);
  color: rgba(0, 200, 83, 1);
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const ErrorMessage = styled(motion.div)`
  background: rgba(255, 50, 50, 0.1);
  border: 1px solid rgba(255, 50, 50, 0.3);
  color: rgba(255, 50, 50, 1);
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const SpinnerIcon = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function ContactSection() {
  const { setBackgroundType, setIntensity, setColorScheme } = useBackground();
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | 'success' | 'error'>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formState.name || !formState.email || !formState.message) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Initialize EmailJS with your public key
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    
    try {
      // Format the message with contact information
      const formattedMessage = `
Message:
${formState.message}

-------------------
Contact Information:
Name: ${formState.name}
Email: ${formState.email}
      `;

      // Send the email using EmailJS
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          name: formState.name,
          email: formState.email,
          subject: formState.subject || "Digital Hub Contact Form",
          message: formattedMessage,
          title: formState.subject || "Digital Hub Contact Form"
        }
      );
      
      if (result.status === 200) {
        // Track successful form submission with Clarity
        trackEvent('contact_form_submitted');
        setTag('contact_subject', formState.subject || 'No Subject');
        // Mark this as an important session to prioritize in Clarity
        upgradeSession('contact_form_submission');
        
        // Reset form after successful submission
        setFormState({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        
        setSubmitStatus('success');
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus(null);
        }, 5000);
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      // Track form submission errors
      trackEvent('contact_form_error');
      setTag('form_error', error instanceof Error ? error.message : 'Unknown error');
      
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  useEffect(() => {
    if (inView) {
      controls.start('visible');
      
      // Change background when scrolling to Contact section
      setBackgroundType('crypto');
      setIntensity(20);
      setColorScheme('green');
    }
  }, [inView, controls, setBackgroundType, setIntensity, setColorScheme]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <ContactContainer id="contact" ref={ref}>
      <ContentWrapper className="content-section-enhanced">
        <SectionTitle
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.8 }}
          className="cyberpunk-section-title cyberpunk-title-md"
          data-text="Sync.Contact_Protocol"
          data-mobile-text="Contact"
        >
          Sync.Contact_Protocol
        </SectionTitle>
        
        <ContactInfo
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <ContactHeading className="cyberpunk-text">Let&apos;s Connect</ContactHeading>
          <ContactDescription className="enhanced-text">
            Interested in working together or have a question? Feel free to reach out - I&apos;d love to hear from you!
          </ContactDescription>
          
          <ContactMethod variants={itemVariants}>
            <ContactIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </ContactIcon>
            <ContactDetail>
              <ContactLabel>Email</ContactLabel>
              <ContactValue>
                <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
              </ContactValue>
              <ContactValue style={{ marginTop: '0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px', color: 'rgba(115, 74, 253, 0.8)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                I prefer using PGP for sensitive communications
              </ContactValue>
              <PGPFingerprint>
                4846 4E53 55CC 30E7 C9B4  D473 7CEA 8546 6E5E 75B2
              </PGPFingerprint>
              <PGPLinks>
                <a href="https://github.com/TacitvsXI.gpg" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Public Key
                </a>
                <a href="https://github.com/pcaversaccio/gpg-sign-and-encrypt" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Usage Guide
                </a>
              </PGPLinks>
            </ContactDetail>
          </ContactMethod>
        </ContactInfo>
        
        <FormContainer
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="cyberpunk-card"
        >
          <FormHeading className="cyberpunk-text">Send Message</FormHeading>
          <Form ref={formRef} onSubmit={handleSubmit}>
            <InputGroup>
              <Label htmlFor="name">Full Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="John Doe"
                value={formState.name}
                onChange={handleChange}
                required
              />
            </InputGroup>
            
            <InputGroup>
              <Label htmlFor="email">Email Address</Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="john@example.com"
                value={formState.email}
                onChange={handleChange}
                required
              />
            </InputGroup>
            
            <InputGroup>
              <Label htmlFor="subject">Subject</Label>
              <Input
                type="text"
                id="subject"
                name="subject"
                placeholder="Project Inquiry"
                value={formState.subject}
                onChange={handleChange}
                required
              />
            </InputGroup>
            
            <InputGroup>
              <Label htmlFor="message">Message</Label>
              <TextArea
                id="message"
                name="message"
                placeholder="Hi, I&apos;m interested in working with you on a project..."
                value={formState.message}
                onChange={handleChange}
                required
              />
            </InputGroup>
            
            <SubmitButton
              type="submit"
              disabled={isSubmitting}
              className="cyberpunk-button"
            >
              {isSubmitting ? (
                <SpinnerIcon
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <FaSpinner />
                </SpinnerIcon>
              ) : (
                'Send Message'
              )}
            </SubmitButton>
            
            <AnimatePresence>
              {submitStatus === 'success' && (
                <SuccessMessage
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <FaCheck /> Your message has been sent successfully! I&apos;ll get back to you soon.
                </SuccessMessage>
              )}
              
              {submitStatus === 'error' && (
                <ErrorMessage
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <FaExclamationTriangle /> There was an error sending your message. Please try again or contact me directly via email.
                </ErrorMessage>
              )}
            </AnimatePresence>
          </Form>
        </FormContainer>
      </ContentWrapper>
    </ContactContainer>
  );
} 