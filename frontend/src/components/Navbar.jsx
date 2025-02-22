import { Book, Menu, School } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import DarkMode from '@/DarkMode'



const Navbar = () => {
    const user = true

    return (
        <div className='h-16 dark:bg-[#0A0A0A] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-10'>
            {/* Desktop */}
            <div className='max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full'>
                <div className='flex items-center gap-2'>
                    <Book size={"30"} />
                    <h1 className='hidden md:block font-extrabold text-2xl'>UniNotesHub</h1>
                </div>
                {/* User icons and dark-mode icons */}
                <div className='flex items-center gap-8'>
                    {
                        user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar>
                                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem>
                                            <span>My Uploads</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <span>Edit Profile</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <span>Logout</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div>
                                <Button variant='outline'>Login</Button>
                                <Button>Signup</Button>
                            </div>
                        )
                    }
                    <DarkMode />
                </div>
            </div>
            {/* Mobile Device */}
            <div className='flex md:hidden items-center justify-between px-4 h-full'>
                <h1 className='font-extrabold text-xl'>UniNotesHub</h1>
                <MobileNavbar />
            </div>
        </div>
    )
}

export default Navbar


import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from '@radix-ui/react-dropdown-menu'

const MobileNavbar = () => {
    const role="instructor"
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
                    <span>My Uploads</span>
                    <span>Edit Profile</span>
                    <p>Log Out</p>
                </nav>
            </SheetContent>
        </Sheet>

    )
}
