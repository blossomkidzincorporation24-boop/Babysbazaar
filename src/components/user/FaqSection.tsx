'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Container from '@/components/ui/Container'

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'Is my payment information safe?',
      a: 'Yes, 100%. We use bank-grade 256-bit encrypted checkout gateways. We also offer Cash on Delivery (COD) across India so you can pay conveniently when your order reaches your doorstep.',
    },
    {
      q: 'How long does delivery take?',
      a: 'All orders are dispatched within 24 hours. Metro deliveries typically arrive within 2–4 business days, while other locations take 4–6 business days.',
    },
    {
      q: 'Can I return or exchange product?',
      a: 'Absolutely! We offer a 7-day hassle-free return and exchange policy for any manufacturing defects or sizing issues. Simply message our WhatsApp team for quick replacement.',
    },
    {
      q: 'How can I track my order?',
      a: 'Once your order is dispatched, you will receive an SMS and WhatsApp update with your live courier tracking link.',
    },
    {
      q: 'Are your products made from real leather?',
      a: 'Our products are crafted from 100% certified child-safe vegan leather and organic materials, completely BPA-free, lead-free, and cruelty-free for sensitive baby skin.',
    },
    {
      q: 'How long will your leather products last?',
      a: 'Our premium baby products are built to withstand everyday baby adventures, water splashes, and gentle wipe-downs, designed to stay durable for years.',
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
