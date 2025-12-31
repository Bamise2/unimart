import { useState } from "react"
import { Plus, Minus } from "lucide-react"

const FAQS = [
  {
    question: "Who can sell on CampusMart?",
    answer: "Only verified University of Ibadan students can become sellers. You must verify your account using your official student email address (@ui.edu.ng)."
  },
  {
    question: "Is there a fee to become a seller?",
    answer: "No, signing up and listing items on CampusMart is currently 100% free for all students."
  },
  {
    question: "How do I get paid?",
    answer: "Transactions are currently handled offline. You meet the buyer in a safe public place on campus (like SUB, Faculty, or Hall of Residence) and receive payment via Bank Transfer or Cash."
  },
  {
    question: "Can I buy from outside the university?",
    answer: "Yes! Anyone can browse and request to buy items, but sellers are strictly students. We recommend meeting on campus for safety."
  },
  {
    question: "What happens if a seller doesn't deliver?",
    answer: "Since payments are made upon meeting/pickup, your money is safe. Do not send money before seeing the item."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faqs" className="py-24 bg-[#fafaf9]">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[#10102a] text-center mb-16">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div 
                key={index} 
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                className="w-full px-8 py-6 text-left flex justify-between items-center font-bold text-[#10102a] text-lg"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                {faq.question}
                {openIndex === index ? <Minus size={20} className="text-[#103470]" /> : <Plus size={20} className="text-gray-400" />}
              </button>
              
              <div 
                className={`px-8 text-gray-600 leading-relaxed overflow-hidden transition-all duration-300 ${
                    openIndex === index ? "max-h-40 pb-8 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}