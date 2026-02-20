import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase, ReleaseNote } from '../lib/supabase';
import VideoEmbed from '../components/VideoEmbed';

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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Custom component to handle videos in markdown
function VideoComponent({ src }: { src: string }) {
  return (
    <div className="mb-6">
      <div className="rounded-lg shadow-lg overflow-hidden w-full max-w-4xl mx-auto" style={{ height: '400px' }}>
        <VideoEmbed url={src} />
      </div>
    </div>
  );
}

// Custom component to handle images with consistent sizing
function ImageComponent({ src, alt }: { src: string; alt?: string }) {
  return (
    <div className="mb-6">
      <div className="w-full max-w-4xl mx-auto rounded-lg shadow-lg overflow-hidden" style={{ height: '400px' }}>
        <img 
          src={src} 
          alt={alt || ''}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      {alt && (
        <p className="text-center text-sm text-stone-500 mt-2 italic">
          {alt}
        </p>
      )}
    </div>
  );
}

function processContentForMarkdown(content: string) {
  console.log('Processing content:', content); // Debug log
  
  // More robust regex to handle various video URL formats
  const processedContent = content.replace(/\[VIDEO:\s*(.*?)\s*\]/g, (match, url) => {
    console.log('Found video match:', match, 'URL:', url); // Debug log
    return `![VIDEO](${url.trim()})`;
  });
  
  console.log('Processed content:', processedContent); // Debug log
  return processedContent;
}

export default function ReleaseNoteDetail() {
  const { slug } = useParams();
  const [releaseNote, setReleaseNote] = useState<ReleaseNote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReleaseNote() {
      try {
        if (!slug) return;
        
        const { data, error } = await supabase
          .from('release_notes')
          .select('*')
          .eq('id', slug)
          .single();

        if (error) throw error;
        setReleaseNote(data);
      } catch (error) {
        console.error('Error fetching release note:', error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchReleaseNote();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  if (!releaseNote) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-brand-green mb-4">Release Note Not Found</h1>
            <Link 
              to="/release-notes"
              className="text-brand-orange hover:text-brand-yellow transition-colors inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Release Notes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extract custom cover image from content or use default
  const coverImageUrl = releaseNote.cover_image || getFeatureImage(releaseNote.version);

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/release-notes"
            className="text-brand-orange hover:text-brand-yellow transition-colors inline-flex items-center mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Release Notes
          </Link>

          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-[300px] md:h-[400px] relative">
              <img 
                src={coverImageUrl}
                alt={releaseNote.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            
            <div className="p-6 md:p-8">
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-brand-green mb-4">{releaseNote.title}</h1>
                <div className="text-sm text-stone-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(releaseNote.published_at)}
                </div>
              </div>
              
              <div className="prose prose-stone max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img: ({ src, alt }) => {
                      console.log('Image component - src:', src, 'alt:', alt); // Debug log
                      // Check if this is a video (our custom VIDEO syntax)
                      if (alt === 'VIDEO' && src) {
                        console.log('Rendering video with src:', src); // Debug log
                        return <VideoComponent src={src} />;
                      }
                      // Regular image
                      console.log('Rendering image with src:', src); // Debug log
                      return <ImageComponent src={src || ''} alt={alt} />;
                    },
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-bold text-brand-green mb-4 mt-8">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-bold text-brand-green mb-3 mt-6">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 text-lg leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-6 mb-4 text-lg leading-relaxed">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="mb-2">
                        {children}
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-brand-green">
                        {children}
                      </strong>
                    )
                  }}
                >
                  {processContentForMarkdown(releaseNote.content)}
                </ReactMarkdown>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}