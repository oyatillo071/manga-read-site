"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/lib/store"
import { Loader2, Save, Trash2, Users, BookOpen, Tag } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useStore()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("users")
  const [loading, setLoading] = useState(false)

  // Mock data for admin panel
  const [users, setUsers] = useState([
    { id: "1", username: "user1", email: "user1@example.com", role: "user" },
    { id: "2", username: "user2", email: "user2@example.com", role: "user" },
    { id: "3", username: "admin", email: "admin@example.com", role: "admin" },
  ])

  const [reports, setReports] = useState([
    { id: "1", mangaId: "manga1", userId: "user1", reason: "Inappropriate content", status: "pending" },
    { id: "2", mangaId: "manga2", userId: "user2", reason: "Wrong tags", status: "resolved" },
  ])

  const [settings, setSettings] = useState({
    siteName: "MangaVerse",
    description: "Discover and read the latest manga, manhua, and manhwa online",
    apiKey: "personal-client-07c79c4f-d8da-4d98-8a23-8e5031297b5e-fb70a7d1",
  })

  // Check if user is admin
  useEffect(() => {
    if (!user || !user.isAdmin) {
      toast({
        title: t("common.unauthorized"),
        description: t("common.adminOnly"),
        variant: "destructive",
      })
      router.push("/")
    }
  }, [user, router, toast, t])

  const handleSaveSettings = () => {
    setLoading(true)
    setTimeout(() => {
      toast({
        title: t("common.settingsSaved"),
        description: t("common.settingsUpdated"),
      })
      setLoading(false)
    }, 1000)
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId))
    toast({
      title: t("common.userDeleted"),
      description: t("common.userRemovedSuccess"),
    })
  }

  const handleResolveReport = (reportId: string) => {
    setReports(reports.map((report) => (report.id === reportId ? { ...report, status: "resolved" } : report)))
    toast({
      title: t("common.reportResolved"),
      description: t("common.reportMarkedResolved"),
    })
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{t("common.adminPanel")}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{t("common.users")}</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{t("common.content")}</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>{t("common.settings")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>{t("common.userManagement")}</CardTitle>
              <CardDescription>{t("common.manageUsers")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">ID</th>
                        <th className="p-2 text-left font-medium">{t("common.username")}</th>
                        <th className="p-2 text-left font-medium">{t("common.email")}</th>
                        <th className="p-2 text-left font-medium">{t("common.role")}</th>
                        <th className="p-2 text-left font-medium">{t("common.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="p-2">{user.id}</td>
                          <td className="p-2">{user.username}</td>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">{user.role}</td>
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.role === "admin"}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>{t("common.contentReports")}</CardTitle>
              <CardDescription>{t("common.manageReports")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">ID</th>
                        <th className="p-2 text-left font-medium">{t("common.mangaId")}</th>
                        <th className="p-2 text-left font-medium">{t("common.reportedBy")}</th>
                        <th className="p-2 text-left font-medium">{t("common.reason")}</th>
                        <th className="p-2 text-left font-medium">{t("common.status")}</th>
                        <th className="p-2 text-left font-medium">{t("common.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id} className="border-b">
                          <td className="p-2">{report.id}</td>
                          <td className="p-2">{report.mangaId}</td>
                          <td className="p-2">{report.userId}</td>
                          <td className="p-2">{report.reason}</td>
                          <td className="p-2">
                            <span
                              className={`inline-block rounded-full px-2 py-1 text-xs ${
                                report.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              }`}
                            >
                              {report.status}
                            </span>
                          </td>
                          <td className="p-2">
                            {report.status === "pending" && (
                              <Button variant="ghost" size="sm" onClick={() => handleResolveReport(report.id)}>
                                {t("common.resolve")}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>{t("common.siteSettings")}</CardTitle>
              <CardDescription>{t("common.configureSettings")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">{t("common.siteName")}</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("common.siteDescription")}</Label>
                  <Textarea
                    id="description"
                    value={settings.description}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">{t("common.apiKey")}</Label>
                  <Input
                    id="apiKey"
                    value={settings.apiKey}
                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  />
                </div>

                <Button onClick={handleSaveSettings} disabled={loading} className="flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("common.saving")}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {t("common.saveSettings")}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
