'use client'

import { useState } from 'react'
import { X, Plus, ImageIcon, User, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface AddPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (player: { name: string; imageUrl: string; description: string }) => void
}

export function AddPlayerModal({ isOpen, onClose, onAdd }: AddPlayerModalProps) {
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && imageUrl && description) {
      onAdd({ name, imageUrl, description })
      setName('')
      setImageUrl('')
      setDescription('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Add Player</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col gap-5">
            {/* Player Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Player Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Smriti Mandhana"
                className="bg-secondary border-border"
                required
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                Image URL
              </label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/player.jpg"
                className="bg-secondary border-border"
                required
              />
              {imageUrl && (
                <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden bg-secondary">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Short Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of the player..."
                className="bg-secondary border-border resize-none h-24"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className={cn(
                "bg-primary hover:bg-primary/90 text-primary-foreground gap-2",
                (!name || !imageUrl || !description) && "opacity-50 cursor-not-allowed"
              )}
              disabled={!name || !imageUrl || !description}
            >
              <Plus className="w-4 h-4" />
              Add Player
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
