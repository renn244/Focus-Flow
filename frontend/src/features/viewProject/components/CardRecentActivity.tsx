import { format } from "date-fns";
import { motion } from "framer-motion";
import { activityColors, activityIcons } from "../constants/Activity";

type CardRecentActivityProps = {
    log: any, index: number,
}

const CardRecentActivity = ({ log, index }: CardRecentActivityProps) => {
    const IconComponent = activityIcons[log.type as keyof typeof activityIcons];
    
    return (
        <motion.div
        key={log.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex gap-3"
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activityColors[log.type as keyof typeof activityColors]}`}>
                <IconComponent className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{log.title}</p>
                    <p className="text-sm text-gray-500">{format(log.timestamp, "MMM dd, yyyy")}</p>
                </div>
                <p className="text-sm text-gray-600">{log.description}</p>
            </div>
        </motion.div>
    )
}

export default CardRecentActivity