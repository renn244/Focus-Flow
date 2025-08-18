import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId"
import useDebounce from "@/lib/useDebounce"
import { Dialog } from "@radix-ui/react-dialog"
import { useQueryClient } from "@tanstack/react-query"
import { motion } from 'framer-motion'
import { Search, UserPlus } from "lucide-react"
import { useState } from "react"
import { useAddMemberMutation } from "../hooks/useAddMemberMutation"
import { useGetUserInfo } from "../hooks/useGetUserInfo"
import { useSearchUser } from "../hooks/useSearchUser"
import { useAddMemberDialog } from "../store/addMemberStore"
import { useTeamManagementStore } from "../store/TeamManagementStore"

const AddMemberDialog = () => {
  const { isOpen, setIsOpen } = useAddMemberDialog();

  const handleOnOpenChange = (value: boolean, cb?: () => void) => {
    setIsOpen(value);
    if(!value && cb) {
      cb();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <AddMember handleOnOpenChange={handleOnOpenChange} />
      </DialogContent>
    </Dialog>
  )
}

type AddMemberProps = {
  handleOnOpenChange: (value: boolean, cb?: () => void) => void;
}

const AddMember = ({ handleOnOpenChange }: AddMemberProps) => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const setIsOpenTeamDialog = useTeamManagementStore(state => state.setIsOpen);

  const [searchUser, setSearchUser] = useState("");
  const projectId = useProjectIdStore((state) => state.projectId);

  const debounceSearchUser = useDebounce(searchUser, 300);
  const { data: users, isLoading } = useSearchUser(debounceSearchUser, projectId || "");
  const { data: user, isLoading: userLoading } = useGetUserInfo(selectedUser || "", projectId || "")

  const  { mutateAsync, isPending } = useAddMemberMutation();
  const queryClient = useQueryClient();

  const handleSubmit = async () => { 
    // put warning or constraint later.
    if(!selectedRole || !selectedUser) return;

    await mutateAsync({ 
      userId: selectedUser, 
      projectId: projectId || "",
      role: selectedRole as "admin" | "member", 
    }, {
      onSuccess: () => {
        handleOnOpenChange(false, () => {
          setSelectedUser(null);
          setSelectedRole(null);
          setIsOpenTeamDialog(true);
          setSearchUser("");
        });
        
        queryClient.invalidateQueries({ queryKey: ['teamMembers', projectId] });
        queryClient.invalidateQueries({ queryKey: ['searchUser'] });
      }
    })
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold">Add Team Member</DialogTitle>
            <p className="text-sm text-gray-600">Invite new members or add existing users to your project</p>
          </div>
        </div>
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-3">
            <Card className="gap-0 py-3">
              <CardHeader className="px-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Find Existing User
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3">
                <div className="space-y-2">
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                    className="pl-8"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Search by username or email..." />
                  </div>

                  {user && (
                    <div>
                      <div className={`flex items-center justify-between p-2 rounded-md border transition-colors`}>
                          <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => setSelectedUser(null)}
                          className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.displayName} />
                              <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{user.displayName}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </motion.div>
                        </div>
                    </div>
                  )}

                  <div>
                    <Select
                    value={selectedRole || ""}
                    onValueChange={(value: "admin" | "member") => setSelectedRole(value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <CardFooter className="px-0">
                    <Button 
                    className="w-full"
                    onClick={() =>  handleSubmit()}
                    disabled={isPending || !selectedUser || !selectedRole || userLoading}
                    >
                      {isPending ? <LoadingSpinner /> : 'Add User'}
                    </Button>
                  </CardFooter>
                </div>
              </CardContent>
            </Card>

            {(users && !isLoading) && (
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
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default AddMemberDialog