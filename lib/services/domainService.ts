import { DomainInfo } from '@/types/global';
import whois from 'whois-json';
import { REGISTRAR_ROASTS, TLD_ROASTS } from '../roasts';

const TLD_COMPLIMENTS: Record<string, string[]> = {
    '.com': ['Classic choice! 👑', 'Timeless and reliable! ⏳'],
    '.io': ['Tech-savvy! 🚀', 'Modern and sleek! 💎'],
    '.dev': ['Clean and professional! 🧼', 'Developer approved! ✅'],
    '.ai': ['Futuristic! 🔮', 'On the cutting edge! ✂️'],
    '.co': ['Smart and affordable! 💡', 'Creative choice! 🎨']
};

const getAgeRoast = (age: number): string => {
    if (age === 0) return 'Brand new! Just hatched! 🐣';
    if (age < 1) return 'Still in diapers! 👶';
    if (age < 3) return 'Fresh domain milk! 🥛';
    if (age < 5) return 'Getting some experience! 📚';
    if (age < 10) return 'Mid-life crisis domain! 🚗';
    return 'Ancient internet artifact! 🦖';
};

// Registrar-based roasts
const getRegistrarRoast = (registrar: string): string => {
    const lowerReg = registrar.toLowerCase();

    if (lowerReg.includes('godaddy')) {
        return REGISTRAR_ROASTS['GoDaddy'][0];
    }
    if (lowerReg.includes('namecheap')) {
        return REGISTRAR_ROASTS['Namecheap'][0];
    }
    if (lowerReg.includes('google')) {
        return REGISTRAR_ROASTS['Google Domains'][0];
    }
    if (lowerReg.includes('name.com')) {
        return REGISTRAR_ROASTS['Name.com'][0];
    }

    return `Never heard of ${registrar}... sketchy? 👀`;
};

// Generate score based on various factors
const calculateDomainScore = (
    age: number,
    tld: string,
    registrar: string,
    isPopularTld: boolean
): number => {
    let score = 50; // Base score

    if (age > 5 && age < 15) score += 20;
    else if (age >= 15) score += 10;
    else if (age > 1) score += 5;

    if (['.com', '.io', '.dev'].includes(tld)) score += 15;
    else if (['.org', '.co', '.ai'].includes(tld)) score += 10;
    else if (['.net', '.me'].includes(tld)) score += 5;

    // Popular TLD bonus
    if (isPopularTld) score += 10;

    if (registrar.includes('GoDaddy')) score -= 5;
    if (registrar.includes('Google')) score += 10;
    if (registrar.includes('Cloudflare')) score += 15;

    return Math.min(Math.max(score, 0), 100);
};

// Main function to analyze and roast a domain
export const analyzeDomain = async (domain: string): Promise<DomainInfo> => {
    try {
        // Extract domain parts
        const url = domain.startsWith('http') ? domain : `https://${domain}`;
        const domainObj = new URL(url);
        const hostname = domainObj.hostname;
        const hasHttps = domainObj.protocol === 'https:';
        const hasWww = hostname.startsWith('www.');
        const cleanDomain = hasWww ? hostname.substring(4) : hostname;

        // Extract TLD
        const parts = cleanDomain.split('.');
        const tld = '.' + parts[parts.length - 1];
        const isPopularTld = ['.com', '.org', '.net', '.io', '.dev', '.co', '.ai', '.info', '.biz', '.club', '.fun', '.online', '.tech', '.app', '.shop', 'me', '.co'].includes(tld);

        // Get WHOIS data
        const whoisData = await whois(cleanDomain, { follow: 1 });
        const result = Array.isArray(whoisData) ? whoisData[0] : whoisData;

        // Parse dates
        const createdDate = (result as any)?.creationDate || (result as any)?.created || (result as any)?.registered;
        const expiresDate = (result as any)?.expiryDate || (result as any)?.expires || (result as any)?.expiration;
        const registrar = (result as any)?.registrar || (result as any)?.registrarName || 'Unknown';

        // Calculate age
        let age = 0;
        if (createdDate) {
            const created = new Date(createdDate);
            const now = new Date();
            age = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        }

        // Check if expiring soon (within 30 days)
        let isExpiringSoon = false;
        if (expiresDate) {
            const expires = new Date(expiresDate);
            const now = new Date();
            const daysUntilExpiry = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            isExpiringSoon = daysUntilExpiry <= 30;
        }

        const isNew = age < 1;

        // Calculate score
        const score = calculateDomainScore(age, tld, registrar, isPopularTld);

        // Generate roasts
        const roasts: string[] = [];
        const compliments: string[] = [];
        const suggestions: string[] = [];

        // TLD roasts
        if (TLD_ROASTS[tld]) {
            roasts.push(TLD_ROASTS[tld][0]);
        } else {
            roasts.push(`${tld}? Trying to be unique? 🤨`);
        }

        // TLD compliments
        if (TLD_COMPLIMENTS[tld]) {
            compliments.push(TLD_COMPLIMENTS[tld][0]);
        }

        // Age roast
        roasts.push(getAgeRoast(age));

        // Registrar roast
        roasts.push(getRegistrarRoast(registrar));

        // HTTPS check
        if (!hasHttps) {
            roasts.push('No HTTPS? Are we in 2010? 📅');
            suggestions.push('Get an SSL certificate ASAP!');
        } else {
            compliments.push('HTTPS secured! 🔒');
        }

        // WWW check
        if (hasWww) {
            roasts.push('Still using www? How retro! 📻');
            suggestions.push('Consider using the non-www version');
        }

        // Domain age specific roasts
        if (isNew) {
            roasts.push('So fresh, Google hasn\'t even indexed you yet! 🔍');
        }

        if (isExpiringSoon) {
            roasts.push('Your domain is about to expire! Panic! 😱');
            suggestions.push('Renew your domain before it\'s too late!');
        }

        // Score-based roasts
        if (score < 30) {
            roasts.push('This domain needs serious help! 🆘');
        } else if (score > 80) {
            compliments.push('Impressive domain game! 🏆');
        }

        // Always add some suggestions
        suggestions.push(
            'Consider setting up email forwarding',
            'Enable domain privacy if available',
            'Set up DNS records properly'
        );

        return {
            domain: cleanDomain,
            tld,
            age,
            registrar,
            createdDate: createdDate ? new Date(createdDate).toISOString().split('T')[0] : 'Unknown',
            expiresDate: expiresDate ? new Date(expiresDate).toISOString().split('T')[0] : 'Unknown',
            isPopularTld,
            isNew,
            isExpiringSoon,
            hasHttps,
            hasWww,
            subdomainCount: parts.length - 2,
            score: Math.round(score),
            roasts,
            compliments,
            suggestions
        };

    } catch (error) {
        console.error('Domain analysis error:', error);

        // Return fallback data for development
        const tld = '.' + domain.split('.').pop();

        return {
            domain,
            tld,
            age: Math.floor(Math.random() * 10) + 1,
            registrar: 'GoDaddy',
            createdDate: '2020-01-01',
            expiresDate: '2025-01-01',
            isPopularTld: ['.com', '.org', '.net', '.io'].includes(tld),
            isNew: false,
            isExpiringSoon: false,
            hasHttps: true,
            hasWww: domain.includes('www.'),
            subdomainCount: 0,
            score: Math.floor(Math.random() * 100),
            roasts: [
                'Failed to analyze properly... typical! 🤦',
                'Even our analysis gave up on this one! 🙈'
            ],
            compliments: [
                'At least you tried! 👍'
            ],
            suggestions: [
                'Check if your domain is properly registered',
                'Make sure WHOIS data is public'
            ]
        };
    }
};