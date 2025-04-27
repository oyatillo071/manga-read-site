"use client"

import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useStore } from "@/lib/store"

interface AdultContentWarningProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AdultContentWarning({ open, onOpenChange }: AdultContentWarningProps) {
  const router = useRouter()
  const { user, updateUser } = useStore()

  const handleEnableAdultContent = () => {
    if (user) {
      updateUser({ showAdultContent: true })
    }
    onOpenChange(false)
  }

  const handleGoToSettings = () => {
    router.push("/settings")
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Adult Content Warning</AlertDialogTitle>
          <AlertDialogDescription>
            This manga contains adult content that may not be suitable for all audiences. You must be 18 years or older
            to view this content.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleEnableAdultContent}>Enable Adult Content</AlertDialogAction>
          <AlertDialogAction onClick={handleGoToSettings}>Go to Settings</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
