import { AdminEvalTable} from "@/features/evaluations/components/records/AdminEvalTable"
import { AdminEvalTableHeader } from "@/features/evaluations/components/records/AdminEvalTableHeader"

export default function DashboardPage() {
    return (
        <div className="space-y-10 p-8">
            <AdminEvalTableHeader />
            <AdminEvalTable />
        </div>
    )
}