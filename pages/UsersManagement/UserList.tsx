"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import {
  UserIcon,
  Edit,
  Trash2,
  Search,
  Plus,
  Shield,
  Check,
  X,
  Mail,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  TrendingUp,
  Briefcase,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  verifyEmail,
  type User,
  type UsersApiResponse,
  type CreateUserData,
  type UpdateUserData,
} from "../../lib/redux/service/userService"
import { UserForm } from "../../pages/UsersManagement/AddEditUser"
import { toast } from "sonner"

function ConfirmDialog({
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  trigger,
}: {
  title: string
  description: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    onConfirm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export interface PageProps {
  user: {
    id: number
    name: string
    email: string
    role: string
  }
}

export function UserList({ user }: PageProps) {
  const [usersData, setUsersData] = useState<UsersApiResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")

  const getUsersArray = () => usersData?.users?.data || []

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const response = await getUsers(currentPage)
        setUsersData(response)
      } catch (error) {
        console.error("Error fetching users:", error)
        setUsersData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [currentPage])

  const handleEdit = async (user: User) => {
    try {
      const data = await getUserById(user.id)
      setEditingUser(data)
      setIsDialogOpen(true)
    } catch (error) {
      console.error("Error fetching user:", error)
      toast.error("Failed to load user data")
    }
  }

  const handleDelete = async (user: User) => {
    try {
      await deleteUser(user.id)
      setUsersData((prev) =>
        prev
          ? {
              ...prev,
              users: {
                ...prev.users,
                data: prev.users.data.filter((u) => u.id !== user.id),
                total: prev.users.total - 1,
              },
            }
          : null,
      )
      toast.success("User deleted successfully")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  const handleVerifyEmail = async (userId: number) => {
    try {
      const updatedUser = await verifyEmail(userId)
      setUsersData((prev) =>
        prev
          ? {
              ...prev,
              users: {
                ...prev.users,
                data: prev.users.data.map((u) => (u.id === userId ? updatedUser : u)),
              },
            }
          : null,
      )
      toast.success("Email verified successfully")
    } catch (error) {
      console.error("Error verifying email:", error)
      toast.error("Failed to verify email")
    }
  }

  const handleUserSaved = async (userData: CreateUserData | UpdateUserData) => {
    try {
      setIsLoading(true)
  
      if (editingUser) {
        // Just update local state after successful update
        setUsersData((prev) =>
          prev
            ? {
                ...prev,
                users: {
                  ...prev.users,
                  data: prev.users.data.map((u) => (u.id === editingUser.id ? { ...u, ...userData } : u)),
                },
              }
            : null,
        )
        toast.success("User updated successfully")
      } else {
        // Just refresh users list after creation
        const refreshedData = await getUsers(currentPage)
        setUsersData(refreshedData)
        toast.success("User created successfully")
      }
  
      setIsDialogOpen(false)
      setEditingUser(null)
    } catch (error) {
      console.error("Error handling saved user:", error)
      toast.error(`Failed to ${editingUser ? "update" : "create"} user`)
    } finally {
      setIsLoading(false)
    }
  }
  

  const toggleUserStatus = async (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active"
    try {
      const updatedUser = await updateUser(user.id, { status: newStatus })
      setUsersData((prev) =>
        prev
          ? {
              ...prev,
              users: {
                ...prev.users,
                data: prev.users.data.map((u) => (u.id === user.id ? updatedUser : u)),
              },
            }
          : null,
      )
      toast.success(`User status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating user status:", error)
      toast.error("Failed to update user status")
    }
  }

  const filteredUsers = getUsersArray().filter((user) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user?.name?.toLowerCase().includes(searchLower) ||
      user?.email?.toLowerCase().includes(searchLower) ||
      user?.role?.toLowerCase().includes(searchLower) ||
      user?.plan?.toLowerCase().includes(searchLower) ||
      String(user?.status)?.toLowerCase().includes(searchLower)
    )
  })

  if (isLoading && getUsersArray().length === 0) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg resumaic-gradient-green text-white hover:opacity-90  button-press">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#2D3639] font-sans">User Management</h1>
            <p className="text-gray-600 font-sans">Manage all system users</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="resumaic-gradient-green hover:opacity-90  button-press text-white"
              onClick={() => {
                setEditingUser(null)
                setIsDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[70vw] !max-w-none max-h-[90vh] overflow-x-auto">
            <DialogHeader>
              <DialogTitle className="font-sans text-[#2D3639]">
                {editingUser ? "Edit User" : "Create New User"}
              </DialogTitle>
              <DialogDescription className="font-sans">
                {editingUser ? "Update user details below" : "Fill in the user details below"}
              </DialogDescription>
            </DialogHeader>
            <UserForm
              mode={editingUser ? "edit" : "create"}
              userId={editingUser?.id}
              initialData={
                editingUser
                  ? {
                      name: editingUser.name,
                      email: editingUser.email,
                      role: editingUser.role,
                      status: editingUser.status,
                      plan: editingUser.plan,
                      plan_type: editingUser.plan_type,
                      dark_mode: editingUser.dark_mode,
                      language: editingUser.language,
                      push_notifications: editingUser.push_notifications,
                      email_updates: editingUser.email_updates,
                    }
                  : undefined
              }
              onSave={handleUserSaved}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingUser(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table/Grid */}
      {getUsersArray().length > 0 && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold font-sans text-[#2D3639]">
                    System Users ({filteredUsers.length})
                  </h3>
                  <p className="text-sm text-gray-600 font-sans">View and manage all registered users</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users by name, email, role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full font-sans"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="border-[#70E4A8]/30 hover:border-[#70E4A8]/50"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className="border-[#70E4A8]/30 hover:border-[#70E4A8]/50"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {viewMode === "table" ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-sans">User</TableHead>
                      <TableHead className="font-sans">Email</TableHead>
                      <TableHead className="font-sans">Role</TableHead>
                      <TableHead className="font-sans">Plan</TableHead>
                      {/* <TableHead className="font-sans">Status</TableHead> */}
                      {/* <TableHead className="font-sans">Verified</TableHead> */}
                      <TableHead className="font-sans">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-[#70E4A8]/5">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-gray-200 hover:border-[#70E4A8] transition-colors">
                              <AvatarFallback className="bg-[#70E4A8]/20 text-[#70E4A8] font-semibold">
                                {(user.name || "")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium font-sans text-[#2D3639]">{user.name}</div>
                              <div className="text-sm text-gray-600 font-sans">
                                Joined: {new Date(user.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 font-sans">
                            <Mail className="h-4 w-4 text-[#70E4A8]" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.role === "admin" ? "default" : "secondary"}
                            className="bg-[#70E4A8]/20 text-[#2D3639] hover:bg-[#70E4A8]/30 font-sans"
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-[#70E4A8]/30 text-[#2D3639] font-sans">
                            {user.plan}
                          </Badge>
                        </TableCell>
                        {/* <TableCell>
                          <Badge
                            variant={user.status === "active" ? "default" : "destructive"}
                            className={`cursor-pointer font-sans ${
                              user.status === "active"
                                ? "bg-[#70E4A8]/20 text-[#2D3639] hover:bg-[#70E4A8]/30"
                                : "bg-[#EA580C]/20 text-[#EA580C] hover:bg-[#EA580C]/30"
                            }`}
                            onClick={() => toggleUserStatus(user)}
                          >
                            {user.status}
                          </Badge>
                        </TableCell> */}
                        {/* <TableCell>
                          {user.email_verified_at ? (
                            <Badge variant="secondary" className="bg-[#70E4A8]/20 text-[#2D3639] font-sans">
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerifyEmail(user.id)}
                              className="text-xs text-[#EA580C] hover:text-[#EA580C] hover:bg-[#EA580C]/10 font-sans"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Not Verified
                            </Button>
                          )}
                        </TableCell> */}
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              className="text-[#70E4A8] hover:text-[#70E4A8] hover:bg-[#70E4A8]/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <ConfirmDialog
                              title={`Delete "${user.name}"`}
                              description={`Are you sure you want to delete the user ${user.name}?`}
                              confirmText="Delete"
                              cancelText="Cancel"
                              onConfirm={() => handleDelete(user)}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#EA580C] hover:text-[#EA580C] hover:bg-[#EA580C]/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="hover:shadow-lg transition-shadow border-2 border-transparent hover:border-[#70E4A8]/20"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-gray-200 hover:border-[#70E4A8] transition-colors">
                          <AvatarFallback className="bg-[#70E4A8]/20 text-[#70E4A8] font-semibold">
                            {(user.name || "")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg font-sans text-[#2D3639]">{user.name}</CardTitle>
                          <CardDescription className="font-sans">{user.email}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium font-sans text-[#2D3639]">Role</Label>
                        <p className="text-sm text-gray-600 font-sans">{user.role}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium font-sans text-[#2D3639]">Plan</Label>
                        <p className="text-sm text-gray-600 font-sans">{user.plan}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium font-sans text-[#2D3639]">Status</Label>
                        <Badge
                          variant={user.status === "active" ? "default" : "destructive"}
                          className={`cursor-pointer font-sans ${
                            user.status === "active"
                              ? "bg-[#70E4A8]/20 text-[#2D3639] hover:bg-[#70E4A8]/30"
                              : "bg-[#EA580C]/20 text-[#EA580C] hover:bg-[#EA580C]/30"
                          }`}
                          onClick={() => toggleUserStatus(user)}
                        >
                          {user.status}
                        </Badge>
                      </div>

                      <div>
                        <Label className="text-sm font-medium font-sans text-[#2D3639]">Verified</Label>
                        {user.email_verified_at ? (
                          <Badge variant="secondary" className="bg-[#70E4A8]/20 text-[#2D3639] font-sans">
                            <Check className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerifyEmail(user.id)}
                            className="text-xs text-[#EA580C] hover:text-[#EA580C] hover:bg-[#EA580C]/10 font-sans"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Not Verified
                          </Button>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 font-sans">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="bg-transparent border-[#70E4A8]/30 text-[#70E4A8] hover:bg-[#70E4A8]/10 hover:border-[#70E4A8]/50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ConfirmDialog
                          title={`Delete "${user.name}"`}
                          description={`Are you sure you want to delete the user ${user.name}?`}
                          confirmText="Delete"
                          cancelText="Cancel"
                          onConfirm={() => handleDelete(user)}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[#EA580C] border-[#EA580C]/30 hover:bg-[#EA580C]/10 hover:border-[#EA580C]/50 bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {usersData?.users && usersData.users.total > usersData.users.per_page && (
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-muted-foreground font-sans">
                Showing{" "}
                <strong>
                  {usersData.users.from}-{usersData.users.to}
                </strong>{" "}
                of <strong>{usersData.users.total}</strong> users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-[#70E4A8]/30 hover:border-[#70E4A8]/50 font-sans"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === usersData.users.last_page}
                  className="border-[#70E4A8]/30 hover:border-[#70E4A8]/50 font-sans"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty States */}
      {filteredUsers.length === 0 && getUsersArray().length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-[#2D3639] mb-2 font-sans">No users found</h3>
            <p className="text-gray-500 mb-4 font-sans">Try adjusting your search terms or create a new user</p>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="border-[#70E4A8]/30 hover:border-[#70E4A8]/50 font-sans"
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {getUsersArray().length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <UserIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-[#2D3639] mb-2 font-sans">No users registered yet</h3>
            <p className="text-gray-500 mb-4 font-sans">
              Create your first user by clicking the "Add User" button above
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-transparent hover:border-[#70E4A8]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-sans text-[#2D3639]">Total Users</CardTitle>
            <UserIcon className="h-4 w-4 text-[#70E4A8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans text-[#2D3639]">{usersData?.users?.total || 0}</div>
            <p className="text-xs text-gray-500 font-sans">All registered system users</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-transparent hover:border-[#70E4A8]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-sans text-[#2D3639]">Active Users</CardTitle>
            <Check className="h-4 w-4 text-[#70E4A8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans text-[#2D3639]">
              {getUsersArray().filter((u) => u.status === "active").length}
            </div>
            <p className="text-xs text-gray-500 font-sans">Currently active accounts</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-transparent hover:border-[#70E4A8]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-sans text-[#2D3639]">Admins</CardTitle>
            <Shield className="h-4 w-4 text-[#70E4A8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans text-[#2D3639]">
              {getUsersArray().filter((u) => u.role === "admin").length}
            </div>
            <p className="text-xs text-gray-500 font-sans">Users with admin privileges</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className="hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#70E4A8]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-sans text-[#2D3639]">
            <div className="p-2 bg-gradient-to-br from-[#70E4A8] to-[#EA580C] rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            User Management Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-[#70E4A8]/20 p-3">
                <UserIcon className="h-5 w-5 text-[#70E4A8]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] font-sans">Role Management</h4>
                <p className="text-sm text-gray-600 font-sans">
                  Assign appropriate roles to control user access and permissions
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-[#EA580C]/20 p-3">
                <Shield className="h-5 w-5 text-[#EA580C]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] font-sans">Admin Privileges</h4>
                <p className="text-sm text-gray-600 font-sans">Limit admin access to trusted users only</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-[#70E4A8]/20 p-3">
                <Briefcase className="h-5 w-5 text-[#70E4A8]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] font-sans">Plan Management</h4>
                <p className="text-sm text-gray-600 font-sans">
                  Monitor and manage user subscription plans effectively
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserList
