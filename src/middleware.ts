import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  corsForbiddenResponse,
  corsPreflightResponse,
  isOriginAllowed,
} from '@/server/http/api-response'

export function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return corsPreflightResponse(request)
  }

  if (!isOriginAllowed(request.headers.get('origin'))) {
    return corsForbiddenResponse(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
