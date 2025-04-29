import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { updateProfile } from "@/utils/api/editProfileApi";
import { BASE_URL } from '../../config';

const EditProfile = () => {
  const { user, setAuth } = useAuthStore();
  const {
    profileUpdate,
    setProfileName,
    setProfilePhoto,
    resetProfileUpdate,
    updateUserProfile,
    fetchLatestProfile,
  } = useProfileStore();

  const [name, setName] = useState(user?.name || "");
  const [profilePhoto, setProfilePhotoState] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePhoto || null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchLatestProfile(token);
  }, []);

  useEffect(() => {
    setName(user?.name || "");
    setProfilePhotoState(null);
    setPreviewUrl(user?.profilePhoto ? `${BASE_URL}${user.profilePhoto}` : null);
  }, [user]);

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhotoState(file);
      setProfilePhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("name", name);
    if (profilePhoto instanceof File) {
      formData.append("profile_picture", profilePhoto);
    }

    try {
      const token = localStorage.getItem("token");
      const backendData = await updateProfile(formData, token);

      const updatedUser = {
        name: backendData.name || user?.name,
        email: backendData.email || user?.email,
        profilePhoto: backendData.profile_picture || user?.profilePhoto,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      updateUserProfile(updatedUser);
      setAuth(updatedUser, token, localStorage.getItem("refreshToken"));

      setName(updatedUser.name);
      setProfilePhotoState(null);
      setPreviewUrl(updatedUser.profilePhoto ? `${BASE_URL}${updatedUser.profilePhoto}` : null);

      resetProfileUpdate();
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Error updating profile: " + (err.message || JSON.stringify(err)));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 my-10 mt-8">
      <h1 className="font-bold text-2xl text-center md:text-left">PROFILE</h1>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 my-5">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 mb-4">
            <AvatarImage
              src={previewUrl || "https://github.com/shadcn.png"}
              alt={user?.name || "@user"}
            />
            <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </div>
        <div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100">
              Name:
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                {user?.name || "Not set"}
              </span>
            </h1>
          </div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100">
              Email:
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                {user?.email || "Not set"}
              </span>
            </h1>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="mt-2">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setProfileName(e.target.value);
                    }}
                    placeholder="Enter your name"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Profile Photo</Label>
                  <Input
                    onChange={onChangeHandler}
                    type="file"
                    accept="image/*"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button onClick={handleUpdate}>Update</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
