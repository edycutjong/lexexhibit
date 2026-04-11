import { jsPDF } from 'jspdf';

export interface LegalSection {
  exhibitNumber: string;
  paragraphNumber: number;
  legalProse: string;
  txHashes: string[];
  dateRange: string;
}

export async function generateAffidavitPdfBase64(sections: LegalSection[]): Promise<string> {
  const doc = new jsPDF({
    unit: 'in',
    format: 'letter'
  });

  // Basic styling for Times New Roman equivalent
  doc.setFont('times', 'normal');
  doc.setFontSize(12);

  // Line numbers setup (1 to 28)
  for (let i = 1; i <= 28; i++) {
    doc.text(i.toString(), 0.5, 1 + (i * 0.33));
  }

  // Draw margins
  doc.setLineWidth(0.01);
  doc.line(1, 1, 1, 10.5); // left margin
  doc.line(8, 1, 8, 10.5); // right margin

  // Caption block
  doc.text('SUPERIOR COURT OF THE STATE OF CALIFORNIA', 1.5, 1.5);
  doc.text('COUNTY OF LOS ANGELES', 1.5, 1.8);
  
  doc.text('JOHN DOE, Plaintiff,', 1.5, 2.5);
  doc.text('v.', 2.5, 2.8);
  doc.text('JANE DOE, Defendant.', 1.5, 3.1);

  doc.text('Case No.: 26-FL-001234', 5.0, 2.5);
  doc.text('AFFIDAVIT OF BLOCKCHAIN', 5.0, 2.8);
  doc.text('ASSET TRACING', 5.0, 3.1);

  doc.setFont('times', 'bold');
  doc.text('DECLARATION UNDER PENALTY OF PERJURY', 1.5, 4.0);
  doc.setFont('times', 'normal');

  doc.text('I, LexExhibit Analyst, declare:', 1.5, 4.5);

  let cursorY = 5.0;

  // Render paragraphs
  sections.forEach((section, index) => {
    if (cursorY > 9.5) {
      doc.addPage();
      cursorY = 1.5;
      for (let i = 1; i <= 28; i++) {
        doc.text(i.toString(), 0.5, 1 + (i * 0.33));
      }
      doc.line(1, 1, 1, 10.5); 
      doc.line(8, 1, 8, 10.5);
    }

    const textLines = doc.splitTextToSize(`${index + 1}. ${section.legalProse}`, 6.0);
    doc.text(textLines, 1.5, cursorY);
    cursorY += (textLines.length * 0.25) + 0.2;
  });

  cursorY += 0.5;
  if (cursorY > 9.5) {
     doc.addPage(); cursorY = 1.5;
  }
  
  doc.text('I declare under penalty of perjury under the laws of the State of', 1.5, cursorY);
  doc.text('California that the foregoing is true and correct.', 1.5, cursorY + 0.25);
  doc.text('Executed on November 1, 2026.', 1.5, cursorY + 0.5);

  doc.text('_____________________________', 5.0, cursorY + 1.0);
  doc.text('LexExhibit Analyst', 5.0, cursorY + 1.25);

  const b64 = btoa(doc.output());
  return `data:application/pdf;base64,${b64}`;
}
