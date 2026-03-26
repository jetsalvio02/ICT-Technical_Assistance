'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, Mail, Phone, BookOpen } from 'lucide-react';

export default function SupportPage() {
  const faqs = [
    {
      question: 'How do I create a new appointment?',
      answer: 'Go to the "New Appointment" section and fill out the form with your details and issue description.'
    },
    {
      question: 'How long does it take to process a request?',
      answer: 'Most requests are processed within 24-48 hours. You will receive email updates on the status.'
    },
    {
      question: 'What if my issue is urgent?',
      answer: 'Contact the ICT Unit directly by phone or email marked in the contact section below.'
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Help & Support
        </h1>
        <p className="text-muted-foreground">
          Find answers to common questions or contact our support team.
        </p>
      </div>

      {/* Contact Information */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Contact ICT Unit
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-semibold text-foreground">(034) 468-9149</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold text-foreground">kabankalan.city@deped.gov.ph</p>
            </div>
          </div>
        </div>
      </Card>

      {/* FAQs */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-6">
              <h3 className="font-semibold text-foreground mb-2">
                {faq.question}
              </h3>
              <p className="text-sm text-muted-foreground">
                {faq.answer}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Documentation */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Documentation
          </h3>
        </div>
        <p className="text-muted-foreground mb-4">
          Learn more about using the ICT Support system.
        </p>
        <Button variant="outline">
          View User Guide
        </Button>
      </Card>
    </div>
  );
}
