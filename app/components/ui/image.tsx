type ImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  width?: number;
  height?: number;
};

export default function Image({
  src,
  alt,
  className,
  fill,
  width,
  height,
}: ImageProps) {
  if (fill) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    );
  }

  return (
    <img src={src} alt={alt} className={className} width={width} height={height} />
  );
}