import React from 'react'
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"


const Hero = () => {

    return (
        <div className=" flex flex-col">
            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-primary/5 py-16">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                Access Previous Year Question Papers
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8">
                                Find exam papers or university, share with others, and
                                prepare better for your exams.
                            </p>
                            <div className="max-w-lg mx-auto">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Search for papers..."
                                        className="shadow-sm"
                                    />
                                    <Button>
                                        <Search className="h-4 w-4 mr-2" />
                                        Search
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default Hero
