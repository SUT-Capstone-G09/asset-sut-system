interface PaymentHeaderProps {
  title: string;
  description: string;
}

export function PaymentHeader({ title, description }: PaymentHeaderProps) {
  return (
    <div>
      <h1 className="text-4xl font-bold text-[#0F172A]">{title}</h1>
      <p className="text-base font-normal text-muted-foreground mt-2 max-w-3xl leading-relaxed">
        {description}
      </p>
    </div>
  );
}
