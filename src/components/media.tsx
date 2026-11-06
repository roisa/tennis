import Image from "next/image";
import type { Court, Scene as SceneKey } from "@/lib/data/schema";
import { Scene } from "./scene";

type Props = {
  src?: string | null;
  alt: string;
  scene: SceneKey;
  seed?: string;
  surface?: Court["surface"];
  className?: string;
  sizes?: string;
  priority?: boolean;
  zoom?: boolean;
  noCourt?: boolean;
};

/** Photography when available; art-directed Scene placeholder otherwise. Parent must be `relative` with a size. */
export function Media({ src, alt, scene, seed, surface, className = "", sizes = "100vw", priority, zoom = true, noCourt }: Props) {
  return (
    <div className={`grain absolute inset-0 overflow-hidden bg-forest-2 ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={src.includes("/uploads/")} className={`object-cover ${zoom ? "media-zoom" : ""}`} />
      ) : (
        <Scene scene={scene} seed={seed} surface={surface} label={`Illustration: ${alt}`} noCourt={noCourt} className={`h-full w-full ${zoom ? "media-zoom" : ""}`} />
      )}
    </div>
  );
}
