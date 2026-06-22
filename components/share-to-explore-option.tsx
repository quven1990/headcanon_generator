import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface ShareToExploreOptionProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
}

export function ShareToExploreOption({
  checked,
  onCheckedChange,
  id = "share-to-explore",
}: ShareToExploreOptionProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          className="mt-0.5"
        />
        <div className="space-y-1 text-left">
          <Label htmlFor={id} className="text-sm font-medium text-gray-900 cursor-pointer">
            Share to community Explore
          </Label>
          <p className="text-xs text-gray-600 leading-relaxed">
            When checked, your generation may appear in the public{" "}
            <a href="/explore" className="text-blue-600 underline hover:text-blue-700">
              Explore gallery
            </a>{" "}
            and search engines. Uncheck to keep it private (saved only to your account).
          </p>
        </div>
      </div>
    </div>
  )
}
