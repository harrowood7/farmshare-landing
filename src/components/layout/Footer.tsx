import React from 'react';
import { Mail, Phone, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-brand-green text-brand-cream py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-roca mb-4">Contact</h3>
            <div className="space-y-2 font-medium">
              <a href="mailto:henry@farmshare.co" className="flex items-center hover:text-white transition-colors">
                <Mail className="h-5 w-5 mr-2" />
                sales@farmshare.co
              </a>
              <a href="tel:301-448-0543" className="flex items-center hover:text-white transition-colors">
                <Phone className="h-5 w-5 mr-2" />
                301-448-0543
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-roca mb-4">Menu</h3>
            <div className="space-y-2 font-medium">
              <Link to="/processors" className="block hover:text-white transition-colors">
                Processors
              </Link>
              <Link to="/producers" className="block hover:text-white transition-colors">
                Producers
              </Link>
              <Link to="/buyers" className="block hover:text-white transition-colors">
                Meat Buyers
              </Link>
              <Link to="/mission" className="block hover:text-white transition-colors">
                Mission
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-roca mb-4">Legal</h3>
            <div className="space-y-2 font-medium">
              <Link to="/privacy" className="block hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-roca mb-4">Connect</h3>
            <a 
              href="https://www.linkedin.com/company/farmshareco/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-white transition-colors font-medium"
            >
              <Linkedin className="h-5 w-5 mr-2" />
              LinkedIn
            </a>
          </div>
        </div>
        <div className="border-t border-brand-cream/20 mt-8 pt-8 text-center font-medium">
          <p>© 2025 Farmshare</p>
        </div>
      </div>
    </footer>
  );
}