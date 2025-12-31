export default function CTA() {
  return (
    <section className="py-20 px-4 bg-black">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Subscribe to Our Newsletter</h2>
        <div className="flex gap-2 mb-8 justify-center max-w-md mx-auto">
          <input type="email" placeholder="Your email address" className="flex-1 px-4 py-3 rounded-full" />
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-medium">
            Get Started
          </button>
        </div>

        <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium mb-8">
          Join Our Community
        </button>

        <div className="flex justify-center gap-6 mb-12">
          <a href="#" className="text-white/70 hover:text-white">
            Instagram
          </a>
          <a href="#" className="text-white/70 hover:text-white">
            LinkedIn
          </a>
          <a href="#" className="text-white/70 hover:text-white">
            TikTok
          </a>
        </div>

        <div className="text-center py-8 border-t border-white/20">
          <p className="text-white/70 mb-2">
            Want to sell?{" "}
            <a href="#" className="text-primary hover:underline">
              Become a seller today
            </a>
          </p>
          <div className="flex justify-center gap-4 text-sm text-white/70">
            <a href="#" className="hover:text-white">
              Terms & Conditions
            </a>
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white">
              Contact Support
            </a>
          </div>
        </div>

        <div className="mt-8 py-6 border-t border-white/20">
          <p className="text-white font-bold mb-2">Unimart</p>
          <p className="text-white/70">Your Campus Marketplace. Simplified.</p>
          <p className="text-white/50 text-sm mt-2">Copyright © 2025 Unimart</p>
          <p className="text-white/50 text-sm">All Rights Reserved.</p>
        </div>
      </div>
    </section>
  )
}
