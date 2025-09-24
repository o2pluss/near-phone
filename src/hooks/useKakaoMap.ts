import { useEffect, useRef, useState } from 'react';

// Kakao Map types (simplified)
interface KakaoMap {
  setCenter: (position: any) => void;
  setLevel: (level: number) => void;
  addOverlayMapTypeId: (type: any) => void;
  removeOverlayMapTypeId: (type: any) => void;
}

interface KakaoMarker {
  setMap: (map: KakaoMap | null) => void;
  setPosition: (position: any) => void;
}

interface KakaoLatLng {
  getLat: () => number;
  getLng: () => number;
}

interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  price: number;
}

// Mock Kakao Maps API
const mockKakaoMaps = {
  Map: class {
    private container: HTMLElement;
    private options: any;
    
    constructor(container: HTMLElement, options: any) {
      this.container = container;
      this.options = options;
      
      // Style the container to look like a map
      container.style.backgroundColor = '#f0f0f0';
      container.style.background = 'linear-gradient(45deg, #e3f2fd 25%, transparent 25%), linear-gradient(-45deg, #e3f2fd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e3f2fd 75%), linear-gradient(-45deg, transparent 75%, #e3f2fd 75%)';
      container.style.backgroundSize = '20px 20px';
      container.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
    }
    
    setCenter(position: any) {
      console.log('Map center set to:', position);
    }
    
    setLevel(level: number) {
      console.log('Map level set to:', level);
    }
    
    addOverlayMapTypeId(type: any) {
      console.log('Overlay added:', type);
    }
    
    removeOverlayMapTypeId(type: any) {
      console.log('Overlay removed:', type);
    }
  },
  
  Marker: class {
    private options: any;
    
    constructor(options: any) {
      this.options = options;
    }
    
    setMap(map: any) {
      if (map) {
        console.log('Marker added to map');
      } else {
        console.log('Marker removed from map');
      }
    }
    
    setPosition(position: any) {
      console.log('Marker position set to:', position);
    }
  },
  
  LatLng: class {
    private lat: number;
    private lng: number;
    
    constructor(lat: number, lng: number) {
      this.lat = lat;
      this.lng = lng;
    }
    
    getLat() { return this.lat; }
    getLng() { return this.lng; }
  },
  
  services: {
    Geocoder: class {
      addressSearch(address: string, callback: (result: any[], status: string) => void) {
        // Mock geocoding
        setTimeout(() => {
          const mockResult = [{
            address_name: address,
            x: '127.027583',
            y: '37.497928'
          }];
          callback(mockResult, 'OK');
        }, 500);
      }
    },
    
    Status: {
      OK: 'OK',
      ZERO_RESULT: 'ZERO_RESULT',
      ERROR: 'ERROR'
    }
  },
  
  event: {
    addListener: (target: any, type: string, handler: Function) => {
      console.log(`Event listener added: ${type}`);
      // Mock event handling
      if (type === 'click') {
        // Simulate click after a delay
        setTimeout(() => {
          handler({
            latLng: new mockKakaoMaps.LatLng(37.497928, 127.027583)
          });
        }, 1000);
      }
    }
  }
};

// Global kakao object mock
declare global {
  interface Window {
    kakao: {
      maps: typeof mockKakaoMaps;
    };
  }
}

export const useKakaoMap = (containerId: string) => {
  const mapRef = useRef<KakaoMap | null>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Kakao Maps API script
    const loadKakaoMaps = () => {
      // In real implementation, you would load the actual Kakao Maps script
      // const script = document.createElement('script');
      // script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`;
      // script.onload = () => {
      //   window.kakao.maps.load(() => {
      //     initializeMap();
      //   });
      // };
      // document.head.appendChild(script);

      // Mock implementation
      if (!window.kakao) {
        window.kakao = { maps: mockKakaoMaps };
      }
      
      setTimeout(() => {
        initializeMap();
      }, 100);
    };

    const initializeMap = () => {
      const container = document.getElementById(containerId);
      if (!container) return;

      const options = {
        center: new window.kakao.maps.LatLng(37.497928, 127.027583), // 강남역 좌표
        level: 3
      };

      const map = new window.kakao.maps.Map(container, options);
      mapRef.current = map as any;
      setIsLoaded(true);
    };

    loadKakaoMaps();

    return () => {
      // Cleanup
      clearMarkers();
    };
  }, [containerId]);

  const addMarker = (store: Store) => {
    if (!mapRef.current) return;

    const position = new window.kakao.maps.LatLng(store.lat, store.lng);
    const marker = new window.kakao.maps.Marker({
      position,
      map: mapRef.current
    });

    // Add click event to marker
    window.kakao.maps.event.addListener(marker, 'click', () => {
      console.log('Store marker clicked:', store.name);
      // You can emit an event or call a callback here
    });

    markersRef.current.push(marker as any);
  };

  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];
  };

  const addStoreMarkers = (stores: Store[]) => {
    clearMarkers();
    stores.forEach(store => {
      addMarker(store);
    });
  };

  const setCenter = (lat: number, lng: number) => {
    if (!mapRef.current) return;
    
    const position = new window.kakao.maps.LatLng(lat, lng);
    mapRef.current.setCenter(position);
  };

  const setLevel = (level: number) => {
    if (!mapRef.current) return;
    
    mapRef.current.setLevel(level);
  };

  const geocodeAddress = (address: string): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      
      geocoder.addressSearch(address, (result: any[], status: string) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          resolve({
            lat: parseFloat(result[0].y),
            lng: parseFloat(result[0].x)
          });
        } else {
          resolve(null);
        }
      });
    });
  };

  return {
    map: mapRef.current,
    isLoaded,
    addMarker,
    clearMarkers,
    addStoreMarkers,
    setCenter,
    setLevel,
    geocodeAddress
  };
};

// Hook for getting user's current location
export const useCurrentLocation = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
        
        // Fallback to default location (강남역)
        setLocation({
          lat: 37.497928,
          lng: 127.027583
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return {
    location,
    error,
    loading,
    getCurrentLocation
  };
};