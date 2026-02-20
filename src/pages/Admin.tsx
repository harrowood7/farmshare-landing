import React, { useState, useEffect } from 'react';
import { supabase, ReleaseNote } from '../lib/supabase';
import { Plus, Edit, Trash2, Save, X, Eye, Calendar, User, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
interface User {
  id: string;
  email: string;
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNote[]>([]);
  const [editingNote, setEditingNote] = useState<ReleaseNote | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    version: '',
    content: '',
    published_at: new Date().toISOString().split('T')[0],
    is_visible: true,
    cover_image: ''
  });

  useEffect(() => {
    checkAuth();
    fetchReleaseNotes();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      checkAuth();
    } catch (error) {
      alert('Sign in failed: ' + (error as Error).message);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) throw error;
      alert('Account created successfully! Please check your email for verification.');
      checkAuth();
    } catch (error) {
      alert('Sign up failed: ' + (error as Error).message);
    }
  };

  const fetchReleaseNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('release_notes')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setReleaseNotes(data || []);
    } catch (error) {
      console.error('Error fetching release notes:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingNote) {
        // Update existing
        const { error } = await supabase
          .from('release_notes')
          .update({
            title: formData.title,
            version: formData.version,
            content: formData.content,
            published_at: formData.published_at,
            is_visible: formData.is_visible,
            cover_image: formData.cover_image || null
          })
          .eq('id', editingNote.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('release_notes')
          .insert({
            title: formData.title,
            version: formData.version,
            content: formData.content,
            published_at: formData.published_at,
            is_visible: formData.is_visible,
            cover_image: formData.cover_image || null
          });

        if (error) throw error;
      }

      // Reset form and refresh data
      setEditingNote(null);
      setIsCreating(false);
      setFormData({
        title: '',
        version: '',
        content: '',
        published_at: new Date().toISOString().split('T')[0],
        is_visible: true,
        cover_image: ''
      });
      fetchReleaseNotes();
      alert('Release note saved successfully!');
    } catch (error) {
      alert('Error saving: ' + (error as Error).message);
    }
  };

  const handleEdit = (note: ReleaseNote) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      version: note.version,
      content: note.content,
      published_at: note.published_at.split('T')[0],
      is_visible: note.is_visible,
      cover_image: note.cover_image || ''
    });
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this release note?')) return;

    try {
      const { error } = await supabase
        .from('release_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchReleaseNotes();
      alert('Release note deleted successfully!');
    } catch (error) {
      alert('Error deleting: ' + (error as Error).message);
    }
  };

  const handleDuplicate = (note: ReleaseNote) => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      title: `${note.title} (Copy)`,
      version: '', // Clear version so user can set new one
      content: note.content,
      published_at: today,
      is_visible: true,
      cover_image: note.cover_image || ''
    });
    setIsCreating(true);
    setEditingNote(null);
  };

  const handleCancel = () => {
    setEditingNote(null);
    setIsCreating(false);
    setPreviewMode(false);
    setFormData({
      title: '',
      version: '',
      content: '',
      published_at: new Date().toISOString().split('T')[0],
      is_visible: true,
      cover_image: ''
    });
  };

  const toggleVisibility = async (note: ReleaseNote) => {
    try {
      const { error } = await supabase
        .from('release_notes')
        .update({ is_visible: !note.is_visible })
        .eq('id', note.id);

      if (error) throw error;
      fetchReleaseNotes();
    } catch (error) {
      alert('Error updating visibility: ' + (error as Error).message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onSignIn={signIn} onSignUp={signUp} />;
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-roca text-brand-green">Release Notes Admin</h1>
            <p className="text-stone-600 mt-2">Manage your release notes and updates</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/release-notes"
              className="text-brand-orange hover:text-brand-yellow transition-colors flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Public Page
            </Link>
            <div className="flex items-center text-stone-600">
              <User className="h-4 w-4 mr-2" />
              {user.email}
            </div>
            <button
              onClick={signOut}
              className="bg-stone-500 text-white px-4 py-2 rounded-lg hover:bg-stone-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingNote) && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-brand-green">
                {editingNote ? 'Edit Release Note' : 'Create New Release Note'}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-brand-green/90 transition-colors flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {previewMode ? 'Edit' : 'Preview'}
                </button>
                <button
                  onClick={handleSave}
                  className="bg-brand-orange text-white px-4 py-2 rounded-lg hover:bg-brand-yellow transition-colors flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-stone-500 text-white px-4 py-2 rounded-lg hover:bg-stone-600 transition-colors flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            </div>

            {!previewMode ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    placeholder="Enter release note title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    placeholder="e.g., 2.1.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Published Date
                  </label>
                  <input
                    type="date"
                    value={formData.published_at}
                    onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Visibility
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_visible"
                      checked={formData.is_visible}
                      onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                      className="h-4 w-4 text-brand-orange focus:ring-brand-orange border-stone-300 rounded"
                    />
                    <label htmlFor="is_visible" className="ml-2 text-sm text-stone-700">
                      Show on public release notes page
                    </label>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Cover Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.cover_image || ''}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-stone-500 mt-1">
                    Custom cover image for this release note. Leave empty to use default.
                  </p>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Content (Markdown supported)
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={20}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange font-mono text-sm"
                    placeholder="Enter your release note content using markdown..."
                  />
                  <div className="mt-2 text-sm text-stone-500">
                    <p><strong>Supported formats:</strong></p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Images: <code>![Alt text](image-url)</code></li>
                      <li>Videos: <code>[VIDEO:video-url]</code></li>
                      <li>Bold text: <code>**bold text**</code></li>
                      <li>Sections: <code>## Section Title</code></li>
                      <li>Lists: <code>* List item</code></li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="prose prose-stone max-w-none">
                <h1>{formData.title}</h1>
                <p className="text-stone-500">Version {formData.version} • {formatDate(formData.published_at)}</p>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {formData.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!isCreating && !editingNote && (
          <div className="mb-8">
            <button
              onClick={() => setIsCreating(true)}
              className="bg-brand-orange text-white px-6 py-3 rounded-lg hover:bg-brand-yellow transition-colors flex items-center font-bold"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Release Note
            </button>
          </div>
        )}

        {/* Release Notes List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200">
            <h2 className="text-xl font-bold text-brand-green">Existing Release Notes</h2>
          </div>
          <div className="divide-y divide-stone-200">
            {releaseNotes.map((note) => (
              <div key={note.id} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-brand-green">{note.title}</h3>
                  <div className="flex items-center text-sm text-stone-500 mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(note.published_at)} • Version {note.version}
                    {!note.is_visible && (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/release-notes/${note.id}`}
                    className="text-brand-green hover:text-brand-green/80 transition-colors p-2"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => toggleVisibility(note)}
                    className={`transition-colors p-2 ${
                      note.is_visible 
                        ? 'text-green-600 hover:text-green-800' 
                        : 'text-red-600 hover:text-red-800'
                    }`}
                    title={note.is_visible ? 'Hide from public' : 'Show to public'}
                  >
                    {note.is_visible ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDuplicate(note)}
                    className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-brand-orange hover:text-brand-yellow transition-colors p-2"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-600 hover:text-red-800 transition-colors p-2"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ 
  onSignIn, 
  onSignUp 
}: { 
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      onSignUp(email, password);
    } else {
      onSignIn(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-roca text-brand-green mb-6 text-center">
          {isSignUp ? 'Create Admin Account' : 'Admin Login'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {isSignUp && (
              <p className="text-xs text-stone-500 mt-1">
                Password must be at least 6 characters long
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-brand-orange text-white py-2 rounded-lg hover:bg-brand-yellow transition-colors font-bold"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-brand-orange hover:text-brand-yellow transition-colors text-sm"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}