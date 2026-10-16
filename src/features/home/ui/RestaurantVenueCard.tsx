import Image from "next/image";

type RestaurantVenueCardProps = {
  title: string;
  titleClassName?: string;
  photoSrc: string;
  photoClassName: string;
  photoWidth: number;
  photoHeight: number;
  photoNodeId?: string;
  logoSrc?: string;
  logoWidth?: number;
  logoHeight?: number;
  logoClassName?: string;
};

/**
 * Venue tile on the restaurants list (Figma 704:4022 / 704:4026 / 704:4029).
 */
export function RestaurantVenueCard({
  title,
  titleClassName = "top-[180px] right-[21px]",
  photoSrc,
  photoClassName,
  photoWidth,
  photoHeight,
  photoNodeId,
  logoSrc,
  logoWidth = 247,
  logoHeight = 133,
  logoClassName = "top-[18px] left-5",
}: RestaurantVenueCardProps) {
  return (
    <article className="relative h-[234px] w-full overflow-hidden rounded-[20px] border-2 border-white bg-brand-forest">
      <Image
        src={photoSrc}
        alt=""
        width={photoWidth}
        height={photoHeight}
        className={`pointer-events-none max-w-none ${photoClassName}`}
        data-node-id={photoNodeId}
      />
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt=""
          width={logoWidth}
          height={logoHeight}
          unoptimized
          className={`pointer-events-none absolute z-[1] max-w-none ${logoClassName}`}
        />
      ) : null}
      <h2
        className={`absolute z-[1] whitespace-nowrap font-mirage text-[44px] leading-5 font-normal text-white ${titleClassName}`}
      >
        {title}
      </h2>
    </article>
  );
}
