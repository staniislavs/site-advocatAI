import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../../lib/firebase';
import { Shield, Plus, Trash2, X, Loader2, Crown, UserCog } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AdminRecord {
  id: string;
  email: string;
  name?: string;
  role?: string;
  createdAt?: any;
}

export const AdminAdmins: React.FC = () => {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ uid: '', email: '', name: '', role: 'admin' });

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'admins'),
      (snap) => {
        const list: AdminRecord[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        list.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
        setAdmins(list);
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'admins');
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.uid.trim() || !form.email.trim()) {
      toast.error('UID та Email обов\'язкові');
      return;
    }
    setSubmitting(true);
    try {
      await setDoc(doc(db, 'admins', form.uid.trim()), {
        email: form.email.trim(),
        name: form.name.trim() || form.email.trim().split('@')[0],
        role: form.role,
        createdAt: serverTimestamp(),
      });
      toast.success('Адміна додано');
      setModalOpen(false);
      setForm({ uid: '', email: '', name: '', role: 'admin' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'admins');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (auth.currentUser?.uid === id) {
      toast.error('Не можна видалити свій акаунт');
      return;
    }
    if (!window.confirm(`Видалити адміна ${email}? Він втратить доступ до панелі.`)) return;
    try {
      await deleteDoc(doc(db, 'admins', id));
      toast.success('Адміна видалено');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `admins/${id}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif italic text-[#141414]">Адміни</h1>
          <p className="text-[#141414]/50 font-medium">Користувачі з доступом до панелі</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 h-12 px-6 bg-[#141414] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#141414]/90 transition"
        >
          <Plus size={16} /> Додати адміна
        </button>
      </div>

      <div className="bg-white border border-[#141414]/10">
        {loading ? (
          <div className="flex items-center justify-center p-16 text-[#141414]/30"><Loader2 className="animate-spin" /></div>
        ) : admins.length === 0 ? (
          <div className="text-center p-16 text-[#141414]/40">Немає адмінів</div>
        ) : (
          <ul className="divide-y divide-[#141414]/10">
            {admins.map(a => {
              const isMe = auth.currentUser?.uid === a.id;
              return (
                <li key={a.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#141414]/[0.02]">
                  <div className="w-10 h-10 rounded-full bg-[#141414] text-white flex items-center justify-center font-serif">
                    {(a.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#141414] truncate">{a.name || a.email}</p>
                      {isMe && <span className="text-[9px] uppercase tracking-widest bg-gold/10 text-gold px-2 py-0.5">Ви</span>}
                      {a.role === 'admin' && <Crown size={12} className="text-gold" />}
                    </div>
                    <p className="text-xs text-[#141414]/50 truncate">{a.email}</p>
                    <p className="text-[10px] text-[#141414]/30 font-mono mt-1">UID: {a.id}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id, a.email)}
                    disabled={isMe}
                    className="p-2 text-[#141414]/40 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title={isMe ? 'Не можна видалити себе' : 'Видалити'}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="bg-gold/5 border border-gold/20 p-6 text-sm text-[#141414]/70">
        <div className="flex items-start gap-3">
          <UserCog size={20} className="text-gold shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-2 text-[#141414]">Як додати нового адміна?</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Новий адмін повинен спочатку зайти на <code className="bg-[#141414]/5 px-1">/admin/login</code> через Google (потім вийти).</li>
              <li>У Firebase Console → Authentication → Users скопіюйте його <b>UID</b>.</li>
              <li>Додайте UID та email через форму вище.</li>
              <li>Після цього він зможе увійти.</li>
            </ol>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#141414]/10">
              <h3 className="font-serif italic text-xl flex items-center gap-3"><Shield size={20} /> Новий адмін</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-[#141414]/5"><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">UID (з Firebase Auth)</label>
                <input type="text" value={form.uid} onChange={e => setForm({...form, uid: e.target.value})} className="w-full h-12 bg-[#141414]/5 px-4 outline-none font-mono text-xs" placeholder="abc123XYZ..." required />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full h-12 bg-[#141414]/5 px-4 outline-none" placeholder="user@example.com" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Ім'я</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full h-12 bg-[#141414]/5 px-4 outline-none" placeholder="Опціонально" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Роль</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full h-12 bg-[#141414]/5 px-4 outline-none">
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 h-12 bg-[#141414]/5 text-[10px] uppercase tracking-widest font-bold hover:bg-[#141414]/10">Скасувати</button>
                <button type="submit" disabled={submitting} className="flex-1 h-12 bg-[#141414] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#141414]/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : <><Plus size={14} /> Додати</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdmins;
