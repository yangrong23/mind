import * as React from 'react'

type ImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'> & {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  priority?: boolean
}

/** Vite shim for next/image — supports `fill` used across mind-landing photos */
export default function Image({
  src,
  alt,
  width,
  height,
  fill,
  sizes,
  priority,
  style,
  className,
  loading,
  ...rest
}: ImageProps) {
  const resolvedLoading = priority ? 'eager' : loading ?? 'lazy'

  if (fill) {
    return (
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        className={className}
        style={{
          position: 'absolute',
          inset: 0,
          height: '100%',
          width: '100%',
          objectFit: 'cover',
          ...style,
        }}
        loading={resolvedLoading}
        decoding="async"
        {...rest}
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      style={style}
      loading={resolvedLoading}
      decoding="async"
      {...rest}
    />
  )
}
