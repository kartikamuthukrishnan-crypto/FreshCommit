import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const indexHtmlPath = path.join(rootDir, 'index.html');

async function syncArticles() {
  console.log('Fetching CAREER_ARTICLES from TypeScript data...');
  const articlesJson = execSync(
    `npx tsx -e 'import { CAREER_ARTICLES } from "./src/data/careerArticles"; console.log(JSON.stringify(CAREER_ARTICLES));'`,
    { cwd: rootDir }
  ).toString();

  const articles = JSON.parse(articlesJson);
  console.log(`Loaded ${articles.length} articles.`);

  const syncArticlesObj = {};
  for (const art of articles) {
    if (!art || !art.id) continue;
    syncArticlesObj[art.id] = {
      id: art.id,
      title: art.title,
      subtitle: art.subtitle,
      summary: art.summary,
      tag: art.tag,
      readTime: art.readTime,
      publishedDate: art.publishedDate,
      lastUpdatedDate: art.lastUpdatedDate || 'October 2026',
      highlights: art.highlights || [],
      author: {
        name: art.author.name,
        role: art.author.role,
        shortRole: art.author.shortRole || art.author.role,
        initials: art.author.initials || 'FC',
        linkedinUrl: art.author.linkedinUrl,
        bio: art.author.bio,
        expertise: art.author.expertise || []
      },
      reviewer: art.reviewer ? {
        name: art.reviewer.name,
        role: art.reviewer.role,
        shortRole: art.reviewer.shortRole || art.reviewer.role,
        linkedinUrl: art.reviewer.linkedinUrl
      } : null
    };
  }

  let html = fs.readFileSync(indexHtmlPath, 'utf8');

  // 1. Build the script injection code for crawler hydration
  const syncArticlesDeclaration = `var SYNCHRONOUS_ARTICLES = ${JSON.stringify(syncArticlesObj, null, 2)};

          function injectArticleSchema(art) {
            if (!art) return;
            var canonicalUrl = 'https://www.freshcommits.com/insights/' + encodeURIComponent(art.id);
            document.title = art.title + ' – FreshCommits Career Guide';
            
            var metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.content = art.summary;
            
            var canonical = document.querySelector('link[rel="canonical"]');
            if (canonical) canonical.href = canonicalUrl;
            
            var ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.content = art.title;
            var ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.content = art.summary;
            var ogUrl = document.querySelector('meta[property="og:url"]');
            if (ogUrl) ogUrl.content = canonicalUrl;
            var ogType = document.querySelector('meta[property="og:type"]');
            if (ogType) ogType.content = 'article';
            
            var twTitle = document.querySelector('meta[name="twitter:title"]');
            if (twTitle) twTitle.content = art.title;
            var twDesc = document.querySelector('meta[name="twitter:description"]');
            if (twDesc) twDesc.content = art.summary;

            function applyArticleLd() {
              var schema = {
                "@context": "https://schema.org",
                "@type": "TechArticle",
                "headline": art.title,
                "description": art.summary,
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": canonicalUrl
                },
                "datePublished": "2026-09-01T08:00:00Z",
                "dateModified": "2026-10-06T12:00:00Z",
                "inLanguage": "en-US",
                "author": {
                  "@type": "Person",
                  "name": art.author.name,
                  "jobTitle": art.author.role,
                  "url": art.author.linkedinUrl,
                  "sameAs": [art.author.linkedinUrl],
                  "description": art.author.bio,
                  "knowsAbout": art.author.expertise || [],
                  "worksFor": {
                    "@type": "Organization",
                    "name": "FreshCommits",
                    "url": "https://www.freshcommits.com"
                  }
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "FreshCommits",
                  "url": "https://www.freshcommits.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.freshcommits.com/favicon.svg"
                  }
                }
              };
              if (art.reviewer) {
                schema.reviewedBy = {
                  "@type": "Person",
                  "name": art.reviewer.name,
                  "jobTitle": art.reviewer.role,
                  "url": art.reviewer.linkedinUrl,
                  "sameAs": [art.reviewer.linkedinUrl],
                  "worksFor": {
                    "@type": "Organization",
                    "name": "FreshCommits",
                    "url": "https://www.freshcommits.com"
                  }
                };
              }
              var scriptEl = document.getElementById('google-article-eeat-schema');
              if (!scriptEl) {
                scriptEl = document.createElement('script');
                scriptEl.id = 'google-article-eeat-schema';
                scriptEl.type = 'application/ld+json';
                document.head.appendChild(scriptEl);
              }
              scriptEl.textContent = JSON.stringify(schema, null, 2);
            }

            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', applyArticleLd);
            } else {
              applyArticleLd();
            }
          }`;

  // Replace or inject SYNCHRONOUS_ARTICLES cleanly between markers
  const startMarker = 'var SYNCHRONOUS_ARTICLES =';
  const endMarker = 'var jobId = null;';
  const startIndex = html.indexOf(startMarker);
  const endIndex = html.indexOf(endMarker);

  if (startIndex !== -1 && endIndex !== -1) {
    html = html.slice(0, startIndex) + syncArticlesDeclaration + '\n          ' + html.slice(endIndex);
    console.log('Replaced existing SYNCHRONOUS_ARTICLES and injectArticleSchema cleanly between markers.');
  } else {
    // If not matching, replace the fallback line
    const fallbackLine = 'var SYNCHRONOUS_ARTICLES = window.SYNCHRONOUS_ARTICLES || {};';
    if (html.includes(fallbackLine)) {
      html = html.replace(fallbackLine, syncArticlesDeclaration);
      console.log('Injected SYNCHRONOUS_ARTICLES and injectArticleSchema into head script.');
    } else {
      console.warn('Could not find insertion anchor for SYNCHRONOUS_ARTICLES');
    }
  }

  // 2. Build the <noscript> section for Career Insights
  const noscriptArticlesHtml = `        <!-- Section 11: Engineering Career Insights & Technical Field Guides (Google E-E-A-T Verified) -->
        <section id="career-insights-index" style="background: #ffffff; border: 1px solid #dadce0; border-radius: 20px; padding: 36px; margin-bottom: 56px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; margin-bottom: 16px;">
            <div>
              <span style="font-size: 11px; color: #0d904f; font-weight: 700; text-transform: uppercase;">Google E-E-A-T Verified Field Guides</span>
              <h2 style="font-size: 24px; font-weight: 700; color: #202124; margin: 4px 0 0 0;">
                Engineering Career Insights &amp; Technical Roadmaps (${articles.length} Field Guides)
              </h2>
            </div>
            <span style="font-size: 12px; color: #5f6368; font-weight: 500;">
              Authored by Akhil Vasu, Dilli Babu, &amp; Jishaka Jose
            </span>
          </div>
          <p style="font-size: 14px; color: #5f6368; line-height: 1.6; margin-bottom: 24px;">
            Peer-reviewed early-career engineering guides covering applicant tracking systems (ATS), coding interview benchmarks, system design foundations, Git hygiene, and total compensation negotiation for developers with 0–2 years of experience.
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
${articles.map(a => `            <article style="background: #f8f9fa; border: 1px solid #e8eaed; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 11px; color: #0d904f; font-weight: 700; text-transform: uppercase; background: #e6f4ea; padding: 2px 8px; border-radius: 4px;">${a.tag}</span>
                  <span style="font-size: 11px; color: #5f6368;">${a.readTime}</span>
                </div>
                <h3 style="font-size: 16px; font-weight: 700; color: #202124; margin: 6px 0 8px 0; line-height: 1.4;">
                  <a href="/insights/${a.id}" style="color: #202124; text-decoration: none;">${a.title}</a>
                </h3>
                <p style="font-size: 12px; color: #5f6368; line-height: 1.6; margin-bottom: 12px;">
                  ${a.summary.slice(0, 200)}...
                </p>
              </div>
              <div style="border-top: 1px solid #e8eaed; padding-top: 12px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                <span style="color: #3c4043; font-weight: 600;">
                  By ${a.author.name} <span style="color: #70757a; font-weight: 400;">(${a.author.shortRole || a.author.role})</span>
                </span>
                <a href="/insights/${a.id}" style="color: #1a73e8; font-weight: 600; text-decoration: none;">Read Guide &rarr;</a>
              </div>
            </article>`).join('\n')}
          </div>
        </section>`;

  // Check if Section 11 already exists in <noscript>
  const noscriptSectionRegex = /<!-- Section 11: Engineering Career Insights[\s\S]*?<\/section>/;
  if (noscriptSectionRegex.test(html)) {
    html = html.replace(noscriptSectionRegex, noscriptArticlesHtml.trim());
    console.log('Updated existing Section 11 in <noscript>.');
  } else {
    // Insert before </main> inside <noscript>
    const mainClose = '</main>';
    const lastMainCloseIdx = html.lastIndexOf(mainClose);
    if (lastMainCloseIdx !== -1) {
      html = html.slice(0, lastMainCloseIdx) + noscriptArticlesHtml + '\n\n      ' + html.slice(lastMainCloseIdx);
      console.log('Inserted Section 11 into <noscript> before </main>.');
    }
  }

  fs.writeFileSync(indexHtmlPath, html, 'utf8');
  console.log('Successfully updated index.html with synchronous article hydration and noscript index!');
}

syncArticles().catch((err) => {
  console.error('Error syncing articles to index.html:', err);
  process.exit(1);
});
