import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const SITE_URL = 'https://permissionator.as93.net';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supported languages (ISO 639-1 codes) - 'en' is canonical/default
const LANGUAGES = [
  'en', // English (canonical)
  'de', // Spanish
  'fr', // French
  'ru', // German
  'es', // Chinese
  'ja', // Japanese
  'pt', // Portuguese
  'id', // Indonesian
  'it', // Italian
  'zh-CN', // Simplified Chinese
  'hi-IN', // Hindi
  'ar-SA', // Arabic
  'ko-KR' // Korean
];

// Most common chmod values (based on actual usage patterns)
const COMMON_CHMODS = [
  '644', // Most common for files
  '755', // Most common for directories/executables
  '777', // Full permissions (often searched)
  '600', // Owner read/write only
  '700', // Owner full access only
  '664', // Group writable files
  '775', // Group writable directories
  '400', // Read-only for owner
  '000', // No permissions
  '666', // Read/write for all (no execute)
];

// Static pages configuration
const STATIC_PAGES = [
  {
    url: '/',
    priority: 1.0,
    changefreq: 'weekly'
  },
  // {
  //   url: '/about',
  //   priority: 0.8,
  //   changefreq: 'monthly'
  // },
  {
    url: '/learn-linux-chmod-command',
    priority: 0.9,
    changefreq: 'monthly'
  }
];

// Todays date, for the last modified date for entries (ISO format, YYYY-MM-DD)
const lastmod = new Date().toISOString().split('T')[0];


/* Based on page type, generate the links to alternative languages */
const createLanguageLinks = (basePath = '') => {
  return LANGUAGES.map(lang => ({
    lang,
    url: lang === 'en' 
      ? `${SITE_URL}${basePath}` 
      : basePath === '' || basePath === '/'
        ? `${SITE_URL}/${lang}` // Homepage: / → /de
        : `${SITE_URL}${basePath}/${lang}` // Other pages: /about → /about/de
  }));
};

/* For the chmod pages, gen links to alt languages */
const createChmodLanguageLinks = (octal) => {
  return LANGUAGES.map(lang => ({
    lang,
    url: lang === 'en' 
      ? `${SITE_URL}/chmod/${octal}` 
      : `${SITE_URL}/${lang}/${octal}`
  }));
};


/* Builds urls from config */
const buildUrls = () => {
  const urls = [];

  // Static pages with language alternates (one entry per page type)
  STATIC_PAGES.forEach(page => {
    // Single entry with all language alternatives
    urls.push({
      url: page.url, // Canonical English URL
      changefreq: page.changefreq,
      priority: page.priority,
      lastmod,
      links: createLanguageLinks(page.url === '/' ? '' : page.url)
    });
  });

  // Chmod calculator pages with language alternatives
  COMMON_CHMODS.forEach(octal => {
    urls.push({
      url: `/chmod/${octal}`,
      changefreq: 'yearly', // chmod values don't change
      priority: 0.7,
      lastmod,
      links: createChmodLanguageLinks(octal) // Include language alternatives
    });
  });

  return urls;
};


/* Validate sitemap looks good */
const validateConfig = () => {
  if (!SITE_URL || !SITE_URL.startsWith('https://')) {
    throw new Error('SITE_URL must be set and use HTTPS');
  }
  
  if (!LANGUAGES.includes('en')) {
    throw new Error('LANGUAGES must include "en" as canonical language');
  }
  
  if (COMMON_CHMODS.some(val => !/^\d{3}$/.test(val))) {
    throw new Error('All chmod values must be 3-digit octal numbers');
  }
};


/* Gen sitemap */
const generateSitemap = async () => {
  try {
    console.log('🚀 Generating SEO-optimized sitemap...');
    
    validateConfig();
    const urls = buildUrls();
    
    // Create sitemap stream
    const sitemap = new SitemapStream({ 
      hostname: SITE_URL,
      cacheTime: 600000, // 10 minutes
    });
    
    // Generate XML
    const xml = await streamToPromise(
      Readable.from(urls).pipe(sitemap)
    );
    
    // Ensure public directory exists
    const publicDir = path.join(__dirname, 'public');
    fs.mkdirSync(publicDir, { recursive: true });
    
    // Write sitemap
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xml.toString());
    
    // Success logging
    console.log('✅ Sitemap generated successfully!');
    console.log(`📁 Location: ${sitemapPath}`);
    console.log(`🔗 Total URLs: ${urls.length}`);
    
    // Detailed breakdown
    const staticCount = STATIC_PAGES.length;
    const chmodCount = COMMON_CHMODS.length;
    
    console.log('\n📊 Breakdown:');
    console.log(`• Static pages (with lang alternatives): ${staticCount}`);
    console.log(`• Chmod calculators: ${chmodCount}`);
    console.log(`• Languages: ${LANGUAGES.join(', ')}`);
    console.log(`• Chmod values: ${COMMON_CHMODS.join(', ')}`);
    console.log('\n🎯 SEO Features:');
    console.log('• Proper hreflang annotations for all pages');
    console.log('• Homepage: / ↔ /de, /fr, etc.');
    console.log('• Static pages: /about ↔ /about/de, /about/fr, etc.');
    console.log('• Chmod pages: /chmod/755 ↔ /de/755, /fr/755, etc.');
    console.log('• No duplicate content issues');
    console.log('• Strategic priority weighting');
    console.log('• Optimized change frequencies');
    
  } catch (err) {
    console.error('❌ Error generating sitemap:', err.message);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemap();
}

export {
  generateSitemap,
  LANGUAGES,
  COMMON_CHMODS,
  STATIC_PAGES,
  buildUrls
};
