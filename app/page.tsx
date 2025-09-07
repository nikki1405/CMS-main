"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"

interface ImageItem {
  url: string
  alt: string
}

interface ContentSection {
  id: string
  title: string
  description: string
  images: ImageItem[]
}

interface Page {
  id: string
  name: string
  title: string
  bannerImage?: ImageItem // <-- add this line
  featuredSection: {
    title: string
    description: string
    images: ImageItem[]
  }
  contentSections: ContentSection[]
}

const getStoredData = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("cmsData")
    if (stored) {
      return JSON.parse(stored)
    }
  }
  // Default data structure
  return {
    pages: {
      content: {
        id: "content",
        name: "Content",
        title: "Welcome to Your Content Hub",
        bannerImage: { url: "/placeholder.svg?height=200&width=1200", alt: "Banner" }, // <-- add this line
        featuredSection: {
          title: "Elevate Your Brand with Compelling Content",
          description: "Craft and manage engaging content that resonates with your audience and drives results.",
          images: [
            { url: "/placeholder.svg?height=200&width=400", alt: "Modern office workspace" }
          ],
        },
        contentSections: [
          {
            id: "1",
            title: "Boost Engagement with Visual Stories",
            description: "Create captivating visual narratives that capture attention and leave a lasting impression.",
            images: [
              { url: "/placeholder.svg?height=200&width=400", alt: "Visual storytelling concept" }
            ],
          },
          {
            id: "2",
            title: "Optimize Your Content for Maximum Impact",
            description: "Refine your content strategy with data-driven insights to achieve your business goals.",
            images: [
              { url: "/placeholder.svg?height=200&width=400", alt: "Content optimization analytics" }
            ],
          },
        ],
      },
    },
  }
}

export default function HomePage() {
  const [data, setData] = useState<any>(null)
  const [currentPageId, setCurrentPageId] = useState<string>("content")

  useEffect(() => {
    setData(getStoredData())

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cmsData") {
        setData(getStoredData())
      }
    }

    window.addEventListener("storage", handleStorageChange)

    const handleCustomStorageChange = () => {
      setData(getStoredData())
    }

    window.addEventListener("cmsDataUpdated", handleCustomStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("cmsDataUpdated", handleCustomStorageChange)
    }
  }, [])

  useEffect(() => {
    // If data changes, reset to first page if currentPageId is missing
    if (data && (!data.pages[currentPageId] || Object.keys(data.pages).length === 0)) {
      setCurrentPageId(Object.keys(data.pages)[0] || "content")
    }
  }, [data, currentPageId])

  if (!data) {
    return <div>Loading...</div>
  }

  const pagesArray: Page[] = Object.values(data.pages)
  const currentPage: Page = data.pages[currentPageId] || pagesArray[0]

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation - User View */}
      <header className="bg-[#ffffff] border-b border-[#dbe0e5] px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            
            <span className="text-[#121417] font-semibold text-lg ml-100">CMS Platform</span>
          </div>

          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            {pagesArray.map((page) => (
              <button
                key={page.id}
                className={`text-[#61758a] hover:text-[#121417] font-medium${currentPageId === page.id ? " text-[#121417] font-bold" : ""}`}
                onClick={() => setCurrentPageId(page.id)}
              >
                {page.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Bell className="w-5 h-5 text-[#61758a]" />
          </div>
        </div>
      </header>

      {/* Main Content - Clean User View */}
      <main className="w-full mx-auto p-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-10 mt-10 text-center">{currentPage.title}</h1>

        <div className="w-full">
          {/* Banner Image */}
          {currentPage.bannerImage?.url && (
  <div className="w-full flex justify-center bg-black">
    <img
      src={currentPage.bannerImage.url}
      alt={currentPage.bannerImage.alt}
      className="w-full max-h-[800px] object-cover"
      style={{ maxWidth: "100%", borderRadius: "0" }}
    />
  </div>
)}

          {/* Featured Section */}
          <section className="flex flex-col lg:flex-row w-full min-h-[180px] max-w-7xl mx-auto">
            {/* Image(s) on the left */}
            <div className="w-full lg:w-1/2 h-[160px] lg:h-auto flex items-stretch">
              {currentPage.featuredSection.images?.[0] && (
                <img
                  src={currentPage.featuredSection.images[0].url}
                  alt={currentPage.featuredSection.images[0].alt}
                  className="object-cover w-full h-full"
                  style={{ borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px" }}
                />
              )}
            </div>
            {/* Data on the right */}
            <div className="w-full lg:w-1/2 bg-black text-white flex flex-col justify-center p-6 lg:p-8">
              <h2 className="text-2xl font-extrabold mb-4">{currentPage.featuredSection.title}</h2>
              <p className="text-base mb-2">{currentPage.featuredSection.description}</p>
            </div>
          </section>

          {/* Content Sections */}
          {currentPage.contentSections.map((section: ContentSection, idx) => (
            <section
              key={section.id}
              className={`flex flex-col lg:flex-row w-full min-h-[180px] max-w-7xl mx-auto mt-8${idx === currentPage.contentSections.length - 1 ? " mb-12 pb-12" : ""}`}
            >
              {/* Image(s) on the left */}
              <div className="w-full lg:w-1/2 h-[160px] lg:h-auto flex items-stretch">
                {section.images?.[0] && (
                  <img
                    src={section.images[0].url}
                    alt={section.images[0].alt}
                    className="object-cover w-full h-full"
                    style={{ borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px" }}
                  />
                )}
              </div>
              {/* Data on the right */}
              <div className="w-full lg:w-1/2 bg-black text-white flex flex-col justify-center p-6 lg:p-8">
                <h3 className="text-2xl font-extrabold mb-4">{section.title}</h3>
                <p className="text-base mb-2">{section.description}</p>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}