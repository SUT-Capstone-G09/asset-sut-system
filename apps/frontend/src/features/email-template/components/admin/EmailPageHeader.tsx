interface EmailPageHeaderProps {
  title: string;
  description?: string;
}

export default function EmailPageHeader({
  title,
  description,
}: EmailPageHeaderProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title text-2xl font-black text-slate-900 tracking-tight">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
      </div>
    </div>
  );
}
