import { getMangaTags } from "@/lib/api"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Browse by Genre | MangaVerse",
  description: "Browse manga by genre on MangaVerse",
}

export default async function GenresPage() {
  const tags = await getMangaTags()

  // Group tags by category
  const groupedTags = tags.reduce((acc: any, tag: any) => {
    const group = tag.attributes.group
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(tag)
    return acc
  }, {})

  // Define the order of groups
  const groupOrder = ["genre", "theme", "format", "content"]

  // Get group names for display
  const groupNames: Record<string, string> = {
    genre: "Genres",
    theme: "Themes",
    format: "Formats",
    content: "Content",
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Browse by Genre</h1>

      <div className="space-y-8">
        {groupOrder.map(
          (group) =>
            groupedTags[group] && (
              <Card key={group}>
                <CardHeader>
                  <CardTitle>{groupNames[group] || group}</CardTitle>
                  <CardDescription>Browse manga by {groupNames[group]?.toLowerCase() || group}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {groupedTags[group].map((tag: any) => (
                      <Link key={tag.id} href={`/genres/${tag.id}`}>
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        >
                          {tag.attributes.name.en}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ),
        )}
      </div>
    </div>
  )
}
