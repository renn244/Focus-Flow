import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
            <section className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-muted-foreground">Available users</h3>
                <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
                        {users
                        .filter(user => user._id !== selectedUser)
                        .map((user, index) => (
                            <motion.div
                            onClick={() => setSelectedUser(user._id)}
                            key={user._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex cursor-pointer items-center justify-between rounded-md border p-2 transition-colors hover:bg-muted/50"
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
                            <div className="py-8 text-center">
                                <Search className="mx-auto mb-4 size-12 text-muted-foreground" />
                                <p className="text-gray-600">No users found matching your search.</p>
                            </div>
                        )}
                </div>
            </section>
        )
    )
}

export default AvailableUser
