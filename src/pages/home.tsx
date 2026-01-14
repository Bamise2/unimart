import Header from "../components/header"
import Hero from "../components/hero"
import Features from "../components/features"
import FAQ from "../components/faq"
import CTA from "../components/cta"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fafaf9]">
      <Header />
      <Hero />
      <Features />
      <FAQ />
      <CTA />
      {/* <Footer /> */}
    </main>
  )
}