'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BarcodeScanner from '@/components/BarcodeScanner'

export default function ScanPage() {
  const router = useRouter()
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [format, setFormat] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [itemInfo, setItemInfo] = useState<any>(null)

  const handleScanSuccess = async (decodedText: string, formatName: string) => {
    console.log('Scanned:', decodedText, 'Format:', formatName)
    setScannedCode(decodedText)
    setFormat(formatName)

    // 바코드로 아이템 검색
    setIsLoading(true)
    try {
      // 기존 재고에 있는지 확인
      const response = await fetch('/api/items')
      const items = await response.json()

      const existingItem = items.find(
        (item: any) => item.barcode === decodedText || item.qrCode === decodedText
      )

      if (existingItem) {
        setItemInfo(existingItem)
      } else {
        // 새 제품
        setItemInfo(null)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToInventory = () => {
    // 재고 추가 페이지로 이동 (바코드 정보 전달)
    router.push(`/items/new?barcode=${scannedCode}`)
  }

  const handleViewItem = () => {
    if (itemInfo) {
      router.push(`/items/${itemInfo.id}`)
    }
  }

  const resetScan = () => {
    setScannedCode(null)
    setFormat(null)
    setItemInfo(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            뒤로
          </button>
          <h1 className="text-3xl font-bold text-gray-900">바코드 스캔</h1>
          <p className="text-gray-600 mt-2">
            제품의 바코드 또는 QR 코드를 스캔하세요
          </p>
        </div>

        {/* 스캐너 */}
        {!scannedCode && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <BarcodeScanner
              onScanSuccess={handleScanSuccess}
              onScanError={(error) => console.error('Scan error:', error)}
            />
          </div>
        )}

        {/* 스캔 결과 */}
        {scannedCode && (
          <div className="space-y-4">
            {/* 스캔 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">스캔 완료</h2>
                <button
                  onClick={resetScan}
                  className="text-blue-500 hover:text-blue-600 text-sm"
                >
                  다시 스캔
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">스캔 코드</p>
                  <p className="text-lg font-mono font-semibold">{scannedCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">포맷</p>
                  <p className="text-sm">{format}</p>
                </div>
              </div>
            </div>

            {/* 로딩 */}
            {isLoading && (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">제품 정보를 확인하는 중...</p>
              </div>
            )}

            {/* 기존 제품 발견 */}
            {!isLoading && itemInfo && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{itemInfo.name}</h3>
                    {itemInfo.brand && (
                      <p className="text-gray-600 mb-2">{itemInfo.brand}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        재고: {itemInfo.quantity}{itemInfo.unit}
                      </span>
                      <span className="text-gray-600">
                        {itemInfo.category.icon} {itemInfo.category.name}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleViewItem}
                  className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  상세 보기
                </button>
              </div>
            )}

            {/* 새 제품 */}
            {!isLoading && !itemInfo && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-2">새 제품</h3>
                <p className="text-gray-600 mb-4">
                  재고에 등록되지 않은 제품입니다. 새로 추가하시겠습니까?
                </p>
                <button
                  onClick={handleAddToInventory}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  재고에 추가하기
                </button>
              </div>
            )}
          </div>
        )}

        {/* 안내 */}
        {!scannedCode && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 사용 팁</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 바코드를 화면 중앙의 박스에 맞춰주세요</li>
              <li>• 충분한 조명이 있는 곳에서 스캔하세요</li>
              <li>• 바코드가 선명하게 보이도록 초점을 맞추세요</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
