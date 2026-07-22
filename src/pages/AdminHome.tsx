import { Link } from 'react-router-dom';
import { Store, Users, Megaphone, ArrowRight } from 'lucide-react';

const TOOLS = [
  {
    to: '/admin/promote',
    title: 'Directory admin',
    desc: 'Promote a prospect, add a customer, add a new prospect from Google, edit a listing, or remove one from the directory.',
    Icon: Store,
  },
  {
    to: '/admin/leads',
    title: 'Lead Router',
    desc: 'Route incoming buyer leads to the nearest processors. Includes booth mode for finding buyers near an event ZIP.',
    Icon: Users,
  },
  {
    to: '/admin/release-notes',
    title: 'Release notes',
    desc: 'Publish and edit the product release notes that appear on the public changelog.',
    Icon: Megaphone,
  },
];

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <h1 className="text-3xl font-roca text-brand-green mb-1">Farmshare admin</h1>
        <p className="text-stone-600 mb-8">Internal tools. Pick one to get started.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map(({ to, title, desc, Icon }) => (
            <Link
              key={to}
              to={to}
              className="group bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-lg bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-brand-green" />
                </div>
                <h2 className="text-lg font-bold text-brand-green">{title}</h2>
              </div>
              <p className="text-sm text-stone-600 flex-1">{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-orange group-hover:gap-2 transition-all">
                Open <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
