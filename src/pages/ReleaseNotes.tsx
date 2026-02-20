import React, { useEffect, useState } from 'react';
import { Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, ReleaseNote } from '../lib/supabase';

function getFeatureImage(version: string): string {
  const images = {
    '2.1.0': 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg', // Invoice/billing documents
    '2.0.0': 'https://images.pexels.com/photos/7947541/pexels-photo-7947541.jpeg', // Technology/software
    '1.9.0': 'https://images.pexels.com/photos/7948006/pexels-photo-7948006.jpeg', // Business meeting
    '1.8.5': 'https://images.pexels.com/photos/5473955/pexels-photo-5473955.jpeg', // Bug fixes/maintenance
    '1.8.0': 'https://images.pexels.com/photos/7948089/pexels-photo-7948089.jpeg', // Development
    '1.0.0': 'https://images.pexels.com/photos/7948019/pexels-photo-7948019.jpeg'  // Launch/milestone
  };
  return images[version as keyof typeof images] || 'https://images.pexels.com/photos/7947541/pexels-photo-7947541.jpeg';
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength).trim();
  return truncated.replace(/[.,!?]$/, '') + '...';
}

function getPreviewContent(content: string): string {
  const sections = content.split('##').filter(Boolean);
  const overview = sections[0]?.split('\n').slice(1).join(' ').trim() || '';
  return overview;
}

export default function ReleaseNotes() {
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    async function fetchReleaseNotes() {
      try {
        const { data, error } = await supabase
          .from('release_notes')
          .select('*')
          .eq('is_visible', true)
          .order('published_at', { ascending: false });

        if (error) throw error;
        setReleaseNotes(data || []);
      } catch (error) {
        console.error('Error fetching release notes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReleaseNotes();
  }, []);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Pagination calculations
  const totalPages = Math.ceil(releaseNotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReleaseNotes = releaseNotes.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl md:text-5xl font-roca text-brand-green">Release Notes</h1>
            {releaseNotes.length > 0 && (
              <div className="text-right">
                <div className="text-xs text-stone-500">
                  Showing {startIndex + 1}-{Math.min(endIndex, releaseNotes.length)} of {releaseNotes.length} releases
                </div>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto"></div>
            </div>
          ) : releaseNotes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <p className="text-lg text-stone-600">No release notes available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentReleaseNotes.map((note) => {
                const overview = getPreviewContent(note.content);
                const previewText = truncateText(overview, 100);
                
                return (
                  <article 
                    key={note.id} 
                    className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col"
                  >
                    <div className="relative h-48">
                      <img 
                        src={note.cover_image || getFeatureImage(note.version)}
                        alt={note.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="mb-4">
                        <h2 className="text-xl font-bold text-brand-green mb-2">{note.title}</h2>
                        <div className="text-sm text-stone-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(note.published_at)}
                        </div>
                      </div>
                      <div className="prose prose-stone max-w-none flex-grow">
                        <p className="text-stone-600">{previewText}</p>
                      </div>
                      <Link
                        to={`/release-notes/${note.id}`}
                        className="mt-4 text-brand-orange hover:text-brand-yellow transition-colors flex items-center font-medium"
                      >
                        Read more
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center space-x-2">
              <button
                onClick={goToPrevious}
                disabled={currentPage === 1}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-white text-brand-green hover:bg-brand-green hover:text-white border border-brand-green'
                }`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-brand-green text-white'
                        : 'bg-white text-brand-green hover:bg-brand-green hover:text-white border border-brand-green'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={goToNext}
                disabled={currentPage === totalPages}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-white text-brand-green hover:bg-brand-green hover:text-white border border-brand-green'
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}