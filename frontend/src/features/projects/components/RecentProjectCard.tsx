import { Card } from "@/components/ui/card"
import { Link } from "@tanstack/react-router" 
import { ChevronDown } from "lucide-react"

const RecentProjectCard = () => {
    return (
        <Card className='min-w-[302px] h-[168px] p-3 gap-1 hover:shadow-lg transition-shadow'>
            <div className="mb-2">
                <h3 className="text-sm font-medium">My Scrum Project</h3> 
                <p className="text-xs font-light text-muted-foreground">Team-managed software</p>
            </div>

            <div className="">
                <p className="text-xs font-bold uppercase text-muted-foreground pl-1">Quick links</p>
                <div className="flex py-1.5 pl-1 hover:bg-muted rounded-xs">
                    <Link className="flex-1 text-xs font-light" to="/">My open work items</Link>
                    <div className="ml-[3px] mr-1.5 px-0.5 rounded-full bg-muted text-xs">
                        <span className="text-xs font-medium">2</span>
                    </div>
                </div>
                <div className="flex py-1.5 pl-1 hover:bg-muted rounded-xs">
                    <Link className="flex-1 text-xs font-light" to="/">Done work items</Link>
                </div>
            </div>

            <div className="border-t">
                <div className="px-3">
                    <div className="flex items-center text-muted-foreground cursor-pointer w-[66px]">
                        <p className="text-xs py-[3px] pl-1">1 board</p>
                        <ChevronDown className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default RecentProjectCard