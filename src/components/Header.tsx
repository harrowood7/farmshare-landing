import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getLinkClass = (path: string) => {
    return `transition-colors font-medium ${
      isActive(path) 
        ? 'text-brand-yellow-light' 
        : 'text-brand-cream hover:text-white'
    }`;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 bg-brand-green backdrop-blur-sm border-b border-brand-cream/20 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <img 
                src="https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content//farmshare%20(1).svg" 
                alt="Farmshare Logo" 
                className="h-16 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/processors" className={getLinkClass('/processors')}>
              Processors
            </Link>
            <Link to="/mission" className={getLinkClass('/mission')}>
              Mission
            </Link>
            <a 
              href="https://meetings.hubspot.com/henry-arrowood/schedule-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-orange text-white px-4 py-2 rounded-lg hover:bg-brand-yellow transition-colors font-bold"
            >
              Schedule Demo
            </a>
            <a 
              href="https://partners.farmshare.co/"
              className="bg-transparent border-2 border-brand-cream text-brand-cream px-4 py-2 rounded-lg hover:bg-brand-cream hover:text-brand-green transition-colors font-bold"
            >
              Login
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-brand-cream hover:text-white transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <nav className="mt-4 space-y-4 pb-4">
            <Link 
              to="/processors" 
              className={`block ${getLinkClass('/processors')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Processors
            </Link>
            <Link 
              to="/mission" 
              className={`block ${getLinkClass('/mission')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Mission
            </Link>
            <Link 
              to="/release-notes" 
              className={`block ${getLinkClass('/release-notes')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Release Notes
            </Link>
            <a 
              href="https://meetings.hubspot.com/henry-arrowood/schedule-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-brand-orange text-white px-4 py-2 rounded-lg hover:bg-brand-yellow transition-colors font-bold text-center"
            >
              Schedule Demo
            </a>
            <a 
              href="https://partners.farmshare.co/"
              className="block w-full bg-transparent border-2 border-brand-cream text-brand-cream px-4 py-2 rounded-lg hover:bg-brand-cream hover:text-brand-green transition-colors font-bold text-center"
            >
              Login
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
