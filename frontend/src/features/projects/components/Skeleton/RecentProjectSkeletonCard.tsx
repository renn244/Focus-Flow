import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const RecentProjectSkeletonCard = () => {
  return (
    <Card className='hover:shadow-md transition-all duration-200 cursor-pointer group bg-white border border-gray-200 py-1'>
        <CardContent className='p-4'>
            <div className='space-y-2'>
                
                <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                        <Skeleton className='h-8 w-8 rounded' />

                        <div className='flex-1'>
                            <Skeleton className='h-5 my-0.5 w-[230px]' />

                            <Skeleton className='h-4.5 mb-0.5 w-[300px]' />
                            <Skeleton className='h-4.5 mb-0.5 w-2/4' />
                        </div>
                    </div>
                </div>

                <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                        <Skeleton className='h-4 w-[79.95px]' />
                    </div>

                    <div className='space-y-2'>
                        <div className="flex items-center justify-between py-1 hover:bg-gray-50 rounded px-2 -mx-2 cursor-pointer">
                            <Skeleton className='h-5 w-[134.22px]' />
                            <Skeleton className='h-5 w-4' />
                        </div>

                        <div className="flex items-center justify-between py-1 hover:bg-gray-50 rounded px-2 -mx-2 cursor-pointer">
                            <Skeleton className='h-5 w-[111.23px]' />
                            <Skeleton className='h-5 w-4' />
                        </div>
                    </div>
                </div>

            </div>
        </CardContent>
    </Card>
  )
}

export default RecentProjectSkeletonCard