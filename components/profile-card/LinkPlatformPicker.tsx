import React, { useState, useMemo } from "react"
import { Search, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "../../components/ui/input"
import { platforms, categories, Platform, PlatformCategory } from "../../lib/profile-card/platform-data"

interface LinkPlatformPickerProps {
    onSelect: (platform: Platform) => void
}

export function LinkPlatformPicker({ onSelect }: LinkPlatformPickerProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedCategories, setExpandedCategories] = useState<Record<PlatformCategory, boolean>>({
        social: true,
        business: true,
        music: false,
        entertainment: false,
        payment: false,
        lifestyle: false,
        other: false
    })

    const filteredPlatforms = useMemo(() => {
        if (!searchQuery.trim()) return platforms
        return platforms.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery])

    const groupedPlatforms = useMemo(() => {
        const groups: Partial<Record<PlatformCategory, Platform[]>> = {}
        filteredPlatforms.forEach(p => {
            if (!groups[p.category]) groups[p.category] = []
            groups[p.category]?.push(p)
        })
        return groups
    }, [filteredPlatforms])

    const toggleCategory = (category: PlatformCategory) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }))
    }

    // If searching, show all matching results regardless of category expansion
    const isSearching = searchQuery.length > 0

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Search platforms..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-gray-50 dark:bg-gray-800 border-none focus-visible:ring-1"
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isSearching ? (
                    // Flat list for search results
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                        {filteredPlatforms.map(platform => (
                            <PlatformItem 
                                key={platform.id} 
                                platform={platform} 
                                onClick={() => onSelect(platform)} 
                            />
                        ))}
                        {filteredPlatforms.length === 0 && (
                            <div className="col-span-full text-center py-8 text-gray-500 text-sm">
                                No platforms found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                ) : (
                    // Categorized list
                    categories.map(category => {
                        const categoryPlatforms = groupedPlatforms[category.id]
                        if (!categoryPlatforms || categoryPlatforms.length === 0) return null

                        const isExpanded = expandedCategories[category.id]

                        return (
                            <div key={category.id} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                                <button 
                                    onClick={() => toggleCategory(category.id)}
                                    className="w-full flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {category.label}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {categoryPlatforms.length} platforms available
                                        </span>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                                
                                {isExpanded && (
                                    <div className="p-3 grid grid-cols-4 sm:grid-cols-5 gap-3 bg-white dark:bg-gray-900">
                                        {categoryPlatforms.map(platform => (
                                            <PlatformItem 
                                                key={platform.id} 
                                                platform={platform} 
                                                onClick={() => onSelect(platform)} 
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

function PlatformItem({ platform, onClick }: { platform: Platform, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="flex flex-col items-center gap-2 group p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
            <div className={`
                h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110
                ${platform.color.startsWith('bg-') ? platform.color : 'bg-gray-500'}
            `}>
                <platform.icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center line-clamp-1 w-full">
                {platform.name}
            </span>
        </button>
    )
}
