import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { CheckCircle, ShieldCheck } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fafaf9] pt-16 pb-32 md:pt-24 md:pb-48">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left: Text Content */}
          <div className="space-y-8 animate-in slide-in-from-left duration-700">
            <div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-[#10102a] tracking-tight leading-tight mb-6">
                Your Campus Marketplace. <br/>
                <span className="text-[#103470]">Verified & Secure.</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                Buy, sell, or trade with University of Ibadan students. 
                Sign up with your <span className="font-bold text-[#103470]">student email</span> to join the exclusive community.
                </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={18} />
                    Verified UI Students Only
                </div>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="text-[#103470]" size={18} />
                    Safe Campus Meetups
                </div>
            </div>

            {/* UPDATED BUTTONS FOR ROUTING */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                    <Button className="h-14 px-8 rounded-full bg-[#103470] hover:bg-[#2856c3] text-white text-lg font-bold shadow-xl shadow-blue-900/10 transition-transform hover:-translate-y-1 w-full sm:w-auto">
                        Join Unimart
                    </Button>
                </Link>
                <Link to="/login">
                    <Button variant="outline" className="h-14 px-8 rounded-full border-2 border-[#10102a] text-[#10102a] hover:bg-gray-100 text-lg font-bold transition-transform hover:-translate-y-1 w-full sm:w-auto">
                        Browse Items
                    </Button>
                </Link>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative animate-in slide-in-from-right duration-700 delay-200">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#e4f1ff] rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition duration-500">
                <img 
                    src="/hero.jpg" 
                    alt="UI Student Shopping" 
                    className="w-full h-[500px] object-cover"
                />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}