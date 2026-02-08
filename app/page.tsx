import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 히어로 섹션 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🏠 HomeStock
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            바코드 스캔으로 쉽게 관리하는 집 재고 관리 시스템
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-4 px-8 rounded-lg transition-colors shadow-lg"
          >
            <svg
              className="w-6 h-6"
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
            바코드 스캔 시작하기
          </Link>
        </div>

        {/* 기능 카드 */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* 바코드 스캔 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📷</div>
            <h3 className="text-xl font-semibold mb-2">바코드 스캔</h3>
            <p className="text-gray-600">
              스마트폰 카메라로 바코드를 스캔하여 빠르게 재고를 등록하세요
            </p>
          </div>

          {/* 재고 관리 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">재고 관리</h3>
            <p className="text-gray-600">
              카테고리별, 위치별로 재고를 체계적으로 관리하세요
            </p>
          </div>

          {/* 유통기한 알림 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-xl font-semibold mb-2">유통기한 알림</h3>
            <p className="text-gray-600">
              유통기한이 임박한 제품을 자동으로 확인하세요
            </p>
          </div>
        </div>

        {/* 빠른 시작 가이드 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            빠른 시작 가이드
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                1
              </div>
              <h4 className="font-semibold mb-2">스캔 버튼 클릭</h4>
              <p className="text-sm text-gray-600">
                상단의 스캔 버튼을 눌러주세요
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                2
              </div>
              <h4 className="font-semibold mb-2">카메라 권한 허용</h4>
              <p className="text-sm text-gray-600">
                카메라 접근을 허용해주세요
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                3
              </div>
              <h4 className="font-semibold mb-2">바코드 스캔</h4>
              <p className="text-sm text-gray-600">
                제품의 바코드를 비춰주세요
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                4
              </div>
              <h4 className="font-semibold mb-2">정보 입력</h4>
              <p className="text-sm text-gray-600">
                수량과 위치를 입력하세요
              </p>
            </div>
          </div>
        </div>

        {/* 푸터 정보 */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            💡 웹 브라우저에서 카메라 권한을 허용해야 합니다
          </p>
          <p className="text-sm mt-2">
            iOS Safari, Android Chrome 등 최신 브라우저에서 사용 가능합니다
          </p>
        </div>
      </div>
    </div>
  )
}
