function parseFirestoreVal(v: any): any {
  if (!v) return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return parseFloat(v.doubleValue);
  if ('arrayValue' in v) {
    const vals = v.arrayValue.values || [];
    return vals.map(parseFirestoreVal);
  }
  if ('mapValue' in v) {
    const fields = v.mapValue.fields || {};
    const obj: Record<string, any> = {};
    for (const k in fields) obj[k] = parseFirestoreVal(fields[k]);
    return obj;
  }
  return undefined;
}

const COUNTRY_NAME_MAP: Record<string, string> = {
  US: 'United States',
  USA: 'United States',
  GB: 'United Kingdom',
  UK: 'United Kingdom',
  CA: 'Canada',
  IN: 'India',
  DE: 'Germany',
  AU: 'Australia',
  FR: 'France',
  IE: 'Ireland',
  NL: 'Netherlands',
  SG: 'Singapore',
  NG: 'Nigeria',
};

function cleanRawText(str: any): string {
  if (!str) return '';
  return String(str)
    .replace(/&lt;br\s*[\/]?&gt;/gi, '\n')
    .replace(/&lt;\/(?:p|div|h[1-6]|li)&gt;/gi, '\n\n')
    .replace(/&lt;[^&gt;]+&gt;/g, ' ')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|li|section|article)>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#xa0;/gi, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function formatDescription(job: Record<string, any>): string {
  const rawDesc = cleanRawText(job.description) || `Apply directly for ${job.title} at ${job.company}`;
  const paragraphs = String(rawDesc)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  let html = '';
  for (const p of paragraphs) {
    html += `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br />')}</p>`;
  }
  if (!html) {
    html = `<p>${rawDesc.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
  }

  const descLower = rawDesc.toLowerCase();

  // Deduplicate responsibilities against overview
  if (job.responsibilities && Array.isArray(job.responsibilities) && job.responsibilities.length) {
    const validResp = job.responsibilities
      .map((r: any) => cleanRawText(r).replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
      .filter((r: string) => {
        if (!r || r.length < 8) return false;
        const low = r.toLowerCase();
        if (/^(?:what you(?:’|'| )*(?:will|'ll)?\s*(?:do|bring)|responsibilities|key responsibilities|the role|what you will be doing|your mission|core duties|qualifications|requirements|basic qualifications|about us|who you are|who we are)[:\s]*$/i.test(low)) return false;
        if (/^about us[:\s]/i.test(low)) return false;
        if (/^we are looking for\b/i.test(low)) return false;
        if (/^this is an ideal role\b/i.test(low)) return false;
        if (/^our team is\b/i.test(low)) return false;
        if (descLower.includes(low.slice(0, 45))) return false;
        return true;
      });

    if (validResp.length > 0) {
      html += '<p><strong>Key Responsibilities:</strong></p><ul>';
      for (const r of validResp) {
        html += `<li>${r.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</li>`;
      }
      html += '</ul>';
    }
  }

  if (job.qualifications && Array.isArray(job.qualifications) && job.qualifications.length) {
    const validQual = job.qualifications
      .map((q: any) => cleanRawText(q).replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
      .filter((q: string) => {
        if (!q || q.length < 8) return false;
        const low = q.toLowerCase();
        if (/^(?:what you(?:’|'| )*(?:will|'ll)?\s*bring|qualifications|requirements|basic qualifications|minimum qualifications|what we look for|who you are|about us)[:\s]*$/i.test(low)) return false;
        return true;
      });

    if (validQual.length > 0) {
      html += '<p><strong>Qualifications (0–2 YoE):</strong></p><ul>';
      for (const q of validQual) {
        html += `<li>${q.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</li>`;
      }
      html += '</ul>';
    }
  }

  if (job.skills && Array.isArray(job.skills) && job.skills.length) {
    html += `<p><strong>Required Tech Stack:</strong> ${job.skills.map((s: any) => cleanRawText(s)).join(', ')}</p>`;
  }

  return html;
}

export const onRequest: any = async (context: any) => {
  const { params, next } = context;
  let jobId = String(params.id || '');

  // Defensive sanitization: extract clean ID even if trailing words/spaces are present
  jobId = jobId.trim().split(/[\s%]+/)[0];
  const idMatch = jobId.match(/(manual-\d+|job-[a-z0-9-]+|ext-[a-z0-9-]+|sync-[a-z0-9-]+|sr-[a-z0-9-]+)/i);
  if (idMatch) jobId = idMatch[1];

  const response = await next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/centered-module-9smzh/databases/ai-studio-juniordevhubentr-9fce9c23-e540-412e-ae3f-aca1eaf015f5/documents/jobs/${encodeURIComponent(
      jobId
    )}`;
    const jobRes = await fetch(firestoreUrl);

    if (jobRes.ok) {
      const doc: any = await jobRes.json();
      if (doc && doc.fields) {
        const job: Record<string, any> = {};
        for (const f in doc.fields) {
          job[f] = parseFirestoreVal(doc.fields[f]);
        }
        job.id = job.id || jobId;

        let countryCode = (job.applicantLocationRequirements || job.country || 'US').trim().toUpperCase();
        if (countryCode === 'USA') countryCode = 'US';
        if (countryCode === 'UK') countryCode = 'GB';
        const countryName = COUNTRY_NAME_MAP[countryCode] || countryCode;

        // Date validation: safe from expiration or future posts
        let safeDatePosted = job.datePosted || new Date().toISOString().split('T')[0];
        const postDate = new Date(safeDatePosted);
        if (isNaN(postDate.getTime()) || postDate > new Date()) {
          safeDatePosted = new Date().toISOString().split('T')[0];
        }

        let safeValidThrough = job.validThrough || '';
        const validDate = new Date(safeValidThrough);
        const today = new Date();
        if (!safeValidThrough || isNaN(validDate.getTime()) || validDate <= today) {
          const d = new Date();
          d.setDate(d.getDate() + 30);
          safeValidThrough = d.toISOString().split('T')[0];
        }

        // Build Google JobPosting Schema
        const schema: Record<string, any> = {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: job.title,
          description: formatDescription(job),
          identifier: {
            '@type': 'PropertyValue',
            name: job.company,
            value: job.id,
          },
          datePosted: safeDatePosted,
          validThrough: safeValidThrough,
          employmentType: job.employmentType || 'FULL_TIME',
          url: `https://www.freshcommits.com/job/${encodeURIComponent(job.id)}`,
          directApply: true,
          hiringOrganization: {
            '@type': 'Organization',
            name: job.company,
            sameAs: job.companyWebsite || undefined,
            logo: job.companyLogo || undefined,
          },
          experienceRequirements: {
            '@type': 'OccupationalExperienceRequirements',
            monthsOfExperience: (job.maxYearsExperience || 1) * 12,
          },
        };

        if (job.applyUrl) {
          schema.sameAs = job.applyUrl;
        }

        if (job.salary && job.salary.min > 0 && job.salary.max >= job.salary.min) {
          const isYearly = job.salary.unit === 'YEAR' || job.salary.min >= 500 || (job.salary.max && job.salary.max >= 500);
          schema.baseSalary = {
            '@type': 'MonetaryAmount',
            currency: job.salary.currency || 'USD',
            value: {
              '@type': 'QuantitativeValue',
              minValue: job.salary.min,
              maxValue: job.salary.max || job.salary.min,
              unitText: isYearly ? 'YEAR' : 'HOUR',
            },
          };
        }

        if (job.isRemote) {
          schema.jobLocationType = 'TELECOMMUTE';
          schema.applicantLocationRequirements = {
            '@type': 'Country',
            name: countryName,
          };
        } else {
          const rawLocParts = (job.location || '').split(',');
          const rawCity = job.city || rawLocParts[0]?.trim() || 'New York';
          const rawState = (job.state || rawLocParts[1]?.trim() || 'NY').replace(/\s*\/.*$/, '').trim();
          schema.jobLocation = {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: rawCity,
              addressRegion: rawState,
              addressCountry: countryCode,
            },
          };
        }

        const schemaJson = JSON.stringify(schema, null, 2);
        const titleText = `${job.title} at ${job.company} (${job.experienceLevel || '0–2 YoE'}) – FreshCommits`;
        const metaDesc = `Apply directly for ${job.title} at ${job.company} in ${job.location || 'Remote'}. Verified early-career software engineering opportunity with direct company application.`;

        // Transform HTML using Cloudflare Pages HTMLRewriter
        let schemaInserted = false;
        return new (globalThis as any).HTMLRewriter()
          .on('title', {
            element(t: any) {
              t.setInnerContent(titleText);
              // Guaranteed insertion directly after <title> (present in all HTML responses)
              if (!schemaInserted) {
                schemaInserted = true;
                t.after(
                  `\n<script id="google-job-posting-schema" type="application/ld+json">\n${schemaJson}\n</script>\n`,
                  { html: true }
                );
              }
            },
          })
          .on('head', {
            element(head: any) {
              if (!schemaInserted) {
                schemaInserted = true;
                head.append(
                  `\n<script id="google-job-posting-schema" type="application/ld+json">\n${schemaJson}\n</script>\n`,
                  { html: true }
                );
              }
            },
          })
          .on('meta[name="description"]', {
            element(m: any) {
              m.setAttribute('content', metaDesc);
            },
          })
          .on('meta[property="og:title"]', {
            element(m: any) {
              m.setAttribute('content', titleText);
            },
          })
          .on('meta[property="og:description"]', {
            element(m: any) {
              m.setAttribute('content', metaDesc);
            },
          })
          .transform(response);
      }
    }
  } catch (e) {
    // Graceful fallback to static response
  }

  return response;
};
