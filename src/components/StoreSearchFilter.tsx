import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { useForm, Controller } from 'react-hook-form';
import { Search, MapPin, Filter, Smartphone } from 'lucide-react';
import { ADDITIONAL_CONDITIONS } from '@/lib/constants';

interface SearchFormData {
  carrier: string;
  model: string;
  storage: string;
  location: string;
  distance: number[];
  minPrice: string;
  maxPrice: string;
  conditions: {
    numberPorting: boolean;
    newSubscription: boolean;
    budget: boolean;
    cardDiscount: boolean;
    bundleDiscount: boolean;
    requiredPlan: boolean;
    additionalService: boolean;
  };
}

interface StoreSearchFilterProps {
  onSearch: () => void;
}

export default function StoreSearchFilter({ onSearch }: StoreSearchFilterProps) {
  const { register, control, handleSubmit, watch, setValue } = useForm<SearchFormData>({
    defaultValues: {
      distance: [5],
      conditions: {
        numberPorting: false,
        newSubscription: false,
        budget: false,
        cardDiscount: false,
        bundleDiscount: false,
        requiredPlan: false,
        additionalService: false,
      }
    }
  });

  const distance = watch('distance');

  const onSubmit = (data: SearchFormData) => {
    console.log('Search data:', data);
    onSearch();
  };

  const carriers = [
    { value: 'kt', label: 'KT' },
    { value: 'skt', label: 'SKT' },
    { value: 'lgu', label: 'LG U+' }
  ];

  const models = [
    { value: 'iphone15', label: 'iPhone 15' },
    { value: 'iphone15pro', label: 'iPhone 15 Pro' },
    { value: 'galaxys24', label: 'Galaxy S24' },
    { value: 'galaxyz6', label: 'Galaxy Z Fold 6' },
    { value: 'galaxyflip6', label: 'Galaxy Z Flip 6' }
  ];

  const storageOptions = [
    { value: '128gb', label: '128GB' },
    { value: '256gb', label: '256GB' },
    { value: '512gb', label: '512GB' },
    { value: '1tb', label: '1TB' }
  ];

  const locations = [
    { value: 'gangnam', label: '강남구' },
    { value: 'seocho', label: '서초구' },
    { value: 'songpa', label: '송파구' },
    { value: 'jongno', label: '종로구' },
    { value: 'jung', label: '중구' }
  ];

  const conditionOptions = [
    { key: 'numberPorting', label: '번호이동' },
    { key: 'newSubscription', label: '신규 가입' },
    { key: 'budget', label: '알뜰폰' },
    ...Object.entries(ADDITIONAL_CONDITIONS).map(([key, label]) => ({
      key: key,
      label: label
    }))
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>휴대폰 검색</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 통신사 및 모델 선택 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carrier">통신사</Label>
                <Controller
                  name="carrier"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="no-border-select">
                        <SelectValue placeholder="통신사 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {carriers.map((carrier) => (
                          <SelectItem key={carrier.value} value={carrier.value}>
                            {carrier.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">모델명</Label>
                <Controller
                  name="model"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="no-border-select">
                        <SelectValue placeholder="모델 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage">용량</Label>
                <Controller
                  name="storage"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="no-border-select">
                        <SelectValue placeholder="용량 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {storageOptions.map((storage) => (
                          <SelectItem key={storage.value} value={storage.value}>
                            {storage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* 위치 및 거리 */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">위치</Label>
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="지역 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="current">현재 위치</SelectItem>
                          {locations.map((location) => (
                            <SelectItem key={location.value} value={location.value}>
                              {location.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>거리 범위: {distance[0]}km 이내</Label>
                  <Controller
                    name="distance"
                    control={control}
                    render={({ field }) => (
                      <Slider
                        value={field.value}
                        onValueChange={field.onChange}
                        max={20}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* 가격 범위 */}
            <div className="space-y-2">
              <Label>가격 범위</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="최소 가격"
                    type="number"
                    {...register('minPrice')}
                  />
                </div>
                <div>
                  <Input
                    placeholder="최대 가격"
                    type="number"
                    {...register('maxPrice')}
                  />
                </div>
              </div>
            </div>

            {/* 조건 체크박스 */}
            <div className="space-y-4">
              <Label>조건</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {conditionOptions.map((option) => (
                  <div key={option.key} className="flex items-center space-x-2">
                    <Controller
                      name={`conditions.${option.key}` as any}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id={option.key}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label
                      htmlFor={option.key}
                      className="text-sm font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 검색 버튼 */}
            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                <Search className="mr-2 h-4 w-4" />
                매장 검색
              </Button>
              <Button type="button" variant="outline" size="icon">
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 빠른 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>인기 검색</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              'iPhone 15 Pro 최저가',
              'Galaxy S24 신규',
              '알뜰폰 할인',
              '번호이동 혜택',
              'Galaxy Z Flip 6'
            ].map((tag, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  // Set predefined search values
                  if (tag.includes('iPhone 15 Pro')) {
                    setValue('model', 'iphone15pro');
                  } else if (tag.includes('Galaxy S24')) {
                    setValue('model', 'galaxys24');
                  } else if (tag.includes('Galaxy Z Flip 6')) {
                    setValue('model', 'galaxyflip6');
                  }
                  
                  if (tag.includes('신규')) {
                    setValue('conditions.newSubscription', true);
                  }
                  if (tag.includes('알뜰폰')) {
                    setValue('conditions.budget', true);
                  }
                  if (tag.includes('번호이동')) {
                    setValue('conditions.numberPorting', true);
                  }
                }}
              >
                {tag}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}