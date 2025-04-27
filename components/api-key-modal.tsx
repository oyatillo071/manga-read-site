"use client"

// Create a new component to handle API key input

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/lib/store"
import { checkApiKey } from "@/lib/api"

interface ApiKeyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ApiKeyModal({ open, onOpenChange }: ApiKeyModalProps) {
  const { toast } = useToast()
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const isValid = await checkApiKey(apiKey)

      if (isValid) {
        useStore.getState().setApiKey(apiKey)

        toast({
          title: "Success",
          description: "API key has been saved",
        })

        onOpenChange(false)
      } else {
        toast({
          title: "Invalid API Key",
          description: "The API key you entered is invalid",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("API key validation error:", error)
      toast({
        title: "Error",
        description: "Failed to validate API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>MangaDex API Key Required</DialogTitle>
          <DialogDescription>
            Please enter your MangaDex API key to access the full functionality of this app.
            <a
              href="https://api.mangadex.org/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-primary hover:underline"
            >
              Learn how to get an API key
            </a>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input placeholder="Enter your MangaDex API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Validating..." : "Save API Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
