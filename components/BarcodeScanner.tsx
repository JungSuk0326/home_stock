'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string, format: string) => void
  onScanError?: (error: string) => void
}

export default function BarcodeScanner({ onScanSuccess, onScanError }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [cameras, setCameras] = useState<any[]>([])

  useEffect(() => {
    // 브라우저 정보 표시
    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua)
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua)

    setDebugInfo(`디바이스: ${isIOS ? 'iOS' : 'Other'}, 브라우저: ${isSafari ? 'Safari' : 'Other'}`)

    return () => {
      // 컴포넌트 언마운트 시 스캐너 정리
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop()
      }
    }
  }, [])

  const testCameraAccess = async () => {
    try {
      // 직접 getUserMedia로 권한 테스트
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })

      // 스트림 즉시 종료
      stream.getTracks().forEach(track => track.stop())

      return true
    } catch (err: any) {
      console.error('Camera access test failed:', err)
      return false
    }
  }

  const startScanning = async () => {
    try {
      setError(null)
      setDebugInfo(prev => prev + '\n카메라 권한 확인 중...')

      // 먼저 카메라 접근 테스트
      const hasAccess = await testCameraAccess()

      if (!hasAccess) {
        setError('카메라 권한이 거부되었습니다. Safari 설정에서 카메라 권한을 확인해주세요.')
        setDebugInfo(prev => prev + '\n❌ 카메라 접근 실패')
        return
      }

      setDebugInfo(prev => prev + '\n✅ 카메라 권한 확인 완료')
      setDebugInfo(prev => prev + '\n카메라 목록 가져오는 중...')

      // 카메라 장치 목록 가져오기
      const devices = await Html5Qrcode.getCameras()

      setDebugInfo(prev => prev + `\n✅ ${devices.length}개 카메라 발견`)

      if (devices && devices.length > 0) {
        setCameras(devices)

        // 후면 카메라 찾기 (바코드 스캔에 적합)
        const backCamera = devices.find(device =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('후면') ||
          device.label.toLowerCase().includes('rear')
        ) || devices[0]

        setDebugInfo(prev => prev + `\n선택된 카메라: ${backCamera.label}`)

        const scanner = new Html5Qrcode('barcode-reader')
        scannerRef.current = scanner

        setDebugInfo(prev => prev + '\n스캐너 시작 중...')

        await scanner.start(
          backCamera.id,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText, decodedResult) => {
            // 스캔 성공
            console.log('Barcode detected:', decodedText)
            setDebugInfo(prev => prev + `\n✅ 바코드 감지: ${decodedText}`)
            onScanSuccess(decodedText, decodedResult.result.format?.formatName || 'UNKNOWN')

            // 스캔 성공 후 자동 중지
            stopScanning()
          },
          (errorMessage) => {
            // 스캔 중 에러 (무시 가능한 에러들)
            // console.log('Scan error:', errorMessage)
          }
        )

        setIsScanning(true)
        setDebugInfo(prev => prev + '\n✅ 스캔 시작!')
      } else {
        setError('카메라를 찾을 수 없습니다')
        setDebugInfo(prev => prev + '\n❌ 카메라 없음')
        onScanError?.('카메라를 찾을 수 없습니다')
      }
    } catch (err: any) {
      console.error('Scanner start error:', err)

      let errorMsg = '알 수 없는 오류가 발생했습니다'

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = '카메라 권한이 거부되었습니다. Safari 설정에서 카메라를 허용해주세요.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = '카메라를 찾을 수 없습니다.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = '카메라가 다른 앱에서 사용 중입니다.'
      } else if (err.name === 'OverconstrainedError') {
        errorMsg = '요청한 카메라 설정을 지원하지 않습니다.'
      } else if (err.name === 'SecurityError') {
        errorMsg = '보안 오류: HTTPS 연결이 필요할 수 있습니다.'
      } else if (err.message) {
        errorMsg = err.message
      }

      setError(`${errorMsg} (${err.name || 'Unknown'})`)
      setDebugInfo(prev => prev + `\n❌ 에러: ${err.name} - ${err.message}`)
      onScanError?.(err.message)
    }
  }

  const stopScanning = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop()
        scannerRef.current = null
      }
      setIsScanning(false)
    } catch (err) {
      console.error('Scanner stop error:', err)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {/* 디버그 정보 */}
      {debugInfo && (
        <div className="w-full p-3 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap text-gray-700">
          {debugInfo}
        </div>
      )}

      {/* 스캔 영역 */}
      <div
        id="barcode-reader"
        className={`w-full rounded-lg overflow-hidden border-2 ${
          isScanning ? 'border-blue-500' : 'border-gray-300'
        }`}
        style={{ minHeight: '300px' }}
      />

      {/* 에러 메시지 */}
      {error && (
        <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          <strong>오류:</strong> {error}
        </div>
      )}

      {/* 컨트롤 버튼 */}
      <div className="flex gap-3 w-full">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            카메라 시작
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            스캔 중지
          </button>
        )}
      </div>

      {/* 안내 메시지 */}
      {isScanning && (
        <div className="text-sm text-gray-600 text-center">
          바코드나 QR 코드를 카메라에 비춰주세요
        </div>
      )}
    </div>
  )
}
