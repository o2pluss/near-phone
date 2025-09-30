'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NaverMapOptions, NaverLatLng, NaverMarkerOptions } from '../types/naver-maps';

interface Store {
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

interface NaverMapProps {
  stores: Store[];
  onStoreSelect?: (store: Store) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

export default function NaverMap({
  stores,
  onStoreSelect,
  center = { lat: 37.5665, lng: 126.9780 }, // 서울 중심
  zoom = 10,
  className = "w-full h-96"
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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
        center: new window.naver.maps.LatLng(center.lat, center.lng),
        zoom: zoom,
        mapTypeControl: true,
        scaleControl: true,
        logoControl: true,
        mapDataControl: true,
        zoomControl: true,
      };

      const newMap = new window.naver.maps.Map(mapRef.current, mapOptions);
      console.log('지도 생성 완료', newMap);
      setMap(newMap);
      
      // 지도 크기 재설정 (지도가 완전히 로드된 후)
      setTimeout(() => {
        if (newMap && window.naver) {
          window.naver.maps.Event.trigger(newMap, 'resize');
          console.log('지도 크기 재설정 완료');
        }
      }, 100);
    } catch (error) {
      console.error('지도 초기화 실패:', error);
    }
  }, [isLoaded, center.lat, center.lng, zoom, map]);

  // 매장 마커 생성
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
            <rect x="8" y="4" width="54" height="24" rx="12" fill="#3C4654" stroke="white" stroke-width="1"/>
            <!-- 말풍선 꼬리 (본체 밑에 깔리도록 조정) -->
            <path d="M35 25L31 29L35 33L39 29L35 25Z" fill="#3C4654"/>
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

  // 지도 중심점 업데이트
  useEffect(() => {
    if (!map) return;
    
    const newCenter = new window.naver.maps.LatLng(center.lat, center.lng);
    map.setCenter(newCenter);
  }, [map, center.lat, center.lng]);

  return (
    <div className={className} style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
      <div 
        ref={mapRef} 
        className="w-full rounded-lg" 
        style={{ height: '100%', minHeight: '400px', flex: 1 }}
      />
      {!isLoaded && (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height: '100%', minHeight: '400px', flex: 1 }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}
