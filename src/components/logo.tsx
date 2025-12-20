import darkLogo from "@/assets/logos/dark.svg";
import logo from "@/assets/logos/main.svg";
import Image from "next/image";

export function Logo() {
  return (
    <div className="relative h-full max-w-full">
      <div className="h-14 w-auto flex justify-start">
        <Image
        src={logo}
        fill
        className="dark:hidden object-contain "
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
      />

      <Image
        src={darkLogo}
        fill
        className="hidden dark:block"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
      />
      </div>
    </div>
  );
}
