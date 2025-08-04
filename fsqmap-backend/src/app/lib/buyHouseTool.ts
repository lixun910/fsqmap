import { extendedTool, generateId } from '@openassistant/utils';
import { z } from 'zod';
import * as turf from '@turf/turf';

export type BuyHouseFunctionArgs = z.ZodObject<{
  redfinDescription: z.ZodString;
  redfinUrl: z.ZodString;
  schoolsDatasetName: z.ZodString;
  groceryStoresDatasetName: z.ZodString;
  parksDatasetName: z.ZodString;
  clinicsDatasetName: z.ZodString;
  hospitalsDatasetName: z.ZodString;
  gymsDatasetName: z.ZodString;
  restaurantsDatasetName: z.ZodString;
  fiveMinsDriveDatasetName: z.ZodString;
  tenMinsDriveDatasetName: z.ZodString;
}>;

interface BuyHouseLlmResult {
  success: boolean;
  redfinDescription?: string;
  summary?: string;
}

interface BuyHouseAdditionalData {
  redfinUrl?: string;
  redfinDescription?: string;
  datasetName?: string;
  combinedGeoJSON?: GeoJSON.FeatureCollection;
}

export type BuyHouseContext = {
  getGeometries?: (datasetName: string) => Promise<GeoJSON.Feature[] | null>;
};

export type ExecuteBuyHouseResult = {
  llmResult: BuyHouseLlmResult;
  additionalData?: BuyHouseAdditionalData;
};

function isBuyHouseContext(context: unknown): context is BuyHouseContext {
  return (
    typeof context === 'object' &&
    context !== null &&
    'getGeometries' in context
  );
}

/**
 * Helper function to check if a point is within any of the given polygons
 */
function isPointInPolygons(
  point: GeoJSON.Feature,
  polygons: GeoJSON.Feature[]
): boolean {
  try {
    // Check if the point has valid coordinates
    if (!point.geometry || point.geometry.type !== 'Point') {
      return false;
    }

    const coordinates = point.geometry.coordinates;
    if (!coordinates || coordinates.length < 2) {
      return false;
    }

    // Create a turf point feature
    const turfPoint = turf.point(coordinates);

    // Check if the point is within any of the polygons
    return polygons.some((polygon) => {
      if (
        polygon.geometry &&
        (polygon.geometry.type === 'Polygon' ||
          polygon.geometry.type === 'MultiPolygon')
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return turf.booleanPointInPolygon(turfPoint, polygon as any);
      }
      return false;
    });
  } catch (error) {
    console.warn('Error in spatial filtering:', error);
    return false;
  }
}

export const buyHouse = extendedTool<
  BuyHouseFunctionArgs,
  BuyHouseLlmResult,
  BuyHouseAdditionalData,
  BuyHouseContext
>({
  description: `Analyze a property for home buying by combining Redfin information with nearby amenities data.
- Uses 5 minutes drive distance polygon to filter all categories of places
- Uses 10 minutes drive distance polygon to filter additional categories
- Creates a combined GeoJSON with the distance polygons and filtered points
- Returns Redfin description and summary of nearby amenities
`,
  parameters: z.object({
    redfinDescription: z
      .string()
      .describe('The Redfin description of the property'),
    redfinUrl: z.string().describe('The Redfin URL of the property'),
    schoolsDatasetName: z
      .string()
      .describe('The name of the dataset containing schools'),
    groceryStoresDatasetName: z
      .string()
      .describe('The name of the dataset containing grocery stores'),
    parksDatasetName: z
      .string()
      .describe('The name of the dataset containing parks'),
    clinicsDatasetName: z
      .string()
      .describe('The name of the dataset containing clinics or urgent care'),
    hospitalsDatasetName: z
      .string()
      .describe('The name of the dataset containing hospitals'),
    gymsDatasetName: z
      .string()
      .describe('The name of the dataset containing gyms'),
    restaurantsDatasetName: z
      .string()
      .describe('The name of the dataset containing restaurants'),
    fiveMinsDriveDatasetName: z
      .string()
      .describe(
        'The name of the dataset containing 5 minutes drive distance polygon'
      ),
            tenMinsDriveDatasetName: z
      .string()
              .describe(
          'The name of the dataset containing 10 minutes drive distance polygon'
        ),
  }),
  execute: async (args, options): Promise<ExecuteBuyHouseResult> => {
    try {
      const {
        redfinDescription,
        redfinUrl,
        schoolsDatasetName,
        groceryStoresDatasetName,
        parksDatasetName,
        clinicsDatasetName,
        hospitalsDatasetName,
        gymsDatasetName,
        restaurantsDatasetName,
        fiveMinsDriveDatasetName,
        tenMinsDriveDatasetName,
      } = args;

      // debug info
      console.log('buyHouseTool args: ', args);

      const context = options?.context;
      if (!isBuyHouseContext(context)) {
        throw new Error('Invalid context');
      }

      // Get the distance polygons
      const fiveMinsDrivePolygon = await context.getGeometries?.(
        fiveMinsDriveDatasetName
      );
      const tenMinsDrivePolygon = await context.getGeometries?.(
        tenMinsDriveDatasetName
      );

      if (!fiveMinsDrivePolygon || fiveMinsDrivePolygon.length === 0) {
        return {
          llmResult: {
            success: false,
            summary: `No 5 minutes drive distance polygon found for dataset: ${fiveMinsDriveDatasetName}`,
          },
        };
      }

      if (!tenMinsDrivePolygon || tenMinsDrivePolygon.length === 0) {
        return {
          llmResult: {
            success: false,
            summary: `No 10 minutes drive distance polygon found for dataset: ${tenMinsDriveDatasetName}`,
          },
        };
      }

      // Get all the place datasets
      const [
        schools,
        groceryStores,
        parks,
        clinics,
        hospitals,
        gyms,
        restaurants,
      ] = await Promise.all([
        context.getGeometries?.(schoolsDatasetName),
        context.getGeometries?.(groceryStoresDatasetName),
        context.getGeometries?.(parksDatasetName),
        context.getGeometries?.(clinicsDatasetName),
        context.getGeometries?.(hospitalsDatasetName),
        context.getGeometries?.(gymsDatasetName),
        context.getGeometries?.(restaurantsDatasetName),
      ]);

      // Create the combined GeoJSON with grouped features
      const combinedGeoJSON: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      };

      // Define all categories that will be used for both 5min and 10min filtering
      const allCategories = [
        { data: schools, name: 'Schools', color: '#ff9ff3' },
        { data: groceryStores, name: 'Grocery Stores', color: '#54a0ff' },
        { data: parks, name: 'Parks', color: '#5f27cd' },
        { data: clinics, name: 'Clinics', color: '#00d2d3' },
        { data: hospitals, name: 'Hospitals', color: '#ff6348' },
        { data: gyms, name: 'Gyms', color: '#ffa502' },
        { data: restaurants, name: 'Restaurants', color: '#2ed573' },
      ];

      const places5Min: GeoJSON.Feature[] = [];
      const places10Min: GeoJSON.Feature[] = [];

      // First group: 5 minutes drive area
      // Add the 5 minutes drive polygon first
      combinedGeoJSON.features.push(
        ...fiveMinsDrivePolygon.map((polygon) => ({
          ...polygon,
          properties: {
            ...polygon.properties,
            category: '5_minutes_drive_area',
            color: '#ff6b6b',
            opacity: 0.3,
          },
        }))
      );

      // Then add all places within 5 minutes drive
      for (const category of allCategories) {
        if (category.data && category.data.length > 0) {
          // Filter places within 5 minutes drive using spatial filtering
          const filteredPlaces = category.data.filter((place) =>
            isPointInPolygons(place, fiveMinsDrivePolygon)
          );

          console.log(
            `Spatial filtering for ${category.name}: ${category.data.length} total, ${filteredPlaces.length} within 5min drive`
          );

          // Create modified places with category property
          const modifiedPlaces = filteredPlaces.map((place) => ({
            ...place,
            properties: {
              ...place.properties,
              category: category.name,
              color: category.color,
              distance: place.properties?.distance || 'Unknown',
            },
          }));

          // Add filtered places to the combined GeoJSON
          combinedGeoJSON.features.push(...modifiedPlaces);

          places5Min.push(...modifiedPlaces);
        }
      }

      // Second group: 10 minutes drive area
      // Add the 10 minutes drive polygon
      combinedGeoJSON.features.push(
        ...tenMinsDrivePolygon.map((polygon) => ({
          ...polygon,
          properties: {
            ...polygon.properties,
            category: '10_minutes_drive_area',
            color: '#4ecdc4',
            opacity: 0.3,
          },
        }))
      );

      // Filter and add places within 10 minutes drive (excluding those already in 5min drive)
      for (const category of allCategories) {
        if (category.data && category.data.length > 0) {
          // Filter places within 10 minutes drive but NOT within 5 minutes drive
          const filteredPlaces = category.data.filter((place) => {
            const isIn10MinDrive = isPointInPolygons(place, tenMinsDrivePolygon);
            const isIn5MinDrive = isPointInPolygons(
              place,
              fiveMinsDrivePolygon
            );
            return isIn10MinDrive && !isIn5MinDrive;
          });

          console.log(
            `Spatial filtering for ${category.name}: ${category.data.length} total, ${filteredPlaces.length} within 10min drive (exclusive)`
          );

          // Create modified places with category property
          const modifiedPlaces = filteredPlaces.map((place) => ({
            ...place,
            properties: {
              ...place.properties,
                              category: `${category.name}`,
              color: category.color,
              distance: place.properties?.distance || 'Unknown',
            },
          }));

          // Add filtered places to the combined GeoJSON
          combinedGeoJSON.features.push(...modifiedPlaces);

          places10Min.push(...modifiedPlaces);
        }
      }

      // Create summary
      const summary = createSummary(places5Min, places10Min);

      // create a datasetName for the combined GeoJSON
      const datasetName = `buyHouse_${generateId()}`;

      console.log(
        'summary:',
        summary
      );

      return {
        llmResult: {
          success: true,
          redfinDescription,
          summary,
        },
        additionalData: {
          redfinUrl,
          redfinDescription,
          datasetName,
          [datasetName]: combinedGeoJSON,
        },
      };
    } catch (error) {
      console.error('Error analyzing property: ', error);
      return {
        llmResult: {
          success: false,
          summary: `Error analyzing property: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      };
    }
  },
});

function createSummary(
  places5Min: GeoJSON.Feature[],
  places10Min: GeoJSON.Feature[]
): string {
  console.log('places5Min count:', places5Min.length);
  console.log('places10Min count:', places10Min.length);

  // Helper function to count categories for a given array of places
  function countCategories(places: GeoJSON.Feature[]) {
    return {
      Schools: places.filter((p) => p.properties?.category === 'Schools')
        .length,
      'Grocery Stores': places.filter(
        (p) => p.properties?.category === 'Grocery Stores'
      ).length,
      Parks: places.filter((p) => p.properties?.category === 'Parks').length,
      Clinics: places.filter((p) => p.properties?.category === 'Clinics')
        .length,
      Hospitals: places.filter((p) => p.properties?.category === 'Hospitals')
        .length,
      Gyms: places.filter((p) => p.properties?.category === 'Gyms').length,
      Restaurants: places.filter(
        (p) => p.properties?.category === 'Restaurants'
      ).length,
    };
  }

  // Helper function to create summary parts for a given categories object
  function createSummaryParts(categories: Record<string, number>): string[] {
    const summaryParts = [];

    if (categories['Schools'] > 0) {
      summaryParts.push(
        `${categories['Schools']} school${categories['Schools'] > 1 ? 's' : ''}`
      );
    }
    if (categories['Grocery Stores'] > 0) {
      summaryParts.push(
        `${categories['Grocery Stores']} grocery store${
          categories['Grocery Stores'] > 1 ? 's' : ''
        }`
      );
    }
    if (categories['Parks'] > 0) {
      summaryParts.push(
        `${categories['Parks']} park${categories['Parks'] > 1 ? 's' : ''}`
      );
    }
    if (categories['Clinics'] > 0) {
      summaryParts.push(
        `${categories['Clinics']} clinic${categories['Clinics'] > 1 ? 's' : ''}`
      );
    }
    if (categories['Hospitals'] > 0) {
      summaryParts.push(
        `${categories['Hospitals']} hospital${
          categories['Hospitals'] > 1 ? 's' : ''
        }`
      );
    }
    if (categories['Gyms'] > 0) {
      summaryParts.push(
        `${categories['Gyms']} gym${categories['Gyms'] > 1 ? 's' : ''}`
      );
    }
    if (categories['Restaurants'] > 0) {
      summaryParts.push(
        `${categories['Restaurants']} restaurant${
          categories['Restaurants'] > 1 ? 's' : ''
        }`
      );
    }

    return summaryParts;
  }

  // Count categories for both distances
  const categories5Min = countCategories(places5Min);
  const categories10Min = countCategories(places10Min);

  // Create summary parts for both distances
  const summaryParts5Min = createSummaryParts(categories5Min);
  const summaryParts10Min = createSummaryParts(categories10Min);

  // Calculate totals
  const totalPlaces5Min = Object.values(categories5Min).reduce(
    (sum, count) => sum + count,
    0
  );
  const totalPlaces10Min = Object.values(categories10Min).reduce(
    (sum, count) => sum + count,
    0
  );

  // Build the summary
  const summaryParts = [];

  if (totalPlaces5Min > 0) {
    summaryParts.push(
      `Within 5 minutes drive: ${totalPlaces5Min} amenities (${summaryParts5Min.join(
        ', '
      )})`
    );
  }

  if (totalPlaces10Min > 0) {
    summaryParts.push(
              `Within 10 minutes drive: ${totalPlaces10Min} amenities (${summaryParts10Min.join(
          ', '
        )})`
    );
  }

  if (summaryParts.length === 0) {
    return 'No nearby amenities found within the specified distances.';
  }

  return `This property has ${summaryParts.join('; ')}.`;
}

export type BuyHouse = typeof buyHouse;
