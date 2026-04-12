import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpeg";

const Footer = () => (
  <footer className="border-t border-border bg-card py-12">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <img src={logo} alt="Yogiraj Enterprises" className="h-12 w-auto object-contain" />
          <span className="font-semibold"><span className="text-primary">Yogiraj</span> Enterprises</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Precision mechanical parts manufacturer serving enterprise B2B clients worldwide.
        </p>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-4 text-foreground">Quick Links</h4>
        <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
          <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
          <Link to="/services" className="hover:text-foreground transition-colors">Services</Link>
          <Link to="/about" className="hover:text-foreground transition-colors">About Us</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </nav>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-4 text-foreground">Services</h4>
        <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span>CNC Machining</span>
          <span>Prototyping</span>
          <span>Custom Fabrication</span>
          <span>Quality Assurance</span>
        </nav>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-4 text-foreground">Contact</h4>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground font-mono">
          <span>yogirajenterprises2018@gmail.com</span>
          <span>8007459311</span>
          <span>Mon–Fri 8:00–17:00</span>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
      <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Yogiraj Enterprises. All rights reserved.</p>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
        <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
      </div>
    </div>
  </footer>
);

export default Footer;
