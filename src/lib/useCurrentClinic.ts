import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export function useCurrentClinic() {
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinicSlug, setClinicSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClinic() {
      if (!supabase) {
        setClinicId('demo-clinic-id');
        setClinicSlug('hotivet');
        setLoading(false);
        return;
      }

      const { data, error: err } = await supabase.from('clinics').select('id, slug').limit(1).maybeSingle();
      if (err) {
        setClinicId('demo-clinic-id');
        setClinicSlug('hotivet');
        setLoading(false);
        return;
      }

      if (data) {
        setClinicId(data.id);
        setClinicSlug(data.slug);
      } else {
        const { data: newClinic } = await supabase
          .from('clinics')
          .insert({ name: 'HotiVet Animal Hospital', slug: 'hotivet', timezone: 'America/New_York' })
          .select('id, slug')
          .single();
        if (newClinic) {
          setClinicId(newClinic.id);
          setClinicSlug(newClinic.slug);
        } else {
          setClinicId('demo-clinic-id');
          setClinicSlug('hotivet');
        }
      }
      setLoading(false);
    }
    loadClinic();
  }, []);

  return { clinicId, clinicSlug, loading, error };
}
