import type { Reservation } from "../types/reservation";

export const mockReservations: Reservation[] = [
  {
    id: "1",
    storeId: "1",
    storeName: "강남 휴대폰 매장",
    storeAddress: "서울시 강남구 역삼동 123-45",
    storePhone: "02-1234-5678",
    date: "2024-01-20",
    time: "14:30",
    model: "iPhone 15 Pro",
    price: 1200000,
    status: "confirmed",
    createdAt: "2024-01-18T10:30:00",
    conditions: ["번호이동", "기기변경"],
    productCarrier: "kt",
    storage: "128GB",
    productSnapshot: {
      id: "prod-1",
      name: "iPhone 15 Pro",
      model: "iPhone 15 Pro",
      storage: "128GB",
      price: 1200000,
      carrier: "kt",
      conditions: ["번호이동", "기기변경"],
      isDeleted: false
    },
    storeSnapshot: {
      id: "1",
      name: "강남 휴대폰 매장",
      address: "서울시 강남구 역삼동 123-45",
      phone: "02-1234-5678"
    }
  },
  {
    id: "2",
    storeId: "2",
    storeName: "서초 모바일 센터",
    storeAddress: "서울시 서초구 서초동 456-78",
    storePhone: "02-2345-6789",
    date: "2024-01-22",
    time: "11:00",
    model: "Galaxy S24 Ultra",
    price: 980000,
    status: "pending",
    createdAt: "2024-01-19T15:20:00",
    conditions: ["신규가입", "결합할인"],
    productCarrier: "skt",
    storage: "256GB",
    productSnapshot: {
      id: "prod-2",
      name: "Galaxy S24 Ultra",
      model: "Galaxy S24 Ultra",
      storage: "256GB",
      price: 980000,
      carrier: "skt",
      conditions: ["신규가입", "결합할인"],
      isDeleted: false
    },
    storeSnapshot: {
      id: "2",
      name: "서초 모바일 센터",
      address: "서울시 서초구 서초동 456-78",
      phone: "02-2345-6789"
    }
  },
  {
    id: "3",
    storeId: "3",
    storeName: "논현 통신",
    storeAddress: "서울시 강남구 논현동 789-12",
    storePhone: "02-3456-7890",
    date: "2024-01-15",
    time: "16:00",
    model: "iPhone 15",
    price: 950000,
    status: "completed",
    createdAt: "2024-01-12T09:15:00",
    conditions: ["번호이동", "기기변경"],
    productCarrier: "lgu",
    storage: "64GB",
    productSnapshot: {
      id: "prod-3",
      name: "iPhone 15",
      model: "iPhone 15",
      storage: "64GB",
      price: 950000,
      carrier: "lgu",
      conditions: ["번호이동", "기기변경"],
      isDeleted: true, // 삭제된 상품 예시
      deletedAt: "2024-01-18T10:00:00"
    },
    storeSnapshot: {
      id: "3",
      name: "논현 통신",
      address: "서울시 강남구 논현동 789-12",
      phone: "02-3456-7890"
    }
  },
  {
    id: "4",
    storeId: "4",
    storeName: "역삼 스마트폰 프라자",
    storeAddress: "서울시 강남구 역삼동 987-65",
    storePhone: "02-4567-8901",
    date: "2024-01-20",
    time: "10:30",
    model: "Galaxy Z Flip 6",
    price: 1100000,
    status: "cancelled",
    createdAt: "2024-01-14T14:45:00",
    conditions: ["번호이동", "카드할인", "결합할인"],
    productCarrier: "kt",
    storage: "128GB",
    productSnapshot: {
      id: "prod-4",
      name: "Galaxy Z Flip 6",
      model: "Galaxy Z Flip 6",
      storage: "128GB",
      price: 1100000,
      carrier: "kt",
      conditions: ["번호이동", "카드할인", "결합할인"],
      isDeleted: false
    },
    storeSnapshot: {
      id: "4",
      name: "역삼 스마트폰 프라자",
      address: "서울시 강남구 역삼동 987-65",
      phone: "02-4567-8901"
    }
  },
  {
    id: "5",
    storeId: "5",
    storeName: "홍대 모바일 플러스",
    storeAddress: "서울시 마포구 홍대입구 234-56",
    storePhone: "02-5678-9012",
    date: "2024-01-25",
    time: "15:00",
    model: "iPhone 15 Pro Max",
    price: 1350000,
    status: "cancel_pending",
    createdAt: "2024-01-20T11:15:00",
    conditions: ["번호이동", "기기변경", "카드할인"],
    productCarrier: "kt",
    storage: "256GB",
    productSnapshot: {
      id: "prod-5",
      name: "iPhone 15 Pro Max",
      model: "iPhone 15 Pro Max",
      storage: "256GB",
      price: 1350000,
      carrier: "kt",
      conditions: ["번호이동", "기기변경", "카드할인"],
      isDeleted: true, // 삭제된 상품 예시
      deletedAt: "2024-01-23T09:00:00"
    },
    storeSnapshot: {
      id: "5",
      name: "홍대 모바일 플러스",
      address: "서울시 마포구 홍대입구 234-56",
      phone: "02-5678-9012"
    }
  },
];