import darkLogo from "@/assets/logos/dark.svg";
import logo from "@/assets/logos/vimeo.svg";
import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-center gap-4"> {/* Use flexbox to align items horizontally with spacing */}
      <div className="relative h-10 w-10"> {/* Set a specific size for the logo container (e.g., h-10 w-10) */}
        <Image
        src={logo}
        fill
        className="dark:hidden"
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
      {/* Update the text content and styling to match the image format */}
      <div>
        {/* Main Title style */}
        <p className="text-base font-bold text-gray-900 dark:text-white">
          A Acedemy
        </p>
        {/* Sub-text/Email style (lighter gray) */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          hello@activeowl.asia
        </p>
      </div>
    </div>
  );
}
