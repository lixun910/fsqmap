import { geotagging, placeSearch, webSearch } from '@openassistant/places';
import { geocoding, reverseGeocoding, routing, isochrone } from '@openassistant/osm';
import { buffer, spatialFilter } from '@openassistant/geoda';
import { convertToVercelAiTool, ToolOutputManager } from '@openassistant/utils';
import { findPlace } from './findPlaceTool';
import { buyHouse } from './buyHouseTool';

// Helper function to get geometries from dataset
const createGetGeometries =
  (toolOutputManager: ToolOutputManager) => async (datasetName: string) => {
    console.log('getGeometries', datasetName);
    // check GeoJson data cached by the ToolOutputManager
    const cachedData = await toolOutputManager.findDataByDatasetName(
      datasetName
    );
    if (cachedData) {
      const { type, content } = cachedData;
      if (type === 'geojson') {
        const geojson = content as GeoJSON.FeatureCollection;
        // return a copy of each feature
        return geojson.features.map((feature: GeoJSON.Feature) => {
          return {
            ...feature,
          };
        });
      }
    }

    return null;
  };

export function createTools(
  toolOutputManager: ToolOutputManager
): Record<string, Tool> {
  const getGeometries = createGetGeometries(toolOutputManager);

  // @ts-expect-error - placeSearch is a valid tool
  const placeSearchTool = convertToVercelAiTool(
    {
      ...placeSearch,
      context: {
        getFsqToken: () => process.env.FSQ_TOKEN || '',
        getGeometries,
      },
      onToolCompleted: toolOutputManager.createOnToolCompletedCallback(),
    },
    { isExecutable: true }
  );

  // @ts-expect-error - placeSearch is a valid tool
  const geotaggingTool = convertToVercelAiTool(
    {
      ...geotagging,
      context: {
        getFsqToken: () => process.env.FSQ_TOKEN || '',
      },
      onToolCompleted: toolOutputManager.createOnToolCompletedCallback(),
    },
    { isExecutable: true }
  );

  // @ts-expect-error - placeSearch is a valid tool
  const isochroneTool = convertToVercelAiTool(
    {
      ...isochrone,
      context: {
        getMapboxToken: () => process.env.MAPBOX_TOKEN!,
      },
      onToolCompleted: toolOutputManager.createOnToolCompletedCallback(),
    },
    { isExecutable: true }
  );

  // @ts-expect-error - placeSearch is a valid tool
  const routingTool = convertToVercelAiTool(
    {
      ...routing,
      context: {
        getMapboxToken: () => process.env.MAPBOX_TOKEN!,
      },
      onToolCompleted: toolOutputManager.createOnToolCompletedCallback(),
    },
    { isExecutable: true }
  );

  // @ts-expect-error - placeSearch is a valid tool
  const geocodingTool = convertToVercelAiTool(
    {
      ...geocoding,
      onToolCompleted: toolOutputManager.createOnToolCompletedCallback(),
    },
    { isExecutable: true }
  );

  // @ts-expect-error - placeSearch is a valid tool
  const reverseGeocodingTool = convertToVercelAiTool(
    {
      ...reverseGeocoding,
      onToolCompleted: toolOutputManager.createOnToolCompletedCallback(),
    },
    { isExecutable: true }
  );

  // @ts-expect-error - placeSearch is a valid tool
  const bufferTool = convertToVercelAiTool(
    {
      ...buffer,
      context: {
        getGeometries: async (datasetName: string) => {
          // check GeoJson data cached by the ToolOutputManager
          const cachedData = await toolOutputManager.findDataByDatasetName(
            datasetName
          );
          if (cachedData) {
            const geojson = cachedData as GeoJSON.FeatureCollection;
            // return a copy with empty the properties of each feature
            return geojson.features.map((feature) => {
              return {
                ...feature,
                properties: {},
              };
            });
          }
          throw new Error(`No cached data found for dataset ${datasetName}`);
        },
      },
      onToolCompleted: toolOutputManager.createOnToolCompletedCallback(),
    },
    { isExecutable: true }
  );

  // @ts-expect-error - placeSearch is a valid tool
  const spatialFilterTool = convertToVercelAiTool(
    {
      ...spatialFilter,
      context: {
        getGeometries,
      },
      onToolCompleted: toolOutputManager.createOnToolCompletedCallback(),
    },
    { isExecutable: true }
  );

  const findPlaceTool = convertToVercelAiTool(
    {
      ...findPlace,
      context: {
        getGeometries,
      },
      onToolCompleted: toolOutputManager.createOnToolCompletedCallback(),
    },
    { isExecutable: true }
  );

  // @ts-expect-error - placeSearch is a valid tool
  const buyHouseTool = convertToVercelAiTool(
    {
      ...buyHouse,
      context: {
        getGeometries,
      },
      onToolCompleted: toolOutputManager.createOnToolCompletedCallback(),
    },
    { isExecutable: true }
  );

  // @ts-expect-error - placeSearch is a valid tool
  const webSearchTool = convertToVercelAiTool(
    {
      ...webSearch,
      context: {
        getSearchAPIKey: () => process.env.SERPER_API_KEY || '',
      },
      onToolCompleted: toolOutputManager.createOnToolCompletedCallback(),
    },
    { isExecutable: true }
  );

  return {
    placeSearch: placeSearchTool,
    geotagging: geotaggingTool,
    isochrone: isochroneTool,
    routing: routingTool,
    geocoding: geocodingTool,
    reverseGeocoding: reverseGeocodingTool,
    buffer: bufferTool,
    spatialFilter: spatialFilterTool,
    findPlace: findPlaceTool,
    buyHouse: buyHouseTool,
    webSearch: webSearchTool,
  };
}
