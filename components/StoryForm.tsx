"use client"

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Send } from "lucide-react";
import { getPlayers, type Player, addStory, addStoryBySlug, uploadFanImage } from "@/lib/api";

const countries = [
  'India', 'United States', 'United Kingdom', 'Australia', 'Canada',
  'UAE', 'Singapore', 'New Zealand', 'South Africa', 'Other'
]

const emotions = ["inspired", "emotional", "proud", "nostalgic", "motivated"] as const

interface StoryFormProps {
  playerId?: string;
  playerName?: string;
  playerSlug?: string;
  onSuccess?: () => void;
}

export default function StoryForm({ playerId, playerName, playerSlug, onSuccess }: StoryFormProps) {
  const [name, setName] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState(playerId || "");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(!playerId);

  // Load players only if no specific player is provided
  useEffect(() => {
    if (playerId) {
      setIsLoadingPlayers(false);
      return;
    }

    const loadPlayers = async () => {
      try {
        const data = await getPlayers();
        setPlayers(data);
      } catch (err) {
        console.error("Failed to load players", err);
      } finally {
        setIsLoadingPlayers(false);
      }
    };

    loadPlayers();
  }, [playerId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !country || !message) return;
    if (!playerId && !selectedPlayerId) return;

    try {
      setLoading(true);
      let imageUrl = "";

      if (image) {
        setIsUploadingImage(true);
        imageUrl = await uploadFanImage(image);
        setIsUploadingImage(false);
      }

      const finalPlayerId = playerId || selectedPlayerId;
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]

      if (playerSlug && !playerId) {
        // Using slug-based submission (player may not have UUID yet)
        await addStoryBySlug(playerSlug, message, name, country, imageUrl, randomEmotion);
      } else {
        // Using UUID-based submission
        await addStory({
          player_id: finalPlayerId,
          fan_name: name,
          country,
          content: message,
          fan_image_url: imageUrl,
          emotion: randomEmotion,
        });
      }

      // Reset form
      setName("");
      setSelectedPlayerId(playerId || "");
      setCountry("");
      setMessage("");
      setImage(null);
      setImagePreview(null);

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Story submission failed", err);
      alert(err instanceof Error ? err.message : "Story submission failed");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading ||
    isUploadingImage ||
    isLoadingPlayers ||
    !name ||
    !country ||
    !message ||
    (!playerId && !selectedPlayerId);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-card border border-border/50 rounded-xl p-6 sm:p-8">
        <FieldGroup className="space-y-6">
          {/* Player Selection - Only show if no specific player */}
          {!playerId && (
            <Field>
              <FieldLabel>Select Player</FieldLabel>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Choose a player or team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team-india">Team India 🇮🇳</SelectItem>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          {/* Player Display - Only show if specific player provided */}
          {playerId && playerName && (
            <Field>
              <FieldLabel>Player</FieldLabel>
              <Input
                value={playerName}
                readOnly
                className="bg-muted cursor-not-allowed font-medium"
              />
            </Field>
          )}

          {/* Your Name */}
          <Field>
            <FieldLabel htmlFor="name">Your Name</FieldLabel>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border"
              required
            />
          </Field>

          {/* Country */}
          <Field>
            <FieldLabel>Country</FieldLabel>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Message */}
          <Field>
            <FieldLabel htmlFor="message">Your Message</FieldLabel>
            <Textarea
              id="message"
              placeholder="Write something real... Share your story or memory."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-input border-border min-h-[180px] resize-none"
              required
            />
          </Field>

          {/* Photo Upload - Optional but encouraged */}
          <Field>
            <FieldLabel htmlFor="image">Add Your Photo (optional)</FieldLabel>
            <label className="border border-dashed border-white/30 p-6 block text-center rounded-xl cursor-pointer hover:border-cyan-400 transition-colors bg-white/5">
              📸 Upload your photo ✨
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={isUploadingImage}
                className="hidden"
              />
            </label>
            {image && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={imagePreview || ""}
                  alt="Preview"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="text-xs text-gray-400">
                  <p>✓ Photo selected: {image.name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="text-red-400 hover:text-red-300 mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Stories with photos feel more real ❤️
            </p>
          </Field>
        </FieldGroup>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        disabled={isDisabled}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 disabled:opacity-50"
      >
        <Send className="w-5 h-5" />
        {isUploadingImage
          ? "Uploading photo..."
          : loading
            ? "Sharing..."
            : "Share Your Story ❤️"}
      </Button>
    </form>
  );
}
