"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, FileText, Plus, Edit2, X, Upload, Check } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"


interface ImageItem {
  id?: string;
  _id?: string; // Backend ID
  url: string;
  alt: string;
  fileName?: string;
  cloudinaryId?: string;
  format?: string;
  size?: number;
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
  featuredSection: {
    title: string
    description: string
    images: ImageItem[]
  }
  contentSections: ContentSection[]
  bannerImage?: ImageItem
}

const getStoredData = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("cmsData")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const sanitizedPages = Object.values(parsed.pages || {}).map((page: any) => ({
          ...page,
          featuredSection: {
            ...page.featuredSection,
            images: Array.isArray(page.featuredSection?.images) ? page.featuredSection.images : [],
          },
          contentSections: Array.isArray(page.contentSections)
            ? page.contentSections.map((section: any) => ({
                ...section,
                images: Array.isArray(section.images) ? section.images : [],
              }))
            : [],
        }))
        return { pages: sanitizedPages.reduce((acc: any, page: Page) => ({ ...acc, [page.id]: page }), {}) }
      } catch (error) {
        console.error("Error parsing localStorage data:", error)
      }
    }
  }

  return {
    pages: {
      content: {
        id: "content",
        name: "Content",
        title: "Welcome to Your Content Hub",
        featuredSection: {
          title: "Elevate Your Brand with Compelling Content",
          description: "Craft and manage engaging content that resonates with your audience and drives results.",
          images: [{ url: "/placeholder.svg?height=200&width=400", alt: "Modern office workspace" }],
        },
        contentSections: [
          {
            id: "1",
            title: "Boost Engagement with Visual Stories",
            description: "Create captivating visual narratives that capture attention and leave a lasting impression.",
            images: [{ url: "/placeholder.svg?height=200&width=400", alt: "Visual storytelling concept" }],
          },
          {
            id: "2",
            title: "Optimize Your Content for Maximum Impact",
            description: "Refine your content strategy with data-driven insights to achieve your business goals.",
            images: [{ url: "/placeholder.svg?height=200&width=400", alt: "Content optimization analytics" }],
          },
        ],
      },
    },
  }
}

const defaultPageData = {
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
}

export default function AdminPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [pages, setPages] = useState<Page[]>([])
  const [currentView, setCurrentView] = useState("content")
  const [currentPage, setCurrentPage] = useState<Page | null>(null)
  const [isEditingPageName, setIsEditingPageName] = useState(false)
  const [tempPageName, setTempPageName] = useState("")
  const [showNewPageModal, setShowNewPageModal] = useState(false)
  const [newPageName, setNewPageName] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState("")
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [uploadingFor, setUploadingFor] = useState<{ type: "featured" | "section" | "add"; id?: string } | null>(null)
  const [isEditingFeaturedTitle, setIsEditingFeaturedTitle] = useState(false)
  const [isEditingFeaturedDesc, setIsEditingFeaturedDesc] = useState(false)
  const [tempFeaturedTitle, setTempFeaturedTitle] = useState("")
  const [tempFeaturedDesc, setTempFeaturedDesc] = useState("")
  const [editingSectionTitle, setEditingSectionTitle] = useState<string | null>(null)
  const [editingSectionDesc, setEditingSectionDesc] = useState<string | null>(null)
  const [tempSectionTitle, setTempSectionTitle] = useState("")
  const [tempSectionDesc, setTempSectionDesc] = useState("")

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn")
    router.push("/admin/login")
  }

  useEffect(() => {
    const checkAuthStatus = () => {
      const loggedIn = localStorage.getItem("adminLoggedIn") === "true"
      if (!loggedIn) {
        router.push("/admin/login")
        return
      }
      setIsCheckingAuth(false)
    }

    checkAuthStatus()
  }, [router])

  useEffect(() => {
    const data = getStoredData()
    const pagesArray = Object.values(data.pages || {}) as Page[]
    setPages(pagesArray)
    setCurrentView(pagesArray[0]?.id || "content")
  }, [])

  useEffect(() => {
    const page = pages.find((p) => p.id === currentView) || null
    setCurrentPage(page)
  }, [pages, currentView])

  useEffect(() => {
    if (pages.length > 0) {
      const data = {
        pages: pages.reduce((acc, page) => {
          acc[page.id] = page
          return acc
        }, {} as any),
      }
      localStorage.setItem("cmsData", JSON.stringify(data))
      window.dispatchEvent(new CustomEvent("cmsDataUpdated"))
    }
  }, [pages])

  const handleNavigation = (view: string) => {
    setCurrentView(view)
    const page = pages.find((p) => p.id === view) || null
    setCurrentPage(page)
  }

  const handleEditPageName = () => {
    if (currentPage) {
      setTempPageName(currentPage.name)
      setIsEditingPageName(true)
    }
  }

  const handleSavePageName = () => {
    if (currentPage) {
      setPages((prev) => prev.map((p) => (p.id === currentPage.id ? { ...p, name: tempPageName } : p)))
      setCurrentPage((prev) => (prev ? { ...prev, name: tempPageName } : null))
      setIsEditingPageName(false)
    }
  }

  const handleAddNewPage = () => {
    const newId = newPageName.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now()
    const newPage: Page = {
      id: newId,
      name: newPageName,
      title: newPageName,
      featuredSection: { ...defaultPageData.featuredSection, images: [...defaultPageData.featuredSection.images] },
      contentSections: defaultPageData.contentSections.map((section) => ({
        ...section,
        id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
        images: [...section.images],
      })),
    }
    setPages((prev) => [...prev, newPage])
    setCurrentView(newId)
    setShowNewPageModal(false)
    setNewPageName("")
  }

  const handleEditHeading = () => {
    if (currentPage) {
      setTempTitle(currentPage.title)
      setIsEditingTitle(true)
    }
  }

  const handleSaveTitle = () => {
    if (currentPage) {
      setPages((prev) => prev.map((p) => (p.id === currentPage.id ? { ...p, title: tempTitle } : p)))
      setCurrentPage((prev) => (prev ? { ...prev, title: tempTitle } : null))
      setIsEditingTitle(false)
    }
  }

  const handleEditFeaturedImage = () => {
    setUploadingFor({ type: "featured" })
    setShowImageUpload(true)
  }

  const handleAddFeaturedImage = () => {
    setUploadingFor({ type: "add" })
    setShowImageUpload(true)
  }

  const handleEditSectionImage = (sectionId: string) => {
    setUploadingFor({ type: "section", id: sectionId })
    setShowImageUpload(true)
  }

  const handleAddSectionImage = (sectionId: string) => {
    setUploadingFor({ type: "add", id: sectionId })
    setShowImageUpload(true)
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL; 

const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file && uploadingFor && currentPage) {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Image upload failed");
      }
      const data = await response.json();
      const image = { ...data, id: data._id , alt: file.name || "Uploaded image" };

      if (uploadingFor.type === "featured") {
        const updatedImages = [
          image,
          ...currentPage.featuredSection.images.slice(1),
        ];
        const updatedPage = {
          ...currentPage,
          featuredSection: { ...currentPage.featuredSection, images: updatedImages },
        };
        setPages((prev) => prev.map((p) => (p.id === currentPage.id ? updatedPage : p)));
        setCurrentPage(updatedPage);
      } else if (uploadingFor.type === "section" && uploadingFor.id) {
        const updatedSections = currentPage.contentSections.map((s) =>
          s.id === uploadingFor.id
            ? { ...s, images: [image, ...s.images.slice(1)] }
            : s
        );
        const updatedPage = { ...currentPage, contentSections: updatedSections };
        setPages((prev) => prev.map((p) => (p.id === currentPage.id ? updatedPage : p)));
        setCurrentPage(updatedPage);
      } else if (uploadingFor.type === "add" && uploadingFor.id) {
        const updatedSections = currentPage.contentSections.map((s) =>
          s.id === uploadingFor.id
            ? { ...s, images: [...s.images, image] }
            : s
        );
        const updatedPage = { ...currentPage, contentSections: updatedSections };
        setPages((prev) => prev.map((p) => (p.id === currentPage.id ? updatedPage : p)));
        setCurrentPage(updatedPage);
      } else if (uploadingFor.type === "add") {
        const updatedImages = [
          ...currentPage.featuredSection.images,
          image
        ];
        const updatedPage = {
          ...currentPage,
          featuredSection: { ...currentPage.featuredSection, images: updatedImages },
        };
        setPages((prev) => prev.map((p) => (p.id === currentPage.id ? updatedPage : p)));
        setCurrentPage(updatedPage);
      }

      setShowImageUpload(false);
      setUploadingFor(null);
    } catch (error) {
      console.error("Image upload error:", error);
    }
  }
};


  const handleEditFeaturedTitle = () => {
    if (currentPage) {
      setTempFeaturedTitle(currentPage.featuredSection.title)
      setIsEditingFeaturedTitle(true)
    }
  }

  const handleSaveFeaturedTitle = () => {
    if (currentPage) {
      const updatedPage = {
        ...currentPage,
        featuredSection: { ...currentPage.featuredSection, title: tempFeaturedTitle },
      }
      setPages((prev) => prev.map((p) => (p.id === currentPage.id ? updatedPage : p)))
      setCurrentPage(updatedPage)
      setIsEditingFeaturedTitle(false)
    }
  }

  const handleEditFeaturedDescription = () => {
    if (currentPage) {
      setTempFeaturedDesc(currentPage.featuredSection.description)
      setIsEditingFeaturedDesc(true)
    }
  }

  const handleSaveFeaturedDesc = () => {
    if (currentPage) {
      const updatedPage = {
        ...currentPage,
        featuredSection: { ...currentPage.featuredSection, description: tempFeaturedDesc },
      }
      setPages((prev) => prev.map((p) => (p.id === currentPage.id ? updatedPage : p)))
      setCurrentPage(updatedPage)
      setIsEditingFeaturedDesc(false)
    }
  }

  const handleEditSectionTitle = (sectionId: string) => {
    if (currentPage) {
      const section = currentPage.contentSections.find((s) => s.id === sectionId)
      if (section) {
        setTempSectionTitle(section.title)
        setEditingSectionTitle(sectionId)
      }
    }
  }

  const handleSaveSectionTitle = (sectionId: string) => {
    if (currentPage) {
      const updatedSections = currentPage.contentSections.map((s) =>
        s.id === sectionId ? { ...s, title: tempSectionTitle } : s,
      )
      const updatedPage = { ...currentPage, contentSections: updatedSections }
      setPages((prev) => prev.map((p) => (p.id === currentPage.id ? updatedPage : p)))
      setCurrentPage(updatedPage)
      setEditingSectionTitle(null)
    }
  }

  const handleEditSectionDescription = (sectionId: string) => {
    if (currentPage) {
      const section = currentPage.contentSections.find((s) => s.id === sectionId)
      if (section) {
        setTempSectionDesc(section.description)
        setEditingSectionDesc(sectionId)
      }
    }
  }

  const handleSaveSectionDesc = (sectionId: string) => {
    if (currentPage) {
      const updatedSections = currentPage.contentSections.map((s) =>
        s.id === sectionId ? { ...s, description: tempSectionDesc } : s,
      )
      const updatedPage = { ...currentPage, contentSections: updatedSections }
      setPages((prev) => prev.map((p) => (p.id === currentPage.id ? updatedPage : p)))
      setCurrentPage(updatedPage)
      setEditingSectionDesc(null)
    }
  }

const handleDeleteFeaturedImage = async (index: number = 0) => {
  if (confirm("Are you sure you want to delete this image?") && currentPage) {
    const image = currentPage.featuredSection.images[index];
    if (!image || !image.id) {
      console.error("Image ID is missing");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${image.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      const updatedImages = currentPage.featuredSection.images.filter((_, i) => i !== index);
      const updatedPage = {
        ...currentPage,
        featuredSection: {
          ...currentPage.featuredSection,
          images: updatedImages.length > 0 ? updatedImages : [
            { url: "/placeholder.svg?height=200&width=400", alt: "Placeholder" }
          ],
        },
      };

      setPages((prev) => prev.map((p) => (p.id === currentPage.id ? updatedPage : p)));
      setCurrentPage(updatedPage);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  }
};



const handleDeleteSectionImage = async (sectionId: string, index: number = 0) => {
  if (confirm("Are you sure you want to delete this image?") && currentPage) {
    const section = currentPage.contentSections.find((s) => s.id === sectionId);
    if (!section) {
      console.error("Section not found");
      return;
    }

    const image = section.images[index];
    if (!image || !image.id) {
      console.error("Image ID is missing");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${image.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      const updatedSections = currentPage.contentSections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              images: s.images.filter((_, i) => i !== index).length > 0
                ? s.images.filter((_, i) => i !== index)
                : [{ url: "/placeholder.svg?height=150&width=200", alt: "Placeholder" }],
            }
          : s
      );

      const updatedPage = { ...currentPage, contentSections: updatedSections };

      setPages((prev) => prev.map((p) => (p.id === currentPage.id ? updatedPage : p)));
      setCurrentPage(updatedPage);
    } catch (error) {
      console.error("Error deleting section image:", error);
    }
  }
};


  const handleDeleteFeaturedDescription = () => {
    if (confirm("Are you sure you want to delete this description?") && currentPage) {
      const updatedPage = {
        ...currentPage,
        featuredSection: { ...currentPage.featuredSection, description: "" },
      }
      setPages((prev) => prev.map((p) => (p.id === currentPage.id ? updatedPage : p)))
      setCurrentPage(updatedPage)
    }
  }

  const handleDeleteSectionDescription = (sectionId: string) => {
    if (confirm("Are you sure you want to delete this description?") && currentPage) {
      const updatedSections = currentPage.contentSections.map((s) =>
        s.id === sectionId ? { ...s, description: "" } : s,
      )
      const updatedPage = { ...currentPage, contentSections: updatedSections }
      setPages((prev) => prev.map((p) => (p.id === currentPage.id ? updatedPage : p)))
      setCurrentPage(updatedPage)
    }
  }

  const handleDeleteSection = (sectionId: string) => {
    if (confirm("Are you sure you want to delete this entire section?") && currentPage) {
      const updatedSections = currentPage.contentSections.filter((s) => s.id !== sectionId)
      const updatedPage = { ...currentPage, contentSections: updatedSections }
      setPages((prev) => prev.map((p) => (p.id === currentPage.id ? updatedPage : p)))
      setCurrentPage(updatedPage)
    }
  }

  const handleAddSection = () => {
    if (currentPage) {
      const newSection: ContentSection = {
        id: Date.now().toString(),
        title: "New Section Title",
        description: "New section description",
        images: [{ url: "/placeholder.svg?height=150&width=200", alt: "New content section" }],
      }
      const updatedSections = [...currentPage.contentSections, newSection]
      const updatedPage = { ...currentPage, contentSections: updatedSections }
      setPages((prev) => prev.map((p) => (p.id === currentPage.id ? updatedPage : p)))
      setCurrentPage(updatedPage)
    }
  }

  const handleDeletePage = () => {
    if (confirm("Are you sure you want to delete this entire page? This action cannot be undone.") && currentPage) {
      setPages((prev) => prev.filter((p) => p.id !== currentPage.id))
      setCurrentView("content")
      setCurrentPage(pages.find((p) => p.id === "content") || null)
    }
  }

  const handleSave = () => {
    alert("Changes saved successfully!")
    console.log("[v0] Saving page data:", currentPage)
  }

  if (isCheckingAuth || !currentPage) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <header className="bg-[#ffffff] border-b border-[#dbe0e5] px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#121417] rounded"></div>
            <span className="text-[#121417] font-semibold text-lg">Admin</span>
          </div>

          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => handleNavigation(page.id)}
                className={`transition-colors ${currentView === page.id ? "text-[#121417]" : "text-[#61758a] hover:text-[#121417]"}`}
              >
                {page.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Bell className="w-5 h-5 text-[#61758a]" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-[#dbe0e5] text-[#61758a] bg-transparent text-xs sm:text-sm"
            >
              Logout
            </Button>
            <div className="w-8 h-8 rounded-full bg-[#dbe0e5] overflow-hidden">
              <img src="/placeholder.svg?height=32&width=32" alt="User avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        <aside className="w-full lg:w-72 bg-[#ffffff] border-r border-[#dbe0e5] lg:min-h-[calc(100vh-73px)]">
          <div className="p-6 sm:p-8">
            <h3 className="text-[#121417] font-bold text-xl mb-6">Menu</h3>
            <nav className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-x-visible">
              {pages.map((page) => {
                const icons = { content: FileText }
                const IconComponent = icons[page.id as keyof typeof icons] || FileText
                return (
                  <button
                    key={page.id}
                    onClick={() => handleNavigation(page.id)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-left whitespace-nowrap lg:w-full text-lg ${
                      currentView === page.id ? "bg-[#e5e8eb] text-[#121417]" : "text-[#61758a] hover:bg-[#f0f2f5]"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="hidden sm:inline">{page.name}</span>
                  </button>
                )
              })}
              <button
                className="flex items-center gap-4 px-4 py-3 text-[#61758a] hover:bg-[#f0f2f5] rounded-lg transition-colors text-left whitespace-nowrap lg:w-full text-lg"
                onClick={() => setShowNewPageModal(true)}
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add New Page</span>
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-6 sm:p-10 lg:p-16 flex flex-col items-center">
          <div className="w-full max-w-3xl lg:max-w-5xl mx-auto">
            <div className="bg-[#ffffff] rounded-lg p-8 sm:p-12 mb-12 border border-[#dbe0e5] flex flex-col items-center">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 w-full">
                <span className="text-[#61758a] text-lg sm:text-xl">Page Name:</span>
                {isEditingPageName ? (
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
                    <Input
                      value={tempPageName}
                      onChange={(e) => setTempPageName(e.target.value)}
                      className="border-[#dbe0e5] w-full sm:w-auto text-lg sm:text-xl py-3"
                      autoFocus
                    />
                    <Button size="lg" onClick={handleSavePageName} className="bg-green-600 hover:bg-green-700 px-6 py-3">
                      <Check className="w-6 h-6" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 justify-center w-full">
                    <span className="font-bold text-[#121417] text-lg sm:text-xl">{currentPage.name}</span>
                    {!isEditingPageName && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-[#dbe0e5] text-[#61758a] hover:bg-[#f0f2f5] bg-transparent w-fit flex items-center gap-2 px-6 py-3"
                        onClick={handleEditPageName}
                      >
                        <Edit2 className="w-5 h-5 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full flex flex-col items-center mb-8">
              <label className="block text-lg font-semibold mb-2 text-[#121417]">Banner Image</label>
              {currentPage.bannerImage?.url && (
                <img
                  src={currentPage.bannerImage.url}
                  alt={currentPage.bannerImage.alt}
                  className="w-full max-w-5xl max-h-[400px] object-cover mb-4 rounded-lg shadow"
                  style={{ borderRadius: "16px" }}
                />
              )}
              <label className="inline-flex items-center px-6 py-3 bg-[#0d80f2] text-white rounded-lg cursor-pointer hover:bg-[#0b6fc2] transition mb-2">
                <Upload className="w-5 h-5 mr-2" />
                Upload Banner Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = URL.createObjectURL(file)
                      const updatedPage = {
                        ...currentPage,
                        bannerImage: { url, alt: "Banner" }
                      }
                      setPages((prev) => prev.map((p) => (p.id === currentPage.id ? updatedPage : p)))
                      setCurrentPage(updatedPage)
                    }
                  }}
                />
              </label>
            </div>

            <div className="flex flex-col items-center mb-12 w-full">
              {isEditingTitle ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full justify-center">
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="text-3xl sm:text-4xl font-bold border-[#dbe0e5] w-full sm:max-w-lg text-center py-4"
                    autoFocus
                  />
                  <Button size="lg" onClick={handleSaveTitle} className="bg-green-600 hover:bg-green-700 w-fit px-6 py-3">
                    <Check className="w-6 h-6" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <h1 className="text-3xl sm:text-4xl font-bold text-[#121417] text-center w-full mb-2">{currentPage.title}</h1>
                  <Button
                    variant="outline"
                    className="border-[#dbe0e5] text-[#61758a] hover:bg-[#f0f2f5] bg-transparent w-fit mt-2 px-6 py-3"
                    onClick={handleEditHeading}
                  >
                    <Edit2 className="w-5 h-5 mr-2" />
                    Edit Heading
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-[#ffffff] rounded-lg p-8 sm:p-12 mb-12 border border-[#dbe0e5] flex flex-col items-center">
              <div className="flex flex-col lg:flex-row lg:justify-center lg:items-center gap-8 lg:gap-16 w-full">
                <div className="flex-1 flex flex-col items-center">
                  <p className="text-[#61758a] text-lg sm:text-xl mb-4 text-center">Featured</p>
                  {isEditingFeaturedTitle ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 w-full justify-center">
                      <Input
                        value={tempFeaturedTitle}
                        onChange={(e) => setTempFeaturedTitle(e.target.value)}
                        className="text-xl sm:text-2xl font-semibold border-[#dbe0e5] w-full text-center py-3"
                        autoFocus
                      />
                      <Button
                        size="lg"
                        onClick={handleSaveFeaturedTitle}
                        className="bg-green-600 hover:bg-green-700 w-fit px-6 py-3"
                      >
                        <Check className="w-6 h-6" />
                      </Button>
                    </div>
                  ) : (
                    <h2
                      className="text-xl sm:text-2xl font-semibold text-[#121417] mb-4 cursor-pointer hover:bg-[#f0f2f5] p-2 rounded text-center w-full"
                      onClick={handleEditFeaturedTitle}
                    >
                      {currentPage.featuredSection.title}
                    </h2>
                  )}

                  {isEditingFeaturedDesc ? (
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6 w-full justify-center">
                      <Textarea
                        value={tempFeaturedDesc}
                        onChange={(e) => setTempFeaturedDesc(e.target.value)}
                        className="border-[#dbe0e5] resize-none w-full text-center text-lg py-3"
                        rows={4}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="lg" onClick={handleSaveFeaturedDesc} className="bg-green-600 hover:bg-green-700 px-6 py-3">
                          <Check className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    currentPage.featuredSection.description && (
                      <p
                        className="text-[#61758a] mb-6 cursor-pointer hover:bg-[#f0f2f5] p-2 rounded text-center w-full text-lg"
                        onClick={handleEditFeaturedDescription}
                      >
                        {currentPage.featuredSection.description}
                      </p>
                    )
                  )}
                </div>
                <div className="flex flex-col items-center w-full lg:w-auto">
                  <div className="flex flex-wrap gap-4 justify-center mb-4 w-full">
                    {Array.isArray(currentPage.featuredSection.images) &&
                      currentPage.featuredSection.images.map((img, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={img.url}
                            alt={img.alt}
                            className="rounded-lg w-full max-w-[200px] h-[120px] object-cover"
                          />
                          <Button
                            size="sm"
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleDeleteFeaturedImage(idx)}
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-[#dbe0e5] text-[#61758a] bg-transparent text-base"
                      onClick={handleEditFeaturedImage}
                    >
                      Replace Image
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-[#dbe0e5] text-[#61758a] bg-transparent text-base"
                      onClick={handleAddFeaturedImage}
                    >
                      Add New Image
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center mt-6">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#dbe0e5] text-[#61758a] bg-transparent text-base"
                  onClick={handleEditFeaturedDescription}
                >
                  Edit Description
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#dbe0e5] text-[#61758a] bg-transparent text-base"
                  onClick={handleDeleteFeaturedDescription}
                >
                  Delete Description
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#dbe0e5] text-[#61758a] bg-transparent text-base"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this section?")) {
                      // handleDeleteSection("featured")
                    }
                  }}
                >
                  Delete Section
                </Button>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold text-[#121417] mb-8 text-center">Additional Content</h2>

            {currentPage.contentSections.map((section) => (
              <div key={section.id} className="bg-[#ffffff] rounded-lg p-8 sm:p-12 mb-10 border border-[#dbe0e5] flex flex-col items-center">
                <div className="flex flex-col lg:flex-row lg:justify-center lg:items-center gap-8 lg:gap-16 w-full">
                  <div className="flex-1 flex flex-col items-center">
                    {editingSectionTitle === section.id ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 w-full justify-center">
                        <Input
                          value={tempSectionTitle}
                          onChange={(e) => setTempSectionTitle(e.target.value)}
                          className="text-xl font-semibold border-[#dbe0e5] w-full text-center py-3"
                          autoFocus
                        />
                        <Button
                          size="lg"
                          onClick={() => handleSaveSectionTitle(section.id)}
                          className="bg-green-600 hover:bg-green-700 w-fit px-6 py-3"
                        >
                          <Check className="w-6 h-6" />
                        </Button>
                      </div>
                    ) : (
                      <h3
                        className="text-xl font-semibold text-[#121417] mb-4 cursor-pointer hover:bg-[#f0f2f5] p-2 rounded text-center w-full"
                        onClick={() => handleEditSectionTitle(section.id)}
                      >
                        {section.title}
                      </h3>
                    )}

                    {editingSectionDesc === section.id ? (
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4 w-full justify-center">
                        <Textarea
                          value={tempSectionDesc}
                          onChange={(e) => setTempSectionDesc(e.target.value)}
                          className="border-[#dbe0e5] resize-none w-full text-center text-lg py-3"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            size="lg"
                            onClick={() => handleSaveSectionDesc(section.id)}
                            className="bg-green-600 hover:bg-green-700 px-6 py-3"
                          >
                            <Check className="w-6 h-6" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      section.description && (
                        <p
                          className="text-[#61758a] cursor-pointer hover:bg-[#f0f2f5] p-2 rounded text-center w-full text-lg mb-4"
                          onClick={() => handleEditSectionDescription(section.id)}
                        >
                          {section.description}
                        </p>
                      )
                    )}
                  </div>
                  <div className="flex flex-col items-center w-full lg:w-auto">
                    <div className="flex flex-wrap gap-4 justify-center mb-4 w-full">
                      {Array.isArray(section.images) && section.images.map((img, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={img.url}
                            alt={img.alt}
                            className="rounded-lg w-full max-w-[200px] h-[120px] object-cover"
                          />
                          <Button
                            size="sm"
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleDeleteSectionImage(section.id, idx)}
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-[#dbe0e5] text-[#61758a] bg-transparent text-base"
                        onClick={() => handleEditSectionImage(section.id)}
                      >
                        Replace Image
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-[#dbe0e5] text-[#61758a] bg-transparent text-base"
                        onClick={() => handleAddSectionImage(section.id)}
                      >
                        Add New Image
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center mt-6">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-[#dbe0e5] text-[#61758a] bg-transparent text-base"
                    onClick={() => handleEditSectionDescription(section.id)}
                  >
                    Edit Description
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-[#dbe0e5] text-[#61758a] bg-transparent text-base"
                    onClick={() => handleDeleteSectionDescription(section.id)}
                  >
                    Delete Description
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-[#dbe0e5] text-[#61758a] bg-transparent text-base"
                    onClick={() => handleDeleteSection(section.id)}
                  >
                    Delete Section
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mt-12">
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#dbe0e5] text-[#61758a] bg-transparent text-base"
                  onClick={handleAddSection}
                >
                  Add Section
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#dbe0e5] text-[#61758a] bg-transparent text-base"
                  onClick={handleDeletePage}
                >
                  Delete Page
                </Button>
              </div>

              <Button
                size="lg"
                className="bg-[#0d80f2] hover:bg-[#0d80f2]/90 text-white px-10 py-4 w-full sm:w-auto text-lg"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </div>
        </main>
      </div>

      {showNewPageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-10 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#121417]">Create New Page</h3>
              <Button variant="outline" size="lg" onClick={() => setShowNewPageModal(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-[#121417] mb-3">Page Name</label>
                <Input
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="Enter page name"
                  className="border-[#dbe0e5] text-lg py-3"
                  autoFocus
                />
              </div>
              <div className="flex gap-4 justify-end">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowNewPageModal(false)}
                  className="border-[#dbe0e5] text-[#61758a] text-lg px-6 py-3"
                >
                  Cancel
                </Button>
                <Button
                  size="lg"
                  onClick={handleAddNewPage}
                  className="bg-[#0d80f2] hover:bg-[#0d80f2]/90 text-white rounded-lg cursor-pointer text-lg px-6 py-3"
                  disabled={!newPageName.trim()}
                >
                  Create Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImageUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#121417]">
                {uploadingFor?.type === "add" ? "Add Image" : "Upload Image"}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowImageUpload(false)
                  setUploadingFor(null)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="border-2 border-dashed border-[#dbe0e5] rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-[#61758a] mx-auto mb-4" />
              <p className="text-[#61758a] mb-4">Choose an image file to upload</p>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 bg-[#0d80f2] text-white rounded-lg cursor-pointer hover:bg-[#0d80f2]/90"
              >
                Select Image
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}