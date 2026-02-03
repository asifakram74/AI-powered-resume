import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Platform } from "../../lib/profile-card/platform-data"

interface AddLinkDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedPlatform: Platform | null
    onConfirm: (url: string, title?: string) => void
}

export function AddLinkDialog({ open, onOpenChange, selectedPlatform, onConfirm }: AddLinkDialogProps) {
    const [inputValue, setInputValue] = useState("")
    const [customTitle, setCustomTitle] = useState("")

    useEffect(() => {
        if (open) {
            setInputValue("")
            setCustomTitle(selectedPlatform?.name || "")
        }
    }, [open, selectedPlatform])

    const handleConfirm = () => {
        if (!selectedPlatform) return

        let finalUrl = inputValue
        // If the platform has a prefix and the user didn't type a full URL, prepend it
        if (selectedPlatform.prefix && !inputValue.startsWith('http')) {
            // Remove @ if present for cleaner concatenation
            const cleanInput = inputValue.replace(/^@/, '')
            finalUrl = `${selectedPlatform.prefix}${cleanInput}`
        } else if (!inputValue.startsWith('http') && selectedPlatform.id !== 'email') {
            // Fallback for custom links or others without prefix
            finalUrl = `https://${inputValue}`
        }

        onConfirm(finalUrl, selectedPlatform.id === 'custom' ? customTitle : selectedPlatform.name)
        onOpenChange(false)
    }

    if (!selectedPlatform) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex flex-col items-center gap-4 mb-2">
                        <div className={`
                            h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-md
                            ${selectedPlatform.color.startsWith('bg-') ? selectedPlatform.color : 'bg-gray-500'}
                        `}>
                            <selectedPlatform.icon className="h-8 w-8" />
                        </div>
                        <DialogTitle className="text-center">
                            Add {selectedPlatform.name}
                        </DialogTitle>
                    </div>
                </DialogHeader>
                
                <div className="space-y-4 py-2">
                    <p className="text-sm text-center text-gray-500">
                        Paste the {selectedPlatform.placeholder} you want visitors to reach.
                    </p>
                    
                    {selectedPlatform.id === 'custom' && (
                         <div className="space-y-2">
                            <Label>Link Title</Label>
                            <Input
                                value={customTitle}
                                onChange={(e) => setCustomTitle(e.target.value)}
                                placeholder="My Portfolio"
                            />
                         </div>
                    )}

                    <div className="space-y-2">
                        <Label>
                            {selectedPlatform.id === 'email' ? 'Email Address' : 
                             selectedPlatform.id === 'custom' ? 'URL' : 
                             `${selectedPlatform.name} ${selectedPlatform.placeholder}`}
                        </Label>
                        <div className="relative">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={selectedPlatform.placeholder}
                        />
                    </div>
                        {selectedPlatform.prefix && (
                            <p className="text-xs text-gray-400">
                                Prefix: {selectedPlatform.prefix}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="sm:justify-between gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!inputValue}
                    >
                        Add Link
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
