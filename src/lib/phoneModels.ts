export interface PhoneModel {
  id: string;
  name: string;
  brand: "samsung" | "apple";
  image: string;
  isFavorite?: boolean;
}

// 전역 상태로 관리되는 휴대폰 모델 목록
let phoneModelsData: PhoneModel[] = [
  {
    id: "galaxy-z-fold7",
    name: "갤럭시 Z 폴드7",
    brand: "samsung",
    image:
      "https://images.unsplash.com/photo-1695048132790-baebe5b7e975?w=300&h=200&fit=crop",
    isFavorite: false,
  },
  {
    id: "galaxy-z-flip7",
    name: "갤럭시 Z 플립7",
    brand: "samsung",
    image:
      "https://images.unsplash.com/photo-1695048132790-baebe5b7e975?w=300&h=200&fit=crop",
    isFavorite: false,
  },
  {
    id: "galaxy-s25-ultra",
    name: "갤럭시 S25 엣지",
    brand: "samsung",
    image:
      "https://images.unsplash.com/photo-1695048132790-baebe5b7e975?w=300&h=200&fit=crop",
    isFavorite: false,
  },
  {
    id: "galaxy-s25-ultra-2",
    name: "갤럭시 S25 울트라",
    brand: "samsung",
    image:
      "https://images.unsplash.com/photo-1695048132790-baebe5b7e975?w=300&h=200&fit=crop",
    isFavorite: true,
  },
  {
    id: "galaxy-s25-plus",
    name: "갤럭시 S25 플러스",
    brand: "samsung",
    image:
      "https://images.unsplash.com/photo-1695048132790-baebe5b7e975?w=300&h=200&fit=crop",
    isFavorite: false,
  },
  {
    id: "galaxy-s25",
    name: "갤럭시 S25",
    brand: "samsung",
    image:
      "https://images.unsplash.com/photo-1695048132790-baebe5b7e975?w=300&h=200&fit=crop",
    isFavorite: true,
  },
  {
    id: "galaxy-z-fold6",
    name: "갤럭시 Z 폴드6",
    brand: "samsung",
    image:
      "https://images.unsplash.com/photo-1695048132790-baebe5b7e975?w=300&h=200&fit=crop",
    isFavorite: false,
  },
  {
    id: "galaxy-z-flip6",
    name: "갤럭시 Z 플립6",
    brand: "samsung",
    image:
      "https://images.unsplash.com/photo-1695048132790-baebe5b7e975?w=300&h=200&fit=crop",
    isFavorite: false,
  },
  {
    id: "iphone-16-pro-max",
    name: "iPhone 16 Pro Max",
    brand: "apple",
    image:
      "https://images.unsplash.com/photo-1702289613007-8b830e2520b0?w=300&h=200&fit=crop",
    isFavorite: false,
  },
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro",
    brand: "apple",
    image:
      "https://images.unsplash.com/photo-1702289613007-8b830e2520b0?w=300&h=200&fit=crop",
    isFavorite: true,
  },
  {
    id: "iphone-16-plus",
    name: "iPhone 16 Plus",
    brand: "apple",
    image:
      "https://images.unsplash.com/photo-1702289613007-8b830e2520b0?w=300&h=200&fit=crop",
    isFavorite: false,
  },
  {
    id: "iphone-16",
    name: "iPhone 16",
    brand: "apple",
    image:
      "https://images.unsplash.com/photo-1702289613007-8b830e2520b0?w=300&h=200&fit=crop",
    isFavorite: true,
  },
];

export const getPhoneModels = (): PhoneModel[] => {
  return phoneModelsData;
};

export const updatePhoneModel = (modelId: string, updates: Partial<PhoneModel>) => {
  phoneModelsData = phoneModelsData.map(model => 
    model.id === modelId 
      ? { ...model, ...updates }
      : model
  );
};

export const getFavoriteModels = (): PhoneModel[] => {
  return phoneModelsData.filter(model => model.isFavorite);
};