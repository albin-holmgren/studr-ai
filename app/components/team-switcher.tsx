import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"

interface Team {
  name: string
  logo: string
  plan: string
}

interface TeamSwitcherProps {
  teams: Team[]
  className?: string
}

export function TeamSwitcher({ teams, className }: TeamSwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedTeam, setSelectedTeam] = React.useState<Team>(teams[0])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a team"
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedTeam.logo}</span>
            <span className="truncate">{selectedTeam.name}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search team..." />
          <CommandEmpty>No team found.</CommandEmpty>
          <CommandGroup>
            {teams.map((team) => (
              <CommandItem
                key={team.name}
                onSelect={() => {
                  setSelectedTeam(team)
                  setOpen(false)
                }}
                className="text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{team.logo}</span>
                  <span>{team.name}</span>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    selectedTeam.name === team.name
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
