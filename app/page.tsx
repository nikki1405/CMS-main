"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"

interface ContentSection {
  id: string
  title: string
  description: string
  imageUrl: string
  imageAlt: string
}

interface Page {
  id: string
  name: string
  title: string
  featuredSection: {
    title: string
    description: string
    imageUrl: string
    imageAlt: string
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
        featuredSection: {
          title: "Elevate Your Brand with Compelling Content",
          description: "Craft and manage engaging content that resonates with your audience and drives results.",
          imageUrl: "/placeholder.svg?height=200&width=400",
          imageAlt: "Modern office workspace",
        },
        contentSections: [
          {
            id: "1",
            title: "Boost Engagement with Visual Stories",
            description: "Create captivating visual narratives that capture attention and leave a lasting impression.",
            imageUrl: "/placeholder.svg?height=200&width=400",
            imageAlt: "Visual storytelling concept",
          },
          {
            id: "2",
            title: "Optimize Your Content for Maximum Impact",
            description: "Refine your content strategy with data-driven insights to achieve your business goals.",
            imageUrl: "/placeholder.svg?height=200&width=400",
            imageAlt: "Content optimization analytics",
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
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Top Navigation - User View */}
      <header className="bg-[#ffffff] border-b border-[#dbe0e5] px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#121417] rounded"></div>
            <span className="text-[#121417] font-semibold text-lg">CMS Platform</span>
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
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#121417] mb-6 sm:mb-8 text-center">{currentPage.title}</h1>

        <div className="bg-[#ffffff] rounded-lg p-6 sm:p-10 mb-10 sm:mb-14 border border-[#dbe0e5]">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-8 lg:gap-16">
            <div className="flex-1">
              <p className="text-[#61758a] text-sm mb-2">Featured</p>
              <h2 className="text-lg sm:text-xl font-semibold text-[#121417] mb-3">
                {currentPage.featuredSection.title}
              </h2>
              <p className="text-[#61758a] mb-4">{currentPage.featuredSection.description}</p>
            </div>
            <div className="flex-shrink-0 w-full lg:w-auto flex justify-center items-center">
              <img
                src={currentPage.featuredSection.imageUrl || "/placeholder.svg"}
                alt={currentPage.featuredSection.imageAlt}
                className="rounded-lg w-full max-w-[360px] h-[200px] object-cover"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8 sm:space-y-12">
          {currentPage.contentSections.map((section: ContentSection) => (
            <div key={section.id} className="bg-[#ffffff] rounded-lg p-6 sm:p-10 border border-[#dbe0e5]">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-8 lg:gap-16">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-[#121417] mb-3">{section.title}</h3>
                  <p className="text-[#61758a]">{section.description}</p>
                </div>
                <div className="flex-shrink-0 w-full lg:w-auto flex justify-center items-center">
                  <img
                    src={section.imageUrl || "/placeholder.svg"}
                    alt={section.imageAlt}
                    className="rounded-lg w-full max-w-[360px] h-[200px] object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
