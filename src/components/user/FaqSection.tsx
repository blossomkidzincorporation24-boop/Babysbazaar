'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Container from '@/components/ui/Container'

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'How do I place an order or enquire about a product?',
      a: 'Simply tap the "Enquire on WhatsApp" button on any product. This immediately connects you with our store team on WhatsApp (+91 84898 24888) with the exact product name, price, and link pre-filled so we can assist you directly.',
    },
    {
      q: 'How does payment work?',
      a: 'Once we confirm product availability, sizing, and your delivery address on WhatsApp, we share simple and secure payment details (UPI / Google Pay / Bank Transfer) to confirm your dispatch.',
    },
    {
      q: 'How long does delivery take?',
      a: 'All orders are carefully packed and dispatched within 24 to 48 hours from our store in Erode. Deliveries within Tamil Nadu usually arrive in 1–3 days, and across India in 3–5 business days.',
    },
    {
      q: 'Can I visit your retail store in Erode?',
      a: 'Yes, absolutely! We welcome you to visit Baby\'s Bazaar in person at 160, Perundurai Road, Near Sudha Hospital, Edayankattuvalasu, Erode, Tamil Nadu 638011.',
    },
    {
      q: 'What materials are used for your baby clothes and bedding?',
      a: 'All our baby apparel, bedding sets, and maternity nighties are crafted from 100% breathable, ultra-soft cotton and baby-safe fabrics gentle on delicate newborn skin.',
    },
    {
      q: 'Can I request additional photos or video clips before purchasing?',
      a: 'Yes! Just ask us on WhatsApp. Our team will gladly send you real-time photos, color choices, and video clips of the exact items before packaging.',
    },
  ]

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className="w-full py-10 lg:py-16">
      <Container>
        {/* Centered Heading */}
        <h2 className="font-roboto-slab text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F40436] text-center mb-8">
          Frequently Asked Questions
        </h2>

        {/* Accordion Box */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-xs overflow-hidden">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={index} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-gray-800 hover:text-[#E1144B] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#E1144B]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-xs text-gray-500 leading-relaxed animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
