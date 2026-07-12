export function AdminEvalFormHeader() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-extrabold text-slate-950">
                    แบบฟอร์มบันทึกการประเมิน
                </h1>
                <div className="px-3 py-1 bg-slate-200 text-slate-600 rounded text-xs font-bold tracking-wider uppercase">
                    Status: Drafting
                </div>
            </div>
        </div>
    )
}
