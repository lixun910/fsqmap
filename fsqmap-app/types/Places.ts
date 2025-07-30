export interface GeotaggingCandidateData {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  categories: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  chains?: Array<{
    id: string;
    name: string;
    logo?: string;
  }>;
  distance?: number;
  phone?: string;
  website?: string;
  rating?: number;
  price?: number;
  hours?: FoursquareHours;
  description?: string;
  email?: string;
  attributes?: FoursquareAttributes;
  photos?: Array<{
    id: string;
    url: string;
  }>;
  popularity?: number;
  verified?: boolean;
  socialMedia?: FoursquareSocialMedia;
  stats?: FoursquareStats;
  tastes?: string[];
  tips?: FoursquareTip[];
}

export interface FoursquareHoursRegular {
  close: string;
  day: number;
  open: string;
}

export interface FoursquareHours {
  display?: string;
  is_local_holiday?: boolean;
  open_now?: boolean;
  regular?: FoursquareHoursRegular[];
}

export interface FoursquareAttributes {
  restroom?: boolean;
  outdoor_seating?: boolean;
  atm?: boolean;
  has_parking?: boolean;
  wifi?: string;
  delivery?: boolean;
  reservations?: boolean;
  takes_credit_card?: boolean;
}

export interface FoursquareSocialMedia {
  facebook_id?: string;
  instagram?: string;
  twitter?: string;
}

export interface FoursquareStats {
  total_photos: number;
  total_ratings: number;
  total_tips: number;
}

export interface FoursquareTip {
  id: string;
  created_at: string;
  text: string;
  url: string;
  lang: string;
  agree_count: number;
  disagree_count: number;
}
