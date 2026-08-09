const DATA_BASE_URL = "https://osmsdataexplorer.com/data/current";

export interface MapResult {
  id: number;
  name: string;
  region: string;
  /** The town/hub this map exits back to — absent for top-level town/field maps */
  returnMapName?: string;
}

interface RawMap {
  id: number;
  name: string;
  region: string;
  return_map_name?: string;
}

interface RawRegionGroup {
  region: string;
  count: number;
  maps: RawMap[];
}

interface MapsPayload {
  regions: RawRegionGroup[];
  total: number;
}

let cache: Promise<MapResult[]> | null = null;

const loadAllMaps = (): Promise<MapResult[]> => {
  if (!cache) {
    cache = fetch(`${DATA_BASE_URL}/maps.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load map data");
        return res.json() as Promise<MapsPayload>;
      })
      .then((data) =>
        data.regions.flatMap((group) =>
          group.maps.map((m) => ({
            id: m.id,
            name: m.name,
            region: m.region,
            returnMapName: m.return_map_name,
          }))
        )
      )
      .catch((err) => {
        cache = null;
        throw err;
      });
  }
  return cache;
};

// Warm the cache as soon as this module loads, same as itemsData.service.ts.
void loadAllMaps().catch(() => {});

export const searchMaps = async (query: string): Promise<MapResult[]> => {
  const all = await loadAllMaps();
  const q = query.toLowerCase();
  return all.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 50);
};

export const formatMapLocation = (map: MapResult): string =>
  map.returnMapName
    ? `${map.name} - near: ${map.returnMapName} in ${map.region}`
    : `${map.name} in ${map.region}`;
