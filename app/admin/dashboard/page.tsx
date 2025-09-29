"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useRouter } from "next/navigation";

interface ContentItem {
  _id: string;
  title: string;
  type: string;
  value: any;
}

interface Section {
  _id: string;
  title: string;
  content: ContentItem[];
}

const AdminDashboard = () => {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const sectionsRes = await fetch("http://localhost:5001/api/sections");
      if (sectionsRes.ok) {
        const sectionsData: Section[] = await sectionsRes.json();

        const sectionsWithContent = await Promise.all(
          sectionsData.map(async (section) => {
            try {
              const contentRes = await fetch(`http://localhost:5001/api/contents/section/${section._id}`);
              if (contentRes.ok) {
                const contentData = await contentRes.json();
                return { ...section, content: contentData };
              } else {
                console.error(`Failed to fetch content for section ${section._id}:`, contentRes.status);
                return { ...section, content: [] };
              }
            } catch (error) {
              console.error(`An error occurred while fetching content for section ${section._id}:`, error);
              return { ...section, content: [] };
            }
          })
        );
        setSections(sectionsWithContent);
      }
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) return;
    try {
      const res = await fetch("http://localhost:5001/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSectionTitle }),
      });
      if (res.ok) {
        setNewSectionTitle("");
        fetchSections();
      }
    } catch (error) {
      console.error("Failed to create section:", error);
    }
  };

  const handleDeleteSection = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5001/api/sections/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchSections();
      }
    } catch (error) {
      console.error("Failed to delete section:", error);
    }
  };

  const handleEditSection = (section: Section) => {
    setEditingSectionId(section._id);
    setEditingSectionTitle(section.title);
  };

  const handleUpdateSection = async (id: string) => {
    if (!editingSectionTitle.trim()) return;
    try {
      const res = await fetch(`http://localhost:5001/api/sections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingSectionTitle }),
      });
      if (res.ok) {
        setEditingSectionId(null);
        setEditingSectionTitle("");
        fetchSections();
      }
    } catch (error) {
      console.error("Failed to update section:", error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleLogout} variant="destructive">Logout</Button>
      </div>
      <div className="mb-4">
        <Input
          type="text"
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          placeholder="New section title"
          className="mr-2"
        />
        <Button onClick={handleCreateSection}>Create Section</Button>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <div key={section._id} className="bg-white p-4 rounded-lg shadow-md flex flex-col">
              {editingSectionId === section._id ? (
                <div className="flex items-center mb-2">
                  <Input
                    type="text"
                    value={editingSectionTitle}
                    onChange={(e) => setEditingSectionTitle(e.target.value)}
                    className="mr-2 flex-grow"
                  />
                  <Button onClick={() => handleUpdateSection(section._id)} size="sm">Save</Button>
                </div>
              ) : (
                <h3 className="text-lg font-bold mb-2">{section.title}</h3>
              )}

              <div className="text-sm text-gray-600 mb-4 flex-grow">
                {section.content.length > 0 ? (
                  <ul>
                    {section.content.slice(0, 3).map((item) => (
                      <li key={item._id} className="truncate">{item.title}: {item.value}</li>
                    ))}
                    {section.content.length > 3 && <li>...</li>}
                  </ul>
                ) : (
                  <p>No content yet.</p>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-auto">
                {editingSectionId !== section._id && (
                  <Button onClick={() => handleEditSection(section)} size="sm">Edit</Button>
                )}
                <Button onClick={() => router.push(`/admin/sections/${section._id}`)} size="sm">Manage Content</Button>
                <Button onClick={() => handleDeleteSection(section._id)} size="sm" variant="destructive">Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;