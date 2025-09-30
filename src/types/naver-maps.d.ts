// 네이버 지도 API 타입 정의
declare global {
  interface Window {
    naver: {
      maps: {
        Map: any;
        LatLng: any;
        Marker: any;
        Size: any;
        Point: any;
        Event: any;
        Service: {
          geocode: (options: any, callback: (status: any, response: any) => void) => void;
          Status: {
            OK: string;
            ERROR: string;
          };
        };
      };
    };
  }
}

export interface NaverMapOptions {
  center: NaverLatLng;
  zoom: number;
  mapTypeId?: string;
  mapTypeControl?: boolean;
  scaleControl?: boolean;
  logoControl?: boolean;
  mapDataControl?: boolean;
  zoomControl?: boolean;
  minZoom?: number;
  maxZoom?: number;
}

export interface NaverLatLng {
  lat(): number;
  lng(): number;
}

export interface NaverMarkerOptions {
  position: NaverLatLng;
  map?: any;
  title?: string;
  icon?: {
    url: string;
    size?: NaverSize;
    anchor?: NaverPoint;
    origin?: NaverPoint;
  };
  zIndex?: number;
}

export interface NaverSize {
  width: number;
  height: number;
}

export interface NaverPoint {
  x: number;
  y: number;
}

export interface NaverGeocoderResult {
  v2: {
    addresses: Array<{
      x: string;
      y: string;
      address: string;
      roadAddress: string;
    }>;
  };
}

export interface NaverGeocoderOptions {
  query: string;
  coordinate?: string;
  filter?: string;
  page?: number;
  count?: number;
}

export {};
