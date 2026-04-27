import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { supabase } from '../../lib/supabase';
import { 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Star,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  service: {
    id: string;
    name: string;
    price: number | string;
    duration: string;
  } | null;
}

export function BookingModal({ isOpen, onClose, businessId, service }: BookingModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderRef] = useState('BIL-' + Math.floor(Math.random() * 90000 + 10000));

  React.useEffect(() => {
    if (isOpen && step === 1 && businessId) {
      fetchStaff();
    }
  }, [isOpen, step, businessId]);

  async function fetchStaff() {
    setStaffLoading(true);
    const { data } = await supabase
      .from('staff')
      .select(`
        id,
        profiles (
          full_name,
          role,
          avatar_url
        )
      `)
      .eq('tenant_id', businessId)
      .eq('is_active', true);
    
    if (data) {
      const formattedStaff = data.map((s: any) => ({
        id: s.id,
        name: s.profiles?.full_name || 'Unnamed Specialist',
        role: s.profiles?.role || 'Stylist',
        image: s.profiles?.avatar_url,
        rating: 5.0 // Fallback
      }));
      setStaffList(formattedStaff);
      if (formattedStaff.length > 0 && !selectedStaff) {
        setSelectedStaff(formattedStaff[0]);
      }
    }
    setStaffLoading(false);
  }

  const times = ['10:00 AM', '11:15 AM', '01:30 PM', '02:45 PM', '04:00 PM', '05:15 PM'];

  const resetAndClose = () => {
    setStep(1);
    setSelectedStaff(null);
    setSelectedTime(null);
    onClose();
  };

  const handleNext = async () => {
    if (step === 3) {
      setLoading(true);
      setError(null);
      
      const priceValue = typeof service?.price === 'number' ? service.price : parseFloat(String(service?.price || '0').replace(/[^0-9.]/g, ''));
      
      // Calculate time
      let timeStr = selectedTime || '10:00 AM';
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
      const formattedTime = `${hours.padStart(2, '0')}:${minutes}:00`;

      // 1. Create the booking record
      const { data: booking, error: bookingErr } = await supabase
        .from('bookings')
        .insert([{
          tenant_id: businessId,
          client_id: user?.id || null, 
          stylist_id: selectedStaff?.id || null,
          booking_date: selectedDate,
          start_time: formattedTime,
          end_time: formattedTime, // Simplified for now
          status: 'pending',
          notes: `Staff requested: ${selectedStaff?.name}. Payment Ref: ${orderRef}`,
          total_price_etb: priceValue,
          service_id: service?.id
        }])
        .select()
        .single();

      if (bookingErr) {
        console.error("Booking failed:", bookingErr);
        setError(bookingErr.message);
        setLoading(false);
        return;
      }

      // 2. Link the service via booking_services join table
      const { error: svcErr } = await supabase
        .from('booking_services')
        .insert([{
          booking_id: booking.id,
          service_id: service?.id,
          price_etb: priceValue
        }]);

      if (svcErr) {
        console.error("Service link failed:", svcErr);
        setError(svcErr.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      setStep(4);
    } else {
      setStep(s => s + 1);
    }
  };
  const handleBack = () => setStep(s => s - 1);

  if (!service) return null;

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={step === 4 ? "Booking Confirmed" : `Book ${service.name}`}>
      <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Step Progress */}
        {step < 4 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ 
                height: '4px', 
                flex: 1, 
                backgroundColor: s <= step ? 'var(--color-primary)' : 'var(--surface-container-low)',
                borderRadius: '2px',
                transition: '0.3s'
              }}></div>
            ))}
          </div>
        )}

        {/* Step 1: Select Provider */}
        {step === 1 && (
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-gray-400)', letterSpacing: '0.1em', marginBottom: '20px' }}>Choose a Provider</h4>
            {staffLoading ? (
               <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {staffList.length > 0 ? staffList.map((s) => (
                  <div 
                    key={s.id} 
                    onClick={() => setSelectedStaff(s)}
                    style={{ 
                      padding: '16px', 
                      borderRadius: '16px', 
                      border: '2px solid',
                      borderColor: selectedStaff?.id === s.id ? 'var(--color-primary)' : 'var(--surface-container-low)',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px',
                      cursor: 'pointer',
                      transition: '0.2s',
                      backgroundColor: selectedStaff?.id === s.id ? 'rgba(0, 108, 79, 0.02)' : 'transparent'
                    }}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--surface-container-low)', overflow: 'hidden' }}>
                      {s.image ? <img src={s.image} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gray-400)' }}><User size={20} /></div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 'bold', fontSize: '15px' }}>{s.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>{s.role}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      <Star size={12} fill="var(--color-primary)" color="var(--color-primary)" />
                      <span>{s.rating}</span>
                    </div>
                  </div>
                )) : (
                  <p style={{ textAlign: 'center', color: 'var(--color-gray-400)', padding: '20px' }}>No specialists available at this time.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '32px' }}>
               <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-gray-400)', letterSpacing: '0.1em', marginBottom: '20px' }}>Select Date</h4>
               <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {[0, 1, 2, 3, 4].map((offset) => {
                    const date = new Date();
                    date.setDate(date.getDate() + offset);
                    const dateStr = date.toISOString().split('T')[0];
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = date.getDate();
                    const isSelected = selectedDate === dateStr;
                    
                    return (
                      <div 
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        style={{ 
                          padding: '12px 20px', 
                          borderRadius: '12px', 
                          border: '1px solid',
                          borderColor: isSelected ? 'var(--color-primary)' : 'var(--surface-container-low)',
                          backgroundColor: isSelected ? 'var(--surface-container-lowest)' : 'transparent',
                          textAlign: 'center',
                          minWidth: '80px',
                          cursor: 'pointer',
                          transition: '0.2s'
                        }}
                      >
                        <p style={{ fontSize: '10px', color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>{dayName}</p>
                        <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{dayNum}</p>
                      </div>
                    );
                  })}
               </div>
            </div>
            <div>
               <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-gray-400)', letterSpacing: '0.1em', marginBottom: '20px' }}>Available Slots</h4>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {times.map((t) => (
                    <button 
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      style={{ 
                        padding: '12px', 
                        borderRadius: '12px', 
                        border: '1px solid',
                        borderColor: selectedTime === t ? 'var(--color-primary)' : 'var(--surface-container-low)',
                        backgroundColor: selectedTime === t ? 'var(--color-primary)' : 'transparent',
                        color: selectedTime === t ? 'white' : 'inherit',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                    >
                      {t}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-gray-400)', letterSpacing: '0.1em', marginBottom: '24px' }}>Review Appointment</h4>
            <div style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--surface-container-low)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: 'var(--color-gray-400)', textTransform: 'uppercase', fontWeight: 'bold' }}>Treatment</p>
                    <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{service.name}</p>
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {typeof service.price === 'number' ? `ETB ${service.price.toFixed(2)}` : service.price}
                  </p>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                     <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                        <Calendar size={14} />
                     </div>
                     <div>
                        <p style={{ fontSize: '9px', color: 'var(--color-gray-400)', textTransform: 'uppercase', fontWeight: 'bold' }}>Date</p>
                        <p style={{ fontSize: '13px', fontWeight: 'bold' }}>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                     </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                     <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                        <Clock size={14} />
                     </div>
                     <div>
                        <p style={{ fontSize: '9px', color: 'var(--color-gray-400)', textTransform: 'uppercase', fontWeight: 'bold' }}>Time</p>
                        <p style={{ fontSize: '13px', fontWeight: 'bold' }}>{selectedTime}</p>
                     </div>
                  </div>
               </div>
               <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--surface-container-low)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-container-low)', overflow: 'hidden' }}>
                    {selectedStaff?.image ? <img src={selectedStaff.image} alt={selectedStaff.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} /></div>}
                  </div>
                  <div>
                    <p style={{ fontSize: '9px', color: 'var(--color-gray-400)', textTransform: 'uppercase', fontWeight: 'bold' }}>Specialist</p>
                    <p style={{ fontSize: '13px', fontWeight: 'bold' }}>{selectedStaff?.name}</p>
                  </div>
               </div>
            </div>
            
            {error && (
              <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--color-error-container)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--color-error)' }}>
                <AlertCircle size={18} />
                <p style={{ fontSize: '12px', fontWeight: 'bold' }}>{error}</p>
              </div>
            )}

            <div style={{ marginTop: '32px', padding: '20px', backgroundColor: 'rgba(0, 108, 79, 0.05)', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
               <CheckCircle2 size={18} color="var(--color-secondary)" style={{ flexShrink: 0 }} />
               <p style={{ fontSize: '12px', color: 'var(--color-secondary)', lineHeight: '1.5' }}>
                  <strong>Note:</strong> A 25% deposit is required to confirm your booking. You will receive a payment reference code on the next screen to complete via mobile banking.
               </p>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(103, 252, 198, 0.1)', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <CheckCircle2 size={48} />
            </div>
            <div>
               <h2 className="serif-italic" style={{ fontSize: '24px', marginBottom: '12px' }}>Request Received</h2>
               <p style={{ fontSize: '14px', color: 'var(--color-gray-500)', lineHeight: '1.6', maxWidth: '300px' }}>
                  Your appointment for <strong>{service.name}</strong> has been requested and is awaiting shop confirmation.
               </p>
            </div>
            <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '24px', borderRadius: '16px', width: '100%' }}>
               <p style={{ fontSize: '10px', color: 'var(--color-gray-400)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>Payment Reference</p>
               <p style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '0.2em', color: 'var(--color-gray-900)' }}>{orderRef}</p>
               <p style={{ fontSize: '11px', color: 'var(--color-gray-500)', marginTop: '8px' }}>Please include this code in your transfer description.</p>
            </div>
            <Button variant="primary" style={{ width: '100%' }} onClick={resetAndClose}>Done</Button>
          </div>
        )}

        {/* Footer Actions */}
        {step < 4 && (
          <div style={{ marginTop: 'auto', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {step > 1 ? (
              <button 
                onClick={handleBack} 
                disabled={loading}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer', color: 'var(--color-gray-500)' }}
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : <div />}
            <Button 
              variant="primary" 
              onClick={handleNext}
              disabled={(step === 1 && !selectedStaff) || (step === 2 && !selectedTime) || loading}
              style={{ padding: '0 32px' }}
              icon={loading ? Loader2 : (step === 3 ? CheckCircle2 : ChevronRight)}
            >
              {loading ? 'Confirming...' : (step === 1 ? 'Choose Time' : step === 2 ? 'Review Booking' : 'Confirm & Pay')}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
