import type { Routine } from '$lib/data/types';
import { supabase } from '$lib/supabase';

export async function shareRoutine(routine: Routine): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('shared_routines')
      .insert({ data: routine })
      .select('id')
      .single();

    if (error || !data) return '';
    return `${window.location.origin}/#r=${data.id}`;
  } catch {
    return '';
  }
}

export async function fetchSharedRoutine(code: string): Promise<Routine | null> {
  try {
    const { data, error } = await supabase
      .from('shared_routines')
      .select('data')
      .eq('id', code)
      .single();

    if (error || !data) return null;
    return data.data as Routine;
  } catch {
    return null;
  }
}
