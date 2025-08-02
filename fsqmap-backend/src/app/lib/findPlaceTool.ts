import { extendedTool } from '@openassistant/utils';
import { z } from 'zod';

export type FindPlaceFunctionArgs = z.ZodObject<{
  placesDatasetName: z.ZodString;
  spatialFilterDatasetName: z.ZodOptional<z.ZodString>;
  isochroneDatasetName: z.ZodOptional<z.ZodString>;
}>;

interface FindPlaceLlmResult {
  success: boolean;
  datasetName?: string;
  results?: string;
}

interface FindPlaceAdditionalData {
  datasetName: string;
  [datasetName: string]: unknown;
}

export type FindPlaceContext = {
  getGeometries?: (datasetName: string) => Promise<GeoJSON.Feature[] | null>;
};

export type ExecuteFindPlaceResult = {
  llmResult: FindPlaceLlmResult;
  additionalData?: FindPlaceAdditionalData;
};

function isFindPlaceContext(context: unknown): context is FindPlaceContext {
  return (
    typeof context === 'object' &&
    context !== null &&
    'getGeometries' in context
  );
}

export const findPlace = extendedTool<
  FindPlaceFunctionArgs,
  FindPlaceLlmResult,
  FindPlaceAdditionalData,
  FindPlaceContext
>({
  description: `Find places using placeSearch tool and spatialJoin tool.
- the placeSearch tool will be used to search for the places.
- the spatialJoin tool will be used to filter the places that are within the search area.
- the datasetName of the spatialJoin tool will be returned as the datasetName of the findPlace tool.
`,
  parameters: z.object({
    placesDatasetName: z
      .string()
      .describe(
        'The name of the dataset with searched places by placeSearch tool'
      ),
    spatialFilterDatasetName: z
      .string()
      .optional()
      .describe('The name of the dataset from related spatial filter tool'),
    isochroneDatasetName: z
      .string()
      .optional()
      .describe('The name of the dataset from isochrone tool if called'),
  }),
  execute: async (args, options): Promise<ExecuteFindPlaceResult> => {
    try {
      const {
        placesDatasetName,
        spatialFilterDatasetName,
        isochroneDatasetName,
      } = args;

      // debug info
      console.log('findPlaceTool args: ', args);

      const context = options?.context;
      if (!isFindPlaceContext(context)) {
        throw new Error('Invalid context');
      }

      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      };

      const placesFeatures = await context.getGeometries?.(placesDatasetName);
      if (!placesFeatures) {
        return {
          llmResult: {
            success: false,
            results: `No geometries found for places dataset: ${placesDatasetName}`,
          },
        };
      }

      let filteredPlacesFeatures = placesFeatures;

      // if spatialFilterDatasetName is provided, filter the places features by the spatialFilterDatasetName using the id property
      if (spatialFilterDatasetName) {
        const spatialFilterFeatures = await context.getGeometries?.(
          spatialFilterDatasetName
        );
        if (spatialFilterFeatures && spatialFilterFeatures.length > 0) {
          // filter the spatialFilterFeatures by the count property
          const validSpatialFilterFeatures = spatialFilterFeatures.filter(
            (feature) => feature.properties?.Count > 0
          );

          // Extract the IDs from the spatial filter features
          const spatialFilterIds = new Set(
            validSpatialFilterFeatures
              .map((feature) => feature.properties?.id)
              .filter((id) => id !== undefined)
          );

          // Filter places features to only include those with matching IDs
          filteredPlacesFeatures = placesFeatures.filter((placeFeature) => {
            const placeId = placeFeature.properties?.id;
            return placeId && spatialFilterIds.has(placeId);
          });

          // Sort the filteredPlacesFeatures by the distance property
          filteredPlacesFeatures.sort((a, b) => {
            const distanceA = a.properties?.distance;
            const distanceB = b.properties?.distance;
            return distanceA - distanceB;
          });
        }
      }

      console.log(
        '🚀 filteredPlacesFeatures: ',
        JSON.stringify(filteredPlacesFeatures, null, 2)
      );

      geojson.features = [...filteredPlacesFeatures];

      const isochroneGeometries = isochroneDatasetName
        ? await context.getGeometries?.(isochroneDatasetName)
        : null;

      if (isochroneGeometries) {
        // merge the isochrone geometries with the places geometries into a new dataset
        geojson.features = [...geojson.features, ...isochroneGeometries];
      }

      // create a new datasetName for findPlace tool
      const newDatasetName = `findPlace_${placesDatasetName}`;
      const newDataset = {
        type: 'geojson',
        content: geojson,
      };

      // filter placesFeatures with the properties: name, address, phone, website and distance for LLMs
      const llmPlacesFeatures = filteredPlacesFeatures.map((feature) => ({
        ...feature,
        properties: {
          name: feature.properties?.name,
          address: feature.properties?.address,
          phone: feature.properties?.phone,
          website: feature.properties?.website,
          rating: feature.properties?.rating,
        },
      }));

      return {
        llmResult: {
          success: true,
          datasetName: newDatasetName,
          results: `Here are ${filteredPlacesFeatures.length} places that are within the search area`,
        },
        additionalData: {
          datasetName: newDatasetName,
          [newDatasetName]: newDataset,
        },
      };
    } catch (error) {
      console.error('Error finding places: ', error);
      return {
        llmResult: {
          success: false,
          results: `Error finding places: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      };
    }
  },
});

export type FindPlace = typeof findPlace;
