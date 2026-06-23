interface PaymentHeaderProps {
  title: string;
  description: string;
}

export function PaymentHeader({ title, description }: PaymentHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-500 text-sm mt-1 max-w-3xl leading-relaxed whitespace-pre-line">
        {description}
      </p>
    </div>
  );
}
