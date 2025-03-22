/**
 * Utility functions for handling images
 */

import { ImageData } from "@/data/images";
import { defaultBlurhash } from "./blurhash-utils";

/**
 * Creates an object URL for a file
 */
export function createObjectURL(file: File): string {
  if (typeof window === 'undefined') {
    return ''; // Not available on server side
  }

  try {
    return URL.createObjectURL(file);
  } catch (error) {
    console.error('Failed to create object URL:', error);
    return '';
  }
}

/**
 * Revokes an object URL to prevent memory leaks
 */
export function revokeObjectURL(url: string): void {
  if (typeof window === 'undefined' || !url) {
    return; // Not available on server side or empty URL
  }

  try {
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to revoke object URL:', error);
  }
}

/**
 * Gets dimensions of an image from a URL
 */
export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !url) {
      // Default dimensions for server-side rendering or missing URL
      resolve({
        width: 800,
        height: 600
      });
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
};

/**
 * Detects potential categories based on the file name
 */
export const detectCategories = (fileName: string): string[] => {
  const categories: string[] = [];
  const lowerFileName = fileName.toLowerCase();

  // Map of keywords to categories
  const categoryMap: Record<string, string[]> = {
    nature: ['nature', 'outdoor', 'landscape', 'mountain', 'forest', 'tree', 'lake', 'river', 'ocean', 'beach', 'sky', 'flower', 'plant', 'garden', 'park'],
    animals: ['animal', 'pet', 'dog', 'cat', 'bird', 'wildlife', 'zoo', 'pet'],
    people: ['people', 'person', 'portrait', 'face', 'selfie', 'family', 'group', 'wedding', 'party'],
    urban: ['city', 'urban', 'street', 'building', 'architecture', 'skyline', 'downtown', 'bridge'],
    food: ['food', 'meal', 'dinner', 'lunch', 'breakfast', 'restaurant', 'cooking', 'dish', 'cuisine'],
    travel: ['travel', 'vacation', 'trip', 'journey', 'adventure', 'destination', 'tourism'],
    art: ['art', 'painting', 'drawing', 'illustration', 'design', 'artwork', 'creative', 'sculpture'],
    technology: ['tech', 'technology', 'computer', 'digital', 'electronic', 'gadget', 'device'],
    vehicle: ['car', 'vehicle', 'transportation', 'bike', 'motorcycle', 'boat', 'train', 'plane', 'airplane'],
    abstract: ['abstract', 'pattern', 'texture', 'minimal', 'simple', 'geometric'],
    night: ['night', 'dark', 'evening', 'stars', 'moon', 'sunset', 'sunrise', 'dusk', 'dawn'],
    sport: ['sport', 'game', 'play', 'fitness', 'exercise', 'workout', 'athletic', 'ball'],
    water: ['water', 'lake', 'river', 'ocean', 'sea', 'pool', 'waterfall', 'rain', 'drop', 'splash'],
    winter: ['winter', 'snow', 'cold', 'ice', 'frost', 'freeze', 'chill'],
    summer: ['summer', 'hot', 'beach', 'sun', 'sunny', 'vacation', 'holiday'],
    autumn: ['autumn', 'fall', 'leaves', 'orange', 'brown', 'maple', 'foliage'],
    spring: ['spring', 'bloom', 'flower', 'blossom', 'green', 'fresh'],
  };

  // Check for matches
  Object.entries(categoryMap).forEach(([category, keywords]) => {
    for (const keyword of keywords) {
      if (lowerFileName.includes(keyword)) {
        categories.push(category);
        break; // Only add each category once
      }
    }
  });

  // If no category detected, add "other"
  if (categories.length === 0) {
    categories.push('other');
  }

  return [...new Set(categories)]; // Remove duplicates
};

/**
 * Processes an uploaded image file and returns image data
 */
export const processImageUpload = async (file: File): Promise<ImageData> => {
  if (typeof window === 'undefined') {
    // Return a placeholder for server-side rendering
    return {
      id: Date.now(),
      title: 'Placeholder',
      description: 'Server-side placeholder',
      src: '',
      alt: 'Placeholder',
      width: 800,
      height: 600,
      blurhash: defaultBlurhash,
      categories: ['other'],
      editable: true
    };
  }

  // Validate the file
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Invalid file type. Please upload an image.');
  }

  // Create object URL and get dimensions
  const imageUrl = createObjectURL(file);

  try {
    const dimensions = await getImageDimensions(imageUrl);

    // Generate a title from the filename
    let title = file.name.split('.')[0];
    // Clean up the title (replace underscores/hyphens with spaces, capitalize first letter)
    title = title
      .replace(/[_-]/g, ' ')
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    // Since we can't generate a blurhash in the browser easily without canvas manipulation,
    // we'll use a default blurhash based on the file type, or the default one
    let placeholderBlurhash = defaultBlurhash;

    // Very basic mapping based on image name or type
    const fileName = file.name.toLowerCase();
    if (fileName.includes('mountain') || fileName.includes('landscape')) {
      placeholderBlurhash = "L6Dd+^t7WBayofj[ayjtRPWBayj[";
    } else if (fileName.includes('beach') || fileName.includes('ocean')) {
      placeholderBlurhash = "L5H2EC=_0g9F%00M%MRj0K%Mt7V@";
    } else if (fileName.includes('city')) {
      placeholderBlurhash = "L4A,}WI9s:og*0oeR*R-E1WBkCR*";
    } else if (fileName.includes('forest') || fileName.includes('tree')) {
      placeholderBlurhash = "L9B:|goJ0gfQIoaeWVfQ%NaefkfQ";
    } else if (file.type.includes('image/jpeg') || file.type.includes('image/jpg')) {
      placeholderBlurhash = "LBDLQ}I;nQsV~V%}s+nQ58tmWVt7";
    } else if (file.type.includes('image/png')) {
      placeholderBlurhash = "L9Cc7?IV.9WB~qt7t7RjM{j[ofj[";
    }

    // Detect categories based on file name
    const categories = detectCategories(file.name);

    // Format the upload date nicely
    const uploadDate = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      id: Date.now(),
      title: title,
      description: `Uploaded on ${uploadDate}`,
      src: imageUrl,
      alt: title,
      width: dimensions.width,
      height: dimensions.height,
      blurhash: placeholderBlurhash,
      categories,
      editable: true
    };
  } catch (error) {
    // If there's an error, clean up the object URL to prevent memory leaks
    if (typeof window !== 'undefined' && imageUrl) {
      revokeObjectURL(imageUrl);
    }
    throw error;
  }
};
