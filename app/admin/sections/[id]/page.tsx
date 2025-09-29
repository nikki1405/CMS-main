
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Content {
  _id: string;
  title: string;
  type: string;
  value: any;
}

const ManageContentPage = () => {
  const params = useParams();
  const sectionId = params.id as string;
  const [content, setContent] = useState<Content[]>([]);
  const [newContentTitle, setNewContentTitle] = useState("");
  const [newContentType, setNewContentType] = useState("text");
  const [newContentValue, setNewContentValue] = useState("");
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [editingContentTitle, setEditingContentTitle] = useState("");
  const [editingContentValue, setEditingContentValue] = useState("");

  useEffect(() => {
    if (sectionId) {
      fetchContent();
    }
  }, [sectionId]);

  const fetchContent = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/contents/section/${sectionId}`);
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
    }
  };

  const handleCreateContent = async () => {
    if (!newContentTitle.trim() || !newContentValue.trim()) {
      console.log("New content title or value is empty.");
      return;
    }
    console.log("Attempting to create content:", { section: sectionId, title: newContentTitle, type: newContentType, value: newContentValue });
    try {
      const res = await fetch("http://localhost:5001/api/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionId, title: newContentTitle, type: newContentType, value: newContentValue }),
      });
      console.log("Create content API response status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("Content created successfully:", data);
        setNewContentTitle("");
        setNewContentType("text");
        setNewContentValue("");
        fetchContent();
      } else {
        const errorData = await res.json();
        console.error("Failed to create content:", res.status, errorData);
      }
    } catch (error) {
      console.error("An error occurred during content creation fetch:", error);
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5001/api/contents/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchContent();
      }
    } catch (error) {
      console.error("Failed to delete content:", error);
    }
  };

  const handleEditContent = (item: Content) => {
    setEditingContentId(item._id);
    setEditingContentTitle(item.title);
    setEditingContentValue(item.value);
  };

  const handleUpdateContent = async (id: string) => {
    if (!editingContentTitle.trim() || !editingContentValue.trim()) return;
    try {
      const res = await fetch(`http://localhost:5001/api/contents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingContentTitle, value: editingContentValue }),
      });
      if (res.ok) {
        setEditingContentId(null);
        setEditingContentTitle("");
        setEditingContentValue("");
        fetchContent();
      }
    } catch (error) {
      console.error("Failed to update content:", error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Manage Content</h1>
      <div className="mb-4">
        <Input
          type="text"
          value={newContentTitle}
          onChange={(e) => setNewContentTitle(e.target.value)}
          placeholder="Content Title"
          className="mr-2 mb-2"
        />
        <select value={newContentType} onChange={(e) => setNewContentType(e.target.value)} className="mr-2">
          <option value="text">Text</option>
          <option value="image">Image</option>
        </select>
        <Textarea
          value={newContentValue}
          onChange={(e) => setNewContentValue(e.target.value)}
          placeholder="Content value"
          className="mr-2"
        />
        <Button onClick={handleCreateContent}>Add Content</Button>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Content</h2>
        <ul>
          {content.map((item) => (
            <li key={item._id} className="mb-2 flex items-center">
              {editingContentId === item._id ? (
                <div className="flex flex-col w-full">
                  <Input
                    type="text"
                    value={editingContentTitle}
                    onChange={(e) => setEditingContentTitle(e.target.value)}
                    className="mb-2"
                  />
                  <Textarea
                    value={editingContentValue}
                    onChange={(e) => setEditingContentValue(e.target.value)}
                    className="mr-2"
                  />
                </div>
              ) : (
                <span><strong>{item.title}</strong> ({item.type}): {item.value}</span>
              )}
              <div className="ml-auto">
                {editingContentId === item._id ? (
                  <Button onClick={() => handleUpdateContent(item._id)} size="sm">Save</Button>
                ) : (
                  <Button onClick={() => handleEditContent(item)} size="sm" className="mr-2">Edit</Button>
                )}
                <Button onClick={() => handleDeleteContent(item._id)} size="sm" variant="destructive">Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManageContentPage;
