import { Plus, Pencil } from 'lucide-react';

export default function Fab({ onClick, label = 'Add', variant = 'add' }) {
  const Icon = variant === 'edit' ? Pencil : Plus;
  return (
    <button type="button" className="fab" onClick={onClick} aria-label={label}>
      <Icon size={22} />
    </button>
  );
}
