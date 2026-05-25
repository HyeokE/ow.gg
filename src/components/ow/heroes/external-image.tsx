/* eslint-disable @next/next/no-img-element */

import type * as React from "react";

import { cn } from "@/lib/utils";

type ExternalImageProps = Omit<
  React.ComponentProps<"img">,
  "alt" | "src"
> & {
  alt: string;
  src?: string | null;
  fallbackClassName?: string;
};

export function ExternalImage({
  alt,
  className,
  fallbackClassName,
  src,
  ...props
}: ExternalImageProps) {
  if (!src) {
    return (
      <div
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-muted text-xs text-muted-foreground",
          fallbackClassName,
          className
        )}
        role="img"
      >
        이미지 없음
      </div>
    );
  }

  return <img alt={alt} className={className} src={src} {...props} />;
}

