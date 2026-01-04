import { analyzeDomain } from '@/lib/services/domainService';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20;
const RATE_LIMIT_WINDOW = 60 * 1000;

const getClientIP = (request: NextRequest): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  return request.headers.get('x-real-ip') || 'anonymous';
};

const domainSchema = z.object({
  domain: z.string().min(3, 'Domain too short').max(253, 'Domain too long')
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const now = Date.now();
    
    const userLimit = rateLimit.get(ip);

    console.log(userLimit);

    if (userLimit) {
      if (now < userLimit.resetTime) {
        if (userLimit.count >= RATE_LIMIT) {
          return NextResponse.json(
            { 
              error: 'Too many requests!',
              message: 'Slow down! Even domains need a break. Try again in a minute.'
            },
            { status: 429 }
          );
        }
        rateLimit.set(ip, { ...userLimit, count: userLimit.count + 1 });
      } else {
        rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      }
    } else {
      rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    // Parse and validate request
    const body = await request.json();
    const validation = domainSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid domain',
          details: validation.error.issues[0].message
        },
        { status: 400 }
      );
    }

    const { domain } = validation.data;
    const analysis = await analyzeDomain(domain);
    

    setTimeout(() => {
      rateLimit.delete(ip);
    }, RATE_LIMIT_WINDOW);
    
    // Return response
    return NextResponse.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to roast domain',
        message: 'Something went wrong while analyzing your domain. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Simple GET endpoint for testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get('domain');
  
  if (!domain) {
    return NextResponse.json({
      message: 'Domain Roaster API 🔥',
      usage: 'POST /api/roast-domain with { "domain": "example.com" }',
      example: 'curl -X POST https://yourdomain.com/api/roast-domain -d \'{"domain":"google.com"}\'',
      endpoints: {
        POST: '/api/roast-domain - Analyze and roast a domain',
        GET: '/api/roast-domain?domain=example.com - Quick test'
      }
    });
  }
  
  // Quick test with GET
  try {
    const analysis = await analyzeDomain(domain);
    return NextResponse.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Use POST for full analysis',
      message: 'For complete roasting, use POST method with JSON body'
    }, { status: 400 });
  }
}