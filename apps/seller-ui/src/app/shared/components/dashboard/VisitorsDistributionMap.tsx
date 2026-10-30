'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Globe, X, TrendingUp } from 'lucide-react';
import { CountryData, findCountryData, resolveNumericCode } from './countryCodes';

export type { CountryData };

export interface VisitorsDistributionMapProps {
  data?: CountryData[];
  isLoading?: boolean;
}

// TopoJSON world atlas hosted locally in Next.js public directory
const GEO_URL = '/countries-110m.json';

// High-contrast 5-tier emerald green intensity palette for dark SaaS dashboards
const INTENSITY_TIERS = [
  { min: 0.0, max: 0.2, fill: '#065f46', stroke: '#047857', label: '1 - 20%' },   // emerald-800
  { min: 0.2, max: 0.4, fill: '#047857', stroke: '#059669', label: '21 - 40%' },  // emerald-700
  { min: 0.4, max: 0.6, fill: '#059669', stroke: '#10b981', label: '41 - 60%' },  // emerald-600
  { min: 0.6, max: 0.8, fill: '#10b981', stroke: '#34d399', label: '61 - 80%' },  // emerald-500
  { min: 0.8, max: 1.0, fill: '#22c55e', stroke: '#86efac', label: '81 - 100%' }, // emerald-400/green-500
];

// Base continent styling for maximum visibility and high contrast
const EMPTY_COUNTRY_FILL = '#1e293b';   // slate-800 (clean, visible continent silhouette)
const EMPTY_COUNTRY_STROKE = '#334155'; // slate-700 (crisp high-contrast borders)
const EMPTY_COUNTRY_HOVER = '#384c68';  // slate-650 on hover

const ACTIVE_COUNTRY_HOVER = '#4ade80'; // vibrant emerald-400 on hover
const ACTIVE_HOVER_STROKE = '#bbf7d0';  // emerald-200 on hover

const SELECTED_FILL = '#22c55e';        // emerald-500 for active selection
const SELECTED_STROKE = '#ffffff';      // crisp white border for selected country

export const VisitorsDistributionMap: React.FC<VisitorsDistributionMapProps> = ({
  data = [],
  isLoading = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [hoveredGeoKey, setHoveredGeoKey] = useState<string | null>(null);
  const [hoveredInfo, setHoveredInfo] = useState<{
    name: string;
    code?: string;
    count?: number;
    percentage?: number;
    hasVisitors: boolean;
  } | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter and safely sanitize data (no mutation)
  const validData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        ...item,
        count: Math.max(0, Number(item.count) || 0),
        percentage: Math.max(0, Number(item.percentage) || 0),
      }));
  }, [data]);

  // Overall statistics
  const totalVisitors = useMemo(
    () => validData.reduce((acc, curr) => acc + curr.count, 0),
    [validData],
  );

  const maxCount = useMemo(
    () => Math.max(...validData.map((d) => d.count), 1),
    [validData],
  );

  // Top 5 countries sorted descending by visitor count
  const topCountries = useMemo(() => {
    return [...validData]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [validData]);

  // Compute green intensity fill and border colors for a country
  const getIntensityColors = (countryMatch?: CountryData) => {
    if (!countryMatch || countryMatch.count <= 0) {
      return { fill: EMPTY_COUNTRY_FILL, stroke: EMPTY_COUNTRY_STROKE };
    }
    const ratio = Math.min(1, Math.max(0, countryMatch.count / maxCount));
    for (let i = INTENSITY_TIERS.length - 1; i >= 0; i--) {
      if (ratio >= INTENSITY_TIERS[i].min) {
        return { fill: INTENSITY_TIERS[i].fill, stroke: INTENSITY_TIERS[i].stroke };
      }
    }
    return { fill: INTENSITY_TIERS[0].fill, stroke: INTENSITY_TIERS[0].stroke };
  };

  // Check if a geography matches the currently selected country
  const isGeoSelected = (
    geoId?: string,
    geoName?: string,
    countryMatch?: CountryData,
  ): boolean => {
    if (!selectedCountry) return false;
    if (countryMatch && countryMatch.code === selectedCountry.code) return true;
    const selectedNumeric =
      resolveNumericCode(selectedCountry.code) ||
      resolveNumericCode(selectedCountry.name);
    const geoNumeric = geoId ? String(geoId).padStart(3, '0') : null;
    if (selectedNumeric && geoNumeric && selectedNumeric === geoNumeric) return true;
    if (
      geoName &&
      selectedCountry.name &&
      geoName.toLowerCase().trim() === selectedCountry.name.toLowerCase().trim()
    ) {
      return true;
    }
    return false;
  };

  // Render proper loading skeleton
  if (isLoading || !mounted) {
    return (
      <div className="w-full h-full flex flex-col justify-between p-6 rounded-2xl bg-[#0b0f17] border border-slate-800/80 shadow-xl select-none animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
          <div className="space-y-2">
            <div className="h-5 w-44 bg-slate-800 rounded-md" />
            <div className="h-3 w-64 bg-slate-800/60 rounded-md" />
          </div>
          <div className="h-6 w-28 bg-slate-800/80 rounded-full" />
        </div>

        {/* Map Placeholder Skeleton */}
        <div className="relative w-full h-[250px] my-3 flex items-center justify-center rounded-xl bg-slate-900/40 border border-slate-800/40">
          <Globe className="w-16 h-16 text-slate-800 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center bg-radial from-slate-800/10 to-transparent" />
        </div>

        {/* Legend Skeleton */}
        <div className="h-4 w-48 bg-slate-800/60 rounded mb-3" />

        {/* Top 5 Countries Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 border-t border-slate-800/60">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-900/60 rounded-xl border border-slate-800/40" />
          ))}
        </div>
      </div>
    );
  }

  // Meaningful empty state when no visitor data exists
  const hasNoData = validData.length === 0 || totalVisitors === 0;

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 rounded-2xl bg-[#0b0f17] border border-slate-800/80 shadow-xl overflow-hidden select-none">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Visitors Distribution
            </h2>
            {totalVisitors > 0 && (
              <span className="px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 rounded-full">
                {totalVisitors.toLocaleString()} Total
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">
            Geographic breakdown of store traffic across countries
          </p>
        </div>

        {/* Selected Country Badge / Reset Action */}
        {selectedCountry ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-600/80 text-emerald-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">{selectedCountry.name}</span>
            <span className="text-slate-300 font-mono">
              ({selectedCountry.count.toLocaleString()} • {selectedCountry.percentage}%)
            </span>
            <button
              onClick={() => setSelectedCountry(null)}
              className="ml-1 text-slate-400 hover:text-white transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium self-start sm:self-auto">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive World Map</span>
          </div>
        )}
      </div>

      {/* 2. Interactive Map Container */}
      <div className="relative w-full h-[255px] my-3 flex items-center justify-center bg-[#040711] rounded-xl border border-slate-800/80 overflow-hidden">
        {hasNoData ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-slate-950/80 backdrop-blur-[2px]">
            <Globe className="w-10 h-10 text-slate-600 mb-2" />
            <h3 className="text-sm font-semibold text-slate-200">
              No visitor geographic data yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Country statistics and global distribution will populate automatically as visitors
              browse your store.
            </p>
          </div>
        ) : null}

        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{
            scale: 155,
            center: [0, 8],
          }}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoId = geo.id as string | undefined;
                const geoName = (geo.properties?.name as string) || '';
                const countryMatch = findCountryData(geoId, geoName, validData);
                const isSelected = isGeoSelected(geoId, geoName, countryMatch);
                const isHovered = hoveredGeoKey === (geoId || geo.rsmKey);
                const hasVisitors = Boolean(countryMatch && countryMatch.count > 0);
                const { fill: baseFill, stroke: baseStroke } = getIntensityColors(countryMatch);

                // Compute high-contrast dynamic SVG fill & stroke
                let currentFill = baseFill;
                let currentStroke = baseStroke;
                let currentStrokeWidth = hasVisitors ? 0.8 : 0.5;

                if (isSelected) {
                  currentFill = SELECTED_FILL;
                  currentStroke = SELECTED_STROKE;
                  currentStrokeWidth = 1.8;
                } else if (isHovered) {
                  currentFill = hasVisitors ? ACTIVE_COUNTRY_HOVER : EMPTY_COUNTRY_HOVER;
                  currentStroke = hasVisitors ? ACTIVE_HOVER_STROKE : '#64748b';
                  currentStrokeWidth = hasVisitors ? 1.4 : 1.0;
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={currentFill}
                    stroke={currentStroke}
                    strokeWidth={currentStrokeWidth}
                    className="outline-none transition-colors duration-150 cursor-pointer"
                    onMouseEnter={() => {
                      setHoveredGeoKey(geoId || geo.rsmKey);
                      setHoveredInfo({
                        name: countryMatch?.name || geoName || 'Unknown Region',
                        code: countryMatch?.code,
                        count: countryMatch?.count,
                        percentage: countryMatch?.percentage,
                        hasVisitors,
                      });
                    }}
                    onMouseLeave={() => {
                      setHoveredGeoKey(null);
                      setHoveredInfo(null);
                    }}
                    onClick={() => {
                      if (countryMatch) {
                        setSelectedCountry(selectedCountry?.code === countryMatch.code ? null : countryMatch);
                      } else {
                        setSelectedCountry({
                          name: geoName || 'Unknown',
                          code: (geoId as string) || '',
                          count: 0,
                          percentage: 0,
                        });
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Clean Interactive Hover Tooltip */}
        {hoveredInfo && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md transition-all duration-150">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                hoveredInfo.hasVisitors ? 'bg-emerald-400 ring-2 ring-emerald-400/40' : 'bg-slate-500'
              }`}
            />
            <div className="text-left">
              <span className="text-xs font-semibold text-white tracking-tight mr-2">
                {hoveredInfo.name}
              </span>
              {hoveredInfo.hasVisitors ? (
                <span className="text-[11px] text-emerald-300 font-mono font-medium">
                  {(hoveredInfo.count ?? 0).toLocaleString()} visitors ({hoveredInfo.percentage}%)
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-normal">
                  No visitors recorded
                </span>
              )}
            </div>
          </div>
        )}

        {/* Clean Intensity Legend (Bottom-Left Overlay) */}
        {!hasNoData && (
          <div className="absolute bottom-2.5 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 backdrop-blur-sm text-[10px] text-slate-300 shadow-lg">
            <span className="font-semibold text-slate-200">Traffic:</span>
            <span className="text-slate-400">Less</span>
            <div className="flex items-center gap-1">
              {INTENSITY_TIERS.map((tier, idx) => (
                <span
                  key={idx}
                  className="w-3 h-3 rounded-[3px] border border-slate-900"
                  style={{ backgroundColor: tier.fill }}
                  title={tier.label}
                />
              ))}
            </div>
            <span className="text-slate-400">More</span>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-[3px] bg-[#1e293b] border border-slate-700" />
              <span className="text-slate-400">No data</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Top 5 Countries Cards & Percentage Indicators */}
      {!hasNoData && topCountries.length > 0 && (
        <div className="pt-2 border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Top 5 Visitor Locations</span>
            </h4>
            <span className="text-[10px] text-slate-400">Click to highlight on map</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {topCountries.map((c, index) => {
              const isSelected = selectedCountry?.code === c.code || selectedCountry?.name === c.name;
              const { fill: intensityColor } = getIntensityColors(c);

              return (
                <button
                  key={c.code || c.name}
                  onClick={() => setSelectedCountry(isSelected ? null : c)}
                  onMouseEnter={() => {
                    const num = resolveNumericCode(c.code) || resolveNumericCode(c.name);
                    if (num) setHoveredGeoKey(num);
                  }}
                  onMouseLeave={() => setHoveredGeoKey(null)}
                  className={`group flex flex-col justify-between p-2.5 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: intensityColor }}
                      />
                      <span
                        className="text-[12px] font-semibold text-slate-100 truncate group-hover:text-white"
                        title={c.name}
                      >
                        {c.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono shrink-0">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-[11px] mb-1.5">
                    <span className="text-slate-400 font-mono text-[10px]">
                      {c.count.toLocaleString()} visitors
                    </span>
                    <span className="text-emerald-400 font-bold font-mono text-[11px]">
                      {c.percentage}%
                    </span>
                  </div>

                  {/* Percentage Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(4, c.percentage))}%`,
                        backgroundColor: intensityColor,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorsDistributionMap;
