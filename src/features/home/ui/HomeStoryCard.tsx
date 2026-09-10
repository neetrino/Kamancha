import Image from 'next/image';
import type { ReactNode } from 'react';

type Box = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * Card artwork as authored in Figma: a clip window placed on the card box and
 * the photo placed inside that window. Both boxes are percentages of their
 * parent so the card keeps its crop while the section scales.
 */
export type HomeStoryCardImage = {
  src: string;
  /** Intrinsic asset size. */
  width: number;
  height: number;
  sizes: string;
  /** Clip window, in % of the card. */
  frame: Box;
  /** Photo placement, in % of the clip window. */
  inner: Box;
  /** Omit for decorative artwork. */
  alt?: string;
};

type HomeStoryCardProps = {
  title: string;
  body: string;
  image: HomeStoryCardImage;
  /** Surface colour and Figma height. */
  className: string;
  /** Text column padding and width. */
  contentClassName: string;
  titleClassName: string;
  bodyClassName: string;
  nodeId: string;
  /** When set, the title opens this URL (same maps links as the footer). */
  titleHref?: string;
  /** Extra content below the body, e.g. the delivery phone number. */
  children?: ReactNode;
};

function boxStyle({ left, top, width, height }: Box) {
  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`,
  };
}

/** Story card — rounded surface with copy over a clipped photo (Figma 455:190). */
export function HomeStoryCard({
  title,
  body,
  image,
  className,
  contentClassName,
  titleClassName,
  bodyClassName,
  nodeId,
  titleHref,
  children,
}: HomeStoryCardProps) {
  const decorative = image.alt === undefined;

  return (
    <article data-node-id={nodeId} className={`relative overflow-clip rounded-[30px] ${className}`}>
      <div className={`relative z-[1] ${contentClassName}`}>
        <h3 className={titleClassName}>
          {titleHref ? (
            <a
              href={titleHref}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-70"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h3>
        <p className={bodyClassName}>{body}</p>
        {children}
      </div>

      <div
        className="pointer-events-none absolute overflow-hidden"
        style={boxStyle(image.frame)}
        aria-hidden={decorative || undefined}
      >
        <Image
          src={image.src}
          alt={image.alt ?? ''}
          width={image.width}
          height={image.height}
          sizes={image.sizes}
          className="absolute max-w-none"
          style={boxStyle(image.inner)}
        />
      </div>
    </article>
  );
}
