import { FileText, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { ReportTemplate } from './ReportTemplate';

interface Props {
  variant?: 'both' | 'raw' | 'ai';
  zoneName?: string;
  crop?: string;
}

export function ExportButtons({ variant = 'both', zoneName, crop }: Props) {
  const [open, setOpen] = useState<'raw' | 'ai' | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {(variant === 'both' || variant === 'raw') && (
          <button
            onClick={() => setOpen('raw')}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-3 hover:border-green-300 transition-colors text-sm shadow-sm"
          >
            <FileText className="text-green-600" size={16} />
            <span className="text-gray-700">Raw Data Report</span>
          </button>
        )}
        {(variant === 'both' || variant === 'ai') && (
          <button
            onClick={() => setOpen('ai')}
            className="flex items-center justify-center gap-2 bg-green-600 rounded-xl px-3 py-3 hover:bg-green-700 transition-colors text-sm shadow-sm"
          >
            <Sparkles className="text-white" size={16} />
            <span className="text-white">AI Analyzed Report</span>
          </button>
        )}
      </div>
      {open && (
        <ReportTemplate
          type={open}
          onClose={() => setOpen(null)}
          zoneName={zoneName}
          crop={crop}
        />
      )}
    </>
  );
}
