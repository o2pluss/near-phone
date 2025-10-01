'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LocateFixedIcon } from 'lucide-react';
import { Button } from './ui/button';
import { NaverMapOptions, NaverLatLng, NaverMarkerOptions } from '../types/naver-maps';

interface MapStore {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  price?: number;
}

interface NaverMapWithSearchProps {
  stores: MapStore[];
  onStoreSelect?: (store: MapStore) => void;
  onVisibleStoresChange?: (visibleStores: MapStore[]) => void;
  onMapClick?: () => void;
  onMapStateChange?: (center: { lat: number; lng: number }, zoom: number) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

export default function NaverMapWithSearch({
  stores,
  onStoreSelect,
  onVisibleStoresChange,
  onMapClick,
  onMapStateChange,
  center = { lat: 37.5665, lng: 126.9780 },
  zoom = 10,
  className = "w-full h-96"
}: NaverMapWithSearchProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // 검색 관련 상태 제거
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>(center);

  // 네이버 지도 API 스크립트 로드
  useEffect(() => {
    const loadNaverMapScript = () => {
      if (window.naver) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || 'test';
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`;
      script.async = true;
      script.onload = () => {
        console.log('네이버 지도 API 로드 완료');
        setIsLoaded(true);
      };
      script.onerror = (error) => {
        console.error('네이버 지도 API 로드 실패:', error);
        console.log('사용된 클라이언트 ID:', clientId);
      };
      document.head.appendChild(script);
    };

    loadNaverMapScript();
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    console.log('지도 초기화 시작', { isLoaded, mapRef: mapRef.current, map });

    try {
      const mapOptions: NaverMapOptions = {
        center: new window.naver.maps.LatLng(currentLocation.lat, currentLocation.lng),
        zoom: zoom,
        mapTypeControl: false, // 지도 타입 컨트롤 숨기기 (일반/위성 버튼)
        scaleControl: false, // 스케일 컨트롤 숨기기
        logoControl: false, // 로고 컨트롤 숨기기
        mapDataControl: false, // 지도 데이터 컨트롤 숨기기
        zoomControl: false, // 줌 컨트롤 숨기기
      };

      const newMap = new window.naver.maps.Map(mapRef.current, mapOptions);
      console.log('지도 생성 완료', newMap);
      setMap(newMap);
      
      // 지도 클릭 이벤트 추가
      if (onMapClick) {
        window.naver.maps.Event.addListener(newMap, 'click', () => {
          onMapClick();
        });
      }
      
      // 지도 크기 재설정 (지도가 완전히 로드된 후)
      setTimeout(() => {
        if (newMap && window.naver) {
          window.naver.maps.Event.trigger(newMap, 'resize');
          console.log('지도 크기 재설정 완료');
        }
      }, 100);
      
      // 지도 이동/줌 이벤트 리스너 추가
      window.naver.maps.Event.addListener(newMap, 'bounds_changed', () => {
        // 지도 경계가 변경되면 매장 필터링
        setTimeout(() => {
          updateVisibleStores(newMap, stores);
        }, 500);
        
        // 지도 상태 변경 콜백 호출
        if (onMapStateChange) {
          const center = newMap.getCenter();
          const zoom = newMap.getZoom();
          onMapStateChange(
            { lat: center.lat(), lng: center.lng() },
            zoom
          );
        }
      });
      
      window.naver.maps.Event.addListener(newMap, 'zoom_changed', () => {
        // 줌 레벨이 변경되면 매장 필터링
        setTimeout(() => {
          updateVisibleStores(newMap, stores);
        }, 500);
        
        // 지도 상태 변경 콜백 호출
        if (onMapStateChange) {
          const center = newMap.getCenter();
          const zoom = newMap.getZoom();
          onMapStateChange(
            { lat: center.lat(), lng: center.lng() },
            zoom
          );
        }
      });
      
      // 초기 매장 필터링
      setTimeout(() => {
        updateVisibleStores(newMap, stores);
      }, 200);
    } catch (error) {
      console.error('지도 초기화 실패:', error);
    }
  }, [isLoaded, currentLocation.lat, currentLocation.lng, zoom, map]);

  // 지도 영역 필터링 기능 비활성화

  // 매장 마커 생성 (안정적인 좌표 사용)
  const createStoreMarkers = useCallback(() => {
    if (!map || !stores.length) return;

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null));

    const newMarkers = stores
      .filter(store => store.latitude && store.longitude)
      .map(store => {
        const position = new window.naver.maps.LatLng(store.latitude, store.longitude);
        
        // 가격을 만원 단위로 표시 (기본값 0)
        const price = store.price || 0;
        const priceText = `${Math.round(price / 10000)}만`;
        
        // 한글을 처리할 수 있도록 encodeURIComponent 사용
        const svgString = `
          <svg width="70" height="40" viewBox="0 0 70 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 말풍선 본체 -->
            <rect x="8" y="4" width="54" height="24" rx="12" fill="#3C4654" stroke="#374151" stroke-width="1"/>
            <!-- 말풍선 꼬리 (본체 밑에 깔리도록 조정) -->
            <path d="M35 25L31 29L35 33L39 29L35 25Z" fill="#3C4654" stroke="#374151" stroke-width="1"/>
            <!-- 텍스트 -->
            <text x="35" y="20" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">${priceText}</text>
          </svg>
        `;
        
        const markerOptions: NaverMarkerOptions = {
          position: position,
          map: map,
          title: store.name,
          icon: {
            url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString),
            size: new window.naver.maps.Size(70, 40),
            anchor: new window.naver.maps.Point(35, 40),
          },
          zIndex: 100
        };

        const marker = new window.naver.maps.Marker(markerOptions);

        // 마커 클릭 이벤트
        window.naver.maps.Event.addListener(marker, 'click', () => {
          if (onStoreSelect) {
            onStoreSelect(store);
          }
        });

        return marker;
      });

    setMarkers(newMarkers);
  }, [map, stores, onStoreSelect]);

  // 매장 마커 업데이트
  useEffect(() => {
    createStoreMarkers();
  }, [createStoreMarkers]);

  // 지도 영역 내의 매장 필터링 함수
  const updateVisibleStores = useCallback((mapInstance: any, storesToFilter: MapStore[]) => {
    if (!mapInstance || !storesToFilter.length || !onVisibleStoresChange) return;
    
    const bounds = mapInstance.getBounds();
    const sw = bounds.getSW(); // 남서쪽 모서리
    const ne = bounds.getNE(); // 북동쪽 모서리
    
    // 지도 중심과 줌 레벨도 확인
    const center = mapInstance.getCenter();
    const zoom = mapInstance.getZoom();
    
    // 디버깅을 위한 로그
    console.log('지도 정보:', {
      center: { lat: center.lat(), lng: center.lng() },
      zoom: zoom,
      sw: { lat: sw.lat(), lng: sw.lng() },
      ne: { lat: ne.lat(), lng: ne.lng() },
      bounds: {
        latRange: ne.lat() - sw.lat(),
        lngRange: ne.lng() - sw.lng()
      }
    });
    
    const filteredStores = storesToFilter.filter(store => {
      if (!store.latitude || !store.longitude) return false;
      
      const lat = store.latitude;
      const lng = store.longitude;
      
      // 수동 경계 확인 (여유 마진 포함)
      const margin = 0.01; // 약 1km 정도의 여유
      const isInBoundsWithMargin = lat >= (sw.lat() - margin) && lat <= (ne.lat() + margin) && 
                                  lng >= (sw.lng() - margin) && lng <= (ne.lng() + margin);
      
      // 지도 중심으로부터의 거리 기반 필터링
      const centerLat = center.lat();
      const centerLng = center.lng();
      const latRange = ne.lat() - sw.lat();
      const lngRange = ne.lng() - sw.lng();
      const maxDistance = Math.max(latRange, lngRange) * 0.8; // 지도 크기의 80%
      
      const distanceFromCenter = Math.sqrt(
        Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2)
      );
      
      const isNearCenter = distanceFromCenter <= maxDistance;
      
      // 두 조건 중 하나라도 만족하면 포함
      const shouldInclude = isInBoundsWithMargin || isNearCenter;
      
      // 디버깅을 위한 로그 (처음 3개 매장만)
      if (storesToFilter.indexOf(store) < 3) {
        console.log(`매장 ${store.name}:`, {
          lat, lng,
          isInBoundsWithMargin,
          isNearCenter,
          shouldInclude,
          distanceFromCenter: distanceFromCenter.toFixed(6),
          maxDistance: maxDistance.toFixed(6),
          swLat: sw.lat(),
          neLat: ne.lat(),
          swLng: sw.lng(),
          neLng: ne.lng()
        });
      }
      
      return shouldInclude;
    });
    
    console.log(`지도 영역 내 매장: ${filteredStores.length}개 (전체: ${storesToFilter.length}개)`);
    
    // 부모 컴포넌트에 visible stores 전달
    onVisibleStoresChange(filteredStores);
  }, [onVisibleStoresChange]);

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newCenter = new window.naver.maps.LatLng(latitude, longitude);
          map.setCenter(newCenter);
          setCurrentLocation({ lat: latitude, lng: longitude });
          
          console.log('현재 위치로 이동:', { lat: latitude, lng: longitude });
          
          // 현재 위치로 이동 후 매장 필터링
          setTimeout(() => {
            updateVisibleStores(map, stores);
          }, 500);
        },
        (error) => {
          console.error('현재 위치를 가져올 수 없습니다:', error);
          alert('현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
        }
      );
    } else {
      alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
    }
  };

  return (
    <div className={className} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 지도 영역 */}
      <div className="relative" style={{ flex: 1, height: '100%' }}>
        <div 
          ref={mapRef} 
          className="w-full" 
          style={{ height: '100%' }}
        />
        {!isLoaded && (
          <div className="flex items-center justify-center bg-gray-100" style={{ height: '100%' }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">지도를 불러오는 중...</p>
            </div>
          </div>
        )}
        
        {/* 현재 위치 버튼 */}
        {isLoaded && (
          <Button
            onClick={getCurrentLocation}
            className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-200 rounded-full p-2 h-10 w-10"
            title="현재 위치로 이동"
          >
            <LocateFixedIcon className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
