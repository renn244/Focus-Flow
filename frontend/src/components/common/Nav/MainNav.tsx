import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthContext } from '@/context/authContext'
import { Link } from '@tanstack/react-router'
import { Bell, Calendar, Search, Settings, Users } from 'lucide-react'
import { useState } from 'react'
import UserDropDown from './UserDropDown'

const MainNav = () => {
    const { user } = useAuthContext();
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to='/projects' className="text-2xl font-bold text-slate-900">
                        Project Dashboard
                    </Link> 
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-slate-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            Board
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-600">
                            <Users className="w-4 h-4 mr-2" />
                            Team
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-600">
                            Calendar
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                        />
                    </div>
                    <Button variant="ghost" size="sm">
                        <Bell className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                    </Button>
                    <UserDropDown
                    userEmail={user?.email || ''}
                    userName={user?.username || ''}
                    avatarUrl={user?.avatarUrl || ''}
                    />
                </div>
            </div>
        </div>
    )
}

export default MainNav