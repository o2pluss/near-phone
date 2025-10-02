import React, { useState, useEffect } from 'react';
import { PageLoadingSpinner } from '../ui/loading-spinner';

interface DeletedItem {
  id: string;
  name: string;
  deleted_at: string;
  deletion_reason: string;
  is_active: boolean;
}

interface DeletedItemsManagerProps {
  type: 'products' | 'tables';
}

export default function DeletedItemsManager({ type }: DeletedItemsManagerProps) {
  const [items, setItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchDeletedItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/deleted-products?type=${type}&page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setItems(data[type] || []);
        setTotalPages(data.totalPages || 0);
      }
    } catch (error) {
      console.error('삭제된 항목 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const restoreItem = async (id: string) => {
    try {
      const response = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: type === 'products' ? 'product' : 'product_table',
          id,
          restoreChildren: type === 'tables'
        })
      });

      if (response.ok) {
        alert('복구되었습니다.');
        fetchDeletedItems();
      } else {
        const error = await response.json();
        alert(`복구 실패: ${error.error}`);
      }
    } catch (error) {
      console.error('복구 실패:', error);
      alert('복구 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchDeletedItems();
  }, [page, type]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        삭제된 {type === 'products' ? '상품' : '상품 테이블'} 관리
      </h2>

      {loading ? (
        <div className="text-center py-8">
          <PageLoadingSpinner text="로딩 중..." />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">이름</th>
                  <th className="px-4 py-2 text-left">삭제일</th>
                  <th className="px-4 py-2 text-left">삭제 사유</th>
                  <th className="px-4 py-2 text-left">상태</th>
                  <th className="px-4 py-2 text-left">작업</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">
                      {new Date(item.deleted_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{item.deletion_reason}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => restoreItem(item.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        복구
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                이전
              </button>
              <span className="px-4 py-1">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
