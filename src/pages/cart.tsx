import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { ShoppingCart } from "lucide-react"

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/20 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm">
              U
            </div>
            <span className="text-xl font-bold text-foreground">Unimart</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/" className="text-primary hover:underline">
            Home
          </Link>
          <span className="mx-2 text-foreground/50">›</span>
          <span className="text-foreground">Shopping Cart</span>
        </div>

        <div className="text-right mb-8">
          <span className="text-foreground/70">0 Items</span>
        </div>

        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-6 text-center">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
              <ShoppingCart size={48} className="text-blue-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">You do not have items in your cart</h2>
          <p className="text-foreground/70 mb-8">
            Try searching for your desired terms or shop from the categories above.
          </p>
          <Link to="/marketplace">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Start Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
