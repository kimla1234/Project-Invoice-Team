"use client";

import { Logo } from "../../logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";
import Image from "next/image";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

import { toast } from "@/hooks/use-toast";

export function Sidebar() {
    const router = useRouter();
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // --- New State for Company Info ---
  const [companyData, setCompanyData] = useState({
    name: "Loading...",
    email: "",
    logo: null as string | null,
  });
  useEffect(() => {
    const fetchUserData = () => {
      const savedData = localStorage.getItem("registered_user");
      if (savedData) {
        try {
          const user = JSON.parse(savedData);
          setCompanyData({
            name: user.companyName || "My Company",
            email: user.companyEmail || "",
            logo: user.companyLogo || null,
          });
        } catch (e) {
          console.error("Error parsing sidebar data", e);
        }
      }
    };

    fetchUserData(); // ទាញទិន្នន័យលើកដំបូង

    // ចាប់ផ្ដើមស្ដាប់នៅពេលមានការបាញ់ Event "company-updated"
    window.addEventListener("company-updated", fetchUserData);

    return () => {
      window.removeEventListener("company-updated", fetchUserData);
    };
  }, []);
  // ----------------------------------

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));

    // Uncomment the following line to enable multiple expanded items
    // setExpandedItems((prev) =>
    //   prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    // );
  };

  useEffect(() => {
    // Keep collapsible open, when it's subpage is active
    NAV_DATA.some((section) => {
      return section.items.some((item) => {
        return true;
      });
    });
  }, [pathname]);

 const handleLogout = async () => {
    try {
      const res = await fetch(`/api/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: data.message || "Logout Successful!",
          description: "You have been safely logged out.",
          variant: "success", // Ensure your toaster supports this variant
          duration: 3000,
        });

        // Redirect and reload
        router.push(`/login`);
        //window.location.reload();
      } else {
        // If 400 (Token not found), the user is effectively logged out anyway
        toast({
          title: "Session Expired",
          description: data.message || "Your session was already cleared.",
          variant: "destructive", // Shadcn default for errors
          duration: 3000,
        });

        // Optional: Redirect anyway since the token is missing/invalid
        router.push(`/`);
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to reach the server. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Logout Error:", error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "max-w-[290px] overflow-hidden border-r border-gray-200 bg-white transition-[width] duration-200 ease-linear dark:border-gray-800 dark:bg-gray-dark",
          isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen",
          isOpen ? "w-full" : "w-0",
        )}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="flex h-full flex-col pl-[25px] pr-[7px]">
          {/* --- New Company Profile Preview --- */}
          <div className="mt-8 flex items-center gap-3 pr-4">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
              {companyData.logo ? (
                <Image
                  src={companyData.logo}
                  alt="Logo"
                  fill // Keeps the image responsive to the parent div
                  className="object-cover"
                  sizes="40px" // Optional: Helps Next.js optimize the image size
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-500 text-sm font-bold text-white">
                  {companyData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
              <p className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                {companyData.name}
              </p>
              <p className="truncate text-xs text-gray-500">
                {companyData.email}
              </p>
            </div>
          </div>
          {/* ---------------------------------- */}

          {/* Navigation */}
          <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10">
            {NAV_DATA.map((section) => (
              <div key={section.label} className="mb-5">
                <h2 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                  {section.label}
                </h2>

                <nav role="navigation " className=" " aria-label={section.label}>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isSignOut = item.title === "Sign out";

                      return (
                        <li key={item.title}>
                          {isSignOut ? (
                            // Sign out button triggers modal
                            <MenuItem
                              className="flex  items-center gap-3 py-3"
                              onClick={() => setShowSignOutModal(true)}
                              isDestructive
                              isActive={false}
                            >
                              <item.icon className="size-6 shrink-0" />
                              <span>{item.title}</span>
                            </MenuItem>
                          ) : item.items.length ? (
                            // existing collapsible menu logic
                            <div>
                              <MenuItem
                                isActive={item.items.some(
                                  ({ url }) => url === pathname,
                                )}
                                onClick={() => toggleExpanded(item.title)}
                              >
                                <item.icon className="size-6 shrink-0" />
                                <span>{item.title}</span>
                                <ChevronUp
                                  className={cn(
                                    "ml-auto   rotate-180 transition-transform duration-200",
                                    expandedItems.includes(item.title) &&
                                      "rotate-0",
                                  )}
                                />
                              </MenuItem>
                            </div>
                          ) : (
                            // normal link item
                            <MenuItem
                              className="flex items-center gap-3 py-3"
                              as="link"
                              href={item.url || "/"}
                              isActive={pathname === item.url}
                            >
                              <item.icon className="size-6 shrink-0" />
                              <span>{item.title}</span>
                            </MenuItem>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <ConfirmModal
          open={showSignOutModal}
          title="Confirm Sign Out"
          description="Are you sure you want to sign out?"
          onConfirm={handleLogout}
          onCancel={() => setShowSignOutModal(false)}
        />
    </>
  );
}
