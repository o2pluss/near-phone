"use client";

import { useEffect, useRef } from "react";
import { loadKakaoMapScript } from "../../utils/kakaoMapLoader";

interface KakaoMapProps {
  appKey: string;
  width?: string;
  height?: string;
}

export default function KakaoMap({ appKey, width = "100%", height = "400px" }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadKakaoMapScript(appKey).then(() => {
      // @ts-ignore
      window.kakao.maps.load(() => {
        if (mapRef.current) {
          // @ts-ignore
          new window.kakao.maps.Map(mapRef.current, {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780),
            level: 3,
          });
        }
      });
    });
  }, [appKey]);

  return <div ref={mapRef} style={{ width, height }} />;
}
