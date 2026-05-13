import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user is in allowed admins
      const adminPath = `admins/${user.uid}`;
      let adminDoc;
      try {
        adminDoc = await getDoc(doc(db, 'admins', user.uid));
      } catch (err: any) {
        if (err.message && err.message.includes('offline')) {
          setError('Помилка мережі: клієнт знаходиться в офлайн-режимі. Будь ласка, перевірте з\'єднання.');
          setLoading(false);
          return;
        }
        handleFirestoreError(err, OperationType.GET, adminPath);
      }
      
      if (adminDoc?.exists() || user.email === 'bogdashkina.lawyer@gmail.com') {
        // If it's the bootstrapped admin, ensure they are in the admins collection
        if (user.email === 'bogdashkina.lawyer@gmail.com' && !adminDoc?.exists()) {
          try {
            await setDoc(doc(db, 'admins', user.uid), {
              email: user.email,
              name: user.displayName || 'Super Admin',
              role: 'admin'
            });
          } catch (writeErr) {
            handleFirestoreError(writeErr, OperationType.WRITE, adminPath);
          }
        }
        navigate('/admin');
      } else {
        await auth.signOut();
        setError('У вас немає прав доступу до адміністративної панелі. Зверніться до власника ресурсу.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message && err.message.includes('offline')) {
        setError('Помилка мережі: клієнт знаходиться в офлайн-режимі. Спробуйте ще раз пізніше.');
      } else if (err.message && err.message.startsWith('{')) {
        // This is likely a JSON string from handleFirestoreError
        try {
          const parsed = JSON.parse(err.message);
          setError(`Помилка Firestore: ${parsed.error}`);
        } catch (e) {
          setError(err.message);
        }
      } else {
        setError(err.message || 'Не вдалося увійти. Спробуйте ще раз або перевірте інтернет-з’єднання.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#141414]/10 p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#141414]/[0.02] transform rotate-45 translate-x-12 -translate-y-12" />
        
        <div className="flex flex-col items-center mb-10 relative z-10 text-center">
          <div className="w-16 h-16 bg-[#141414] flex items-center justify-center text-white mb-6 transform hover:rotate-12 transition-transform duration-500">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-serif italic mb-2">Адмін Панель</h1>
          <p className="text-[#141414]/40 font-medium tracking-wide flex items-center gap-2">
            ВХІД ДЛЯ АВТОРИЗОВАНИХ КОРИСТУВАЧІВ
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-red-700 font-medium leading-relaxed">{error}</p>
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-14 bg-[#141414] text-white flex items-center justify-center gap-3 font-bold uppercase tracking-widest hover:bg-[#141414]/90 transition-all active:scale-[0.98] disabled:opacity-50 group"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              ВХІД ЧЕРЕЗ GOOGLE
            </>
          )}
        </button>

        <div className="mt-12 pt-8 border-t border-[#141414]/10 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 hover:text-[#141414] transition-all flex items-center justify-center gap-2 mx-auto"
          >
            ПОВЕРНУТИСЯ НА САЙТ <ArrowRight size={12} />
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#141414]/20">
        POWERED BY GENIUZ LEGAL TECH
      </p>
    </div>
  );
};

export default AdminLogin;
