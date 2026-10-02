import Image from "next/image";

type LogoProps = { size?: "sm" | "md" | "lg"; showText?: boolean };

const sizes = { sm: 34, md: 42, lg: 56 };

export function Logo({ size = "md", showText = true }: LogoProps) {
  const dimension = sizes[size];
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="Cooksy">
      <Image
        src="/logo-icon.svg"
        alt=""
        width={dimension}
        height={dimension}
        priority
        className="rounded-[28%] shadow-[0_5px_14px_rgba(245,82,32,.2)]"
      />
      {showText && (
        <span className="text-[25px] font-extrabold leading-none tracking-[-1.35px]">
          <span className="text-cooksy-ink dark:text-white">Cook</span>
          <span className="text-[#F55220]">sy</span>
        </span>
      )}
    </span>
  );
}
