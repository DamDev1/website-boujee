import { DomainInfo } from '@/types/global';
import whois from 'whois-json';
import { REGISTRAR_ROASTS, TLD_ROASTS } from '../roasts';

const TLD_COMPLIMENTS: Record<string, string[]> = {
    '.com': ['Classic choice! 👑', 'Timeless and reliable! ⏳', 'The gold standard! 🏅'],
    '.io': ['Tech-savvy! 🚀', 'Modern and sleek! 💎', 'Startup energy! ⚡'],
    '.dev': ['Clean and professional! 🧼', 'Developer approved! ✅', 'Straight to the point! 🎯'],
    '.ai': ['Futuristic! 🔮', 'On the cutting edge! ✂️', 'Ahead of the curve! 📈'],
    '.co': ['Smart and affordable! 💡', 'Creative choice! 🎨', 'Short and punchy! 👊']
};

// Helper: Pick random item from array
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Improved age roast with randomization (already good!)
const getAgeRoast = (age: number): string => {
    const roasts = {
        0: [
            'Brand new! Just hatched! 🐣',
            'Fresh out of the registry oven! 🔥',
            'Registered yesterday? Smells like new domain! 🌱',
            'Age 0? You\'re basically a domain toddler! 👶'
        ],
        baby: [ // < 1 year
            'Still in diapers! 👶',
            'Younger than most TikTok trends! 📱',
            'Barely old enough to have an index.html! 🍼',
            'So new, the paint\'s still wet! 🖌️'
        ],
        toddler: [ // 1–2 years (< 3)
            'Fresh domain milk! 🥛',
            'Toddler domain throwing tantrums in the sandbox! 🪣',
            'Just learned to crawl... on Google! 🕷️',
            'Young enough to still believe in 100% uptime! ☁️'
        ],
        kid: [ // 3–4 years (< 5)
            'Getting some experience! 📚',
            'Kindergarten graduate of the internet! 🎓',
            'Survived a few Google updates — impressive! 🏅',
            'Old enough to have a favicon! 🎨'
        ],
        teen: [ // 5–9 years (< 10)
            'Mid-life crisis domain! 🚗',
            'Teenage domain, full of angst and broken links! 😩',
            'Remembers when mobile-first wasn\'t a thing! 📟',
            'Probably has a MySpace backup somewhere... 🌌'
        ],
        ancient: [ // 10+ years
            'Ancient internet artifact! 🦖',
            'Older than Instagram and still kicking! 📸',
            'Pre-dates smartphones — a true survivor! 🏺',
            'Was around when Flash was cool... RIP ⚰️',
            'Geocities called, wants its vibe back! 🏠',
            'Boasted "Best viewed in Netscape Navigator" once! 🌐',
            'Older than most developers using it! 👴'
        ]
    };

    let bucket;
    if (age === 0) bucket = roasts[0];
    else if (age < 1) bucket = roasts.baby;
    else if (age < 3) bucket = roasts.toddler;
    else if (age < 5) bucket = roasts.kid;
    else if (age < 10) bucket = roasts.teen;
    else bucket = roasts.ancient;

    return randomItem(bucket);
};

// Registrar roast — now fully randomized!
const getRegistrarRoast = (registrar: string): string => {
    const lowerReg = registrar.toLowerCase();

    if (lowerReg.includes('godaddy')) return randomItem(REGISTRAR_ROASTS['GoDaddy']);
    if (lowerReg.includes('namecheap')) return randomItem(REGISTRAR_ROASTS['Namecheap']);
    if (lowerReg.includes('google') || lowerReg.includes('squarespace')) return randomItem(REGISTRAR_ROASTS['Google Domains'] || REGISTRAR_ROASTS['Squarespace Domains'] || ['Google refugee? 🏃']);
    if (lowerReg.includes('name.com')) return randomItem(REGISTRAR_ROASTS['Name.com']);
    if (lowerReg.includes('cloudflare')) return randomItem(REGISTRAR_ROASTS['Cloudflare Registrar'] || ['Too good for markups! 😇']);
    if (lowerReg.includes('porkbun')) return randomItem(REGISTRAR_ROASTS['Porkbun'] || ['Oink oink, savings! 🐷']);
    if (lowerReg.includes('squarespace')) return randomItem(REGISTRAR_ROASTS['Squarespace Domains']);

    const generics = [
        `Never heard of ${registrar}... sketchy? 👀`,
        `${registrar}? Sounds made up! 🤥`,
        `Using ${registrar}? Bold move in 2026! 😅`,
        `${registrar}? That's a new one on me! 🫢`
    ];
    return randomItem(generics);
};

// Domain scoring logic (unchanged, but solid)
const calculateDomainScore = (
    age: number,
    tld: string,
    registrar: string,
    isPopularTld: boolean
): number => {
    let score = 50;

    if (age > 5 && age < 15) score += 20;
    else if (age >= 15) score += 10;
    else if (age > 1) score += 5;

    if (['.com', '.io', '.dev'].includes(tld)) score += 15;
    else if (['.org', '.co', '.ai'].includes(tld)) score += 10;
    else if (['.net', '.me'].includes(tld)) score += 5;

    if (isPopularTld) score += 10;

    const lowerReg = registrar.toLowerCase();
    if (lowerReg.includes('godaddy')) score -= 5;
    if (lowerReg.includes('google') || lowerReg.includes('squarespace')) score += 10;
    if (lowerReg.includes('cloudflare')) score += 15;
    if (lowerReg.includes('porkbun')) score += 12;

    return Math.min(Math.max(score, 0), 100);
};

export const analyzeDomain = async (domain: string): Promise<DomainInfo> => {
    try {
        const url = domain.startsWith('http') ? domain : `https://${domain}`;
        const domainObj = new URL(url);
        const hostname = domainObj.hostname;
        const hasHttps = domainObj.protocol === 'https:';
        const hasWww = hostname.startsWith('www.');
        const cleanDomain = hasWww ? hostname.substring(4) : hostname;

        const parts = cleanDomain.split('.');
        const tld = '.' + parts[parts.length - 1];
        const isPopularTld = ['.com', '.org', '.net', '.io', '.dev', '.co', '.ai', '.info', '.biz', '.club', '.fun', '.online', '.tech', '.app', '.shop', '.me'].includes(tld);

        const whoisData = await whois(cleanDomain, { follow: 1 });
        const result = Array.isArray(whoisData) ? whoisData[0] : whoisData;

        const createdDate = (result as any)?.creationDate || (result as any)?.created || (result as any)?.registered;
        const expiresDate = (result as any)?.expiryDate || (result as any)?.expires || (result as any)?.expiration;
        const registrar = (result as any)?.registrar || (result as any)?.registrarName || 'Unknown';

        let age = 0;
        if (createdDate) {
            const created = new Date(createdDate);
            const now = new Date();
            age = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        }

        let isExpiringSoon = false;
        if (expiresDate) {
            const expires = new Date(expiresDate);
            const now = new Date();
            const daysUntilExpiry = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
        }

        const isNew = age < 1;
        const score = calculateDomainScore(age, tld, registrar, isPopularTld);

        const roasts: string[] = [];
        const compliments: string[] = [];
        const suggestions: string[] = [];

        // TLD Roast (random!)
        if (TLD_ROASTS[tld]) {
            roasts.push(randomItem(TLD_ROASTS[tld]));
        } else {
            roasts.push(randomItem([
                `${tld}? Trying to be unique? 🤨`,
                `${tld}? That's... creative! 😅`,
                `.${tld} – never seen that before! 🫢`,
                `${tld}? Are you from the future? 🚀`
            ]));
        }

        // TLD Compliment (random if available)
        if (TLD_COMPLIMENTS[tld]) {
            compliments.push(randomItem(TLD_COMPLIMENTS[tld]));
        }

        // Age roast
        roasts.push(getAgeRoast(age));

        // Registrar roast
        roasts.push(getRegistrarRoast(registrar));

        // HTTPS
        if (!hasHttps) {
            roasts.push('No HTTPS? Are we in 2010? 📅');
            suggestions.push('Enable HTTPS with a free SSL cert (Let\'s Encrypt!)');
        } else {
            compliments.push('HTTPS locked and loaded! 🔒');
        }

        // WWW
        if (hasWww) {
            roasts.push('Still using www? How retro! 📻');
            suggestions.push('Redirect www to non-www (or vice versa) for consistency');
        }

        // New domain extras
        if (isNew) {
            roasts.push('So new, Google hasn\'t even noticed you yet! 🕵️');
        }

        // Expiring soon
        if (isExpiringSoon) {
            roasts.push('Expiring soon? Better renew before someone snipes it! 😱');
            suggestions.push('Renew now — don\'t lose your domain!');
        }

        // Score feedback
        if (score < 30) {
            roasts.push('This domain needs a serious glow-up! 🆘');
        } else if (score > 80) {
            compliments.push('Elite domain status achieved! 🏆');
        } else if (score > 60) {
            compliments.push('Solid domain choices all around! ✅');
        }

        // General suggestions
        suggestions.push(
            'Set up email forwarding (e.g., hello@ → Gmail)',
            'Enable WHOIS privacy if it\'s not already on',
            'Use a modern DNS provider for speed and security'
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

        const tld = '.' + domain.split('.').pop() || '.com';

        return {
            domain,
            tld,
            age: Math.floor(Math.random() * 15) + 1,
            registrar: 'Mystery Registrar',
            createdDate: 'Unknown',
            expiresDate: 'Unknown',
            isPopularTld: ['.com', '.org', '.net', '.io'].includes(tld),
            isNew: false,
            isExpiringSoon: false,
            hasHttps: domain.startsWith('https://'),
            hasWww: domain.includes('www.'),
            subdomainCount: 0,
            score: Math.floor(Math.random() * 60) + 20,
            roasts: [
                'WHOIS lookup failed... hiding something? 🕵️',
                'Even the internet doesn\'t know you exist! 👻',
                'Analysis failed harder than a 500 error! 💥'
            ],
            compliments: [
                'At least you have a domain! 🎉'
            ],
            suggestions: [
                'Make sure your domain has public WHOIS data',
                'Try again later — servers might be napping 😴'
            ]
        };
    }
};