"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/lib/store"
import { useLanguage } from "@/components/language-provider"

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
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

        router.push("/")
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

      router.push("/")
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

  return (
    <div className="container mx-auto flex max-w-md flex-col items-center justify-center py-12">
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">{t("auth.login")}</h1>
          <p className="text-muted-foreground">Enter your credentials to sign in to your account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.username")}</FormLabel>
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
                  <FormLabel>{t("auth.password")}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : t("auth.signIn")}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm">
          <p>
            {t("auth.dontHaveAccount")}{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              {t("auth.signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
