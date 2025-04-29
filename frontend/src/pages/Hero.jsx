import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import usePyqStore from '@/store/pyqStore';
import UniversityTable from './university/UniversitiyTable';
import PYQFilter from './university/PYQFilter';

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { fetchSearchSuggestions, suggestions, isLoadingSuggestions, error } = usePyqStore();

  useEffect(() => {
    const debouncedUpdate = debounce((query) => {
      setDebouncedSearchQuery(query);
    }, 300);
    debouncedUpdate(searchQuery);
    return () => clearTimeout(debouncedUpdate.timeoutId);
  }, [searchQuery]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      fetchSearchSuggestions(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (item) => {
    setSearchQuery(item.name);
    setShowSuggestions(false);
  };

  const toggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const handleFilterUpdate = (universityName) => {
    setSearchQuery(universityName);
    setIsFilterOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="bg-gradient-to-br from-purple-600 to-blue-600/70 py-16 text-white mt-4">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Access Previous Year Question Papers
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                Search by university or filter by university, program, branch, or course.
              </p>
              <div className="max-w-lg mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Search by university..."
                    className="shadow-sm flex-1 text-black bg-white"
                    value={searchQuery}
                    onChange={handleInputChange}
                  />
                  <Button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="bg-white text-purple-700 hover:bg-purple-100"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button
                    onClick={toggleFilter}
                    className="bg-white text-purple-700 hover:bg-purple-100"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter Questions
                  </Button>
                </div>
                {error && (
                  <div className="text-red-200 text-sm mt-2">{error}</div>
                )}
                {showSuggestions && !isLoadingSuggestions && (
                  <div className="absolute z-10 bg-white border rounded-md mt-12 w-full max-w-lg mx-auto max-h-60 overflow-y-auto shadow-lg text-black">
                    {suggestions.universities.length > 0 ? (
                      <div>
                        <div className="p-2 font-bold text-sm text-gray-500">
                          Universities
                        </div>
                        {suggestions.universities.map((item) => (
                          <div
                            key={item.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSuggestionClick(item)}
                          >
                            {item.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2 text-gray-500">No universities found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogContent className="max-w-[90vw] sm:max-w-lg p-4">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Filter Previous Year Questions
              </DialogTitle>
            </DialogHeader>
            <PYQFilter
              onFilterComplete={() => setIsFilterOpen(false)}
              onUniversityFilter={handleFilterUpdate}
            />
          </DialogContent>
        </Dialog>

        <UniversityTable searchQuery={debouncedSearchQuery} />
      </main>
    </div>
  );


};

export default Hero;
