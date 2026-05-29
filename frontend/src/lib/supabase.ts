import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  if (!supabase) {
    console.warn("Supabase client not initialized. Check your environment variables.");
    return null;
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('forsight-uploads') // User needs to ensure this bucket exists and is public
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image to Supabase:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('forsight-uploads')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadImageToSupabase:', error);
    return null;
  }
};
