import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  Timestamp,
  addDoc,
  updateDoc,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  MapPin,
  Calendar as CalendarIcon,
  Loader2,
  X,
  Edit2,
  Mail,
  Send as TelegramIcon,
  MessageCircle,
  ChevronRight as ChevronRightIcon,
  Trash2
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { uk } from 'date-fns/locale';
import { cn } from '../../lib/utils';

export const AdminCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  useEffect(() => {
    const q = query(collection(db, 'consultations'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: (doc.data().date as Timestamp)?.toDate()
      }));
      setEvents(data);
      setLoading(false);
    }, (error) => {
      if (error.message.includes('offline')) {
        console.warn('Calendar: Client is offline.');
        setLoading(false);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'consultations');
      }
    });
    return () => unsubscribe();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };
  
  // Booking Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    time: '10:00',
    duration: '60',
    type: 'On-line',
    notes: '',
    reminders: {
      email: false,
      telegram: false,
      whatsapp: false
    }
  });

  const resetForm = () => {
    setEditingEventId(null);
    setFormData({
      clientName: '',
      time: '10:00',
      duration: '60',
      type: 'On-line',
      notes: '',
      reminders: {
        email: false,
        telegram: false,
        whatsapp: false
      }
    });
  };

  const handleEditClick = (event: any) => {
    setEditingEventId(event.id);
    setFormData({
      clientName: event.clientName || '',
      time: format(event.date, 'HH:mm'),
      duration: event.duration || '60',
      type: event.type || 'On-line',
      notes: event.notes || '',
      reminders: event.reminders || {
        email: false,
        telegram: false,
        whatsapp: false
      }
    });
    setSelectedDay(event.date);
    setIsModalOpen(true);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;

    try {
      setIsSubmitting(true);
      
      const [hours, minutes] = formData.time.split(':').map(Number);
      const bookingDate = new Date(selectedDay);
      bookingDate.setHours(hours, minutes, 0, 0);

      const eventData = {
        clientName: formData.clientName,
        date: Timestamp.fromDate(bookingDate),
        duration: formData.duration,
        type: formData.type,
        notes: formData.notes,
        reminders: formData.reminders,
        updatedAt: Timestamp.now()
      };

      if (editingEventId) {
        await updateDoc(doc(db, 'consultations', editingEventId), eventData);
      } else {
        await addDoc(collection(db, 'consultations'), {
          ...eventData,
          createdAt: Timestamp.now()
        });
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'consultations');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Ви впевненi, що хочете видалити цей запис?')) return;

    try {
      setIsSubmitting(true);
      await deleteDoc(doc(db, 'consultations', eventId));
      if (editingEventId === eventId) {
        setIsModalOpen(false);
        resetForm();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'consultations');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif italic text-[#141414]">Календар</h1>
          <p className="text-[#141414]/50 font-medium">Планування та огляд консультацій</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#141414] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414]/90 transition-all"
        >
          <Plus size={14} /> Запланувати
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white border border-[#141414]/10 overflow-hidden">
          <div className="p-6 border-b border-[#141414]/10 flex items-center justify-between bg-[#141414]/[0.02]">
            <h2 className="font-serif italic text-xl capitalize">
              {format(currentMonth, 'LLLL yyyy', { locale: uk })}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-[#141414]/5"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest hover:underline"
              >
                Сьогодні
              </button>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-[#141414]/5"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-[#141414]/10">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(day => (
              <div key={day} className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-[#141414]/30 border-r border-[#141414]/10 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "min-h-[100px] p-2 border-r border-b border-[#141414]/10 cursor-pointer transition-colors relative group",
                    !isSameMonth(day, monthStart) ? "bg-[#141414]/[0.02]" : "hover:bg-[#141414]/[0.02]",
                    isSelected ? "ring-1 ring-inset ring-[#141414] bg-[#141414]/[0.03]" : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "text-xs font-mono font-bold",
                      !isSameMonth(day, monthStart) ? "text-[#141414]/20" : "text-[#141414]/60",
                      isToday ? "text-[#141414] underline underline-offset-4 decoration-gold decoration-2" : ""
                    )}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event: any) => (
                      <div key={event.id} className="text-[9px] bg-[#141414] text-white px-1.5 py-0.5 font-bold uppercase tracking-tighter truncate">
                        {event.clientName}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] text-[#141414]/40 font-bold uppercase pl-1">
                        + ще {dayEvents.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="bg-white border border-[#141414]/10 flex flex-col">
          <div className="p-6 border-b border-[#141414]/10 bg-[#141414]/[0.04]">
            <h3 className="font-serif italic text-xl">Подiї на день</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mt-1">
              {selectedDay ? format(selectedDay, 'd MMMM yyyy', { locale: uk }) : 'Оберiть дату'}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-[#141414]/20" size={32} />
              </div>
            ) : selectedDay && getEventsForDay(selectedDay).length > 0 ? (
              getEventsForDay(selectedDay).map((event: any) => (
                <div 
                  key={event.id} 
                  onClick={() => handleEditClick(event)}
                  className="group relative p-4 border-l-2 border-[#141414] bg-[#141414]/[0.02] space-y-2 hover:bg-[#141414]/[0.05] transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-[#141414] text-white px-2 py-0.5">
                      {format(event.date, 'HH:mm')}
                    </span>
                    <div className="flex items-center gap-2">
                       {event.reminders?.email && <Mail size={10} className="text-[#141414]/60" />}
                       {event.reminders?.telegram && <TelegramIcon size={10} className="text-[#141414]/60" />}
                       {event.reminders?.whatsapp && <MessageCircle size={10} className="text-[#141414]/60" />}
                       <Edit2 size={12} className="text-[#141414]/0 group-hover:text-[#141414]/40 transition-all ml-1" />
                       <button
                         onClick={(e) => handleDeleteEvent(event.id, e)}
                         className="p-1 hover:bg-red-50 text-red-500/0 group-hover:text-red-500 transition-all rounded"
                       >
                         <Trash2 size={12} />
                       </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-sm">{event.clientName}</h4>
                  <div className="space-y-1">
                    <p className="text-[10px] text-[#141414]/60 flex items-center gap-2">
                      <Clock size={12} /> {event.duration || '60'} хв
                    </p>
                    <p className="text-[10px] text-[#141414]/60 flex items-center gap-2">
                      <MapPin size={12} /> {event.type || 'On-line'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="w-12 h-12 bg-[#141414]/5 rounded-full flex items-center justify-center mx-auto text-[#141414]/10">
                  <CalendarIcon size={24} />
                </div>
                <p className="text-[#141414]/40 font-serif italic text-sm">
                  На цей день жодних консультацiй не заплановано
                </p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-[#141414]/10 bg-[#141414]/[0.02]">
             <button 
               onClick={() => {
                 resetForm();
                 setIsModalOpen(true);
               }}
               className="w-full h-11 border border-[#141414] font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414] hover:text-white transition-all"
             >
                Бронювати час
             </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#141414]/60 backdrop-blur-sm" 
            onClick={() => !isSubmitting && setIsModalOpen(false)} 
          />
          <div className="relative w-full max-w-md bg-white p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-[#141414]/5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="font-serif italic text-2xl mb-1">
              {editingEventId ? 'Редагувати консультацiю' : 'Запланувати консультацiю'}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-8">
              {selectedDay ? format(selectedDay, 'd MMMM yyyy', { locale: uk }) : ''}
            </p>

            <form onSubmit={handleBooking} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#141414]/40 block pl-1">
                  Iм'я клiєнта
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.clientName}
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full h-12 px-4 bg-[#141414]/[0.02] border border-[#141414]/10 focus:border-[#141414] outline-none transition-all text-sm font-medium"
                  placeholder="Введiть iм'я..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#141414]/40 block pl-1">
                    Час
                  </label>
                  <input 
                    required
                    type="time" 
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full h-12 px-4 bg-[#141414]/[0.02] border border-[#141414]/10 focus:border-[#141414] outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#141414]/40 block pl-1">
                    Тривалiсть (хв)
                  </label>
                  <select 
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full h-12 px-4 bg-[#141414]/[0.02] border border-[#141414]/10 focus:border-[#141414] outline-none transition-all text-sm font-medium"
                  >
                    <option value="30">30 хв</option>
                    <option value="45">45 хв</option>
                    <option value="60">60 хв</option>
                    <option value="90">90 хв</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#141414]/40 block pl-1">
                  Тип консультацiї
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['On-line', 'Off-line'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={cn(
                        "h-12 border text-[10px] font-bold uppercase tracking-widest transition-all",
                        formData.type === type 
                          ? "bg-[#141414] text-white border-[#141414]" 
                          : "border-[#141414]/10 hover:border-[#141414]/30"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#141414]/40 block pl-1">
                  Нагадування (Push/Notif)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, reminders: { ...formData.reminders, email: !formData.reminders.email } })}
                    className={cn(
                      "h-12 border flex items-center justify-center gap-2 transition-all",
                      formData.reminders.email 
                        ? "bg-[#141414] text-white border-[#141414]" 
                        : "border-[#141414]/10 hover:border-[#141414]/30 text-[#141414]/40"
                    )}
                  >
                    <Mail size={14} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, reminders: { ...formData.reminders, telegram: !formData.reminders.telegram } })}
                    className={cn(
                      "h-12 border flex items-center justify-center gap-2 transition-all",
                      formData.reminders.telegram 
                        ? "bg-[#141414] text-white border-[#141414]" 
                        : "border-[#141414]/10 hover:border-[#141414]/30 text-[#141414]/40"
                    )}
                  >
                    <TelegramIcon size={14} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">TG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, reminders: { ...formData.reminders, whatsapp: !formData.reminders.whatsapp } })}
                    className={cn(
                      "h-12 border flex items-center justify-center gap-2 transition-all",
                      formData.reminders.whatsapp 
                        ? "bg-[#141414] text-white border-[#141414]" 
                        : "border-[#141414]/10 hover:border-[#141414]/30 text-[#141414]/40"
                    )}
                  >
                    <MessageCircle size={14} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">WA</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#141414]/40 block pl-1">
                  Примiтки
                </label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full h-24 p-4 bg-[#141414]/[0.02] border border-[#141414]/10 focus:border-[#141414] outline-none transition-all text-sm font-medium resize-none"
                  placeholder="Додаткова iнформацiя..."
                />
              </div>

              <div className="flex gap-4 mt-6">
                {editingEventId && (
                  <button 
                    type="button"
                    onClick={() => handleDeleteEvent(editingEventId)}
                    disabled={isSubmitting}
                    className="flex-1 h-14 border border-red-500/20 text-red-500 font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                    Видалити
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] h-14 bg-[#141414] text-white font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-[#141414]/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      {editingEventId ? 'Зберегти' : 'Пiдтвердити'}
                      <ChevronRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
