import React, { useState, useRef, useEffect } from 'react';
import { LocationResult, locationApi } from '../services/locationApi';

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationAdd: (name: string, country: string, lat: number, lon: number) => void;
}

const AddLocationModal: React.FC<AddLocationModalProps> = ({
  isOpen,
  onClose,
  onLocationAdd
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout>();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle search
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await locationApi.searchLocations(query);
      setSearchResults(results);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = (query: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleLocationSelect = (location: LocationResult) => {
    onLocationAdd(location.name, location.country, location.lat, location.lon);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedIndex(-1);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleLocationSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        handleClose();
        break;
    }
  };

  const popularLocations = locationApi.getPopularLocations();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Add Location</h2>
            <button
              onClick={handleClose}
              className="text-white/60 hover:text-white/80 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-6 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search for a city..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
            />
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto">
          {searchQuery ? (
            // Search Results
            searchResults.length > 0 ? (
              <div className="px-6 pb-6">
                {searchResults.map((location, index) => (
                  <button
                    key={`${location.lat}-${location.lon}`}
                    onClick={() => handleLocationSelect(location)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 animate-fade-in hover:scale-[1.02] ${
                      index === selectedIndex 
                        ? 'bg-white/20 scale-[1.02]' 
                        : 'hover:bg-white/10'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-white">
                          {location.name}
                          {location.state && `, ${location.state}`}
                        </div>
                        <div className="text-sm text-white/60">{location.country}</div>
                      </div>
                      <div className="text-xs text-white/40">
                        {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : !loading && (
              <div className="px-6 pb-6 text-center text-white/60">
                <div className="text-2xl mb-2">🌍</div>
                <p>No locations found</p>
              </div>
            )
          ) : (
            // Popular Locations
            <div className="px-6 pb-6">
              <h3 className="text-sm font-medium text-white/80 mb-3">Popular Locations</h3>
              <div className="space-y-1">
                {popularLocations.slice(0, 8).map((location, index) => (
                  <button
                    key={`${location.lat}-${location.lon}`}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-all duration-200 animate-fade-in hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-white">{location.name}</div>
                        <div className="text-sm text-white/60">{location.country}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLocationModal;