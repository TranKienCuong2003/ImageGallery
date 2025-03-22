export interface ImageData {
  id: number;
  title: string;
  description: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  blurhash?: string; // Optional for backward compatibility
  categories?: string[]; // Categories/tags for the image
  editable?: boolean; // Whether the image can be edited (usually true for user uploads)
}

// Using high-quality images from Unsplash with stable URLs
export const images: ImageData[] = [
  {
    id: 1,
    title: "Mountain Landscape",
    description: "A beautiful mountain landscape with snow-capped peaks. Perfect for nature lovers and hikers.",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    alt: "Mountain landscape with snow-capped peaks",
    width: 2070,
    height: 1380,
    blurhash: "L6Dd+^t7WBayofj[ayjtRPWBayj[",
    categories: ["nature", "mountains", "landscape"]
  },
  {
    id: 2,
    title: "Beach Sunset",
    description: "Golden sunset over a tropical beach. Experience the warm glow of the sun as it meets the ocean.",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    alt: "Golden sunset over a tropical beach",
    width: 2073,
    height: 1386,
    blurhash: "L5H2EC=_0g9F%00M%MRj0K%Mt7V@",
    categories: ["nature", "beach", "sunset", "ocean"]
  },
  {
    id: 3,
    title: "City Skyline",
    description: "Modern city skyline at night with colorful lights. Urban architecture captured in its full glory.",
    src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df",
    alt: "Modern city skyline at night",
    width: 2044,
    height: 1363,
    blurhash: "L4A,}WI9s:og*0oeR*R-E1WBkCR*",
    categories: ["urban", "city", "architecture", "night"]
  },
  {
    id: 4,
    title: "Forest Path",
    description: "A serene path through a lush green forest. Peaceful trail surrounded by ancient trees and foliage.",
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    alt: "Path through a green forest",
    width: 2071,
    height: 1381,
    blurhash: "L9B:|goJ0gfQIoaeWVfQ%NaefkfQ",
    categories: ["nature", "forest", "trees", "green"]
  },
  {
    id: 5,
    title: "Desert Dunes",
    description: "Sweeping sand dunes in a vast desert landscape. Golden waves of sand stretching to the horizon.",
    src: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0",
    alt: "Desert sand dunes",
    width: 2070,
    height: 1380,
    blurhash: "LCFZk^xu0JM|-:t7RkxuNGRPRjRj",
    categories: ["nature", "desert", "landscape", "sand"]
  },
  {
    id: 6,
    title: "Waterfall",
    description: "Majestic waterfall cascading down rocky cliffs. Powerful waters creating a breathtaking spectacle.",
    src: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d",
    alt: "Majestic waterfall",
    width: 2200,
    height: 1467,
    blurhash: "L6DdIVt7WBayofj[ayjtRPWBofj[",
    categories: ["nature", "water", "waterfall", "landscape"]
  },
  {
    id: 7,
    title: "Northern Lights",
    description: "Spectacular aurora borealis lighting up the night sky. Magical green curtains dancing across stars.",
    src: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7",
    alt: "Northern lights in the sky",
    width: 2000,
    height: 1333,
    blurhash: "L45q-wRj}tRkIpR*tSR*s9tSn$Rj",
    categories: ["nature", "sky", "night", "aurora"]
  },
  {
    id: 8,
    title: "Autumn Forest",
    description: "Vibrant autumn colors in a dense forest. Rich reds and golds paint the landscape in fall splendor.",
    src: "https://images.unsplash.com/photo-1508669232496-137b159c1cdb",
    alt: "Autumn forest with colorful leaves",
    width: 2070,
    height: 1380,
    blurhash: "LBDLQ}I;nQsV~V%}s+nQ58tmWVt7",
    categories: ["nature", "forest", "autumn", "foliage"]
  },
  {
    id: 9,
    title: "Coral Reef",
    description: "Colorful coral reef teeming with marine life. Underwater ecosystem showing nature's creative wonder.",
    src: "https://images.unsplash.com/photo-1546026423-cc4642628d2b",
    alt: "Underwater coral reef",
    width: 2070,
    height: 1380,
    blurhash: "L8C6?cR*C@oy~ot7R*ae0gWVxZt7",
    categories: ["underwater", "ocean", "coral", "marine"]
  },
  {
    id: 10,
    title: "Snowy Cabin",
    description: "Cozy cabin surrounded by snow-covered pine trees. Winter retreat offering warmth in a frozen landscape.",
    src: "https://images.unsplash.com/photo-1482192505345-5655af888cc4",
    alt: "Cabin in a snowy forest",
    width: 2070,
    height: 1380,
    blurhash: "L9Cc7?IV.9WB~qt7t7RjM{j[ofj[",
    categories: ["winter", "snow", "cabin", "trees"]
  },
  {
    id: 11,
    title: "Lavender Field",
    description: "Endless rows of purple lavender flowers. Fragrant blooms creating a sea of color in the countryside.",
    src: "https://images.unsplash.com/photo-1468581264429-2548ef9eb732",
    alt: "Field of lavender flowers",
    width: 2070,
    height: 1380,
    blurhash: "LAE:JOI;xat7~o%2WBRj%Lxaj[M{",
    categories: ["nature", "flowers", "purple", "fields"]
  },
  {
    id: 12,
    title: "Countryside",
    description: "Rolling hills and farmland in the countryside. Pastoral scenes of green meadows and rural tranquility.",
    src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
    alt: "Countryside landscape with rolling hills",
    width: 2062,
    height: 1375,
    blurhash: "LBDuZ~=|D%nh_4t7M{s:0gM{M{s:",
    categories: ["nature", "countryside", "fields", "rural"]
  }
];

// Extract all unique categories from the images
export const allCategories = Array.from(
  new Set(
    images.flatMap(image => image.categories || [])
  )
).sort();

// Function to filter images by category
export const filterByCategory = (images: ImageData[], category: string): ImageData[] => {
  if (!category) return images;
  return images.filter(image => image.categories?.includes(category));
};
