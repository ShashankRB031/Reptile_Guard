
import { jsPDF } from "jspdf";
import { SightingReport } from "../types";

export const generateReportPDF = (report: SightingReport) => {
  const doc = new jsPDF();
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);
  let y = 0;

  const checkPageBreak = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - 20) {
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  };

  // ========== HEADER ==========
  doc.setFillColor(6, 78, 59);
  doc.rect(0, 0, pageWidth, 42, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ReptileGuard", pageWidth / 2, 16, { align: "center" });
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Official Wildlife Conservation & Rescue Documentation", pageWidth / 2, 24, { align: "center" });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Report ID: ${report.id}`, pageWidth / 2 - 30, 35);
  doc.text(`Status: ${report.status}`, pageWidth / 2 + 30, 35);

  y = 52;

  // ========== REPORT META ==========
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.text(`Report Date: ${new Date(report.timestamp).toLocaleDateString()}`, margin + 5, y + 10);
  doc.text(`Sighting Time: ${report.sightingTime}`, margin + 65, y + 10);
  doc.text(`Risk Level: ${report.riskLevel}`, margin + 125, y + 10);
  y += 24;

  // ========== REPORTER INFORMATION ==========
  checkPageBreak(40);
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, "F");
  doc.setFontSize(9);
  doc.setTextColor(146, 64, 14);
  doc.setFont("helvetica", "bold");
  doc.text("REPORTER INFORMATION", margin + 5, y + 9);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(31, 41, 55);
  doc.text(`Name: ${report.userName}`, margin + 5, y + 18);
  doc.text(`Mobile: ${report.reporterMobile}`, margin + 70, y + 18);
  doc.text(`Alt Mobile: ${report.reporterAltMobile || 'N/A'}`, margin + 130, y + 18);
  doc.text(`Email: ${report.reporterEmail || 'N/A'}`, margin + 5, y + 26);
  y += 40;

  // ========== INCIDENT LOCATION ==========
  checkPageBreak(40);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, "F");
  doc.setTextColor(6, 78, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("INCIDENT LOCATION", margin + 5, y + 9);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(31, 41, 55);
  doc.text(`State: ${report.location.state}`, margin + 5, y + 18);
  doc.text(`District: ${report.location.district}`, margin + 55, y + 18);
  doc.text(`Pincode: ${report.location.pincode || 'N/A'}`, margin + 110, y + 18);
  doc.text(`Village: ${report.location.village}`, margin + 5, y + 26);
  doc.text(`Taluk: ${report.location.taluk}`, margin + 55, y + 26);
  doc.text(`Landmark: ${report.location.landmark}`, margin + 110, y + 26);
  y += 40;

  // ========== SPECIES INFORMATION ==========
  checkPageBreak(50);
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(margin, y, contentWidth, 45, 3, 3, "F");
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("SPECIES IDENTIFICATION", margin + 5, y + 9);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(report.reptileData.name, margin + 5, y + 20);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(107, 114, 128);
  doc.text(`(${report.reptileData.scientificName})`, margin + 5, y + 28);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  const venomText = report.reptileData.isVenomous ? 'VENOMOUS' : 'NON-VENOMOUS';
  doc.text(`Classification: ${venomText}  |  Danger Level: ${report.reptileData.dangerLevel}  |  Environment: ${report.location.locationType}`, margin + 5, y + 38);
  y += 52;

  // ========== SPECIES DESCRIPTION ==========
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(31, 41, 55);
  doc.text("SPECIES DESCRIPTION:", margin, y);
  y += 6;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const splitDesc = doc.splitTextToSize(report.reptileData.description, contentWidth);
  splitDesc.forEach((line: string) => {
    checkPageBreak(6);
    doc.text(line, margin, y);
    y += 5;
  });
  y += 8;

  // ========== SIGHTING PHOTOGRAPHS ==========
  if (report.imageUrls && report.imageUrls.length > 0) {
    checkPageBreak(60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    doc.text("SIGHTING PHOTOGRAPHS:", margin, y);
    y += 6;
    
    const imgSize = 42;
    const imgGap = 5;
    report.imageUrls.slice(0, 4).forEach((img, i) => {
      try {
        doc.addImage(img, "JPEG", margin + (i * (imgSize + imgGap)), y, imgSize, imgSize);
      } catch (e) {
        console.log('Could not add image to PDF');
      }
    });
    y += imgSize + 10;
  }

  // ========== OFFICER UPDATE STATUS ==========
  checkPageBreak(55);
  doc.setFillColor(219, 234, 254);
  const officerBoxHeight = report.updatedByOfficer ? 48 : 22;
  doc.roundedRect(margin, y, contentWidth, officerBoxHeight, 3, 3, "F");
  doc.setTextColor(30, 64, 175);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("WILDLIFE OFFICER DETAILS", margin + 5, y + 9);
  
  if (report.updatedByOfficer) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(31, 41, 55);
    doc.text(`Name: ${report.updatedByOfficer.name}`, margin + 5, y + 18);
    doc.text(`Designation: ${report.updatedByOfficer.designation || 'Wildlife Officer'}`, margin + 5, y + 26);
    doc.text(`Email: ${report.updatedByOfficer.email}`, margin + 5, y + 34);
    doc.text(`Mobile: ${report.updatedByOfficer.mobile}`, margin + 90, y + 34);
    doc.text(`Status Updated On: ${new Date(report.updatedByOfficer.updatedAt).toLocaleString()}`, margin + 5, y + 42);
    y += officerBoxHeight + 8;
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("Status not yet updated by any officer", margin + 5, y + 17);
    y += officerBoxHeight + 8;
  }

  // ========== RESCUE PHOTOGRAPHS ==========
  if (report.rescueImageUrls && report.rescueImageUrls.length > 0) {
    checkPageBreak(60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    doc.text("FIELD EVIDENCE (Rescue Photos):", margin, y);
    y += 6;
    
    const imgSize = 42;
    const imgGap = 5;
    report.rescueImageUrls.slice(0, 4).forEach((img, i) => {
      try {
        doc.addImage(img, "JPEG", margin + (i * (imgSize + imgGap)), y, imgSize, imgSize);
      } catch (e) {
        console.log('Could not add rescue image to PDF');
      }
    });
    y += imgSize + 10;
  }

  // ========== OFFICIAL REMARKS ==========
  checkPageBreak(25);
  doc.setFillColor(254, 249, 195);
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(133, 77, 14);
  doc.text("OFFICIAL REMARKS", margin + 5, y + 6);
  y += 12;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  const remarks = report.officerNotes || "No remarks provided by officer.";
  const splitNotes = doc.splitTextToSize(remarks, contentWidth);
  splitNotes.forEach((line: string) => {
    checkPageBreak(6);
    doc.text(line, margin, y);
    y += 5;
  });

  // ========== FOOTER ON ALL PAGES ==========
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(`ReptileGuard - Official Wildlife Conservation Record`, margin, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 8, { align: "center" });
  }

  doc.save(`ReptileGuard_Report_${report.id}.pdf`);
};
