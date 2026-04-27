import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { BookingModal } from '../components/ui/BookingModal';
import { supabase } from '../lib/supabase';
import { 
  Star, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Scissors, 
  Phone,
  ArrowRight,
  Loader2,
  Users as UsersIcon,
  MessageSquare,
  Layout,
  BookOpen,
  Info as InfoIcon,
  Home as HomeIcon,
  CheckCircle,
  Award,
  Calendar,
  Bell,
  CreditCard,
  UserCircle2
} from 'lucide-react';

export default function PublicShop() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  
  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [team, setTeam] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [limitReached, setLimitReached] = useState(false);

  const tabs = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'services', label: 'Services', icon: Scissors },
    { id: 'book', label: 'Book', icon: BookOpen },
    { id: 'team', label: 'Team', icon: UsersIcon },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'portfolio', label: 'Portfolio', icon: Layout },
    { id: 'about', label: 'About', icon: InfoIcon },
  ];

  useEffect(() => {
    if (slug) {
      fetchShopData();
    }
  }, [slug]);

  async function fetchShopData() {
    setLoading(true);
    
    // 1. Fetch Business by Slug
    const { data: biz, error: bizErr } = await supabase
      .from('shops')
      .select('*')
      .eq('slug', slug)
      .single();

    if (bizErr || !biz) {
      console.error("Error fetching business:", bizErr);
      setLoading(false);
      return;
    }
    setBusiness(biz);

    // 2. Fetch Services
    const { data: svcs } = await supabase
      .from('services')
      .select('*')
      .eq('tenant_id', biz.id)
      .eq('is_active', true);
    
    // Map services to match component props (e.g. price_etb -> price)
    if (svcs) {
      setServices(svcs.map(s => ({
        ...s,
        price: `ETB ${s.price_etb}`,
        duration: `${s.duration_minutes}m`,
        image: s.image_url
      })));
    }
    
    // 3. Fetch Team
    const { data: teamData } = await supabase
      .from('staff')
      .select('*, profiles!user_id(*)')
      .eq('tenant_id', biz.id);
    if (teamData) setTeam(teamData);

    // 4. Fetch Reviews
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*, profiles!client_id(full_name, avatar_url)')
      .eq('tenant_id', biz.id)
      .order('created_at', { ascending: false });

    if (reviewsData && reviewsData.length > 0) {
      setReviews(reviewsData.map(r => ({
        id: r.id,
        user: r.profiles?.full_name || 'Anonymous',
        rating: r.rating,
        comment: r.comment,
        date: new Date(r.created_at).toLocaleDateString()
      })));
    } else {
      setReviews([]);
    }

    // 5. Fetch Portfolio
    const { data: portfolioData } = await supabase
      .from('lookbook_items')
      .select('*')
      .eq('tenant_id', biz.id)
      .limit(8);
    
    if (portfolioData && portfolioData.length > 0) {
      setPortfolio(portfolioData.map(p => ({
        id: p.id,
        image: p.image_url,
        category: p.tags?.[0] || 'Work'
      })));
    } else {
      // Fallback to placeholder if no portfolio items exist
      setPortfolio([
        { id: '1', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400', category: 'Fade' },
        { id: '2', image: 'https://images.unsplash.com/photo-1599351431247-f10bc1356262?w=400', category: 'Beard' },
        { id: '3', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400', category: 'Styling' },
      ]);
    }

    // 6. Fetch Subscription Status
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(*)')
      .eq('tenant_id', biz.id)
      .single();
    
    if (subData) {
      const limit = subData.subscription_plans.booking_limit;
      if (limit !== -1 && subData.bookings_count >= limit) {
        setLimitReached(true);
      }
    }

    setLoading(false);
  }

  const handleBookService = (service: any) => {
    if (!service) {
      setActiveTab('services');
      return;
    }
    if (limitReached) {
      alert("This shop has reached its monthly booking capacity. Please check back later or contact the shop directly.");
      return;
    }
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const openBookTab = (service?: any) => {
    setActiveTab('book');
    if (service) {
      setSelectedService(service);
    }
  };


  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
      </div>
    );
  }

  if (!business) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
        <h2 className="serif-italic" style={{ fontSize: '32px' }}>Shop Not Found</h2>
        <p style={{ color: 'var(--color-gray-500)' }}>The shop you are looking for is unavailable.</p>
        <Button variant="primary" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home': return renderHome();
      case 'services': return renderServices();
      case 'book': return renderBook();
      case 'team': return renderTeam();
      case 'reviews': return renderReviews();
      case 'portfolio': return renderPortfolio();
      case 'about': return renderAbout();
      default: return renderHome();
    }
  };

  const renderHome = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
        <Card title="Featured Services" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {services.slice(0, 3).map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 'bold' }}>{s.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>{s.duration}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleBookService(s)}>Book Now</Button>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Expert Team" style={{ padding: '32px' }}>
           <div style={{ display: 'flex', gap: '16px' }}>
             {team.slice(0, 3).map(t => (
               <div key={t.id} style={{ textAlign: 'center' }}>
                 <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', marginBottom: '8px' }}>
                   <img src={t.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=' + t.profiles?.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 </div>
                 <p style={{ fontSize: '11px', fontWeight: 'bold' }}>{t.profiles?.full_name?.split(' ')[0]}</p>
               </div>
             ))}
           </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {[
          { title: 'Fast Booking', copy: 'Choose a service, pick a time, and select staff or auto-assign.', icon: Calendar },
          { title: 'Visible Team', copy: 'Every staff profile can show photo, bio, services, rating, and work.', icon: UserCircle2 },
          { title: 'Payment Options', copy: 'Support cash or transfer with screenshot proof where needed.', icon: CreditCard },
          { title: 'Smart Alerts', copy: 'Confirmation, day reminder, 30-minute alert, and go-now notification.', icon: Bell },
        ].map((item) => (
          <Card key={item.title} style={{ padding: '28px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <item.icon size={20} />
            </div>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{item.title}</p>
            <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', lineHeight: '1.7' }}>{item.copy}</p>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderServices = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
      {services.map((service) => (
        <Card 
          key={service.id} 
          style={{ display: 'flex', gap: '24px', padding: '24px', cursor: 'pointer' }} 
          onClick={() => handleBookService(service)}
        >
          {service.image ? (
             <div style={{ width: '120px', height: '120px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0 }}>
                <img src={service.image} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             </div>
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '16px', backgroundColor: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-primary)' }}>
              <Scissors size={40} />
            </div>
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 className="serif-italic" style={{ fontSize: 'var(--text-xl)' }}>{service.name}</h3>
                <span style={{ fontWeight: 'bold', fontSize: 'var(--text-lg)' }}>{service.price}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', lineHeight: '1.5' }}>{service.description}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-gray-400)', fontWeight: 'bold' }}>
                <Clock size={14} />
                <span>{service.duration} SERVICE</span>
              </div>
              <button
                className="btn-ghost"
                style={{ fontSize: '11px' }}
                onClick={(event) => {
                  event.stopPropagation();
                  handleBookService(service);
                }}
              >
                Select
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderBook = () => (
    <div style={{ textAlign: 'center', padding: '80px', backgroundColor: 'var(--surface-container-lowest)', borderRadius: '32px' }}>
      <Calendar size={64} color="var(--color-primary)" style={{ marginBottom: '24px' }} />
      <h2 className="serif-italic" style={{ fontSize: '32px', marginBottom: '16px' }}>Schedule Your Session</h2>
      <p style={{ color: 'var(--color-gray-500)', marginBottom: '32px' }}>Choose your preferred service, time, and staff member, or let the shop auto-assign the best available professional.</p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <Button variant="primary" size="lg" onClick={() => handleBookService(selectedService || services[0])}>Choose Service</Button>
        <Button variant="secondary" size="lg" onClick={() => setActiveTab('team')}>View Specialists</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '32px', textAlign: 'left' }}>
        <Card style={{ padding: '20px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Payment</p>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', lineHeight: '1.6' }}>Cash or transfer with screenshot upload when required by the shop.</p>
        </Card>
        <Card style={{ padding: '20px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Notifications</p>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', lineHeight: '1.6' }}>Receive confirmation, day reminder, 30-minute alert, and go-now prompts.</p>
        </Card>
        <Card style={{ padding: '20px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Booking History</p>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', lineHeight: '1.6' }}>Customers can track upcoming and past bookings from their account area.</p>
        </Card>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
      {team.map(t => (
        <Card key={t.id} style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px' }}>
            <img src={t.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=' + t.profiles?.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h3 className="serif-italic" style={{ fontSize: '20px' }}>{t.profiles?.full_name}</h3>
          <p style={{ fontSize: '12px', color: 'var(--color-gray-500)', textTransform: 'uppercase', fontWeight: 'bold', margin: '4px 0 16px' }}>{t.role}</p>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', lineHeight: '1.6', marginBottom: '16px' }}>{t.bio || 'Visible public profile with experience, services, portfolio, and reviews.'}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
            {(t.specializations || ['Generalist']).map((s: string) => <Badge key={s} variant="secondary" style={{ fontSize: '9px' }}>{s}</Badge>)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '18px', fontSize: '12px', color: 'var(--color-gray-500)' }}>
            <Star size={14} fill="var(--color-primary)" color="var(--color-primary)" />
            <span>{t.avg_rating || '5.0'} rating</span>
          </div>
          <Button
            variant="ghost"
            style={{ width: '100%' }}
            onClick={() => openBookTab(services[0])}
          >
            Book with {t.profiles?.full_name?.split(' ')[0]}
          </Button>
        </Card>
      ))}
    </div>
  );

  const renderReviews = () => (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 className="serif-italic" style={{ fontSize: '32px' }}>Customer Feedback</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>{[1,2,3,4,5].map(i => <Star key={i} size={16} fill="var(--color-primary)" color="var(--color-primary)" />)}</div>
            <span style={{ fontWeight: 'bold' }}>4.9/5.0</span>
          </div>
        </div>
        <Button variant="primary" onClick={() => navigate('/bookings')}>Write a Review</Button>
      </div>
      {reviews.map(r => (
        <Card key={r.id} style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.user[0]}</div>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{r.user}</p>
                <p style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>{r.date}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>{[1,2,3,4,5].map(i => <Star key={i} size={12} fill={i <= r.rating ? "var(--color-primary)" : "none"} color="var(--color-primary)" />)}</div>
          </div>
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--color-gray-600)' }}>{r.comment}</p>
        </Card>
      ))}
    </div>
  );

  const renderPortfolio = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <Badge variant="primary">All Work</Badge>
        <Badge variant="outline">Fades</Badge>
        <Badge variant="outline">Color</Badge>
        <Badge variant="outline">Artistic</Badge>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {portfolio.map(p => (
          <div key={p.id} style={{ aspectRatio: '1', borderRadius: '16px', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
            <img src={p.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
              <Badge variant="secondary" style={{ fontSize: '10px' }}>{p.category}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAbout = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px' }}>
      <div>
        <h2 className="serif-italic" style={{ fontSize: '32px', marginBottom: '24px' }}>The Bilillee Experience</h2>
        <p style={{ lineHeight: '1.8', color: 'var(--color-gray-600)', marginBottom: '32px' }}>
          {business.description || 'Founded on precision, hospitality, and trust, this shop showcases transparent staff profiles, service quality, and portfolio work before you book.'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={24} /></div>
            <div>
              <p style={{ fontWeight: 'bold' }}>Premium Standards</p>
              <p style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>Strong service delivery, clear pricing, and a polished booking experience.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-secondary-100)', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={24} /></div>
            <div>
              <p style={{ fontWeight: 'bold' }}>Certified Specialists</p>
              <p style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>Every visible staff member can present experience, specialties, portfolio, and reviews.</p>
            </div>
          </div>
        </div>
      </div>
      <Card style={{ padding: '40px' }}>
        <h3 className="serif-italic" style={{ fontSize: '24px', marginBottom: '24px' }}>Visit Our Studio</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <MapPin size={20} color="var(--color-primary)" />
            <p style={{ fontSize: '14px' }}>{business.address || "Addis Ababa, Ethiopia"}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Phone size={20} color="var(--color-primary)" />
            <p style={{ fontSize: '14px' }}>{business.phone || "+251 11 555 0198"}</p>
          </div>
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--surface-container-low)' }}>
             <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-gray-400)', marginBottom: '16px' }}>Hours of Operation</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span>Mon - Fri</span><span style={{ fontWeight: 'bold' }}>09:00 - 20:00</span></div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span>Sat</span><span style={{ fontWeight: 'bold' }}>10:00 - 18:00</span></div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span>Sun</span><span style={{ fontWeight: 'bold' }}>Closed</span></div>
             </div>
          </div>
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--surface-container-low)' }}>
            <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-gray-400)', marginBottom: '16px' }}>Payments</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Badge variant="secondary">Cash</Badge>
              <Badge variant="outline">Transfer + Screenshot</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const scrollToSection = (id: string) => {
    setActiveTab(id === 'catalog' ? 'services' : id);
  };

  return (
    <PublicLayout 
      businessName={business.name}
      onShopClick={() => scrollToSection('home')}
      onServicesClick={() => scrollToSection('services')}
      onAboutClick={() => scrollToSection('about')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
        
        <BookingModal 
          isOpen={isBookingOpen} 
          onClose={() => setIsBookingOpen(false)} 
          service={selectedService} 
          businessId={business.id}
        />

        {/* Hero Section */}
        <header style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(12, 1fr)', 
          gap: '40px', 
          alignItems: 'center',
          padding: '40px 0'
        }}>
          <div style={{ gridColumn: 'span 7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Badge variant="primary" style={{ backgroundColor: 'rgba(0, 108, 79, 0.1)', color: 'var(--color-secondary)' }}>VERIFIED SALON</Badge>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                < Star size={14} fill="var(--color-primary)" color="var(--color-primary)" />
                <span>4.9 (120+ Reviews)</span>
              </div>
            </div>
            <h1 style={{ fontSize: 'var(--text-6xl)', lineHeight: '1.1', marginBottom: '24px' }}>
              {business.name.split(' ').slice(0, -1).join(' ')} <span className="serif-italic">{business.name.split(' ').slice(-1)}</span>
            </h1>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-600)', maxWidth: '500px', lineHeight: '1.6', marginBottom: '32px' }}>
              {business.description || "A curated experience focusing on editorial aesthetics and holistic wellness. Our practitioners are industry leaders committed to your well-being."}
            </p>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Button 
                variant="primary" 
                size="lg" 
                style={{ padding: '0 40px' }} 
                icon={ArrowRight}
                onClick={() => handleBookService(selectedService || services[0])}
              >
                Book Appointment
              </Button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-gray-500)' }}>
                <MapPin size={16} />
                <span>{business.address || "Addis Ababa, Ethiopia"}</span>
              </div>
            </div>
          </div>
          <div style={{ gridColumn: 'span 5' }}>
            <div style={{ 
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              aspectRatio: '4/5',
              boxShadow: 'var(--shadow-xl)'
            }}>
              <img 
                src={business.banner_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuA-0CIjBW1_m6XHOWzaGLKISFoSdVZKZ7rdCbWMTExC6hIuU7GdmqNM30dhv2tl-JRgM_tp7S-gutTTAOeCo0p1cYL10LDfT5TiDQhrHsadho4e08WBPiRMB9ODxfMYj6n91sz72C6bjHXQJk4-AiN584cnKLsc_C8P-IzQndsabLlZSu7-gVUrvAzoM2x6NZsHirl6uYykziI3vzQ05Wkm6zmH0Mz0Q8IukTfCTX5oMZXqoBNUUEeQGjmjaMWagYZzKW9yrk1UgoU"} 
                alt={business.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ 
                position: 'absolute', 
                bottom: '24px', 
                left: '24px', 
                right: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                padding: '20px',
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                   <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>Next Available</p>
                   <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Tomorrow, 10:00 AM</p>
                </div>
                <button 
                  onClick={() => handleBookService(selectedService || services[0])}
                  style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div style={{ borderBottom: '1px solid var(--surface-container-low)', display: 'flex', justifyContent: 'center', gap: '32px', position: 'sticky', top: '70px', backgroundColor: 'var(--color-white)', zIndex: 10, padding: '0 20px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                padding: '20px 0', 
                backgroundColor: 'transparent', 
                border: 'none', 
                borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-gray-400)',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '0 20px 100px' }}>
          {renderTabContent()}
        </div>

      </div>
    </PublicLayout>
  );
}
