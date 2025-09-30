'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddressResult {
  address: string;
  roadAddress: string;
  jibunAddress: string;
  latitude: number;
  longitude: number;
}

interface AddressSearchProps {
  value: string;
  onAddressSelect: (address: string, latitude: number, longitude: number) => void;
  placeholder?: string;
  className?: string;
}

export default function AddressSearch({
  value,
  onAddressSelect,
  placeholder = "주소를 검색하세요",
  className = ""
}: AddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [searchResults, setSearchResults] = useState<AddressResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 네이버 지도 API 스크립트 로드
  useEffect(() => {
    const loadNaverMapScript = () => {
      if (window.naver && window.naver.maps && window.naver.maps.Service) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || 'test';
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`;
      script.async = true;
      script.onload = () => {
        console.log('네이버 지도 API 로드 완료');
        // geocoder 모듈이 로드될 때까지 잠시 대기
        setTimeout(() => {
          if (window.naver && window.naver.maps && window.naver.maps.Service) {
            setIsLoaded(true);
          } else {
            setError('지도 API 로드에 실패했습니다.');
          }
        }, 100);
      };
      script.onerror = (error) => {
        console.error('네이버 지도 API 로드 실패:', error);
        setError('지도 API를 불러올 수 없습니다.');
      };
      document.head.appendChild(script);
    };

    loadNaverMapScript();
  }, []);

  // 검색 실행
  const searchAddress = async (query: string) => {
    if (!query.trim() || !isLoaded || !window.naver || !window.naver.maps || !window.naver.maps.Service) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // 네이버 지도 API v3의 geocoder 사용
      window.naver.maps.Service.geocode({
        query: query,
        count: 10
      }, (status: any, response: any) => {
        setIsSearching(false);
        
        console.log('Geocoder 응답:', { status, response });
        
        if (status === window.naver.maps.Service.Status.OK) {
          // 네이버 지도 API v3의 올바른 응답 구조 처리
          const result = response.v2; // 검색 결과의 컨테이너
          const items = result.addresses; // 검색 결과의 배열
          
          if (!items || items.length === 0) {
            setError('검색 결과가 없습니다.');
            setSearchResults([]);
            return;
          }
          
          const results: AddressResult[] = items.map((item: any) => ({
            address: item.roadAddress || item.jibunAddress || '',
            roadAddress: item.roadAddress || '',
            jibunAddress: item.jibunAddress || '',
            latitude: parseFloat(item.y || 0),
            longitude: parseFloat(item.x || 0)
          }));
          
          setSearchResults(results);
          setShowResults(true);
        } else {
          console.error('주소 검색 실패:', status);
          setError('주소를 찾을 수 없습니다.');
          setSearchResults([]);
        }
      });
    } catch (err) {
      console.error('주소 검색 오류:', err);
      setError('주소 검색 중 오류가 발생했습니다.');
      setIsSearching(false);
    }
  };

  // 입력값 변경 핸들러 (디바운싱 적용)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // 기존 타이머 클리어
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // 500ms 후에 검색 실행
    searchTimeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        searchAddress(query);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);
  };

  // 주소 선택 핸들러
  const handleAddressSelect = (result: AddressResult) => {
    setSearchQuery(result.address);
    setShowResults(false);
    onAddressSelect(result.address, result.latitude, result.longitude);
  };

  // 검색 결과 닫기
  const handleCloseResults = () => {
    setShowResults(false);
  };

  // 검색 버튼 클릭
  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      searchAddress(searchQuery);
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        searchAddress(searchQuery);
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  // 외부 클릭 시 결과 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.address-search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`address-search-container relative ${className}`}>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="pl-10 pr-20"
            disabled={!isLoaded}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
            {isSearching && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowResults(false);
                }}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSearchClick}
              disabled={!isLoaded || !searchQuery.trim() || isSearching}
              className="h-6 w-6 p-0"
            >
              <Search className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* 검색 결과 */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-gray-100 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">검색 결과</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCloseResults}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="py-1">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAddressSelect(result)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {result.address}
                      </div>
                      {result.roadAddress && result.roadAddress !== result.address && (
                        <div className="text-xs text-gray-500 truncate">
                          도로명: {result.roadAddress}
                        </div>
                      )}
                      {result.jibunAddress && result.jibunAddress !== result.address && (
                        <div className="text-xs text-gray-500 truncate">
                          지번: {result.jibunAddress}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <Alert className="mt-2" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 로딩 상태 */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-50 rounded-md flex items-center justify-center">
            <div className="text-sm text-gray-500">지도 API 로딩 중...</div>
          </div>
        )}
      </div>
    </div>
  );
}
