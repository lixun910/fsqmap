import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

interface PlaceCategory {
  id: string;
  title: string;
  icon: string;
  subcategories?: string[];
}

interface DistanceFilter {
  id: string;
  label: string;
  icon: string;
  description: string;
}

interface PlacesOptionsProps {
  onPlaceSelect?: (category: string, subcategory?: string) => void;
  onDistanceFilterChange?: (filter: DistanceFilter | null) => void;
  onTextToInput?: (text: string) => void; // New prop for setting text to input
}

const placeCategories: PlaceCategory[] = [
  {
    id: 'restaurants',
    title: 'Restaurants',
    icon: '🍽️',
    subcategories: [
      'Mexican',
      'Italian',
      'Chinese',
      'Japanese',
      'Indian',
      'Thai',
      'American',
      'Pizza',
      'Burgers',
      'Sushi',
    ],
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    icon: '🏥',
    subcategories: [
      'Dentist',
      'Hospital',
      'Pharmacy',
      'Clinic',
      'Urgent Care',
      'Optometrist',
      'Dermatologist',
    ],
  },
  {
    id: 'services',
    title: 'Services',
    icon: '🔧',
    subcategories: [
      'Gas Station',
      'Car Wash',
      'Auto Repair',
      'Bank',
      'ATM',
      'Post Office',
      'Laundry',
    ],
  },
  {
    id: 'shopping',
    title: 'Shopping',
    icon: '🛍️',
    subcategories: [
      'Grocery Store',
      'Convenience Store',
      'Mall',
      'Department Store',
      'Electronics',
      'Clothing',
    ],
  },
  {
    id: 'entertainment',
    title: 'Entertainment',
    icon: '🎬',
    subcategories: [
      'Movie Theater',
      'Bowling Alley',
      'Arcade',
      'Museum',
      'Park',
      'Gym',
      'Library',
    ],
  },
  {
    id: 'transportation',
    title: 'Transportation',
    icon: '🚗',
    subcategories: [
      'Parking',
      'Bus Stop',
      'Train Station',
      'Airport',
      'Taxi',
      'Ride Share',
    ],
  },
];

const distanceFilters: DistanceFilter[] = [
  {
    id: 'walking-5',
    label: '5 min walk',
    icon: '🚶',
    description: 'Within 5 minutes walking',
  },
  {
    id: 'walking-10',
    label: '10 min walk',
    icon: '🚶',
    description: 'Within 10 minutes walking',
  },
  {
    id: 'biking-2',
    label: '2 min bike',
    icon: '🚲',
    description: 'Within 2 minutes biking',
  },
  {
    id: 'biking-5',
    label: '5 min bike',
    icon: '🚲',
    description: 'Within 5 minutes biking',
  },
  {
    id: 'driving-5',
    label: '5 min drive',
    icon: '🚗',
    description: 'Within 5 minutes driving',
  },
  {
    id: 'driving-10',
    label: '10 min drive',
    icon: '🚗',
    description: 'Within 10 minutes driving',
  },
  {
    id: 'transit-15',
    label: '15 min transit',
    icon: '🚌',
    description: 'Within 15 minutes by transit',
  },
  {
    id: 'any-distance',
    label: 'Any distance',
    icon: '🌍',
    description: 'No distance restriction',
  },
];

export function PlacesOptions({
  onPlaceSelect,
  onDistanceFilterChange,
  onTextToInput,
}: PlacesOptionsProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    null
  ); // No category expanded by default
  const [selectedDistanceFilter, setSelectedDistanceFilter] = useState<
    string | null
  >(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );

  const handleCategoryPress = (category: PlaceCategory) => {
    // Always expand categories with subcategories, don't collapse
    if (category.subcategories && category.subcategories.length > 0) {
      setExpandedCategory(category.id);
      // Update input text even for categories with subcategories
      const distanceText = selectedDistanceFilter
        ? distanceFilters.find((f) => f.id === selectedDistanceFilter)?.label
        : '';

      let fullText = `I am looking for ${category.title.toLowerCase()}`;

      if (distanceText) {
        fullText += ` within ${distanceText} distance`;
      }

      onTextToInput?.(fullText);
    } else {
      // No subcategories, select directly
      onPlaceSelect?.(category.title);
      // Set text to input with proper formatting
      const distanceText = selectedDistanceFilter
        ? distanceFilters.find((f) => f.id === selectedDistanceFilter)?.label
        : '';

      let fullText = `I am looking for ${category.title.toLowerCase()}`;

      if (distanceText) {
        fullText += ` within ${distanceText} distance`;
      }

      onTextToInput?.(fullText);
    }
  };

  const handleSubcategoryPress = (
    categoryTitle: string,
    subcategory: string
  ) => {
    onPlaceSelect?.(categoryTitle, subcategory);
    setSelectedSubcategory(subcategory);
    // Don't collapse after selection - keep subcategories visible

    // Set text to input with proper formatting
    const distanceText = selectedDistanceFilter
      ? distanceFilters.find((f) => f.id === selectedDistanceFilter)?.label
      : '';

    let fullText = `I am looking for ${subcategory.toLowerCase()} restaurant`;

    if (distanceText) {
      fullText += ` within ${distanceText} distance`;
    }

    onTextToInput?.(fullText);
  };

  const handleDistanceFilterPress = (filter: DistanceFilter) => {
    // Toggle selection - if already selected, uncheck it
    const newSelection =
      selectedDistanceFilter === filter.id ? null : filter.id;
    setSelectedDistanceFilter(newSelection);
    onDistanceFilterChange?.(newSelection ? filter : null);

    // Update input text if a subcategory is currently selected
    if (selectedSubcategory) {
      const distanceText = newSelection
        ? distanceFilters.find((f) => f.id === newSelection)?.label
        : '';

      let fullText = `I am looking for ${selectedSubcategory.toLowerCase()} restaurant`;

      if (distanceText) {
        fullText += ` within ${distanceText} distance`;
      }

      onTextToInput?.(fullText);
    }
  };

  const expandedCategoryData = expandedCategory
    ? placeCategories.find((cat) => cat.id === expandedCategory)
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What are you looking for?</Text>

      {/* Category buttons - always in a fixed horizontal row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {placeCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              expandedCategory === category.id && styles.categoryButtonExpanded,
            ]}
            onPress={() => handleCategoryPress(category)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryTitle}>{category.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Subcategories - show when category is expanded */}
      {expandedCategoryData &&
        expandedCategoryData.subcategories &&
        expandedCategoryData.subcategories.length > 0 && (
          <View style={styles.subcategoriesWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.subcategoriesContainer}
            >
              {expandedCategoryData.subcategories?.map((subcategory, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.subcategoryButton}
                  onPress={() =>
                    handleSubcategoryPress(
                      expandedCategoryData.title,
                      subcategory
                    )
                  }
                >
                  <Text style={styles.subcategoryText}>{subcategory}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

      {/* Distance filters - smaller and less prominent */}
      <View style={styles.distanceFiltersSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.distanceFiltersContainer}
        >
          {distanceFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.distanceFilterButton,
                selectedDistanceFilter === filter.id &&
                  styles.distanceFilterButtonSelected,
              ]}
              onPress={() => handleDistanceFilterPress(filter)}
            >
              <Text style={styles.distanceFilterIcon}>{filter.icon}</Text>
              <Text
                style={[
                  styles.distanceFilterLabel,
                  selectedDistanceFilter === filter.id &&
                    styles.distanceFilterLabelSelected,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryButton: {
    width: 65,
    height: 65,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 10,
  },
  categoryButtonExpanded: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 3,
  },
  categoryTitle: {
    fontSize: 8,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },
  subcategoriesWrapper: {
    marginTop: 4,
  },
  subcategoriesContainer: {
    flexDirection: 'row',
  },
  subcategoryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  subcategoryText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  distanceFiltersSection: {
    marginTop: 12,
  },
  distanceFiltersContainer: {
    flexDirection: 'row',
  },
  distanceFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 70,
    justifyContent: 'center',
  },
  distanceFilterButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  distanceFilterIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  distanceFilterLabel: {
    fontSize: 11,
    color: '#6c757d',
    fontWeight: '400',
  },
  distanceFilterLabelSelected: {
    color: '#2196f3',
    fontWeight: '500',
  },
});
