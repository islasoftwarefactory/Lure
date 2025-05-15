"use client"

import { useState } from "react"
import BackgroundImage, { type ImagePosition, type ImageScaling } from "./ui/background-image"
// Importe os componentes da pasta ui em vez do Radix diretamente
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export default function BackgroundDemo() {
  // Desktop configuration
  const [desktopPosition, setDesktopPosition] = useState<ImagePosition>("center")
  const [desktopScaling, setDesktopScaling] = useState<ImageScaling>("cover")
  const [desktopOverlay, setDesktopOverlay] = useState("")
  const [desktopBlur, setDesktopBlur] = useState(false)

  // Mobile configuration
  const [mobilePosition, setMobilePosition] = useState<ImagePosition>("75% center")
  const [mobileScaling, setMobileScaling] = useState<ImageScaling>("cover")
  const [mobileOverlay, setMobileOverlay] = useState("rgba(0,0,0,0.2)")
  const [mobileBlur, setMobileBlur] = useState(false)

  // Sync options
  const [syncWithDesktop, setSyncWithDesktop] = useState(false)

  // Apply mobile settings from desktop
  const syncMobileToDesktop = () => {
    setMobilePosition(desktopPosition)
    setMobileScaling(desktopScaling)
    setMobileOverlay(desktopOverlay)
    setMobileBlur(desktopBlur)
  }

  return (
    <div className="min-h-screen">
      <BackgroundImage
        desktop={{
          src: "/images/background.jpg",
          alt: "Shipping scene with delivery truck and boxes",
          position: desktopPosition,
          scaling: desktopScaling,
          overlay: desktopOverlay || undefined,
          blur: desktopBlur,
        }}
        mobile={
          syncWithDesktop
            ? undefined
            : {
                src: "/images/background.jpg",
                alt: "Shipping scene with delivery truck and boxes",
                position: mobilePosition,
                scaling: mobileScaling,
                overlay: mobileOverlay || undefined,
                blur: mobileBlur,
              }
        }
      />

      <div className="container mx-auto p-4 relative z-10">
        <div className="bg-white/90 p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-8">
          <h1 className="text-2xl font-bold mb-6">Background Image Configuration</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Desktop Configuration */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Desktop View</h2>

              <div>
                <Label htmlFor="desktop-position">Position</Label>
                <Select value={desktopPosition} onValueChange={(value) => setDesktopPosition(value as ImagePosition)}>
                  <SelectTrigger id="desktop-position">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="25% 75%">Custom (25% 75%)</SelectItem>
                    <SelectItem value="75% 25%">Custom (75% 25%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="desktop-scaling">Scaling</Label>
                <Select value={desktopScaling} onValueChange={(value) => setDesktopScaling(value as ImageScaling)}>
                  <SelectTrigger id="desktop-scaling">
                    <SelectValue placeholder="Select scaling" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="fill">Fill</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="desktop-overlay">Overlay Color</Label>
                <Input
                  id="desktop-overlay"
                  type="text"
                  placeholder="e.g., rgba(0,0,0,0.5)"
                  value={desktopOverlay}
                  onChange={(e) => setDesktopOverlay(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="desktop-blur" checked={desktopBlur} onCheckedChange={setDesktopBlur} />
                <Label htmlFor="desktop-blur">Apply Blur</Label>
              </div>
            </div>

            {/* Mobile Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Mobile View</h2>
                <div className="flex items-center space-x-2">
                  <Switch id="sync-with-desktop" checked={syncWithDesktop} onCheckedChange={setSyncWithDesktop} />
                  <Label htmlFor="sync-with-desktop">Use Desktop Settings</Label>
                </div>
              </div>

              {!syncWithDesktop && (
                <>
                  <div>
                    <Label htmlFor="mobile-position">Position</Label>
                    <Select value={mobilePosition} onValueChange={(value) => setMobilePosition(value as ImagePosition)}>
                      <SelectTrigger id="mobile-position">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="25% 75%">Custom (25% 75%)</SelectItem>
                        <SelectItem value="75% 25%">Custom (75% 25%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="mobile-scaling">Scaling</Label>
                    <Select value={mobileScaling} onValueChange={(value) => setMobileScaling(value as ImageScaling)}>
                      <SelectTrigger id="mobile-scaling">
                        <SelectValue placeholder="Select scaling" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Cover</SelectItem>
                        <SelectItem value="contain">Contain</SelectItem>
                        <SelectItem value="fill">Fill</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="mobile-overlay">Overlay Color</Label>
                    <Input
                      id="mobile-overlay"
                      type="text"
                      placeholder="e.g., rgba(0,0,0,0.5)"
                      value={mobileOverlay}
                      onChange={(e) => setMobileOverlay(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="mobile-blur" checked={mobileBlur} onCheckedChange={setMobileBlur} />
                    <Label htmlFor="mobile-blur">Apply Blur</Label>
                  </div>

                  <Button onClick={syncMobileToDesktop}>Copy Desktop Settings to Mobile</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
