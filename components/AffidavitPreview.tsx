'use client';

import { FileText, Download } from "lucide-react";

export function AffidavitPreview({ pdfDataUrl }: { pdfDataUrl: string | null }) {
  if (!pdfDataUrl) {
    return (
      <div className="w-full h-[600px] bg-zinc-900 border border-white/10 rounded-xl flex flex-col items-center justify-center text-zinc-500 p-8 text-center space-y-4">
         <FileText className="w-12 h-12 opacity-50" />
         <div>
           <p className="font-medium text-zinc-300">No Affidavit Generated</p>
           <p className="text-sm mt-1">Scan a wallet and click &quot;Generate Affidavit&quot; to preview the court-admissible PDF.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[800px] bg-zinc-950 border border-white/10 rounded-xl overflow-hidden relative group">
       <iframe 
         src={`${pdfDataUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
         className="w-full h-full border-none"
         title="Affidavit Preview"
       />
       <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={pdfDataUrl}
            download="affidavit_exhibit.pdf"
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-medium px-4 py-2 rounded-lg shadow-xl"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
       </div>
    </div>
  );
}
