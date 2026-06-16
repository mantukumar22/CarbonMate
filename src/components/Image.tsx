import React from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function Image({
  src,
  alt,
  width,
  height,
  priority,
  className,
  style,
  ...props
}: ImageProps) {
  // Return standard high-performance img element
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{
        ...style,
        ...(priority ? { contentVisibility: "auto" } : {}),
      }}
      loading={priority ? "eager" : "lazy"}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}
