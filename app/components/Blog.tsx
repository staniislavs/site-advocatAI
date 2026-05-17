import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router';
import { 
  Calendar, 
  User, 
  ArrowRight, 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Search,
  ChevronRight,
  ChevronLeft,
  Clock,
  Share2,
  FileText,
  AlertTriangle,
  MessageSquare,
  Facebook,
  Send,
  Phone,
  CheckCircle2,
  Link2,
  Library,
  Gavel,
  Home,
  Coins,
  Users,
  Building2,
  Baby,
  Key
} from 'lucide-react';
const Markdown = lazy(() => import('react-markdown'));
import { 
  getPosts, 
  Post, 
  createPost, 
  updatePost, 
  deletePost,
  BLOG_CATEGORIES,
  BLOG_CATEGORY_IDS,
  getCategoryLabel
} from '../lib/blogService';
import { auth, signInWithGoogle, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { transliterate, LOCALIZED_PATHS, LanguageCode, getApiUrl } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { JsonLd, buildArticleSchema, buildBreadcrumbSchema, buildFaqSchema } from './JsonLd';
import { Helmet } from 'react-helmet-async';

const calculateReadingTime = (content: string) => {
  if (!content) return 1;
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

const formatDate = (date: any) => {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString();
};


const Blog: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { lang, page, category, slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const currentLang = (lang as LanguageCode) || (i18n.language?.split('-')[0] as LanguageCode) || 'uk';
  const paths = LOCALIZED_PATHS[currentLang];
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPost, setEditPost] = useState<Partial<Post>>({});
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const adminEmail = "bogdashkina.lawyer@gmail.com";

  useEffect(() => {
    fetchPosts();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAdmin(u?.email === adminEmail);
    });
    return () => unsubscribe();
  }, [category, isAdmin]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getPosts(!isAdmin);
      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  const POSTS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => { setCurrentPage(1); }, [category, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of posts) {
      const key = p.category || 'general';
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [posts]);

  const filteredPosts = posts.filter(p => {
    // Robust category matching: match ID, legacy name, or transliterated localized name
    const matchesCategory = !category || 
      p.category === category || 
      transliterate(getCategoryLabel(p.category, t)).toLowerCase() === category.toLowerCase() ||
      (category === 'general' && (p.category === 'Загальне' || p.category === 'Загальні теми'));

    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedPost = useMemo(() => {
    // Try slug first, then fallback to category if slug is missing (handles /lang/page/category/slug OR /lang/page/slug)
    const effectiveSlug = slug || category;
    if (!effectiveSlug || effectiveSlug === paths.blog) return null;
    
    const decodedSlug = decodeURIComponent(effectiveSlug).toLowerCase();
    
    // First try to find by exact slug
    let post = posts.find(p => p.slug?.toLowerCase() === decodedSlug || p.id === effectiveSlug);
    
    // If not found and we are using category as fallback, check if it's a real category ID
    // If it is a real category, we don't treat it as a slug
    if (!post && !slug && category && BLOG_CATEGORY_IDS.includes(category as any)) {
      return null;
    }
    
    return post;
  }, [slug, category, posts, paths.blog]);

  const handleCreateNew = () => {
    setEditPost({
      title: 'Нова стаття',
      slug: 'nova-stattya-' + Date.now(),
      excerpt: 'Короткий анонс...',
      content: '## Вступ\n\nТут ваш текст...',
      contentType: 'markdown',
      coverImage: '',
      author: user?.displayName || "Дар'я Богдашкіна",
      tags: [],
      category: category || 'rozluchennya',
      status: 'draft',
      faq: []
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Slug validation and auto-generation with transliteration
      const baseText = editPost.slug || editPost.title || 'post';
      const finalSlug = transliterate(baseText) || `post-${Date.now()}`;

      const dataToSave = {
        title: editPost.title || 'Без назви',
        slug: finalSlug,
        category: editPost.category || 'rozluchennya',
        excerpt: editPost.excerpt || '',
        content: editPost.content || '',
        contentType: editPost.contentType || 'markdown',
        coverImage: editPost.coverImage || '',
        status: editPost.status || 'draft',
        tags: editPost.tags || [],
        author: editPost.author || user?.displayName || "Дар'я Богдашкіна",
        faq: editPost.faq || []
      };

      if (editPost.id) {
        await updatePost(editPost.id, dataToSave);
      } else {
        await createPost({
          ...dataToSave,
          createdAt: new Date(),
        } as Post);
      }
      setIsEditing(false);
      fetchPosts();
    } catch (error) {
      console.error("Save error:", error);
      alert('Помилка при збереженні. Перевірте правильність заповнення полів.');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Видалити статтю?')) {
      await deletePost(id);
      fetchPosts();
      if (slug) navigate(`/${currentLang}/${paths.blog}`);
    }
  };

  // -------------------------------------------------------------------------
  // VIEWS
  // -------------------------------------------------------------------------

  if (loading && slug) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Clock size={48} className="text-sage animate-spin" />
          <p className="font-serif italic text-navy-deep/40">{t('common.loading') || 'Завантаження...'}</p>
        </div>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <BlogPostView 
        post={selectedPost} 
        allPosts={posts}
        isAdmin={isAdmin}
        onEdit={() => { setEditPost(selectedPost); setIsEditing(true); }}
        onDelete={(e) => handleDelete(selectedPost.id!, e)}
        currentLang={currentLang}
        paths={paths}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Search Header */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {category && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <button 
                onClick={() => navigate(-1)}
                className="group inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-sage transition-all"
              >
                <div className="w-8 h-8 rounded-full border border-[var(--card-border)] flex items-center justify-center group-hover:border-sage group-hover:bg-sage/5 transition-all">
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-500" />
                </div>
                Назад
              </button>
            </motion.div>
          )}
          <div className="mb-4 flex items-center justify-between">
            <h1 className="font-serif text-5xl md:text-7xl text-[var(--text-primary)]">
              {t('blog.hero.title')}
            </h1>
            {isAdmin && (
              <button 
                onClick={handleCreateNew}
                className="bg-sage text-white p-4 rounded-full shadow-2xl shadow-sage/30 hover:scale-105 transition-transform"
              >
                <Plus size={24} />
              </button>
            )}
          </div>
          <p className="text-[var(--text-secondary)] text-xl font-light mb-12 max-w-2xl leading-relaxed opacity-80">
            {t('blog.hero.subtitle')}
          </p>

          <div className="relative max-w-3xl group">
            <input 
              type="text"
              placeholder={t('blog.hero.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 md:h-18 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-[1.5rem] md:rounded-[2rem] px-12 md:px-14 py-4 text-sm md:text-base text-[var(--text-primary)] focus:bg-[var(--bg-primary)] focus:ring-1 focus:ring-sage/50 focus:border-sage/30 outline-none transition-all shadow-sm"
            />
            <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-sage" size={20} />
            <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2">
               <button className="bg-sage text-white px-5 md:px-8 py-2 md:py-3 rounded-[1.2rem] md:rounded-[1.5rem] font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#a6844d] transition-colors shadow-lg shadow-sage/20">
                {t('blog.hero.find')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3">
            <Link
              to={`/${currentLang}/${paths.blog}`}
              className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl border transition-all group relative ${!category ? 'bg-sage border-sage text-white font-bold shadow-lg shadow-sage/20' : 'bg-[var(--bg-secondary)] border-[var(--card-border)] hover:border-sage/40'}`}
            >
              <Library size={22} className={`mb-3 group-hover:scale-110 transition-transform ${!category ? 'text-white' : 'text-sage'}`} />
              <span className="text-[9px] uppercase font-bold tracking-widest text-center">{t('blog.categories.all')}</span>
              <span className={`absolute top-2 right-2 text-[10px] font-mono ${!category ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>{posts.length}</span>
            </Link>
            {BLOG_CATEGORIES.map(cat => {
              const cnt = categoryCounts[cat.id] || 0;
              return (
                <Link
                  key={cat.id}
                  to={`/${currentLang}/${paths.blog}/${cat.id}`}
                  className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl border transition-all group relative ${category === cat.id ? 'bg-sage border-sage text-white font-bold shadow-lg shadow-sage/20' : 'bg-[var(--bg-secondary)] border-[var(--card-border)] hover:border-sage/40'}`}
                >
                  <cat.icon size={22} className={`mb-3 group-hover:scale-110 transition-transform ${category === cat.id ? 'text-white' : 'text-sage'}`} />
                  <span className="text-[9px] uppercase font-bold tracking-widest text-center">{t(`blog.categories.items.${cat.id}`)}</span>
                  {cnt > 0 && (
                    <span className={`absolute top-2 right-2 text-[10px] font-mono ${category === cat.id ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>{cnt}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Posts Feed */}
      <section id="posts-grid" className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {category && (
            <div className="mb-14 max-w-3xl">
              <p className="text-[var(--text-secondary)] font-light leading-relaxed text-lg border-l-2 border-sage pl-8 py-2">
                Я, Дар'я Богдашкіна, надаю професійну допомогу у сфері "{getCategoryLabel(category, t)}". 
                Завдяки багаторічному досвіду та глибокому розумінню цивільного права, я допоможу вам 
                вирішити правові питання будь-якої складності.
              </p>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-[3rem] border border-sage/10">
                  <p className="text-[var(--text-secondary)] font-light">{t('blog.no_posts')}</p>
                </div>
              ) : (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredPosts
                    .slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE)
                    .map((post, idx) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        idx={idx}
                        isAdmin={isAdmin}
                        onEdit={() => { setEditPost(post); setIsEditing(true); }}
                        onDelete={(e) => handleDelete(post.id!, e)}
                        t={t}
                        currentLang={currentLang}
                        blogPath={paths.blog}
                      />
                    ))}
                </div>
                {filteredPosts.length > POSTS_PER_PAGE && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === 1}
                      className="h-10 px-4 border border-sage/20 text-[10px] uppercase tracking-widest font-bold disabled:opacity-30 hover:bg-sage hover:text-white hover:border-sage transition"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {Array.from({ length: Math.ceil(filteredPosts.length / POSTS_PER_PAGE) }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        onClick={() => { setCurrentPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`h-10 w-10 border text-sm font-bold transition ${currentPage === n ? 'bg-sage text-white border-sage' : 'border-sage/20 hover:border-sage/60'}`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => { setCurrentPage(p => Math.min(Math.ceil(filteredPosts.length / POSTS_PER_PAGE), p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === Math.ceil(filteredPosts.length / POSTS_PER_PAGE)}
                      className="h-10 px-4 border border-sage/20 text-[10px] uppercase tracking-widest font-bold disabled:opacity-30 hover:bg-sage hover:text-white hover:border-sage transition"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
                </>
              )}
            </div>

            {/* Sidebar with Top Articles ( п. 2.4 ТЗ ) */}
            {!category && (
              <aside className="w-full lg:w-80 space-y-8">
                <div className="bg-[var(--bg-secondary)]/50 p-8 rounded-3xl border border-sage/10 shadow-xl">
                  <h4 className="font-serif text-xl text-[var(--text-primary)] mb-6 flex items-center gap-2">
                    <MessageSquare size={18} className="text-sage" />
                    Найчастіше запитують
                  </h4>
                  <ul className="space-y-4">
                    {posts.slice(0, 5).map((p, i) => (
                      <li key={p.id} className="group">
                        <Link to={`/${currentLang}/${paths.blog}/${p.category}/${p.slug}`} className="flex gap-3">
                          <span className="text-sage font-serif text-lg">{i + 1}.</span>
                          <span className="text-sm text-[var(--text-secondary)] group-hover:text-sage transition-colors line-clamp-2 leading-snug">
                            {p.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-sage p-8 rounded-3xl text-navy-deep">
                  <h4 className="font-serif text-xl mb-2">Потрібна допомога?</h4>
                  <p className="text-xs opacity-80 mb-6">Отримайте консультацію адвоката онлайн або в офісі</p>
                  <button onClick={() => navigate(`/${currentLang}/${paths.contacts}`)} className="w-full bg-white text-sage py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/90 transition-all">
                    Записатися
                  </button>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      {/* Editor Modal */}
      <EditorModal 
        isOpen={isEditing} 
        post={editPost} 
        onSave={handleSave} 
        onCancel={() => setIsEditing(false)} 
        onChange={setEditPost} 
      />
    </div>
  );
};

// -------------------------------------------------------------------------
// SUB-COMPONENTS
// -------------------------------------------------------------------------

const PostCard: React.FC<{ post: Post, idx: number, isAdmin: boolean, onEdit: () => void, onDelete: (e: any) => void, t: any, currentLang: string, blogPath: string }> = ({ post, idx, isAdmin, onEdit, onDelete, t, currentLang, blogPath }) => {
  const postUrl = `/${currentLang}/${blogPath}/${post.category || 'general'}/${post.slug || post.id}`;
  
  // Find category icon for "placeholder" style per user request
  const categoryIcon = BLOG_CATEGORIES.find(c => c.id === post.category)?.icon || Library;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      className="group bg-[var(--bg-secondary)] rounded-[2.5rem] overflow-hidden border border-[var(--card-border)] hover:border-sage/30 transition-all duration-500 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] md:hover:shadow-[0_40px_80px_-20px_rgba(94,105,77,0.15)] flex flex-col h-full relative"
    >
      <Link to={postUrl} className="flex flex-col h-full z-10">
        <div className="aspect-[16/10] overflow-hidden relative bg-[var(--bg-primary)]/50">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-[var(--bg-primary)] relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-sage/5 rounded-bl-[80px]" />
               <div className="w-16 h-16 rounded-3xl bg-sage/10 flex items-center justify-center text-sage mb-4 group-hover:scale-110 transition-transform duration-700">
                  {React.createElement(categoryIcon, { size: 32 })}
               </div>
               <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-sage/60">{getCategoryLabel(post.category, t)}</span>
            </div>
          )}
          
          <div className="absolute top-6 left-6 bg-sage text-white px-4 py-1.5 rounded-full text-[9px] uppercase font-bold tracking-widest shadow-xl">
            {getCategoryLabel(post.category, t)}
          </div>
          
          {post.status !== 'published' && (
            <div className="absolute top-6 right-6 bg-[var(--bg-primary)]/90 text-sage px-4 py-1.5 rounded-full text-[9px] uppercase font-bold flex items-center gap-2 backdrop-blur-sm shadow-xl border border-sage/20">
              <EyeOff size={14} /> {t('blog.admin.draft')}
            </div>
          )}
        </div>

        <div className="p-8 md:p-10 flex-1 flex flex-col">
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-6 font-bold">
            <span className="flex items-center gap-2"><Calendar size={14} className="text-sage" /> {formatDate(post.updatedAt || post.createdAt)}</span>
            <span className="flex items-center gap-2"><Clock size={14} className="text-sage" /> {calculateReadingTime(post.content)} хв</span>
          </div>
          
          <h3 className="font-serif text-2xl md:text-[28px] text-[var(--text-primary)] mb-4 leading-[1.2] group-hover:text-sage transition-colors line-clamp-3">
            {post.title}
          </h3>
          
          <p className="text-[var(--text-secondary)] font-light text-base line-clamp-2 mb-10 opacity-70 leading-relaxed">
            {post.excerpt}
          </p>
          
          <div className="mt-auto pt-6 border-t border-[var(--card-border)] flex items-center justify-between">
            <div className="flex items-center gap-3 text-sage font-bold text-[10px] uppercase tracking-widest group/btn">
              <span className="pb-1 border-b border-transparent group-hover:border-sage transition-all">Читати повністю</span>
              <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </Link>
      
      {isAdmin && (
        <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
            className="p-3 bg-[var(--bg-primary)]/80 backdrop-blur-md text-sage rounded-full hover:bg-sage hover:text-white transition-all shadow-xl border border-sage/20"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(e); }}
            className="p-3 bg-red-500/10 backdrop-blur-md text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-xl border border-red-500/20"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

const BlogPostView: React.FC<{ 
  post: Post, 
  allPosts: Post[], 
  isAdmin: boolean, 
  onEdit: () => void, 
  onDelete: (e: any) => void,
  currentLang: string,
  paths: any
}> = ({ post, allPosts, isAdmin, onEdit, onDelete, currentLang, paths }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postContentRef = useRef<HTMLDivElement>(null);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const [headings, setHeadings] = useState<{ id: string, text: string }[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    if (postContentRef.current) {
      const hElements = postContentRef.current.querySelectorAll('h2');
      const hData = Array.from(hElements).map((el, idx) => {
        const id = `heading-${idx}`;
        el.id = id;
        return { id, text: el.textContent || '' };
      });
      setHeadings(hData);

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      }, { rootMargin: '-10% 0px -80% 0px' });

      hElements.forEach(el => observer.observe(el));
      return () => observer.disconnect();
    }
  }, [post]);

  const relatedPosts = allPosts
    .filter(p => p.category === post.category && p.slug !== post.slug)
    .slice(0, 4);

  // Schema Markup per TZ 5.2
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const href = typeof window !== 'undefined' ? window.location.href : '';
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Головна', url: `${origin}/${currentLang}` },
    { name: 'Блог', url: `${origin}/${currentLang}/${paths.blog}` },
    { name: getCategoryLabel(post.category, t), url: `${origin}/${currentLang}/${paths.blog}/${post.category}` },
    { name: post.title, url: href },
  ]);

  const articleSchema = buildArticleSchema({
    title: post.title,
    description: post.excerpt || '',
    image: post.coverImage,
    datePublished: (post.createdAt?.toDate?.() || post.createdAt)?.toString?.() || '',
    dateModified: (post.updatedAt?.toDate?.() || post.updatedAt || post.createdAt)?.toString?.() || '',
    author: post.author,
    url: href,
  });

  const faqSchema = post.faq && post.faq.length > 0 ? buildFaqSchema(post.faq) : null;

  const SidebarCTA = () => {
    const [submitting, setSubmitting] = useState(false);
    const [ctaData, setCtaData] = useState({ name: '', phone: '', desc: '' });

    const handleCtaSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        const appRef = await addDoc(collection(db, 'applications'), {
          clientName: ctaData.name,
          phone: ctaData.phone,
          message: ctaData.desc,
          status: 'new',
          createdAt: serverTimestamp(),
          source: 'blog_sidebar_cta'
        });

        // Також зберігаємо в leads для адмінки
        await addDoc(collection(db, 'leads'), {
          clientName: ctaData.name,
          phone: ctaData.phone,
          message: ctaData.desc,
          status: 'new',
          createdAt: serverTimestamp(),
          source: 'blog_sidebar_cta',
          applicationId: appRef.id
        });

        // Повідомлення тепер надсилається через Firebase Cloud Functions (onCreate на колекції 'applications')
        // Це вирішує проблему CORS на Cloudflare

        setFormSubmitted(true);
        toast.success('Заявку відправлено');
      } catch (err: any) {
        console.error('CTA error:', err);
        if (err.message && err.message.includes('offline')) {
          toast.error('Помилка мережі: клієнт в офлайні. Спробуйте пізніше.');
        } else {
          handleFirestoreError(err, OperationType.WRITE, 'leads');
          toast.error('Помилка відправки');
        }
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="bg-[var(--bg-secondary)] p-10 rounded-[2.5rem] text-[var(--text-primary)] border border-[var(--card-border)] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden group">
        {!formSubmitted ? (
          <div className="relative z-10">
            <h4 className="font-serif text-3xl mb-3 leading-tight tracking-tight">Безкоштовна<br/>оцінка справи</h4>
            <p className="text-xs opacity-60 mb-10 font-light text-[var(--text-secondary)]">Залишіть заявку — отримайте особисту відповідь адвоката за 15 хвилин</p>
            
            <form className="space-y-5" onSubmit={handleCtaSubmit}>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-muted)] ml-4">Ваше ім'я</label>
                <input 
                  required
                  type="text" 
                  value={ctaData.name}
                  onChange={e => setCtaData({...ctaData, name: e.target.value})}
                  placeholder="Олена Савченко" 
                  className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-[1.2rem] px-6 py-4 text-sm focus:bg-[var(--bg-secondary)] focus:ring-1 focus:ring-sage/50 focus:border-sage/30 outline-none transition-all shadow-sm text-[var(--text-primary)]"
                />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-muted)] ml-4">Телефон</label>
                 <input 
                  required
                  type="tel" 
                  value={ctaData.phone}
                  onChange={e => setCtaData({...ctaData, phone: e.target.value})}
                  placeholder="+38 (0__) ___ __ __" 
                  className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-[1.2rem] px-6 py-4 text-sm focus:bg-[var(--bg-secondary)] focus:ring-1 focus:ring-sage/50 focus:border-sage/30 outline-none transition-all shadow-sm text-[var(--text-primary)]"
                />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-muted)] ml-4">Опис справи</label>
                 <textarea 
                  value={ctaData.desc}
                  onChange={e => setCtaData({...ctaData, desc: e.target.value})}
                  placeholder="Напишіть коротко ваше запитання..." 
                  className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-[1.2rem] px-6 py-4 text-sm focus:bg-[var(--bg-secondary)] focus:ring-1 focus:ring-sage/50 focus:border-sage/30 outline-none transition-all h-32 resize-none shadow-sm text-[var(--text-primary)]"
                />
              </div>
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-sage text-white py-5 rounded-[1.2rem] font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-sage-bright/95 transition-all shadow-xl shadow-sage/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {submitting && <Clock size={16} className="animate-spin" />}
                Отримати консультацію <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-sage/10 flex justify-center gap-6 text-sage">
              <a href="https://t.me/Bohdashkina" target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform"><Send size={20} /></a>
              <Link to={`/${currentLang}/${paths.contacts}`} className="hover:scale-110 transition-transform"><MessageSquare size={20} /></Link>
              <a href="tel:+380959098980" className="hover:scale-110 transition-transform"><Phone size={20} /></a>
            </div>
          </div>
        ) : (
          <div className="relative z-10 text-center py-10">
            <CheckCircle2 size={48} className="text-green-600 mx-auto mb-4" />
            <h4 className="font-serif text-2xl mb-2">Заявку прийнято!</h4>
            <p className="text-sm opacity-70">Очікуйте на дзвінок адвоката протягом 15 хвилин.</p>
          </div>
        )}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-sage/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
      </div>
    );
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      <Helmet>
        <title>{`${post.title} | Адвокат Дар'я Богдашкіна`}</title>
        <meta name="description" content={post.excerpt || post.title} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.title} />
        {post.coverImage && <meta property="og:image" content={post.coverImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        {post.coverImage && <meta name="twitter:image" content={post.coverImage} />}
      </Helmet>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* Reading Progress Bar ( п. 4.1 ТЗ ) */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[3px] bg-sage z-[120] origin-left shadow-[0_0_10px_rgba(94,105,77,0.5)]" 
        style={{ scaleX }}
      />

      {/* Header */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <button 
              onClick={() => navigate(-1)}
              className="group inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-sage transition-all"
            >
              <div className="w-8 h-8 rounded-full border border-[var(--card-border)] flex items-center justify-center group-hover:border-sage group-hover:bg-sage/5 transition-all">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-500" />
              </div>
              Назад
            </button>
          </motion.div>

          {/* Breadcrumbs ( п. 4.1 ТЗ ) */}
          <nav className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-10 font-bold">
            <Link to={`/${currentLang}`} className="hover:text-sage transition-colors">Головна</Link>
            <ChevronRight size={12} className="opacity-30" />
            <Link to={`/${currentLang}/${paths.blog}`} className="hover:text-sage transition-colors">Блог</Link>
            <ChevronRight size={12} className="opacity-30" />
            <Link to={`/${currentLang}/${paths.blog}/${post.category}`} className="hover:text-sage transition-colors">{getCategoryLabel(post.category, t)}</Link>
            <ChevronRight size={12} className="opacity-30" />
            <span className="text-sage truncate max-w-[200px]">{post.title}</span>
          </nav>

          <Link to={`/${currentLang}/${paths.blog}/${post.category}`} className="inline-block bg-sage/10 text-sage border border-sage/20 px-5 py-1.5 rounded-full text-[10px] uppercase font-bold mb-10 shadow-sm">
            {getCategoryLabel(post.category, t)}
          </Link>

          <h1 className="font-serif text-3xl md:text-[52px] text-[var(--text-primary)] leading-[1.1] mb-10 max-w-5xl tracking-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-12 gap-y-6 text-[10px] uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--card-border)] pb-10 font-bold">
            <span className="flex items-center gap-3"><Calendar size={16} className="text-sage" /> {t('blog.post.updated')}: {formatDate(post.updatedAt || post.createdAt)}</span>
            <span className="flex items-center gap-3"><Clock size={16} className="text-sage" /> {calculateReadingTime(post.content)} хв читання</span>
            <span className="flex items-center gap-3"><User size={16} className="text-sage" /> {post.author}</span>
            {isAdmin && (
               <div className="flex gap-6 ml-auto">
                <button onClick={onEdit} className="text-sage hover:underline flex items-center gap-2"><Edit2 size={12} /> Редагувати</button>
                <button onClick={onDelete} className="text-red-500 hover:underline flex items-center gap-2"><Trash2 size={12} /> Видалити</button>
               </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Layout ( п. 4.2 ТЗ ) */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20">
          {/* Left Column: Content (65%) */}
          <div className="w-full lg:w-[65%]">
            {post.coverImage && (
              <div className="aspect-[21/9] rounded-[2.5rem] overflow-hidden mb-20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] relative">
                <img src={post.coverImage} className="w-full h-full object-cover" alt="" loading="eager" decoding="async" fetchPriority="high" />
              </div>
            )}

            {/* Table of Contents ( п. 4.3 ТЗ ) */}
            {headings.length >= 3 && (
              <div className="bg-[var(--bg-secondary)] p-10 rounded-[2rem] border border-[var(--card-border)] mb-16 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sage/5 rounded-bl-[80px]" />
                <h4 className="font-serif text-2xl text-[var(--text-primary)] mb-8 uppercase tracking-widest">{t('blog.post.toc')}</h4>
                <ul className="space-y-4">
                  {headings.map(h => (
                    <li key={h.id}>
                      <a 
                        href={`#${h.id}`} 
                        className={`text-[15px] transition-all flex items-center gap-3 ${activeHeading === h.id ? 'text-sage font-bold translate-x-3' : 'text-[var(--text-secondary)] hover:text-sage'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full transition-all ${activeHeading === h.id ? 'bg-sage scale-150' : 'bg-[var(--card-border)]'}`} />
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div 
              ref={postContentRef}
              className="markdown-body prose prose-invert max-w-none text-[var(--text-secondary)] font-light leading-[1.8] text-[17px] md:text-[18px]"
            >
              {post.contentType === 'html' ? (
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              ) : (
                <Suspense fallback={<div className="opacity-50">…</div>}>
                  <Markdown
                    components={{
                      blockquote: ({ node, children, ...props }) => {
                        const text = String(children).trim();
                        const isImportant = /^\[!(warning|important|важливо)\]/i.test(text);
                        const isPractice = /^\[!(practice|tip|практика)\]/i.test(text);
                        const cleaned = text.replace(/^\[![\wа-яіїєґ]+\]\s*/i, '');
                        if (isImportant) {
                          return (
                            <div className="my-6 p-5 bg-sage/10 border-l-4 border-sage text-[var(--text-primary)] rounded-r-lg flex gap-3">
                              <AlertTriangle className="text-sage shrink-0 mt-0.5" size={20} />
                              <div>
                                <p className="font-bold text-sage mb-1 text-sm uppercase tracking-wider">Важливо</p>
                                <div className="text-[var(--text-secondary)]">{cleaned || children}</div>
                              </div>
                            </div>
                          );
                        }
                        if (isPractice) {
                          return (
                            <div className="my-6 p-5 bg-[var(--bg-secondary)] border-l-4 border-sage/60 rounded-r-lg flex gap-3">
                              <Gavel className="text-sage shrink-0 mt-0.5" size={20} />
                              <div>
                                <p className="font-bold text-[var(--text-primary)] mb-1 text-sm uppercase tracking-wider">З практики</p>
                                <div className="text-[var(--text-secondary)] italic">{cleaned || children}</div>
                              </div>
                            </div>
                          );
                        }
                        return <blockquote {...props}>{children}</blockquote>;
                      },
                    }}
                  >{post.content}</Markdown>
                </Suspense>
              )}
            </div>

            {/* Mobile CTA ( п. 4.2 ТЗ ) */}
            <div className="lg:hidden mt-16">
               <SidebarCTA />
            </div>

            {/* FAQ Section ( п. 4.5 ТЗ ) */}
            {post.faq && post.faq.length > 0 && (
              <div className="mt-20 pt-20 border-t border-sage/10">
                <h3 className="font-serif text-3xl text-[var(--text-primary)] mb-10">Часті питання</h3>
                <div className="space-y-4">
                  {post.faq.map((item, id) => (
                    <FAQItem key={id} question={item.question} answer={item.answer} isOpenDefault={id === 0} />
                  ))}
                </div>
              </div>
            )}

            {/* Social Share */}
            <div className="mt-16 pt-8 border-t border-sage/10 flex items-center gap-6">
               <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{t('blog.post.share')}</span>
               <div className="flex gap-4">
                  <button 
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border border-sage/10 flex items-center justify-center text-sage hover:bg-sage hover:text-navy-deep transition-all shadow-sm"
                  >
                    <Facebook size={18} />
                  </button>
                  <button
                    onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`, '_blank')}
                    className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border border-sage/10 flex items-center justify-center text-sage hover:bg-sage hover:text-navy-deep transition-all shadow-sm"
                    aria-label="Telegram"
                  >
                    <Send size={18} />
                  </button>
                  <button
                    onClick={() => window.open(`viber://forward?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`, '_blank')}
                    className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border border-sage/10 flex items-center justify-center text-sage hover:bg-sage hover:text-navy-deep transition-all shadow-sm"
                    aria-label="Viber"
                  >
                    <MessageSquare size={18} />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Посилання скопійовано');
                    }}
                    aria-label="Copy link"
                    className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border border-sage/10 flex items-center justify-center text-sage hover:bg-sage hover:text-navy-deep transition-all shadow-sm"
                  >
                    <Link2 size={18} />
                  </button>
               </div>
            </div>
          </div>

          {/* Right Column: Sidebar (30%, п. 4.6 ТЗ ) */}
          <aside className="hidden lg:block w-full lg:w-[30%] space-y-16">
            <div className="sticky top-32 space-y-16">
              {/* CTA Box */}
              <SidebarCTA />

              {/* Author Bio ( п. 4.6 ТЗ ) */}
              <div className="bg-[var(--bg-secondary)] p-10 rounded-[2.5rem] border border-[var(--card-border)] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sage/5 rounded-bl-[60px]" />
                <div className="relative z-10">
                  <div className="mb-6">
                    <h5 className="font-serif text-2xl text-[var(--text-primary)] leading-tight">{post.author}</h5>
                    <p className="text-[9px] uppercase text-sage tracking-[0.3em] font-bold mt-3 leading-relaxed">Адвокат, 12+ років юридичної практики</p>
                  </div>
                  <div className="w-8 h-px bg-sage/30 mb-6" />
                  <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed mb-8 opacity-80 italic">
                    "Спеціалізуюся на сімейних та цивільних справах. Моя мета — ваш спокій та захист ваших інтересів через закон."
                  </p>
                  <Link to={`/${currentLang}`} className="group flex items-center gap-2 text-sage text-[10px] font-bold uppercase tracking-[0.2em] hover:translate-x-2 transition-transform duration-500">
                    Дізнатись більше <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Related Posts ( п. 4.6 ТЗ ) */}
              {relatedPosts.length > 0 && (
                <div className="space-y-8 px-2">
                  <h4 className="font-serif text-2xl text-[var(--text-primary)] relative">
                    <span className="absolute -left-4 top-0 bottom-0 w-1 bg-sage rounded-full" />
                    Схожі статті
                  </h4>
                  <div className="space-y-10">
                    {relatedPosts.map(p => (
                      <Link 
                        key={p.id} 
                        to={`/${currentLang}/${paths.blog}/${p.category}/${p.slug}`}
                        className="block group"
                      >
                        <h6 className="text-[17px] text-[var(--text-primary)] font-medium leading-snug group-hover:text-sage transition-colors mb-3 line-clamp-2">{p.title}</h6>
                        <span className="inline-block bg-[var(--bg-secondary)] text-[var(--text-muted)] text-[9px] uppercase font-bold px-3 py-1 rounded-full border border-[var(--card-border)] group-hover:border-sage/20 transition-all">
                          {getCategoryLabel(p.category, t)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

const FAQItem: React.FC<{ question: string, answer: string, isOpenDefault?: boolean }> = ({ question, answer, isOpenDefault = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-2xl overflow-hidden transition-all shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between gap-4 group"
      >
        <span className="font-medium text-[var(--text-primary)] group-hover:text-sage transition-colors">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="text-sage">
          <ChevronRight size={18} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-6 text-[var(--text-secondary)] font-light leading-relaxed"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EditorModal: React.FC<{ isOpen: boolean, post: Partial<Post>, onSave: () => void, onCancel: () => void, onChange: (p: Partial<Post>) => void }> = ({ isOpen, post, onSave, onCancel, onChange }) => {
  const { t } = useTranslation();
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex flex-col items-center justify-start p-4 md:p-10 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-navy-deep/95 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.98 }}
        className="relative w-full max-w-5xl bg-[var(--bg-primary)] p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-sage/30 shadow-2xl flex flex-col max-h-full overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8 flex-shrink-0">
          <h3 className="font-serif text-2xl md:text-3xl text-sage">Редагування статті</h3>
          <button 
            onClick={onCancel}
            className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-sage/10 flex items-center justify-center text-sage hover:border-sage transition-all"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Заголовок</label>
                <input 
                  type="text" 
                  value={post.title} 
                  onChange={e => onChange({...post, title: e.target.value})}
                  className="w-full bg-[var(--bg-secondary)] border border-sage/10 rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-sage outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Slug (URL) - тільки малі літери та дефіси</label>
                <input 
                  type="text" 
                  value={post.slug} 
                  onChange={e => onChange({...post, slug: transliterate(e.target.value)})}
                  placeholder="наприклад: як-поділити-майно"
                  className="w-full bg-[var(--bg-secondary)] border border-sage/10 rounded-xl px-4 py-3 text-[var(--text-primary)] font-mono text-sm outline-none focus:border-sage"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Рубрика</label>
                <select 
                  value={post.category} 
                  onChange={e => onChange({...post, category: e.target.value})}
                  className="w-full bg-[var(--bg-secondary)] border border-sage/10 rounded-xl px-4 py-3 text-[var(--text-primary)] outline-none focus:border-sage"
                >
                  {BLOG_CATEGORIES.map(c => <option key={c.id} value={c.id}>{t(`blog.categories.items.${c.id}`)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Короткий опис</label>
                <textarea 
                  value={post.excerpt} 
                  onChange={e => onChange({...post, excerpt: e.target.value})}
                  className="w-full bg-[var(--bg-secondary)] border border-sage/10 rounded-xl px-4 py-3 text-[var(--text-primary)] h-32 outline-none focus:border-sage resize-none overflow-y-auto custom-scrollbar"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Зображення (URL)</label>
                <input 
                  type="text" 
                  value={post.coverImage} 
                  onChange={e => onChange({...post, coverImage: e.target.value})}
                  className="w-full bg-[var(--bg-secondary)] border border-sage/10 rounded-xl px-4 py-3 text-[var(--text-primary)] outline-none focus:border-sage"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Тип контенту</label>
                <div className="flex gap-4">
                  {['markdown', 'html'].map(type => (
                    <button 
                      key={type}
                      onClick={() => onChange({...post, contentType: type as any})}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${post.contentType === type ? 'bg-sage text-white border-sage hover:bg-sage-bright/95' : 'border-sage/20 text-sage hover:bg-sage/5'}`}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 py-4 p-4 bg-sage/5 rounded-2xl border border-sage/10">
                <input 
                  type="checkbox" 
                  id="edit-published" 
                  checked={post.status === 'published'} 
                  onChange={e => onChange({...post, status: e.target.checked ? 'published' : 'draft'})} 
                  className="w-6 h-6 accent-sage cursor-pointer"
                />
                <label htmlFor="edit-published" className="text-sm font-medium cursor-pointer">Опублікувати статтю</label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Контент (Markdown/HTML)</label>
            <textarea 
              value={post.content} 
              onChange={e => onChange({...post, content: e.target.value})}
              className="w-full h-96 bg-[var(--bg-secondary)] border border-sage/10 rounded-2xl p-6 text-[var(--text-primary)] font-mono text-sm outline-none focus:border-sage transition-all overflow-y-auto custom-scrollbar"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4 flex-shrink-0">
          <button 
            onClick={onSave}
            className="flex-1 bg-sage hover:bg-sage-bright/95 text-white px-12 py-4 rounded-2xl font-bold uppercase text-sm tracking-widest shadow-xl shadow-sage/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Зберегти зміни
          </button>
          <button 
            onClick={onCancel}
            className="flex-1 bg-[var(--bg-secondary)] text-[var(--text-primary)] px-12 py-4 rounded-2xl font-bold uppercase text-sm tracking-widest border border-sage/10 hover:bg-sage/5 transition-all"
          >
            Скасувати
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Blog;

