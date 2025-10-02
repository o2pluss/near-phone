import React, { useEffect, useRef, useCallback } from 'react';
import { Button } from './button';

interface InfiniteScrollProps<T> {
  items: T[];
  hasMore: boolean;
  onLoadMore: () => Promise<void> | void;
  loading: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
  
  // 표시 설정
  initialDisplayCount?: number;
  loadMoreCount?: number;
  enableInfiniteScroll?: boolean;
  
  // UI 커스터마이징
  loadMoreText?: string;
  loadingText?: string;
  noMoreText?: string;
  showProgressIndicator?: boolean;
  
  // 클래스 및 스타일
  containerClassName?: string;
  itemClassName?: string;
  
  // 키 추출 함수 (React key prop용)
  getItemKey: (item: T, index: number) => string | number;
}

export function InfiniteScroll<T>({
  items,
  hasMore,
  onLoadMore,
  loading,
  renderItem,
  initialDisplayCount = 15,
  loadMoreCount = 15,
  enableInfiniteScroll = false,
  loadMoreText = "더보기",
  loadingText = "로딩 중...",
  noMoreText = "모든 항목을 불러왔습니다",
  showProgressIndicator = true,
  containerClassName = "",
  itemClassName = "",
  getItemKey
}: InfiniteScrollProps<T>) {
  
  const [displayCount, setDisplayCount] = React.useState(
    Number.isNaN(initialDisplayCount) ? 15 : initialDisplayCount
  );
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  // 표시할 아이템들
  const displayedItems = items.slice(0, displayCount);
  const hasMoreToShow = items.length > displayCount;
  const remainingCount = items.length - displayCount;
  
  // Load More 핸들러
  const handleLoadMore = useCallback(async () => {
    if (loading) return;
    
    // 로컬에서 더 보여줄 수 있는 경우
    if (hasMoreToShow) {
      const safeLoadMoreCount = Number.isNaN(loadMoreCount) ? 15 : loadMoreCount;
      setDisplayCount(prev => Math.min(prev + safeLoadMoreCount, items.length));
      return;
    }
    
    // 서버에서 더 가져와야 하는 경우
    if (hasMore) {
      await onLoadMore();
    }
  }, [loading, hasMoreToShow, hasMore, onLoadMore, loadMoreCount, items.length]);
  
  // 무한 스크롤을 위한 Intersection Observer
  useEffect(() => {
    if (!enableInfiniteScroll || loading || (!hasMoreToShow && !hasMore)) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    
    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [enableInfiniteScroll, loading, hasMoreToShow, hasMore, handleLoadMore]);
  

  
  // 아이템 변경 시 표시 개수 조정
  useEffect(() => {
    if (items.length < displayCount) {
      setDisplayCount(items.length);
    }
  }, [items.length]);
  
  return (
    <div className={`space-y-4 ${containerClassName}`}>
      {/* 아이템 목록 */}
      <div className="space-y-3">
        {displayedItems.map((item, index) => (
          <div key={getItemKey(item, index)} className={itemClassName}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      
      {/* 무한 스크롤 센티널 */}
      {enableInfiniteScroll && (hasMoreToShow || hasMore) && (
        <div ref={sentinelRef} className="h-4 w-full" />
      )}
      
      {/* 로딩 인디케이터 */}
      {loading && (
        <div className="text-center py-4">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">{loadingText}</span>
          </div>
        </div>
      )}
      
      {/* 버튼 컨트롤들 */}
      {!enableInfiniteScroll && (hasMoreToShow || hasMore) && !loading && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={handleLoadMore}
            className="min-w-32"
          >
            {hasMoreToShow 
              ? `${remainingCount}개 ${loadMoreText}`
              : loadMoreText
            }
          </Button>
        </div>
      )}
      
      {/* 진행 상황 표시 */}
      {showProgressIndicator && items.length > (Number.isNaN(initialDisplayCount) ? 15 : initialDisplayCount) && (
        <div className="text-center text-sm text-muted-foreground">
          {displayCount}개 / {hasMore ? `${items.length}+` : items.length}개
        </div>
      )}
      
      {/* 모든 데이터 로드 완료 메시지 */}
      {!hasMore && !hasMoreToShow && items.length > 0 && (
        <div className="text-center text-sm text-muted-foreground py-2">
          {noMoreText}
        </div>
      )}
    </div>
  );
}