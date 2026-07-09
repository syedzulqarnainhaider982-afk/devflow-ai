import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BrainCircuit className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl tracking-tight">DevFlow<span className="text-primary">AI</span></span>
            </Link>
            <p className="text-muted-foreground text-sm">
              The ultimate AI developer toolkit. Build faster, smarter, and better.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DevFlow AI. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-white transition-colors">Discord</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
