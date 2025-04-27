"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useStore, type Comment } from "@/lib/store"
import { useLanguage } from "@/components/language-provider"
import UserAvatar from "@/components/user-avatar"
import LoginModal from "@/components/login-modal"

interface MangaCommentsProps {
  mangaId: string
}

export default function MangaComments({ mangaId }: MangaCommentsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const { user, comments, addComment, removeComment } = useStore()
  const [newComment, setNewComment] = useState("")
  const [showLoginModal, setShowLoginModal] = useState(false)

  const mangaComments = comments
    .filter((comment) => comment.mangaId === mangaId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleSubmitComment = () => {
    if (!user) {
      setShowLoginModal(true)
      return
    }

    if (!newComment.trim()) return

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      mangaId,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    }

    addComment(comment)
    setNewComment("")

    toast({
      title: "Comment added",
      description: "Your comment has been added successfully",
    })
  }

  const handleDeleteComment = (commentId: string) => {
    removeComment(commentId)

    toast({
      title: "Comment deleted",
      description: "Your comment has been deleted",
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-4 min-h-[100px] resize-none"
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmitComment}>{t("common.submit")}</Button>
        </div>
      </div>

      {mangaComments.length === 0 ? (
        <div className="rounded-lg border p-6 text-center">
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mangaComments.map((comment) => (
            <div key={comment.id} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {comment.userId === user?.id ? (
                    <UserAvatar user={user} />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/20 text-center leading-8">
                      {comment.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{comment.username}</div>
                    <div className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                {user && comment.userId === user.id && (
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(comment.id)}>
                    {t("common.delete")}
                  </Button>
                )}
              </div>

              <p className="whitespace-pre-line">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        message="You need to be logged in to comment."
      />
    </div>
  )
}
