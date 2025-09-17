"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminRegister() {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("http://localhost:5000/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || "Registration failed")
        setIsLoading(false)
        return
      }

      localStorage.setItem("adminToken", data.token)
      alert("Admin registered successfully!")
      setIsLoading(false)
      router.push("/")
    } catch (err) {
      console.error(err)
      alert("Something went wrong")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Register Admin</h2>
          <p className="mt-2 text-sm text-gray-600">Create a new admin account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
