interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({ label, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <input
        className="w-full p-2 bg-transparent border border-gray-300 text-white rounded focus:border-primary focus:outline-none"
        {...props}
      />
      <label className="text-white text-xs">{label}</label>
    </div>
  );
}
