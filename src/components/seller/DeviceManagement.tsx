"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { useForm } from 'react-hook-form';
import { 
  Smartphone, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  X,
  Search,
  Filter,
  Image as ImageIcon
} from 'lucide-react';

interface DeviceModel {
  id: string;
  carrier: string;
  manufacturer: string;
  model: string;
  imageUrl?: string;
  createdAt: string;
}

const mockDeviceModels: DeviceModel[] = [
  {
    id: '1',
    carrier: 'KT',
    manufacturer: 'Apple',
    model: 'iPhone 15 Pro',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    carrier: 'SKT',
    manufacturer: 'Samsung',
    model: 'Galaxy S24 Ultra',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    carrier: 'LG U+',
    manufacturer: 'Samsung',
    model: 'Galaxy S24',
    createdAt: '2024-01-05'
  }
];

const carriers = ['KT', 'SKT', 'LG U+', '기타'];
const manufacturers = ['Apple', 'Samsung', 'LG', 'Google', 'OnePlus', '기타'];

export default function DeviceManagement() {
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>(mockDeviceModels);
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceModel | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const deviceForm = useForm<Omit<DeviceModel, 'id' | 'createdAt'>>({
    defaultValues: {
      carrier: '',
      manufacturer: '',
      model: '',
      imageUrl: ''
    }
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleDeviceModelAdd = (data: Omit<DeviceModel, 'id' | 'createdAt'>) => {
    const newDevice: DeviceModel = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      imageUrl: selectedImage ? URL.createObjectURL(selectedImage) : data.imageUrl
    };
    setDeviceModels([...deviceModels, newDevice]);
    handleDialogClose();
  };

  const handleDeviceEdit = (device: DeviceModel) => {
    setEditingDevice(device);
    deviceForm.reset(device);
    setIsDeviceDialogOpen(true);
  };

  const handleDeviceModelDelete = (deviceId: string) => {
    setDeviceModels(deviceModels.filter(device => device.id !== deviceId));
  };

  const handleDialogClose = () => {
    setIsDeviceDialogOpen(false);
    setEditingDevice(null);
    setSelectedImage(null);
    deviceForm.reset();
  };

  const filteredDevices = deviceModels.filter(device => 
    device.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.carrier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">단말기 등록</h1>
          <p className="text-muted-foreground">단말기 모델을 등록하고 관리할 수 있습니다</p>
        </div>
        <Button onClick={() => setIsDeviceDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          단말기 추가
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="모델명, 제조사, 통신사로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              필터
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Device List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>단말기 모델 ({filteredDevices.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이미지</TableHead>
                <TableHead>통신사</TableHead>
                <TableHead>제조사</TableHead>
                <TableHead>모델명</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {device.imageUrl ? (
                        <img 
                          src={device.imageUrl} 
                          alt={device.model}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{device.carrier}</TableCell>
                  <TableCell>{device.manufacturer}</TableCell>
                  <TableCell className="font-medium">{device.model}</TableCell>
                  <TableCell>{device.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeviceEdit(device)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeviceModelDelete(device.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Device Add/Edit Dialog */}
      <Dialog open={isDeviceDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingDevice ? '단말기 모델 수정' : '단말기 모델 추가'}
            </DialogTitle>
            <DialogDescription>
              {editingDevice ? '단말기 모델 정보를 수정하세요' : '새로운 단말기 모델을 등록하세요'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={deviceForm.handleSubmit(handleDeviceModelAdd)} className="space-y-4">
            {/* 이미지 업로드 */}
            <div className="space-y-2">
              <Label>단말기 이미지 (선택사항)</Label>
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="device-image-upload"
                    />
                    <label htmlFor="device-image-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          클릭하여 이미지 선택
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WEBP (최대 5MB)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                {selectedImage && (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="미리보기"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => setSelectedImage(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* 통신사 선택 */}
            <div className="space-y-2">
              <Label htmlFor="carrier">통신사</Label>
              <Select
                value={deviceForm.watch('carrier')}
                onValueChange={(value) => deviceForm.setValue('carrier', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="통신사를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.map((carrier) => (
                    <SelectItem key={carrier} value={carrier}>
                      {carrier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 제조사 선택 */}
            <div className="space-y-2">
              <Label htmlFor="manufacturer">제조사</Label>
              <Select
                value={deviceForm.watch('manufacturer')}
                onValueChange={(value) => deviceForm.setValue('manufacturer', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="제조사를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {manufacturers.map((manufacturer) => (
                    <SelectItem key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 모델명 입력 */}
            <div className="space-y-2">
              <Label htmlFor="model">모델명</Label>
              <Input
                id="model"
                {...deviceForm.register('model', { required: true })}
                placeholder="예: iPhone 15 Pro, Galaxy S24 Ultra"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                취소
              </Button>
              <Button type="submit">
                {editingDevice ? '수정' : '추가'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
