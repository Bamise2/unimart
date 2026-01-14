import { CheckCircle2, Lock, MessageCircle, Smartphone, Search } from "lucide-react"

export default function Features() {
  return (
    <div id="features" className="bg-white py-24">
      {/* SECTION 1: TRUST INDICATORS (Matching image_1fb4aa.png) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-32">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#10102a] mb-4">Trusted by UI Students</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join the secure campus marketplace designed exclusively for the University of Ibadan community.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4 group">
                <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-[#103470] group-hover:scale-110 transition duration-300">
                    <CheckCircle2 size={40} />
                </div>
                <h3 className="text-xl font-bold text-[#10102a]">Verified Sellers</h3>
                <p className="text-gray-500 leading-relaxed">
                    All sellers are verified UI students via school email. Buyers can sign up safely to shop.
                </p>
            </div>
            <div className="space-y-4 group">
                <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-[#103470] group-hover:scale-110 transition duration-300">
                    <Lock size={40} />
                </div>
                <h3 className="text-xl font-bold text-[#10102a]">Secure Transactions</h3>
                <p className="text-gray-500 leading-relaxed">
                    Meet safely on campus or use our recommended spots at SUB/Tech Road for exchanges.
                </p>
            </div>
            <div className="space-y-4 group">
                <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-[#103470] group-hover:scale-110 transition duration-300">
                    <MessageCircle size={40} />
                </div>
                <h3 className="text-xl font-bold text-[#10102a]">Direct Communication</h3>
                <p className="text-gray-500 leading-relaxed">
                    Chat directly with buyers and sellers to negotiate prices and coordinate meetups safely.
                </p>
            </div>
        </div>
      </div>

      {/* SECTION 2: BUILT FOR UI (Matching image_1fb4e1.jpg) */}
      <div id="how-it-works" className="bg-[#fafaf9] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-[#10102a] mb-4">Built Specifically for UI Students</h2>
                <p className="text-lg text-gray-600">Every feature designed with campus life in mind.</p>
                
                {/* Endorsement Badge */}
                <div className="mt-8 inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100">
                    <div className="w-8 h-8 bg-[#103470] rounded-full flex items-center justify-center text-white font-serif font-bold text-xs">UI</div>
                    <div className="text-left">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Made For</p>
                        <p className="text-sm font-bold text-[#10102a]">University of Ibadan Community</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition duration-300">
                    <h3 className="text-xl font-bold text-[#10102a] mb-2">Seamless Listings</h3>
                    <p className="text-gray-500 mb-8 text-sm">Post and manage products with one tap from your phone.</p>
                    <div className="bg-[#f0f7ff] rounded-2xl p-6 flex justify-center">
                        <Smartphone size={80} className="text-[#103470]/20" />
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition duration-300">
                    <h3 className="text-xl font-bold text-[#10102a] mb-2">Verified Students</h3>
                    <p className="text-gray-500 mb-8 text-sm">Only verified UI (@ui.edu.ng) accounts can list items.</p>
                    <div className="bg-[#f0f7ff] rounded-2xl p-6 flex justify-center items-center flex-col gap-2">
                        <CheckCircle2 size={48} className="text-green-500" />
                        <span className="font-bold text-[#103470]">ID Verified</span>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition duration-300">
                    <h3 className="text-xl font-bold text-[#10102a] mb-2">Smart Categories</h3>
                    <p className="text-gray-500 mb-8 text-sm">Quickly find Textbooks, Hostel needs, and Gadgets.</p>
                    <div className="bg-[#f0f7ff] rounded-2xl p-6 flex justify-center">
                        <Search size={80} className="text-[#103470]/20" />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}