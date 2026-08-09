import { searchMaps, formatMapLocation, type MapResult } from "@/services";
import { useSearchDropdown } from "../hooks/useSearchDropdown";

interface MapSearchProps {
  onSelect: (map: MapResult) => void;
  onClear: () => void;
  selectedMap: { name: string; region: string; returnMapName?: string } | null;
}

const MAP_SEARCH_MIN_CHARS = 3;

export const MapSearch = ({ onSelect, onClear, selectedMap }: MapSearchProps) => {
  const { query, setQuery, results, isOpen, setIsOpen, loading, wrapperRef } =
    useSearchDropdown<MapResult>(searchMaps, MAP_SEARCH_MIN_CHARS);

  const handleSelect = (map: MapResult) => {
    onSelect(map);
    setQuery(map.name);
    setIsOpen(false);
  };

  if (selectedMap) {
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-800 border border-maple-border rounded-lg">
        <span className="text-2xl flex-shrink-0">📍</span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate">{selectedMap.name}</p>
          <p className="text-slate-400 text-xs truncate">{formatMapLocation(selectedMap as MapResult)}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onClear();
            setQuery("");
          }}
          className="text-slate-400 hover:text-red-400 transition-colors text-sm flex-shrink-0"
        >
          ✕ Change
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type at least 3 characters to search maps..."
          className="w-full px-4 py-2.5 bg-slate-800 border border-maple-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-maple-orange/50 focus:border-maple-orange transition-all"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-maple-orange text-sm animate-pulse">
            Searching...
          </span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 max-h-72 overflow-y-auto bg-slate-800 border border-maple-border rounded-lg shadow-xl">
          {results.map((map) => (
            <button
              key={map.id}
              type="button"
              onClick={() => handleSelect(map)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700 transition-colors text-left"
            >
              <span className="text-lg flex-shrink-0">📍</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{map.name}</p>
                <p className="text-slate-400 text-xs truncate">{formatMapLocation(map)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && !loading && query.length >= MAP_SEARCH_MIN_CHARS && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-maple-border rounded-lg p-3 text-slate-400 text-sm text-center">
          No maps found
        </div>
      )}
    </div>
  );
};
