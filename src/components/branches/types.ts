export interface Branch {
  id: string;
  name_ar: string;
  name_en: string;
  area_ar: string;
  area_en: string;
  address_ar: string;
  address_en: string;
  works_hours: string;
  phone: string;
  email?: string;
  google_map: string;
  image?: string;
  image_url?: string;
  lat?: number;
  lng?: number;
  is_active?: boolean;
  created_at: string;
}

export type BranchFormData = {
  name_ar: string;
  name_en: string;
  address_ar: string;
  address_en: string;
  phone: string;
  email?: string;
  google_map?: string;
  lat?: number;
  lng?: number;
};
