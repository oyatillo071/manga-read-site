"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

interface MangaReaderSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MangaReaderSettings({ open, onOpenChange }: MangaReaderSettingsProps) {
  const { readerSettings, updateReaderSettings } = useStore()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reader Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="infinite-scroll">Infinite Scroll</Label>
              <p className="text-sm text-muted-foreground">
                Automatically load the next chapter when you reach the end
              </p>
            </div>
            <Switch
              id="infinite-scroll"
              checked={readerSettings.infiniteScroll}
              onCheckedChange={(checked) => {
                updateReaderSettings({ infiniteScroll: checked })
              }}
            />
          </div>

          <div className="space-y-3">
            <div>
              <Label>Auto-Scroll Speed</Label>
              <p className="text-sm text-muted-foreground">Control how fast the pages auto-scroll</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">Slow</span>
              <Slider
                value={[readerSettings.autoScrollSpeed]}
                min={1}
                max={10}
                step={1}
                className="flex-1"
                onValueChange={(value) => {
                  updateReaderSettings({ autoScrollSpeed: value[0] })
                }}
              />
              <span className="text-sm">Fast</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label>Image Quality</Label>
              <p className="text-sm text-muted-foreground">Lower quality loads faster but may be less clear</p>
            </div>
            <div className="flex gap-4">
              <Button
                variant={readerSettings.imageQuality === "low" ? "default" : "outline"}
                size="sm"
                onClick={() => updateReaderSettings({ imageQuality: "low" })}
              >
                Low
              </Button>
              <Button
                variant={readerSettings.imageQuality === "medium" ? "default" : "outline"}
                size="sm"
                onClick={() => updateReaderSettings({ imageQuality: "medium" })}
              >
                Medium
              </Button>
              <Button
                variant={readerSettings.imageQuality === "high" ? "default" : "outline"}
                size="sm"
                onClick={() => updateReaderSettings({ imageQuality: "high" })}
              >
                High
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
