// src/components/Navbar.jsx
import { Book, Menu, Upload } from 'lucide-react';
import React, { useRef, useEffect } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DarkMode from '@/DarkMode';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '@/utils/api/authApi';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from '@radix-ui/react-dropdown-menu';

const Navbar = () => {
  const { user, isAuthenticated, token, logout, setError, error } = useAuthStore();
  const { fetchLatestProfile, error: profileError } = useProfileStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchLatestProfile();
    }
  }, [isAuthenticated, token, fetchLatestProfile]);

  const handleLogout = async () => {
    console.log("Attempting logout...");
    try {
      await logoutUser();
      logout();
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
      if (setError) setError(err.error || "Logout failed");
    }
  };

  const handleUploadRedirect = () => {
    if (isAuthenticated) {
      navigate('/uploadpyq');
    } else {
      navigate('/login', { state: { from: '/uploadpyq' } });
    }
  };

  return (
    <div className='h-16 dark:bg-[#0A0A0A] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-10'>
      {(error || profileError) && (
        <div className="bg-red-500 text-white text-center py-2">{error || profileError}</div>
      )}

      {/* Desktop Navbar */}
      <div className='max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full px-4'>
        <div className='flex items-center gap-2'>
          <Book size={"30"} />
          <h1 className='font-extrabold text-2xl'>UniNotesHub</h1>
        </div>
        <div className='flex items-center gap-4'>
          {isAuthenticated && user ? (
            <>
              <Button variant="outline" onClick={handleUploadRedirect} className="flex items-center gap-2">
                <Upload size={16} />
                Upload
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      src={user?.profilePhoto ? `http://localhost:8000${user.profilePhoto}` : "https://github.com/shadcn.png"}
                      alt={user?.name || "@user"}
                    />
                    <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>{user?.name || "My Account"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/editProfile')}>
                      <span>Edit Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-4">
              <Button variant='outline' onClick={() => navigate('/login')}>Login</Button>
              <Button onClick={() => navigate('/login?tab=signup')}>Signup</Button> {/* Updated */}
            </div>
          )}
          <DarkMode />
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className='flex md:hidden items-center justify-between px-4 h-full'>
        <h1 className='font-extrabold text-xl'>UniNotesHub</h1>
        <MobileNavbar
          user={user}
          isAuthenticated={isAuthenticated}
          handleLogout={handleLogout}
          handleUploadRedirect={handleUploadRedirect}
          navigate={navigate}
        />
      </div>
    </div>
  );
};

const MobileNavbar = ({ user, isAuthenticated, handleLogout, handleUploadRedirect, navigate }) => {
  const sheetRef = useRef();

  const handleNavigation = (path) => {
    navigate(path);
    if (sheetRef.current) sheetRef.current.click();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size='icon' className='rounded-full bg-gray-200 hover:bg-gray-200' variant="outline">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className='flex flex-col'>
        <SheetHeader className='flex flex-row items-center justify-between mt-2'>
          <SheetTitle>UniNotesHub</SheetTitle>
          <DarkMode />
        </SheetHeader>
        <Separator className='mr-2' />
        <nav className='flex flex-col space-y-4'>
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user?.profilePhoto ? `http://localhost:8000${user.profilePhoto}` : "https://github.com/shadcn.png"}
                    alt={user?.name || "@user"}
                  />
                  <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <span>{user?.name || "My Account"}</span>
              </div>
              <span onClick={() => handleNavigation('/dashboard')} className="cursor-pointer">Dashboard</span>
              <span onClick={handleUploadRedirect} className="cursor-pointer flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </span>
              <span onClick={() => handleNavigation('/editProfile')} className="cursor-pointer">Edit Profile</span>
              <span onClick={handleLogout} className="cursor-pointer">Log Out</span>
            </>
          ) : (
            <>
              <span onClick={() => handleNavigation('/login')} className="cursor-pointer">Login</span>
              <span onClick={() => handleNavigation('/login?tab=signup')} className="cursor-pointer">Signup</span> {/* Updated */}
            </>
          )}
        </nav>
        <SheetClose ref={sheetRef} className="hidden" />
      </SheetContent>
    </Sheet>
  );
};

export default Navbar;