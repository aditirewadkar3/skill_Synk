import * as React from "react"
import { Users, UserPlus, Settings, LogOut, Edit2, Check, X, Search, Trash2 } from "lucide-react"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { communityAPI, chatAPI, getCurrentUser } from "@/services/api"

export function CommunityManagement({ 
  chatId, 
  communityName, 
  open, 
  onOpenChange,
  onUpdateName,
  onLeave
}) {
  const [members, setMembers] = React.useState([])
  const [availableFreelancers, setAvailableFreelancers] = React.useState([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [newName, setNewName] = React.useState(communityName)
  const [isEditingName, setIsEditingName] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [inviting, setInviting] = React.useState(null)
  const [removing, setRemoving] = React.useState(null)
  
  const currentUser = getCurrentUser()

  const fetchData = React.useCallback(async () => {
    if (!chatId || !open) return
    try {
      setLoading(true)
      const [membersList, allUsers] = await Promise.all([
        communityAPI.getMembers(chatId),
        chatAPI.getUsers()
      ])
      setMembers(membersList)
      
      // Filter for freelancers not already in community and are available
      const memberUids = new Set(membersList.map(m => m.uid))
      const freelancers = allUsers.filter(u => 
        u.role === 'freelancer' && 
        !memberUids.has(u.id) && 
        (u.isAvailable !== false) // Default to available if not specified
      )
      setAvailableFreelancers(freelancers)
    } catch (error) {
      console.error("Failed to fetch community data:", error)
    } finally {
      setLoading(false)
    }
  }, [chatId, open])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  React.useEffect(() => {
    setNewName(communityName)
  }, [communityName])

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === communityName) {
      setIsEditingName(false)
      return
    }
    try {
      await communityAPI.updateName(chatId, newName)
      onUpdateName(newName)
      setIsEditingName(false)
    } catch (error) {
      console.error("Failed to update name:", error)
    }
  }

  const handleInvite = async (targetUid) => {
    try {
      setInviting(targetUid)
      await communityAPI.invite(chatId, targetUid)
      fetchData() // Refresh list
    } catch (error) {
      console.error("Failed to invite member:", error)
    } finally {
      setInviting(null)
    }
  }

  const handleRemove = async (targetUid) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        setRemoving(targetUid)
        await communityAPI.removeMember(chatId, targetUid)
        fetchData() // Refresh list
      } catch (error) {
        console.error("Failed to remove member:", error)
      } finally {
        setRemoving(null)
      }
    }
  }

  const handleLeave = async () => {
    if (window.confirm("Are you sure you want to leave this community?")) {
      try {
        await communityAPI.leave(chatId)
        onLeave()
        onOpenChange(false)
      } catch (error) {
        console.error("Failed to leave community:", error)
      }
    }
  }

  const filteredFreelancers = availableFreelancers.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community Info
            </SheetTitle>
          </div>
          <SheetDescription>
            Manage members and settings for this group.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Community Name Section */}
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Community Name
              </label>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)} 
                      className="h-9"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" className="h-9 w-9 text-green-500" onClick={handleUpdateName}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive" onClick={() => setIsEditingName(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full group">
                    <h3 className="text-lg font-bold truncate">{communityName}</h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditingName(true)}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Members List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Members ({members.length})
                </h4>
              </div>
              <ScrollArea className="max-h-[220px]">
                <div className="space-y-3 pr-4">
                  {members.length === 0 && !loading ? (
                    <p className="text-xs text-center text-muted-foreground py-4 italic">No members found</p>
                  ) : (
                    members.map((member) => (
                      <div key={member.uid} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-9 w-9 border border-border/50">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.uid}`} />
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate leading-none mb-1">{member.name}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 uppercase font-medium">
                                {member.role || 'Freelancer'}
                              </Badge>
                              {member.uid === currentUser?.uid && (
                                <Badge variant="default" className="text-[9px] h-4 py-0 bg-primary/20 text-primary border-none">You</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {member.uid !== currentUser?.uid && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemove(member.uid)}
                            disabled={removing === member.uid}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            {/* Invite Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Add Members
              </h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Search freelancers..." 
                  className="pl-9 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <ScrollArea className="flex-1 max-h-[250px]">
                <div className="space-y-2 pr-4">
                  {filteredFreelancers.length === 0 ? (
                    <p className="text-xs text-center text-muted-foreground py-4">No freelancers found to invite</p>
                  ) : (
                    filteredFreelancers.map((f) => (
                      <div key={f.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={f.avatar} />
                            <AvatarFallback>{f.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{f.name}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => handleInvite(f.id)}
                          disabled={inviting === f.id}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <SheetFooter className="p-6 border-t mt-auto">
          <Button variant="destructive" className="w-full gap-2" onClick={handleLeave}>
            <LogOut className="h-4 w-4" />
            Leave Community
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
