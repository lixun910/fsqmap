export interface BuyHouseLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface BuyHouseCategory {
  id: string;
  name: string;
  icon: string;
}

export interface BuyHousePlace {
  id: string;
  name: string;
  location: BuyHouseLocation;
  categories: BuyHouseCategory[];
  distance: number;
  phone?: string;
  website?: string;
  category: string;
  color: string;
}

export interface BuyHousePolygon {
  id: string;
  coordinates: [number, number][];
  category: string;
  color: string;
  opacity: number;
}

export interface BuyHouseData {
  type: 'geojson';
  content: {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      id: string;
      geometry: {
        type: 'Point' | 'Polygon';
        coordinates: [number, number] | [number, number][][];
      };
      properties: {
        id?: string;
        name?: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
        categories?: BuyHouseCategory[];
        distance?: number;
        phone?: string;
        website?: string;
        category: string;
        color: string;
        opacity?: number;
        [key: string]: any;
      };
    }>;
  };
}

export interface BuyHouseResultProps {
  data: BuyHouseData | any;
  onPlaceSelect?: (place: BuyHousePlace) => void;
  isLoading?: boolean;
  redfinUrl?: string;
  redfinDescription?: string;
  houseThumbnail?: string;
} 