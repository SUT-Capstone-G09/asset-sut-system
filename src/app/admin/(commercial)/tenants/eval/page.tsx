import { AdminEvalTable} from "@/features/evaluations/components/AdminEvalTable"
import { AdminEvalTableHeader } from "@/features/evaluations/components/AdminEvalTableHeader"

export default function DashboardPage() {
    return (
        <div className="space-y-10 p-8">
            <AdminEvalTableHeader />
            <AdminEvalTable />
        </div>
    )
}