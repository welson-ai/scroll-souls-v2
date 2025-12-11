"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { addMembersToOrganization } from "@/app/actions/organizations"

interface AddMembersModalProps {
  isOpen: boolean
  onClose: () => void
  organizationId: string
  onMembersAdded: () => void
}

export default function AddMembersModal({ isOpen, onClose, organizationId, onMembersAdded }: AddMembersModalProps) {
  const [users, setUsers] = useState<any[]>([])
  const [existingMembers, setExistingMembers] = useState<string[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      fetchExistingMembers()
    }
  }, [isOpen, organizationId])

  const fetchUsers = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("profiles").select("id, display_name, email").order("email")
    setUsers(data || [])
  }

  const fetchExistingMembers = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("organization_members").select("user_id").eq("org_id", organizationId)
    setExistingMembers(data?.map((m: any) => m.user_id) || [])
  }

  const handleAddMembers = async () => {
    setLoading(true)
    try {
      await addMembersToOrganization(organizationId, selectedUsers)
      setSelectedUsers([])
      onMembersAdded()
      onClose()
    } catch (error) {
      console.error("[v0] Error adding members:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      !existingMembers.includes(user.id) &&
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
          <p className="text-sm text-muted-foreground">Search by email to add members to your organization</p>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] max-h-[300px]">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {searchTerm ? "No users found matching this email" : "Type an email to search"}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() =>
                  setSelectedUsers((prev) =>
                    prev.includes(user.id) ? prev.filter((id) => id !== user.id) : [...prev, user.id],
                  )
                }
                className={`w-full rounded-lg border p-3 text-left text-sm transition-all ${
                  selectedUsers.includes(user.id) ? "border-purple-600 bg-purple-50" : "border-input hover:bg-accent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{user.display_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  {selectedUsers.includes(user.id) && <Check className="h-4 w-4 text-purple-600 flex-shrink-0" />}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex gap-3 pt-2 border-t">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
            onClick={handleAddMembers}
            disabled={loading || selectedUsers.length === 0}
          >
            {loading ? "Adding..." : `Add ${selectedUsers.length} Member${selectedUsers.length !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
