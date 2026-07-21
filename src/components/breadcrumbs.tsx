"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Construct JSON-LD BreadcrumbList schema
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${BASE_URL}/`
      },
      ...items.map((item, idx) => ({
        "@type": "ListItem",
        "position": idx + 2,
        "name": item.label,
        ...(item.href ? { "item": `${BASE_URL}${item.href}` } : {})
      }))
    ]
  };

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      <nav className="flex items-center space-x-1.5 text-xs text-gray-400 py-4" aria-label="Breadcrumb">
        <Link href="/" className="flex items-center gap-1 hover:text-gray-600 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span className="sr-only">Home</span>
        </Link>
        
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <div key={idx} className="flex items-center space-x-1.5">
              <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
              {isLast || !item.href ? (
                <span className="font-semibold text-gray-700 truncate max-w-[200px]" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-gray-600 transition-colors truncate max-w-[200px]">
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
