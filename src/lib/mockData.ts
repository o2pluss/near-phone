// Mock 데이터를 메모리에 저장하는 간단한 저장소
class MockDataStore {
  private reservations: any[] = []; // 모든 예약 데이터 초기화됨

  getReservations(): any[] {
    return this.reservations;
  }

  addReservation(reservation: any): any {
    const newReservation = {
      id: `reservation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending', // 기본 상태 설정
      ...reservation,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.reservations.unshift(newReservation);
    console.log('예약 추가됨:', newReservation.id);
    return newReservation;
  }

  updateReservation(id: string, updates: any): any | null {
    console.log('예약 업데이트 시도:', id, '현재 예약들:', this.reservations.map(r => r.id));
    const index = this.reservations.findIndex(r => r.id === id);
    if (index === -1) {
      console.log('예약을 찾을 수 없음:', id);
      return null;
    }
    
    this.reservations[index] = {
      ...this.reservations[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    console.log('예약 업데이트 성공:', this.reservations[index]);
    return this.reservations[index];
  }

  deleteReservation(id: string): boolean {
    const index = this.reservations.findIndex(r => r.id === id);
    if (index === -1) return false;
    
    this.reservations.splice(index, 1);
    return true;
  }

  getReservationById(id: string): any | null {
    return this.reservations.find(r => r.id === id) || null;
  }

  clearAllReservations(): void {
    this.reservations = [];
    console.log('모든 예약 데이터가 삭제되었습니다.');
  }
}

// 전역 객체로 저장소 인스턴스 관리
declare global {
  var __mockDataStore: MockDataStore | undefined;
}

// 싱글톤 인스턴스 반환 (Next.js에서 서버 사이드 렌더링 시에도 동일한 인스턴스 사용)
export const mockDataStore = (() => {
  if (typeof globalThis !== 'undefined' && globalThis.__mockDataStore) {
    return globalThis.__mockDataStore;
  }
  
  const store = new MockDataStore();
  if (typeof globalThis !== 'undefined') {
    globalThis.__mockDataStore = store;
  }
  return store;
})();
