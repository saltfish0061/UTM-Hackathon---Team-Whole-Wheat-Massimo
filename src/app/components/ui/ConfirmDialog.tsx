import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmStyles = {
    danger:  'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
    default: 'bg-green-600 hover:bg-green-700 text-white',
  };

  const iconStyles = {
    danger:  'bg-red-100 text-red-500',
    warning: 'bg-amber-100 text-amber-500',
    default: 'bg-green-100 text-green-600',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog card */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-[fadeInScale_160ms_ease-out]">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
        >
          <X size={16} />
        </button>

        <div className="p-6 space-y-4">
          {/* Icon + title */}
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconStyles[variant]}`}>
              <AlertTriangle size={20} />
            </div>
            <div className="pt-0.5">
              <h3 className="text-gray-900">{title}</h3>
              <p className="text-gray-500 text-sm mt-1 leading-relaxed">{message}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 bg-white border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => { onConfirm(); }}
              className={`flex-1 rounded-xl py-2.5 text-sm transition-colors shadow-sm ${confirmStyles[variant]}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
