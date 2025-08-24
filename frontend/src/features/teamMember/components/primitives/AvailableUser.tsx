import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from 'framer-motion'
import { Search } from "lucide-react"
import { useSearchUser } from "../../hooks/useSearchUser"
import useDebounce from "@/lib/useDebounce"
import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId"

type AvailableUserProps = {
    searchUser: string;
    selectedUser: string | null;
    setSelectedUser: (userId: string) => void;
}

const AvailableUser = ({
    searchUser, selectedUser, setSelectedUser
}: AvailableUserProps) => {
    const projectId = useProjectIdStore((state) => state.projectId);

    const debounceSearchUser = useDebounce(searchUser, 300);
    const { data: users, isLoading } = useSearchUser(debounceSearchUser, projectId || "");

    return (
        (users && !isLoading) && (
            <Card className="gap-0 py-3">
                <CardHeader className="px-3">
                    <CardTitle className="text-lg">Available Users</CardTitle>
                </CardHeader>
                <CardContent className="px-3">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {users
                        .filter(user => user._id !== selectedUser)
                        .map((user, index) => (
                            <motion.div
                            onClick={() => setSelectedUser(user._id)}
                            key={user._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center justify-between p-2 rounded-md border transition-colors`}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.displayName} />
                                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-gray-900">{user.displayName}</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {users && users.filter(user => user._id !== selectedUser).length === 0 && (
                            <div className="text-center py-8">
                                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No users found matching your search.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    )
}

export default AvailableUser