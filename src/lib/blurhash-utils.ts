/**
 * Blurhash placeholders are small image placeholders that show a blurred version of an image
 * while the actual image is loading. Here we're using hardcoded blurhash values for our demo images,
 * but in a real application, you would calculate these when processing the images on the server.
 */

// Map of image URLs to their blurhash values
// In a real app, these would be stored in your database along with the image metadata
// All blurhash values are exactly 28 characters
export const blurhashMap = {
  "mountain": "L6Dd+^t7WBayofj[ayjtRPWBayj[",
  "beach": "L5H2EC=_0g9F%00M%MRj0K%Mt7V@",
  "city": "L4A,}WI9s:og*0oeR*R-E1WBkCR*",
  "forest": "L9B:|goJ0gfQIoaeWVfQ%NaefkfQ",
  "desert": "LCFZk^xu0JM|-:t7RkxuNGRPRjRj",
  "waterfall": "L6DdIVt7WBayofj[ayjtRPWBofj[",
  "lights": "L45q-wRj}tRkIpR*tSR*s9tSn$Rj",
  "autumn": "LBDLQ}I;nQsV~V%}s+nQ58tmWVt7",
  "coral": "L8C6?cR*C@oy~ot7R*ae0gWVxZt7",
  "snowy": "L9Cc7?IV.9WB~qt7t7RjM{j[ofj[",
  "lavender": "LAE:JOI;xat7~o%2WBRj%Lxaj[M{",
  "countryside": "LBDuZ~=|D%nh_4t7M{s:0gM{M{s:"
};

// Default blurhash to use when a specific one isn't found
// Ensure it's exactly 28 characters
export const defaultBlurhash = "L9C}KID*D%IT.TM{ofWB00%Mt7M{";

/**
 * Get a blurhash value based on image URL or title
 */
export function getBlurhashFromImage(image: { src: string; title: string }): string {
  // Return default blurhash if image object is invalid
  if (!image || !image.title) {
    return defaultBlurhash;
  }

  // Get the image key from the title or URL
  const imageTitleLower = image.title.toLowerCase();

  // Check if any of the keys in our blurhash map are in the title or URL
  const matchingKey = Object.keys(blurhashMap).find(key =>
    imageTitleLower.includes(key)
  );

  // Return the matching blurhash or the default one
  return matchingKey ? blurhashMap[matchingKey as keyof typeof blurhashMap] : defaultBlurhash;
}
