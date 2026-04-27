import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  MapPin,
  Phone,
  Image as ImageIcon,
  Clock3,
  CreditCard,
  Loader2,
  Store,
  Eye,
  CheckCircle2,
} from 'lucide-react';

type ProfileForm = {
  name: string;
  description: string;
  phone: string;
  city: string;
  address: string;
  bannerUrl: string;
  logoUrl: string;
  workingHours: string;
  paymentOptions: string;
};

function toAddressText(address: unknown) {
  if (!address) return '';
  if (typeof address === 'string') return address;
  if (typeof address === 'object') return JSON.stringify(address);
  return String(address);
}

function buildInitialForm(business: any): ProfileForm {
  const settings = business?.settings || {};
  return {
    name: business?.name || '',
    description: business?.description || '',
    phone: business?.phone || settings.phone || '',
    city: business?.city || settings.city || '',
    address: toAddressText(business?.address || settings.address),
    bannerUrl: business?.banner_url || settings.banner_url || '',
    logoUrl: business?.logo_url || settings.logo_url || '',
    workingHours: settings.working_hours || 'Mon - Sat, 9:00 AM - 8:00 PM',
    paymentOptions: settings.payment_options || 'Cash, Transfer + Screenshot',
  };
}

export default function StorefrontSettings() {
  const { business, loading: authLoading } = useAuth();
  const [form, setForm] = useState<ProfileForm>(() => buildInitialForm(business));
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    setForm(buildInitialForm(business));
  }, [business]);

  const completeness = useMemo(() => {
    const fields = [
      form.name,
      form.description,
      form.phone,
      form.city,
      form.address,
      form.workingHours,
      form.paymentOptions,
    ];
    const complete = fields.filter((value) => value.trim().length > 0).length;
    return Math.round((complete / fields.length) * 100);
  }, [form]);

  function updateField<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaveMessage('');
  }

  async function saveProfile() {
    if (!business?.id) return;
    setSaving(true);
    setSaveMessage('');

    const nextSettings = {
      ...(business?.settings || {}),
      phone: form.phone,
      city: form.city,
      address: form.address,
      banner_url: form.bannerUrl,
      logo_url: form.logoUrl,
      working_hours: form.workingHours,
      payment_options: form.paymentOptions,
    };

    const payload: Record<string, any> = {};
    const businessKeys = business ? new Set(Object.keys(business)) : new Set<string>();

    if (businessKeys.has('name')) payload.name = form.name;
    if (businessKeys.has('description')) payload.description = form.description;
    if (businessKeys.has('phone')) payload.phone = form.phone;
    if (businessKeys.has('city')) payload.city = form.city;
    if (businessKeys.has('banner_url')) payload.banner_url = form.bannerUrl;
    if (businessKeys.has('logo_url')) payload.logo_url = form.logoUrl;
    if (businessKeys.has('address')) payload.address = form.address;
    if (businessKeys.has('settings')) payload.settings = nextSettings;

    const { error } = await supabase
      .from('shops')
      .update(payload)
      .eq('id', business.id);

    setSaving(false);
    setSaveMessage(error ? 'Could not save profile right now.' : 'Profile saved for Phase 1.');
  }

  if (authLoading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(320px, 0.8fr)', gap: 'var(--space-8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <div>
            <Badge variant="primary" style={{ marginBottom: 'var(--space-4)' }}>Phase 1 Shop Profile</Badge>
            <h2 className="serif-italic" style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-3)' }}>Public storefront basics</h2>
            <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-lg)' }}>
              Keep this page focused on the owner essentials customers need right now: name, about, contact, location, hours, and payment options.
            </p>
          </div>

          <div className="card" style={{ padding: 'var(--space-8)', display: 'grid', gap: 'var(--space-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="eyebrow">Shop Name</span>
                <input className="form-input" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="eyebrow">City</span>
                <input className="form-input" value={form.city} onChange={(e) => updateField('city', e.target.value)} />
              </label>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="eyebrow">About Shop</span>
              <textarea
                className="form-input"
                rows={5}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="eyebrow">Phone</span>
                <input className="form-input" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="eyebrow">Working Hours</span>
                <input className="form-input" value={form.workingHours} onChange={(e) => updateField('workingHours', e.target.value)} />
              </label>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="eyebrow">Address</span>
              <input className="form-input" value={form.address} onChange={(e) => updateField('address', e.target.value)} />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="eyebrow">Cover Image URL</span>
                <input className="form-input" value={form.bannerUrl} onChange={(e) => updateField('bannerUrl', e.target.value)} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="eyebrow">Logo Image URL</span>
                <input className="form-input" value={form.logoUrl} onChange={(e) => updateField('logoUrl', e.target.value)} />
              </label>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="eyebrow">Payment Options</span>
              <input className="form-input" value={form.paymentOptions} onChange={(e) => updateField('paymentOptions', e.target.value)} />
            </label>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: saveMessage.includes('saved') ? 'var(--color-secondary)' : 'var(--color-gray-500)' }}>
                {saveMessage.includes('saved') ? <CheckCircle2 size={16} /> : null}
                <span style={{ fontSize: '13px' }}>{saveMessage || 'Save changes whenever the public basics are ready.'}</span>
              </div>
              <Button variant="primary" onClick={saveProfile} isLoading={saving}>Save Profile</Button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <Eye size={18} color="var(--color-primary)" />
              <p className="eyebrow" style={{ marginBottom: 0 }}>Customer Preview</p>
            </div>
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', backgroundColor: 'var(--surface-container-low)' }}>
              <div style={{ aspectRatio: '4 / 3', backgroundColor: 'var(--surface-container)', position: 'relative' }}>
                {form.bannerUrl ? (
                  <img src={form.bannerUrl} alt={form.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gray-400)' }}>
                    <ImageIcon size={40} />
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: '18px', padding: '14px 16px' }}>
                  <p className="eyebrow" style={{ marginBottom: '6px' }}>{form.city || 'City'} • Shop</p>
                  <h3 className="serif-italic" style={{ fontSize: 'var(--text-2xl)', marginBottom: '6px' }}>{form.name || 'Your Shop Name'}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-gray-600)', lineHeight: '1.6' }}>
                    {form.description || 'Your storefront intro appears here.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p className="eyebrow">Profile Completeness</p>
            <h3>{completeness}%</h3>
            <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--surface-container-low)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${completeness}%`, height: '100%', backgroundColor: 'var(--color-primary)' }}></div>
            </div>
            <p style={{ color: 'var(--color-gray-600)', lineHeight: '1.6' }}>
              Phase 1 completeness is about trust: clear description, reachable contact info, location, hours, and payment expectations.
            </p>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p className="eyebrow">What Customers Need</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Store size={16} color="var(--color-primary)" /><span>Clear shop identity and short intro</span></div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><MapPin size={16} color="var(--color-primary)" /><span>Easy-to-read location details</span></div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Clock3 size={16} color="var(--color-primary)" /><span>Working hours before booking</span></div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Phone size={16} color="var(--color-primary)" /><span>Contact method when they need help</span></div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><CreditCard size={16} color="var(--color-primary)" /><span>Cash and transfer expectations</span></div>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
