import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/lib/store"

interface UserAvatarProps {
  user: User
  className?: string
}

export default function UserAvatar({ user, className }: UserAvatarProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : user.username.substring(0, 2).toUpperCase()

  return (
    <Avatar className={className}>
      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || user.username} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}
