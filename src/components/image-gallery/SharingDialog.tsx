"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Check, X, Link } from "lucide-react";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  PinterestShareButton,
  RedditShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  PinterestIcon,
  RedditIcon,
  EmailIcon,
} from "react-share";
import { ImageData } from "@/data/images";

interface SharingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  image: ImageData;
  galleryUrl: string;
}

export function SharingDialog({ isOpen, onClose, image, galleryUrl }: SharingDialogProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("social");

  // Build sharing URLs
  const shareUrl = `${galleryUrl}?image=${image.id}`;
  const shareTitle = `Check out this image: ${image.title}`;
  const shareDescription = image.description;

  // Handle copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Create embed code for the image
  const embedCode = `<a href="${galleryUrl}?image=${image.id}" target="_blank" rel="noopener noreferrer">
  <img src="${image.src}" alt="${image.alt}" width="${image.width}" height="${image.height}" style="max-width: 100%; height: auto;" />
</a>`;

  // Handle copy embed code
  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this image</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="social" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="embed">Link & Embed</TabsTrigger>
          </TabsList>

          <TabsContent value="social" className="mt-4">
            <div className="flex flex-wrap gap-4 justify-center">
              <FacebookShareButton url={shareUrl}>
                <FacebookIcon size={40} round />
              </FacebookShareButton>

              <TwitterShareButton url={shareUrl} title={shareTitle}>
                <TwitterIcon size={40} round />
              </TwitterShareButton>

              <LinkedinShareButton url={shareUrl} title={shareTitle}>
                <LinkedinIcon size={40} round />
              </LinkedinShareButton>

              <PinterestShareButton url={shareUrl} media={image.src} description={shareTitle}>
                <PinterestIcon size={40} round />
              </PinterestShareButton>

              <RedditShareButton url={shareUrl} title={shareTitle}>
                <RedditIcon size={40} round />
              </RedditShareButton>

              <EmailShareButton url={shareUrl} subject={shareTitle} body={shareDescription}>
                <EmailIcon size={40} round />
              </EmailShareButton>
            </div>

            <p className="text-sm text-center mt-4 text-muted-foreground">
              Click an icon to share this image on your favorite platform
            </p>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" htmlFor="share-link">
                  Share Link
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  id="share-link"
                  value={shareUrl}
                  readOnly
                  onClick={(e) => e.currentTarget.select()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Embed Code
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={handleCopyEmbed}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="relative">
                <textarea
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={embedCode}
                  readOnly
                  onClick={(e) => e.currentTarget.select()}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use this code to embed the image on your website or blog.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
