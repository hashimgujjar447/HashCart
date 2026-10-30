export interface CountryData {
  name: string;
  code: string;
  count: number;
  percentage: number;
  color?: string;
}

// ISO 3166-1 alpha-2 to numeric 3-digit code mapping
export const ALPHA2_TO_NUMERIC: Record<string, string> = {
  AF: '004', AL: '008', DZ: '012', AO: '024', AR: '032', AM: '051', AU: '036', AT: '040',
  AZ: '031', BS: '044', BD: '050', BY: '112', BE: '056', BZ: '084', BJ: '204', BT: '064',
  BO: '068', BA: '070', BW: '072', BR: '076', BN: '096', BG: '100', BF: '854', BI: '108',
  KH: '116', CM: '120', CA: '124', CF: '140', TD: '148', CL: '152', CN: '156', CO: '170',
  CG: '178', CD: '180', CR: '188', CI: '384', HR: '191', CU: '192', CY: '196', CZ: '203',
  DK: '208', DJ: '262', DO: '214', EC: '218', EG: '818', SV: '222', GQ: '226', ER: '232',
  EE: '233', ET: '231', FK: '238', FJ: '242', FI: '246', FR: '250', TF: '260', GA: '266',
  GM: '270', GE: '268', DE: '276', GH: '288', GR: '300', GL: '304', GT: '320', GN: '324',
  GW: '624', GY: '328', HT: '332', HN: '340', HU: '348', IS: '352', IN: '356', ID: '360',
  IR: '364', IQ: '368', IE: '372', IL: '376', IT: '380', JM: '388', JP: '392', JO: '400',
  KZ: '398', KE: '404', KP: '408', KR: '410', KW: '414', KG: '417', LA: '418', LV: '428',
  LB: '422', LS: '426', LR: '430', LY: '434', LT: '440', LU: '442', MK: '807', MG: '450',
  MW: '454', MY: '458', ML: '466', MR: '478', MX: '484', MD: '498', MN: '496', ME: '499',
  MA: '504', MZ: '508', MM: '104', NA: '516', NP: '524', NL: '528', NC: '540', NZ: '554',
  NI: '558', NE: '562', NG: '566', NO: '578', OM: '512', PK: '586', PA: '591', PG: '598',
  PY: '600', PE: '604', PH: '608', PL: '616', PT: '620', PR: '630', QA: '634', RO: '642',
  RU: '643', RW: '646', SA: '682', SN: '686', RS: '688', SL: '694', SK: '703', SI: '705',
  SB: '090', SO: '706', ZA: '710', SS: '728', ES: '724', LK: '144', SD: '729', SR: '740',
  SZ: '748', SE: '752', CH: '756', SY: '760', TW: '158', TJ: '762', TZ: '834', TH: '764',
  TL: '626', TG: '768', TT: '780', TN: '788', TR: '792', TM: '795', UG: '800', UA: '804',
  AE: '784', GB: '826', US: '840', UY: '858', UZ: '860', VU: '548', VE: '862', VN: '704',
  PS: '275', YE: '887', ZM: '894', ZW: '716',
};

// ISO 3166-1 alpha-3 to numeric mapping
export const ALPHA3_TO_NUMERIC: Record<string, string> = {
  USA: '840', CAN: '124', IND: '356', GBR: '826', PAK: '586', AUS: '036', DEU: '276',
  FRA: '250', CHN: '156', JPN: '392', BRA: '076', ITA: '380', ESP: '724', MEX: '484',
  RUS: '643', SAU: '682', ARE: '784', ZAF: '710', EGY: '818', NGA: '566', TUR: '792',
  IDN: '360', KOR: '410', SGP: '702', MYS: '458', THA: '764', VNM: '704', PHL: '608',
  BGD: '050', NZL: '554', IRL: '372', NLD: '528', SWE: '752', CHE: '756', POL: '616',
  UKR: '804', ARG: '032', CHL: '152', COL: '170', PER: '604', KWT: '414', QAT: '634',
  NOR: '578', DNK: '208', FIN: '246', AUT: '040', BEL: '056', PRT: '620', GRC: '300',
};

// Common names and aliases to numeric mapping
export const NAME_TO_NUMERIC: Record<string, string> = {
  'united states': '840',
  'united states of america': '840',
  usa: '840',
  us: '840',
  canada: '124',
  india: '356',
  'united kingdom': '826',
  uk: '826',
  'great britain': '826',
  pakistan: '586',
  australia: '036',
  germany: '276',
  france: '250',
  china: '156',
  japan: '392',
  brazil: '076',
  italy: '380',
  spain: '724',
  mexico: '484',
  russia: '643',
  'saudi arabia': '682',
  'united arab emirates': '784',
  uae: '784',
  'south africa': '710',
  egypt: '818',
  nigeria: '566',
  turkey: '792',
  türkiye: '792',
  indonesia: '360',
  'south korea': '410',
  korea: '410',
  singapore: '702',
  malaysia: '458',
  thailand: '764',
  vietnam: '704',
  philippines: '608',
  bangladesh: '050',
  'new zealand': '554',
  ireland: '372',
  netherlands: '528',
  sweden: '752',
  switzerland: '756',
  poland: '616',
  ukraine: '804',
  argentina: '032',
  chile: '152',
  colombia: '170',
  peru: '604',
};

/**
 * Resolves any country code (Alpha-2, Alpha-3, Numeric) or name to its 3-digit numeric ISO code.
 */
export function resolveNumericCode(codeOrName: string): string | null {
  if (!codeOrName) return null;
  const raw = codeOrName.trim();
  const upper = raw.toUpperCase();
  const lower = raw.toLowerCase();

  // 1. Direct Alpha-2 match
  if (ALPHA2_TO_NUMERIC[upper]) {
    return ALPHA2_TO_NUMERIC[upper];
  }

  // 2. Direct Alpha-3 match
  if (ALPHA3_TO_NUMERIC[upper]) {
    return ALPHA3_TO_NUMERIC[upper];
  }

  // 3. Name or alias match
  if (NAME_TO_NUMERIC[lower]) {
    return NAME_TO_NUMERIC[lower];
  }

  // 4. If already numeric (e.g. "840", "124", "36")
  if (/^\d+$/.test(raw)) {
    return raw.padStart(3, '0');
  }

  return null;
}

/**
 * Matches a React Simple Maps geography object to an entry in the countryData list.
 */
export function findCountryData(
  geoId: string | undefined,
  geoName: string | undefined,
  data: CountryData[],
): CountryData | undefined {
  if (!data || data.length === 0) return undefined;

  const normalizedGeoId = geoId ? geoId.padStart(3, '0') : null;
  const normalizedGeoName = geoName ? geoName.toLowerCase().trim() : null;

  return data.find((item) => {
    // 1. Match by resolved numeric code
    const itemNumeric = resolveNumericCode(item.code) || resolveNumericCode(item.name);
    if (itemNumeric && normalizedGeoId && itemNumeric === normalizedGeoId) {
      return true;
    }

    // 2. Match by direct country name
    if (normalizedGeoName && item.name) {
      const itemLower = item.name.toLowerCase().trim();
      if (
        normalizedGeoName === itemLower ||
        normalizedGeoName.includes(itemLower) ||
        itemLower.includes(normalizedGeoName)
      ) {
        return true;
      }
    }

    return false;
  });
}
