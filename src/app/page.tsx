import { ImageGallery } from "@/components/image-gallery/ImageGallery";
import { images } from "@/data/images";

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Ultimate Image Gallery</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A feature-rich gallery with everything you need:
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
            Image Editing
          </div>
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
            Social Sharing
          </div>
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
            Categories & Tags
          </div>
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
            Auto-Play Slideshow
          </div>
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
            Drag & Drop
          </div>
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
            Masonry Layout
          </div>
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
            Search Filtering
          </div>
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
            Blurhash Loading
          </div>
        </div>
      </div>

      <ImageGallery images={images} />

      <footer className="mt-16 text-center text-sm text-muted-foreground space-y-2">
        <p className="font-semibold">
          Full-Featured Image Gallery
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mt-6">
          <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/20">
            <h3 className="font-medium">Image Editing</h3>
            <p className="text-xs mt-1">Crop, rotate, and apply filters to your images</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/20">
            <h3 className="font-medium">Social Sharing</h3>
            <p className="text-xs mt-1">Share images on social media or get embed codes</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/20">
            <h3 className="font-medium">Categories</h3>
            <p className="text-xs mt-1">Organize and filter by categories/tags</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/20">
            <h3 className="font-medium">Slideshow</h3>
            <p className="text-xs mt-1">View images as an auto-advancing slideshow</p>
          </div>
        </div>
        <p className="text-xs mt-6">
          Click images to view in lightbox • Use ← → keys to navigate • Categories filter images by topic
        </p>
      </footer>
    </main>
  );
}
