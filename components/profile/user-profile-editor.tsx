"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateUserProfile } from "@/lib/actions/users";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Upload, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
});

interface UserProfileEditorProps {
  user: any;
}

export function UserProfileEditor({ user }: UserProfileEditorProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(user.profile_photo_url);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user.full_name || "",
    },
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      // Delete old photo if exists
      if (user.profile_photo_url && user.profile_photo_url.includes("profile-photos/")) {
        try {
          const oldPath = user.profile_photo_url.split("profile-photos/")[1];
          if (oldPath) {
            await supabase.storage.from("avatars").remove([`profile-photos/${oldPath}`]);
          }
        } catch (deleteError) {
          console.log("Could not delete old photo:", deleteError);
          // Continue anyway
        }
      }

      // Upload new photo with upsert to allow overwriting
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // Check if bucket exists
        if (uploadError.message?.includes("Bucket not found") || uploadError.message?.includes("The resource already exists")) {
          // Try to update if file exists
          const { error: updateError } = await supabase.storage
            .from("avatars")
            .update(filePath, file, {
              cacheControl: "3600",
            });
          
          if (updateError) {
            throw new Error("Storage bucket 'avatars' may not exist. Please create it in Supabase Storage.");
          }
        } else {
          throw uploadError;
        }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update user profile
      setPhotoUrl(publicUrl);
      await updateUserProfile({ profile_photo_url: publicUrl });
      
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
      
      // Reset file input
      e.target.value = "";
      
      router.refresh();
    } catch (error: any) {
      console.error("Photo upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload photo. Please ensure the 'avatars' storage bucket exists in Supabase.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setLoading(true);
    try {
      await updateUserProfile({
        full_name: data.full_name,
        profile_photo_url: photoUrl,
      });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={user.full_name}
                  width={96}
                  height={96}
                  className="rounded-full object-cover"
                  style={{ width: '96px', height: '96px' }}
                  unoptimized={photoUrl.includes('supabase.co')}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
              )}
            </div>
            <div>
              <Input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploading}
              />
              <Button 
                type="button" 
                variant="outline" 
                disabled={uploading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const input = document.getElementById("photo-upload") as HTMLInputElement;
                  if (input && !uploading) {
                    input.click();
                  }
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : "Upload Photo"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG or GIF. Max size 5MB
              </p>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder="Enter your full name"
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          {/* Read-only fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={user.username} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={user.role?.replace("_", " ")} disabled className="capitalize" />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

