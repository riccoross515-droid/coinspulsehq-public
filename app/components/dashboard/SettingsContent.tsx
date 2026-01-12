"use client";

import { useState, useTransition,  useRef } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { User, Loader2, Upload } from "lucide-react";
import { updateProfile, updatePassword } from "@/app/actions/user";
import toast from "react-hot-toast";

import { useUploadThing } from "@/app/utils/uploadthing";
import Image from "next/image";
import { Modal } from "../ui/Modal";

interface SettingsContentProps {
  user: {
    name: string | null;
    email: string;
    image?: string | null;
  };
}

export function SettingsContent({ user }: SettingsContentProps) {
  const [name, setName] = useState(user.name || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {
       // Handled in the submit flow
    },
    onUploadError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
          toast.error("File size must be less than 4MB");
          return;
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
      
      // Cleanup object URL when component unmounts or preview changes
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    startProfileTransition(async () => {
      let imageUrl = user.image; // Default to current image

      // 1. Upload new image if selected
      if (selectedFile) {
        try {
           const uploadRes = await startUpload([selectedFile]);
           if (uploadRes && uploadRes[0]) {
               imageUrl = uploadRes[0].url;
           } else {
               toast.error("Failed to upload image.");
               return; 
           }
        } catch (err) {
            console.error(err);
            toast.error("Error uploading image.");
            return;
        }
      } else if (avatarPreview === null) {
          // Explicitly cleared
          imageUrl = null;
      }

      // 2. Save Profile
      const result = await updateProfile({ 
          name, 
          image: imageUrl || undefined,
          clearImage: imageUrl === null 
      });

      if (result.success) {
        toast.success("Profile updated successfully!");
        setSelectedFile(null); // Reset file selection
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    });
  };

  const handleDeleteAvatar = () => {
     setIsDeleteModalOpen(true);
  };

  const confirmDeleteAvatar = () => {
    // Immediate removal using server action
    startProfileTransition(async () => {
        const result = await updateProfile({ 
            name, // Keep existing name
            clearImage: true 
        });

        if (result.success) {
            setAvatarPreview(null);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            toast.success("Avatar removed successfully");
        } else {
            toast.error(result.error || "Failed to remove avatar");
        }
        setIsDeleteModalOpen(false);
    });
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    startPasswordTransition(async () => {
      const result = await updatePassword({ currentPassword, newPassword });
      if (result.success) {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(result.error || "Failed to update password");
      }
    });
  };

  const isLoading = isProfilePending || isUploading;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-[22.5px] font-semibold text-foreground/90 tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg font-medium">Manage your profile and security preferences.</p>
      </div>

      {/* Profile Section */}
      <Card className="p-8 border-border/40 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground/90 mb-8">Personal Information</h2>
        
        <div className="flex flex-col gap-10">
            {/* Avatar Section - Modern Layout */}
            <div className="flex items-center gap-8">
                <div className="relative shrink-0">
                    <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center border-2 border-border overflow-hidden relative group shadow-sm transition-all hover:border-primary/50">
                        {avatarPreview ? (
                             <Image 
                               src={avatarPreview} 
                               alt="Avatar" 
                               fill 
                               className="object-cover"
                             />
                        ) : (
                             <User className="h-10 w-10 text-muted-foreground/50" />
                        )}
                        {/* Overlay to hint interactivity */}
                        <div 
                           className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                           onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                     <p className="text-sm font-medium text-foreground/70">Profile Picture</p>
                     <div className="flex items-center gap-4">
                         
                         <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileSelect}
                         />

                         <Button 
                            type="button"
                            size="sm" 
                            disabled={isLoading}
                            onClick={() => fileInputRef.current?.click()}
                            className="h-9 px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
                         >
                             {selectedFile ? "Change File" : "Upload New"}
                         </Button>
                         
                         {avatarPreview && (
                             <Button 
                               type="button"
                               variant="outline" 
                               size="sm" 
                               onClick={handleDeleteAvatar}
                               disabled={isLoading}
                               className="h-9 px-4 text-xs font-semibold bg-secondary/50 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
                             >
                                 Delete avatar
                             </Button>
                         )}
                     </div>
                     <p className="text-[11px] text-muted-foreground">
                        {selectedFile ? (
                           <span className="text-green-600 font-medium">Selected: {selectedFile.name} (Click save to apply)</span>
                        ) : (
                           "Recommended: Square image, max 4MB."
                        )}
                     </p>
                </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-border/40 w-full" />

            {/* Form */}
            <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Full Name</label>
                        <input 
                            type="text" 
                            disabled={isLoading}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Email Address</label>
                        <input 
                            type="email" 
                            readOnly
                            value={user.email}
                            className="w-full h-11 rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground cursor-not-allowed shadow-sm transition-opacity"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button disabled={isLoading} className="h-10 px-6 font-semibold shadow-md min-w-[140px]">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
      </Card>

      {/* Security Section */}
      <Card className="p-8 border-border/40 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground/90 mb-6">Update password</h2>

        <form onSubmit={handlePasswordUpdate} className="space-y-5 max-w-lg">
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Current Password</label>
                <input 
                    type="password" 
                    required
                    disabled={isPasswordPending}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
            </div>
            
            <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">New Password</label>
                    <input 
                        type="password" 
                        required
                        disabled={isPasswordPending}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Confirm Password</label>
                    <input 
                        type="password" 
                        required
                        disabled={isPasswordPending}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="pt-2 flex justify-end">
                <Button disabled={isPasswordPending} className="h-10 px-6 font-semibold shadow-md">
                  {isPasswordPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
                </Button>
            </div>
        </form>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Avatar"
      >
        <div className="p-6">
            <p className="text-muted-foreground mb-6">Are you sure you want to remove your profile picture? This change will be applied once you click "Save Changes".</p>
            <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
                    Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteAvatar}>
                    Remove
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
}
