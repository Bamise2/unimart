import { X, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "./ui/button"

interface ResponseModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error'
  title: string
  message: string
}

export default function ResponseModal({ isOpen, onClose, type, title, message }: ResponseModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex justify-end">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                <X size={24}/>
            </button>
        </div>
        
        <div className="flex flex-col items-center text-center">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
            </div>
            
            <h3 className="text-xl font-bold text-[#10102a] mb-2">{title}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
            
            <Button onClick={onClose} className={`w-full py-6 font-bold text-lg rounded-xl ${type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}>
                {type === 'success' ? 'Continue' : 'Try Again'}
            </Button>
        </div>
      </div>
    </div>
  )
}