export function RequiredAsterisk({ required, optional }) {
  if (!required || optional) return null;
  return <span className="required-asterisk"> *</span>;
}

export default function FormLabel({ children, required, optional }) {
  return (
    <label>
      {children}
      <RequiredAsterisk required={required} optional={optional} />
    </label>
  );
}
