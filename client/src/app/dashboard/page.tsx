import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
const Dashboard = () => {
    return (
        <div>
            <h1>DAOs</h1>
            <div>
                {/* List of existing DAOs */}
                <Button asChild>
                    <Link href="/dashboard/create-dao"><Plus /> Add</Link>
                </Button>
            </div>
        </div>
    )
}

export default Dashboard