"use client";

import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import ContactHeader from './ContactHeader';
import ContactMapCard from './ContactMapCard';
import ContactInquiryForm from './ContactInquiryForm';
import ContactInfoCards from './ContactInfoCards';

export default function ContactView() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <PageContainer>
      <main className="max-w-6xl mx-auto px-6 py-12">
        <ContactHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          <ContactMapCard />
          <ContactInquiryForm mounted={mounted} />
        </div>

        <ContactInfoCards />
      </main>
    </PageContainer>
  );
}
