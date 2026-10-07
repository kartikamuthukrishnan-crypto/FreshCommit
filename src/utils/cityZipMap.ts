/**
 * Comprehensive US Tech Hubs, Metropolitan Areas & Postal/ZIP Code Map
 * Used by Job Extractor and Admin Panel for precise Google for Jobs JobPosting Schema compliance
 */

export interface CityZipEntry {
  city: string;
  state: string;
  zip: string;
  defaultLocation: string;
}

export const KNOWN_CITY_ZIP_MAP: Record<string, CityZipEntry> = {
  // --- California (Silicon Valley, Bay Area & SoCal) ---
  'san francisco': { city: 'San Francisco', state: 'CA', zip: '94105', defaultLocation: 'San Francisco, CA / Hybrid' },
  'sf': { city: 'San Francisco', state: 'CA', zip: '94105', defaultLocation: 'San Francisco, CA / Hybrid' },
  'san francisco bay area': { city: 'San Francisco', state: 'CA', zip: '94105', defaultLocation: 'San Francisco, CA / Hybrid' },
  'bay area': { city: 'San Francisco', state: 'CA', zip: '94105', defaultLocation: 'San Francisco, CA / Hybrid' },
  'san jose': { city: 'San Jose', state: 'CA', zip: '95113', defaultLocation: 'San Jose, CA / Hybrid' },
  'sunnyvale': { city: 'Sunnyvale', state: 'CA', zip: '94086', defaultLocation: 'Sunnyvale, CA / Hybrid' },
  'mountain view': { city: 'Mountain View', state: 'CA', zip: '94043', defaultLocation: 'Mountain View, CA / Hybrid' },
  'palo alto': { city: 'Palo Alto', state: 'CA', zip: '94301', defaultLocation: 'Palo Alto, CA / Hybrid' },
  'menlo park': { city: 'Menlo Park', state: 'CA', zip: '94025', defaultLocation: 'Menlo Park, CA / Hybrid' },
  'santa clara': { city: 'Santa Clara', state: 'CA', zip: '95054', defaultLocation: 'Santa Clara, CA / Hybrid' },
  'cupertino': { city: 'Cupertino', state: 'CA', zip: '95014', defaultLocation: 'Cupertino, CA / Hybrid' },
  'redwood city': { city: 'Redwood City', state: 'CA', zip: '94063', defaultLocation: 'Redwood City, CA / Hybrid' },
  'fremont': { city: 'Fremont', state: 'CA', zip: '94538', defaultLocation: 'Fremont, CA / Hybrid' },
  'oakland': { city: 'Oakland', state: 'CA', zip: '94612', defaultLocation: 'Oakland, CA / Hybrid' },
  'berkeley': { city: 'Berkeley', state: 'CA', zip: '94704', defaultLocation: 'Berkeley, CA / Hybrid' },
  'san mateo': { city: 'San Mateo', state: 'CA', zip: '94402', defaultLocation: 'San Mateo, CA / Hybrid' },
  'foster city': { city: 'Foster City', state: 'CA', zip: '94404', defaultLocation: 'Foster City, CA / Hybrid' },
  'pleasanton': { city: 'Pleasanton', state: 'CA', zip: '94588', defaultLocation: 'Pleasanton, CA / Hybrid' },
  'los gatos': { city: 'Los Gatos', state: 'CA', zip: '95032', defaultLocation: 'Los Gatos, CA / Hybrid' },
  'los angeles': { city: 'Los Angeles', state: 'CA', zip: '90012', defaultLocation: 'Los Angeles, CA / Hybrid' },
  'la': { city: 'Los Angeles', state: 'CA', zip: '90012', defaultLocation: 'Los Angeles, CA / Hybrid' },
  'santa monica': { city: 'Santa Monica', state: 'CA', zip: '90401', defaultLocation: 'Santa Monica, CA / Hybrid' },
  'culver city': { city: 'Culver City', state: 'CA', zip: '90232', defaultLocation: 'Culver City, CA / Hybrid' },
  'irvine': { city: 'Irvine', state: 'CA', zip: '92614', defaultLocation: 'Irvine, CA / Hybrid' },
  'pasadena': { city: 'Pasadena', state: 'CA', zip: '91101', defaultLocation: 'Pasadena, CA / Hybrid' },
  'burbank': { city: 'Burbank', state: 'CA', zip: '91502', defaultLocation: 'Burbank, CA / Hybrid' },
  'san diego': { city: 'San Diego', state: 'CA', zip: '92101', defaultLocation: 'San Diego, CA / Hybrid' },

  // --- Washington (Greater Seattle & Puget Sound) ---
  'seattle': { city: 'Seattle', state: 'WA', zip: '98101', defaultLocation: 'Seattle, WA / Hybrid' },
  'bellevue': { city: 'Bellevue', state: 'WA', zip: '98004', defaultLocation: 'Bellevue, WA / Hybrid' },
  'redmond': { city: 'Redmond', state: 'WA', zip: '98052', defaultLocation: 'Redmond, WA / Hybrid' },
  'kirkland': { city: 'Kirkland', state: 'WA', zip: '98033', defaultLocation: 'Kirkland, WA / Hybrid' },
  'renton': { city: 'Renton', state: 'WA', zip: '98057', defaultLocation: 'Renton, WA / Hybrid' },
  'bothell': { city: 'Bothell', state: 'WA', zip: '98011', defaultLocation: 'Bothell, WA / Hybrid' },

  // --- New York & Tri-State Area ---
  'new york': { city: 'New York', state: 'NY', zip: '10001', defaultLocation: 'New York, NY / Hybrid' },
  'nyc': { city: 'New York', state: 'NY', zip: '10001', defaultLocation: 'New York, NY / Hybrid' },
  'manhattan': { city: 'New York', state: 'NY', zip: '10001', defaultLocation: 'New York, NY / Hybrid' },
  'new york city': { city: 'New York', state: 'NY', zip: '10001', defaultLocation: 'New York, NY / Hybrid' },
  'brooklyn': { city: 'Brooklyn', state: 'NY', zip: '11201', defaultLocation: 'Brooklyn, NY / Hybrid' },
  'queens': { city: 'Queens', state: 'NY', zip: '11101', defaultLocation: 'Queens, NY / Hybrid' },
  'jersey city': { city: 'Jersey City', state: 'NJ', zip: '07302', defaultLocation: 'Jersey City, NJ / Hybrid' },
  'hoboken': { city: 'Hoboken', state: 'NJ', zip: '07030', defaultLocation: 'Hoboken, NJ / Hybrid' },
  'newark': { city: 'Newark', state: 'NJ', zip: '07102', defaultLocation: 'Newark, NJ / Hybrid' },

  // --- Massachusetts (Greater Boston Tech Corridor) ---
  'boston': { city: 'Boston', state: 'MA', zip: '02110', defaultLocation: 'Boston, MA / Hybrid' },
  'cambridge': { city: 'Cambridge', state: 'MA', zip: '02138', defaultLocation: 'Cambridge, MA / Hybrid' },
  'waltham': { city: 'Waltham', state: 'MA', zip: '02451', defaultLocation: 'Waltham, MA / Hybrid' },
  'burlington': { city: 'Burlington', state: 'MA', zip: '01803', defaultLocation: 'Burlington, MA / Hybrid' },
  'somerville': { city: 'Somerville', state: 'MA', zip: '02143', defaultLocation: 'Somerville, MA / Hybrid' },

  // --- Texas (Austin, Dallas-Fort Worth, Houston) ---
  'austin': { city: 'Austin', state: 'TX', zip: '78701', defaultLocation: 'Austin, TX / Hybrid' },
  'round rock': { city: 'Round Rock', state: 'TX', zip: '78664', defaultLocation: 'Round Rock, TX / Hybrid' },
  'dallas': { city: 'Dallas', state: 'TX', zip: '75201', defaultLocation: 'Dallas, TX / Hybrid' },
  'plano': { city: 'Plano', state: 'TX', zip: '75024', defaultLocation: 'Plano, TX / Hybrid' },
  'irving': { city: 'Irving', state: 'TX', zip: '75038', defaultLocation: 'Irving, TX / Hybrid' },
  'fort worth': { city: 'Fort Worth', state: 'TX', zip: '76102', defaultLocation: 'Fort Worth, TX / Hybrid' },
  'houston': { city: 'Houston', state: 'TX', zip: '77002', defaultLocation: 'Houston, TX / Hybrid' },
  'san antonio': { city: 'San Antonio', state: 'TX', zip: '78205', defaultLocation: 'San Antonio, TX / Hybrid' },

  // --- Illinois (Chicago Metro) ---
  'chicago': { city: 'Chicago', state: 'IL', zip: '60601', defaultLocation: 'Chicago, IL / Hybrid' },
  'naperville': { city: 'Naperville', state: 'IL', zip: '60540', defaultLocation: 'Naperville, IL / Hybrid' },
  'evanston': { city: 'Evanston', state: 'IL', zip: '60201', defaultLocation: 'Evanston, IL / Hybrid' },

  // --- Colorado (Denver & Boulder Tech Corridor) ---
  'denver': { city: 'Denver', state: 'CO', zip: '80202', defaultLocation: 'Denver, CO / Hybrid' },
  'boulder': { city: 'Boulder', state: 'CO', zip: '80301', defaultLocation: 'Boulder, CO / Hybrid' },
  'colorado springs': { city: 'Colorado Springs', state: 'CO', zip: '80903', defaultLocation: 'Colorado Springs, CO / Hybrid' },

  // --- Georgia (Atlanta Metro) ---
  'atlanta': { city: 'Atlanta', state: 'GA', zip: '30303', defaultLocation: 'Atlanta, GA / Hybrid' },
  'alpharetta': { city: 'Alpharetta', state: 'GA', zip: '30009', defaultLocation: 'Alpharetta, GA / Hybrid' },

  // --- Washington D.C. Metro & Northern Virginia ---
  'washington': { city: 'Washington', state: 'DC', zip: '20001', defaultLocation: 'Washington, DC / Hybrid' },
  'dc': { city: 'Washington', state: 'DC', zip: '20001', defaultLocation: 'Washington, DC / Hybrid' },
  'washington dc': { city: 'Washington', state: 'DC', zip: '20001', defaultLocation: 'Washington, DC / Hybrid' },
  'arlington': { city: 'Arlington', state: 'VA', zip: '22201', defaultLocation: 'Arlington, VA / Hybrid' },
  'mclean': { city: 'McLean', state: 'VA', zip: '22102', defaultLocation: 'McLean, VA / Hybrid' },
  'reston': { city: 'Reston', state: 'VA', zip: '20190', defaultLocation: 'Reston, VA / Hybrid' },
  'alexandria': { city: 'Alexandria', state: 'VA', zip: '22314', defaultLocation: 'Alexandria, VA / Hybrid' },
  'ashburn': { city: 'Ashburn', state: 'VA', zip: '20147', defaultLocation: 'Ashburn, VA / Hybrid' },
  'bethesda': { city: 'Bethesda', state: 'MD', zip: '20814', defaultLocation: 'Bethesda, MD / Hybrid' },
  'baltimore': { city: 'Baltimore', state: 'MD', zip: '21201', defaultLocation: 'Baltimore, MD / Hybrid' },

  // --- North Carolina (Research Triangle & Charlotte) ---
  'raleigh': { city: 'Raleigh', state: 'NC', zip: '27601', defaultLocation: 'Raleigh, NC / Hybrid' },
  'durham': { city: 'Durham', state: 'NC', zip: '27701', defaultLocation: 'Durham, NC / Hybrid' },
  'chapel hill': { city: 'Chapel Hill', state: 'NC', zip: '27514', defaultLocation: 'Chapel Hill, NC / Hybrid' },
  'charlotte': { city: 'Charlotte', state: 'NC', zip: '28202', defaultLocation: 'Charlotte, NC / Hybrid' },

  // --- Pacific Northwest (Oregon) & Utah ---
  'portland': { city: 'Portland', state: 'OR', zip: '97201', defaultLocation: 'Portland, OR / Hybrid' },
  'beaverton': { city: 'Beaverton', state: 'OR', zip: '97005', defaultLocation: 'Beaverton, OR / Hybrid' },
  'hillsboro': { city: 'Hillsboro', state: 'OR', zip: '97124', defaultLocation: 'Hillsboro, OR / Hybrid' },
  'salt lake city': { city: 'Salt Lake City', state: 'UT', zip: '84101', defaultLocation: 'Salt Lake City, UT / Hybrid' },
  'lehi': { city: 'Lehi', state: 'UT', zip: '84043', defaultLocation: 'Lehi, UT / Hybrid' },
  'provo': { city: 'Provo', state: 'UT', zip: '84601', defaultLocation: 'Provo, UT / Hybrid' },

  // --- Southwest (Arizona & Nevada) ---
  'phoenix': { city: 'Phoenix', state: 'AZ', zip: '85001', defaultLocation: 'Phoenix, AZ / Hybrid' },
  'tempe': { city: 'Tempe', state: 'AZ', zip: '85281', defaultLocation: 'Tempe, AZ / Hybrid' },
  'scottsdale': { city: 'Scottsdale', state: 'AZ', zip: '85251', defaultLocation: 'Scottsdale, AZ / Hybrid' },
  'chandler': { city: 'Chandler', state: 'AZ', zip: '85224', defaultLocation: 'Chandler, AZ / Hybrid' },
  'las vegas': { city: 'Las Vegas', state: 'NV', zip: '89101', defaultLocation: 'Las Vegas, NV / Hybrid' },

  // --- Midwest Tech Hubs ---
  'minneapolis': { city: 'Minneapolis', state: 'MN', zip: '55401', defaultLocation: 'Minneapolis, MN / Hybrid' },
  'st paul': { city: 'St. Paul', state: 'MN', zip: '55101', defaultLocation: 'St. Paul, MN / Hybrid' },
  'indianapolis': { city: 'Indianapolis', state: 'IN', zip: '46204', defaultLocation: 'Indianapolis, IN / Hybrid' },
  'columbus': { city: 'Columbus', state: 'OH', zip: '43215', defaultLocation: 'Columbus, OH / Hybrid' },
  'cincinnati': { city: 'Cincinnati', state: 'OH', zip: '45202', defaultLocation: 'Cincinnati, OH / Hybrid' },
  'cleveland': { city: 'Cleveland', state: 'OH', zip: '44114', defaultLocation: 'Cleveland, OH / Hybrid' },
  'detroit': { city: 'Detroit', state: 'MI', zip: '48226', defaultLocation: 'Detroit, MI / Hybrid' },
  'ann arbor': { city: 'Ann Arbor', state: 'MI', zip: '48104', defaultLocation: 'Ann Arbor, MI / Hybrid' },
  'pittsburgh': { city: 'Pittsburgh', state: 'PA', zip: '15219', defaultLocation: 'Pittsburgh, PA / Hybrid' },
  'philadelphia': { city: 'Philadelphia', state: 'PA', zip: '19102', defaultLocation: 'Philadelphia, PA / Hybrid' },
  'st louis': { city: 'St. Louis', state: 'MO', zip: '63101', defaultLocation: 'St. Louis, MO / Hybrid' },
  'kansas city': { city: 'Kansas City', state: 'MO', zip: '64106', defaultLocation: 'Kansas City, MO / Hybrid' },

  // --- Southeast & Florida ---
  'miami': { city: 'Miami', state: 'FL', zip: '33131', defaultLocation: 'Miami, FL / Hybrid' },
  'tampa': { city: 'Tampa', state: 'FL', zip: '33602', defaultLocation: 'Tampa, FL / Hybrid' },
  'orlando': { city: 'Orlando', state: 'FL', zip: '32801', defaultLocation: 'Orlando, FL / Hybrid' },
  'nashville': { city: 'Nashville', state: 'TN', zip: '37201', defaultLocation: 'Nashville, TN / Hybrid' }
};

/**
 * Resolves postal code and clean state for a given city name
 */
export function lookupCityZip(cityName: string): CityZipEntry | undefined {
  if (!cityName) return undefined;
  const raw = cityName.trim();

  // 1. Direct exact match
  const norm = raw.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  if (KNOWN_CITY_ZIP_MAP[norm]) return KNOWN_CITY_ZIP_MAP[norm];

  // 2. Extract city before comma (e.g. "Boston, MA" -> "boston")
  if (raw.includes(',')) {
    const cityPart = raw.split(',')[0].trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
    if (KNOWN_CITY_ZIP_MAP[cityPart]) return KNOWN_CITY_ZIP_MAP[cityPart];
  }

  // 3. Extract city before hyphen or slash (e.g. "Boston-MA-USA" -> "boston")
  const dashParts = raw.split(/[-_/]/);
  if (dashParts.length > 1) {
    const firstPart = dashParts[0].trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
    if (KNOWN_CITY_ZIP_MAP[firstPart]) return KNOWN_CITY_ZIP_MAP[firstPart];
  }

  // 4. Substring scan across known tech hubs
  for (const [key, entry] of Object.entries(KNOWN_CITY_ZIP_MAP)) {
    if (norm.startsWith(key) || norm.includes(key)) {
      return entry;
    }
  }

  return undefined;
}
