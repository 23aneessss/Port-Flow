import Image from "next/image";
import carrierLogo from "@/assets/carrier.webp";



export default function PortBranding() {
return (
    <div className="flex flex-col items-center gap-3">
      {/* Logo */}
    <Image
        src={carrierLogo}
        alt="Carrier Logo"
        width={160}
        height={160}
        className="h-28 w-auto object-contain"
        priority
    />
    </div>
);
}
