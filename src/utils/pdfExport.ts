import { jsPDF } from 'jspdf';
import { PCBuild, Currency } from '../types/hardware';
import { calculateTotalPrice, checkCompatibility } from './compatibility';
import { estimateGameFps } from './benchmarks';

export function exportBuildToPdf(build: PCBuild, currency: Currency, buildName = 'My Custom PC'): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const { usd, uzs } = calculateTotalPrice(build);
  const compatibility = checkCompatibility(build);
  const benchmarks = estimateGameFps(build);

  // Background Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 40, 'F');

  // Title & Brand
  doc.setTextColor(6, 182, 212); // cyan-400
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ApexPC Builder', 15, 18);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Hardware Specification & Quotation Sheet', 15, 26);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 15, 33);
  doc.text(`Configuration: ${buildName}`, 130, 33);

  // System Compatibility Status Box
  let y = 48;
  const statusColor = compatibility.isCompatible ? [16, 185, 129] : [239, 68, 68]; // green or red
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(15, y, 180, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(
    compatibility.isCompatible
      ? '✓ 100% HARDWARE COMPATIBILITY VERIFIED'
      : `⚠ COMPATIBILITY ISSUES DETECTED (${compatibility.issues.length} alerts)`,
    20,
    y + 6.5
  );

  y += 18;

  // Components Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, 180, 8, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CATEGORY', 18, y + 5.5);
  doc.text('COMPONENT MODEL', 55, y + 5.5);
  doc.text('TDP', 145, y + 5.5);
  doc.text(currency === 'USD' ? 'PRICE (USD)' : 'PRICE (UZS)', 165, y + 5.5);

  y += 10;

  const categories: { key: keyof PCBuild; label: string }[] = [
    { key: 'cpu', label: 'Processor (CPU)' },
    { key: 'motherboard', label: 'Motherboard' },
    { key: 'ram', label: 'Memory (RAM)' },
    { key: 'gpu', label: 'Graphics Card (GPU)' },
    { key: 'storage', label: 'Storage Drive' },
    { key: 'psu', label: 'Power Supply (PSU)' },
    { key: 'case', label: 'Chassis / Case' },
    { key: 'cooler', label: 'Cooling System' },
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  categories.forEach((cat, index) => {
    const item = build[cat.key];
    const isAlt = index % 2 === 1;

    if (isAlt) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 4, 180, 8, 'F');
    }

    doc.setTextColor(71, 85, 105);
    doc.text(cat.label, 18, y + 1.5);

    if (item) {
      doc.setTextColor(15, 23, 42);
      const nameText = item.name.length > 44 ? item.name.substring(0, 42) + '...' : item.name;
      doc.text(nameText, 55, y + 1.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`${item.tdp}W`, 145, y + 1.5);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      const priceText = currency === 'USD' ? `$${item.priceUsd}` : `${item.priceUzs.toLocaleString()} UZS`;
      doc.text(priceText, 165, y + 1.5);
      doc.setFont('helvetica', 'normal');
    } else {
      doc.setTextColor(148, 163, 184);
      doc.text('Not selected', 55, y + 1.5);
      doc.text('-', 145, y + 1.5);
      doc.text('-', 165, y + 1.5);
    }

    y += 8.5;
  });

  // Total summary box
  y += 5;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y, 195, y);
  y += 7;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, 180, 24, 2, 2, 'F');

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.text(`Estimated System Peak Power: ~${compatibility.totalTdp}W`, 20, y + 7);
  doc.text(`Recommended Power Supply: >= ${compatibility.recommendedPsu}W`, 20, y + 14);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Total System Price:', 120, y + 10);
  doc.setTextColor(6, 182, 212);
  doc.setFontSize(14);
  const totalPriceFormatted = currency === 'USD' ? `$${usd.toLocaleString()}` : `${uzs.toLocaleString()} UZS`;
  doc.text(totalPriceFormatted, 160, y + 10);

  // Gaming FPS estimates section
  y += 32;
  doc.setFillColor(15, 23, 42);
  doc.rect(15, y, 180, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTIMATED GAMING PERFORMANCE (1080p ULTRA)', 18, y + 5);

  y += 9;
  doc.setFontSize(8.5);
  benchmarks.slice(0, 4).forEach((bench) => {
    doc.setTextColor(51, 65, 85);
    doc.text(bench.name, 20, y + 4);
    doc.setTextColor(6, 182, 212);
    doc.setFont('helvetica', 'bold');
    doc.text(`${bench.fps1080p} FPS (${bench.playability})`, 130, y + 4);
    doc.setFont('helvetica', 'normal');
    y += 6;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('ApexPC Builder • https://apexpcbuilder.com • Real-time AI Hardware Engine', 15, 285);

  // Save PDF
  doc.save(`${buildName.toLowerCase().replace(/\s+/g, '-')}-specs.pdf`);
}
