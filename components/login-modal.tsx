"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/lib/store"

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message?: string
}

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

export default function LoginModal({ open, onOpenChange, message }: LoginModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)

    try {
      // For demo purposes, check if this is the admin account
      if (values.username === "admin" && values.password === "admin") {
        useStore.getState().login({
          id: "admin-id",
          email: "admin@example.com",
          username: "admin",
          name: "Admin User",
          showAdultContent: true,
          isAdmin: true,
        })

        toast({
          title: "Login successful",
          description: "Welcome back, Admin!",
        })

        onOpenChange(false)
        return
      }

      // For demo purposes, simulate a successful login for any credentials
      useStore.getState().login({
        id: `user-${Date.now()}`,
        email: `${values.username}@example.com`,
        username: values.username,
        name: values.username,
        showAdultContent: false,
        isAdmin: false,
      })

      toast({
        title: "Login successful",
        description: `Welcome back, ${values.username}!`,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = () => {
    onOpenChange(false)
    router.push("/register")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login Required</DialogTitle>
          <DialogDescription>{message || "Please login to continue."}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={handleRegister}>
                Register
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
