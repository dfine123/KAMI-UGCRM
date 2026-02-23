import { Instagram, Music2, Youtube, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const icons: Record<string, React.ComponentType<any>> = {
  INSTAGRAM: Instagram,
  TIKTOK: Music2,
  YOUTUBE: Youtube,
  MULTI_PLATFORM: Globe,
  INSTAGRAM_REEL: Instagram,
  INSTAGRAM_STORY: Instagram,
  YOUTUBE_SHORT: Youtube,
  YOUTUBE_VIDEO: Youtube,
};

const colors: Record<string, string> = {
  INSTAGRAM: "text-pink-400",
  TIKTOK: "text-cyan-400",
  YOUTUBE: "text-red-400",
  MULTI_PLATFORM: "text-purple-400",
  INSTAGRAM_REEL: "text-pink-400",
  INSTAGRAM_STORY: "text-pink-400",
  YOUTUBE_SHORT: "text-red-400",
  YOUTUBE_VIDEO: "text-red-400",
};

interface PlatformIconProps {
  platform: string;
  className?: string;
  size?: number;
}

export function PlatformIcon({ platform, className, size = 16 }: PlatformIconProps) {
  const Icon = icons[platform] || Globe;
  const color = colors[platform] || "text-gray-400";

  return <Icon className={cn(color, className)} size={size} />;
}
