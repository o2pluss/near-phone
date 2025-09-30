import { useRef, useEffect, useState } from 'react';

// Mock Kakao Maps API for development
const mockKakaoMaps = {
  Map: class {
    constructor(container: HTMLElement, options: any) {
      this.container = container;
      this.options = options;
      this.center = options.center;
      this.level = options.level;
    }
    
    setCenter(center: any) {
      this.center = center;
    }
    
    setLevel(level: number) {
      this.level = level;
    }
  },
  
  LatLng: class {
    constructor(lat: number, lng: number) {
      this.lat = lat;
      this.lng = lng;
    }
  },
  
  Marker: class {
    constructor(options: any) {
      this.position = options.position;
      this.map = options.map;
    }
  },
  
  event: {
    addListener: (marker: any, event: string, callback: Function) => {
      // Mock event listener
      console.log(`Mock event listener added for ${event}`);
    }
  },
  
  services: {
    Geocoder: class {
      addressSearch(address: string, callback: Function) {
        // Mock geocoding - return Seoul coordinates
        setTimeout(() => {
          callback([{
            y: '37.5665',
            x: '126.9780',
            address_name: address
          }], 'OK');
        }, 100);
      }
    },
    Status: {
      OK: 'OK'
    }
  }
};

// Global type declarations
declare global {
  interface Window {
    kakao: any;
  }
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
    constructor(container: HTMLElement, options: any) {
      this.container = container;
      this.options = options;
      this.center = options.center;
      this.level = options.level;
    }
    
    setCenter(center: any) {
      this.center = center;
    }
    
    setLevel(level: number) {
      this.level = level;
    }
  },
  
  LatLng: class {
    constructor(lat: number, lng: number) {
      this.lat = lat;
      this.lng = lng;
    }
  },
  
  Marker: class {
    constructor(options: any) {
      this.position = options.position;
      this.map = options.map;
    }
  },
  
  event: {
    addListener: (marker: any, event: string, callback: Function) => {
      // Mock event listener
      console.log(`Mock event listener added for ${event}`);
    }
  },
  
  services: {
    Geocoder: class {
      addressSearch(address: string, callback: Function) {
        // Mock geocoding - return Seoul coordinates
        setTimeout(() => {
          callback([{
            y: '37.5665',
            x: '126.9780',
            address_name: address
          }], 'OK');
        }, 100);
      }
    },
    Status: {
      OK: 'OK'
    }
  }
};

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
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    setError(null);

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
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
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
