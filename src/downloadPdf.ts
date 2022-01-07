import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
import './genjyuugothic-20150607/jspdf-GenJyuuGothic-Regular-normal.js';
import { formatDate } from './util';

export const downloadPdf = async (svgs: Iterable<SVGSVGElement>) => {
  const doc = new jsPDF({ putOnlyUsedFonts: true, unit: 'mm', format: [100, 148] });
  doc.setFont('GenJyuuGothic-Regular', 'normal');

  // svg2pdf.js による setFont() を無視します。
  doc.setFont = () => doc;

  let first = true;
  for (const svg of svgs) {
    first ? (first = false) : doc.addPage();
    await doc.svg(svg);
  }

  await doc.save(`omotegaki-${formatDate(new Date())}.pdf`, { returnPromise: true });
};
