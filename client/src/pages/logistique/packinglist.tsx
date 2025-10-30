import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Save, FilePlus, RefreshCw, Check, Package, Truck, Plus, Copy, X, Trash2, Download, FileSpreadsheet, AlertCircle, Calendar, Weight, Box, MapPin, User, Shield, History, Eye, Calculator, Archive, ChevronDown, Search, Filter } from 'lucide-react';

type FormData = {
  origin: {
    companyName: string;
    address: string;
    city: string;
  };
  destination: {
    companyName: string;
    address: string;
    city: string;
  };
  transport: {
    truckNumber: string;
    chauffeurNumber: string;
    transporteur: string;
    scelle: string;
  };
  technicalDetails: {
    dateProduction: string;
    dateDeparture: string;
    lotNumbers: string;
    ggn: string;
    orderNumber: string;
    poidsNetTotal: string;
    poidsBrutTotal: string;
  };
  palletRows: Array<{
    numero: number;
    produit: string;
    calibre: string;
    paletteNr: string;
    caissesPerPalette: string;
  }>;
  calibreSummary: Record<string, { palettes: number; caisses: number }>;
  palletTypes: {
    type220: number;
    type264: number;
    type90: number;
    type210: number;
  };
};

const PackingListManager = () => {
  const [lots, setLots] = useState([
    {
      id: 'lot-1',
      lotNumber: 'PL-2025-001',
      status: 'en_cours',
      formData: {
        origin: {
          companyName: 'FRUITS FOR YOU',
          address: 'Lot N°14 Rez De Chaussée Zone Industrielle',
          city: 'Kénitra – Maroc'
        },
        destination: {
          companyName: 'AZ FRANCE',
          address: '18 Rue du Puits Dixme, 94320 Thiais',
          city: 'France'
        },
        transport: {
          truckNumber: 'TRK-1234',
          chauffeurNumber: 'CH-5678',
          transporteur: 'CAP MED',
          scelle: 'SCL-9012'
        },
        technicalDetails: {
          dateProduction: '2025-10-09',
          dateDeparture: '2025-10-10',
          lotNumbers: '5-01-1202FFY25A',
          ggn: '4063651496413',
          orderNumber: '24250134',
          poidsNetTotal: '12672',
          poidsBrutTotal: '13992'
        },
        palletRows: Array.from({ length: 15 }, (_, i) => ({
          numero: i + 1,
          produit: 'AVOCAT HASS BIO',
          calibre: ['16', '18', '20', '22', '24'][i % 5],
          paletteNr: (i + 1).toString(),
          caissesPerPalette: i % 2 === 0 ? '264' : '220'
        })),
        calibreSummary: {},
        palletTypes: { type220: 0, type264: 0, type90: 0, type210: 0 }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
  
  const [currentLotId, setCurrentLotId] = useState('lot-1');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; field: string } | null>(null);
  const [showCalculations, setShowCalculations] = useState(true);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [showPriceConfig, setShowPriceConfig] = useState(false);
  const [invoicePrices, setInvoicePrices] = useState<Record<string, number>>({});
  const [invoiceQuantities, setInvoiceQuantities] = useState<Record<string, number>>({});

  const produits = ['AVOCAT HASS BIO',
     'AVOCAT HASS CONV','AVOCAT ZUTANO BIO', 
     'AVOCAT ZUTANO CONV', 
     'AVOCAT HASS BIO - 12 4 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS BIO - 14 4 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS BIO - 16 4 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS BIO - 18 4 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS BIO - 20 4 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS BIO - 22 4 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS BIO - 24 4 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS BIO - 26 4 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS BIO - 28 4 KG produit certifié par CCPB MA-BIO-102',

    'AVOCAT HASS  CONVO - 12 4 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS  CONVO - 14 4 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS  CONVO - 16 4 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS  CONVO - 18 4 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS  CONVO - 20 4 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS  CONVO - 22 4 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS  CONVO - 24 4 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS  CONVO - 26 4 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS CONVO - 28 4 KG produit certifié par CCPB MA-BIO-102',

          'AVOCAT HASS BIO - 12 10 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS BIO - 14 10 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS BIO - 16 10 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS BIO - 18 10 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS BIO - 20 10 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS BIO - 22 10 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS BIO - 24 10 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS BIO - 26 10 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS BIO - 28 10 KG produit certifié par CCPB MA-BIO-102',

    'AVOCAT HASS  CONVO - 12 10 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS  CONVO - 14 10 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS  CONVO - 16 10 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS  CONVO - 18 10 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS  CONVO - 20 10 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS  CONVO - 22 10 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS  CONVO - 24 10 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS  CONVO - 26 10 KG produit certifié par CCPB MA-BIO-102',
     'AVOCAT HASS CONVO - 28 10 KG produit certifié par CCPB MA-BIO-102',

  ];
  const calibres = ['12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32'];
  const caissepallete = ['90', '108', '220', '264', '60' , '150' , '432', '372', '738', '324', '48']; // Fixed missing comma

  // Weight constants per box (kg)
  const WEIGHT_PER_BOX = {
    net: 0,
    brut: 0
  };

  // Generate a styled invoice (facture) PDF matching the provided template
  const generateInvoice = async () => {
    if (!currentData || !currentLot) return;
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF('p', 'mm', 'a4');

    const pageWidth = 210;
    const margin = 10;
    let y = margin;

    // Colors
    const yellow: [number, number, number] = [255, 204, 0];
    const darkText: [number, number, number] = [30, 30, 30];

    // Top yellow header band
    doc.setFillColor(161, 240, 161);
    doc.rect(0, 0, pageWidth, 30, 'F');

    // Logo area (left)
 // Logo area (left)
try {
  // Try loading a local logo if available
  const logoUrl = '/assets/logo.png';
  const res = await fetch(logoUrl)
    .then(r => r.blob())
    .then(b => new Promise((res2, rej) => {
      const fr = new FileReader();
      fr.onload = () => res2(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(b);
    }));

  if (res) {
    // Square logo (width = height)
    const logoSize = 20; // you can adjust this value (e.g. 24, 30)
    doc.addImage(String(res), 'PNG', margin + 3, 4, logoSize, logoSize);
  }
} catch (error) {
  console.error("Error loading logo:", error);
}

doc.setFontSize(18);
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'bold');
    doc.text('FRUITS FOR YOU ', pageWidth - margin - 165, 16);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    // Invoice title (right side)
    doc.setFontSize(18);
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - margin - 60, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice Date: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin - 60, 18);
    doc.text(`Invoice #: TRC-EXP-EU-BIO-25Q4-001`, pageWidth - margin - 60, 24);

    y = 36;

   // === From / To blocks (compact stacked layout) ===
const leftX = margin;
const midX = pageWidth / 2 + 10; // small shift to avoid touching the middle
doc.setFontSize(9);

// Titles
doc.setFont('helvetica', 'bold');
doc.text('FROM:', leftX, y);
doc.text('TO:', midX, y);

// FROM block
doc.setFont('helvetica', 'normal');
let fromY = y + 5;
const fromLines = [
  'FRUITS FOR YOU S.A.R.L AU',
  'Lot N° 14 Rez De Chaussée Zone Industrielle 14A Bir Rami Est',
  '                 Troisième Tranche - Kénitra - Maroc'
];
fromLines.forEach(line => {
  doc.text(line, leftX, fromY, { maxWidth: 80 }); // limit width for wrapping
  fromY += 4; // tighter spacing
});

// TO block
let toY = y + 8;
const toLines = [
  currentData.destination.companyName || '',
  currentData.destination.address || '',
  currentData.destination.city || ''
];
toLines.forEach(line => {
  doc.text(line, midX, toY, { maxWidth: 80 });
  toY += 4;
});

// Move down after both blocks
y = Math.max(fromY, toY) + 6;

// --- Poids Net / Poids Brut / Truck / Palettes / Order / Tracabilité ---
doc.setFontSize(9);
doc.setTextColor(...darkText);

let spacing = 5; // tighter vertical spacing between lines
let tY = y + 6;  // start under "TRANSPORT"

// Poids Net
doc.setFont('helvetica', 'bold');
doc.text('Poids Net:', leftX, tY);
doc.setFont('helvetica', 'normal');
doc.text(`${currentData.technicalDetails.poidsNetTotal || ''} KG`, leftX + 36, tY);

// Poids Brut
tY += spacing;
doc.setFont('helvetica', 'bold');
doc.text('Poids Brut:', leftX, tY);
doc.setFont('helvetica', 'normal');
doc.text(`${currentData.technicalDetails.poidsBrutTotal || ''} KG`, leftX + 36, tY);

// Truck Number
tY += spacing;
doc.setFont('helvetica', 'bold');
doc.text('Truck N°:', leftX, tY);
doc.setFont('helvetica', 'normal');
doc.text(`${currentData.technicalDetails.truckNumber || '6836-011'}`, leftX + 36, tY);

// Total Palettes
tY += spacing;
doc.setFont('helvetica', 'bold');
doc.text('Total Palettes:', leftX, tY);
doc.setFont('helvetica', 'normal');
  doc.text(`${calculations!.totalPallets || '22'}`, leftX + 36, tY);

// Order Number
tY += spacing;
doc.setFont('helvetica', 'bold');
doc.text('Order N°:', leftX, tY);
doc.setFont('helvetica', 'normal');
doc.text(`${currentData.technicalDetails.orderNumber || ''}`, leftX + 36, tY);

// Tracabilité Interne
tY += spacing;
doc.setFont('helvetica', 'bold');
doc.text('Internal Traceability:', leftX, tY);
doc.setFont('helvetica', 'normal');
doc.text('TRC-ORD-EU-BIO-25Q4-0001', leftX + 36, tY);

y = tY + 8; // update Y for next section


    // Table header - yellow
    const tableX = margin;
    const tableW = pageWidth - margin * 2;
    const colW = [tableW * 0.48, tableW * 0.12, tableW * 0.13, tableW * 0.12, tableW * 0.15];
    const colX = [tableX, tableX + colW[0], tableX + colW[0] + colW[1], tableX + colW[0] + colW[1] + colW[2], tableX + colW[0] + colW[1] + colW[2] + colW[3]];

    doc.setFillColor(161, 240, 161);
    doc.rect(tableX, y, tableW, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.setFontSize(10);
    doc.text('DESCRIPTION', colX[0] + 3, y + 7);
    doc.text('ORIGIN', colX[1] + 3, y + 7);
    doc.text('PRICE', colX[2] + 3, y + 7);
    doc.text('QUANTITIES', colX[3] + 3, y + 7);
    doc.text('AMOUNT', colX[4] + 3, y + 7);

    y += 12;

    // Aggregate rows by product+calibre+price
    const agg: Record<string, { produit: string; calibre: string; origin: string; price: number; qty: number; amount: number }> = {};
    // Build a map of aggregated quantities based on palletRows
    const rowQtyMap: Record<string, number> = {};
    (currentData.palletRows || []).forEach((r) => {
      const produit = r.produit || '';
      const calibre = r.calibre || '';
      const caisses = parseInt(r.caissesPerPalette || '0') || 0;
      const key = `${produit}||${calibre}`;
      rowQtyMap[key] = (rowQtyMap[key] || 0) + caisses;
    });

    // For each product+calibre, prefer invoiceQuantities override if present, otherwise use aggregated row qtys
    const keys = Array.from(new Set([...
      Object.keys(rowQtyMap),
      ...Object.keys(invoiceQuantities || {})
    ]));

    keys.forEach(kpc => {
      const [produit, calibre] = kpc.split('||');
      const keyPriceOnly = `${produit}||${calibre}`;
      const manualPrice = invoicePrices[keyPriceOnly];
      const fallbackPrice = parseFloat(String(currentData.technicalDetails?.unitPrice ?? '33.5')) || 33.5;
      const price = typeof manualPrice === 'number' ? manualPrice : fallbackPrice;
      const qtyFromRows = rowQtyMap[keyPriceOnly] || 0;
      const qtyOverride = invoiceQuantities[keyPriceOnly];
      const qty = typeof qtyOverride === 'number' ? qtyOverride : qtyFromRows;
      const key = `${produit}||${calibre}||${price}`;
      if (!agg[key]) agg[key] = { produit, calibre, origin: 'MOROCCO', price, qty: 0, amount: 0 };
      agg[key].qty += qty;
      agg[key].amount += price * qty;
    });
// Draw rows
doc.setFont('helvetica', 'normal');
doc.setFontSize(9);

let rowIndex = 0;
let totalQty = 0;
let totalAmount = 0;

for (const k of Object.keys(agg)) {
  const it = agg[k];

  // Create two-line description: main + certification
  const descMain = `${it.produit} - ${it.calibre} 10 KG produit certifié par CCPB MA-BIO-102 `;
  const descSub = `lot n° ${currentData.technicalDetails.lotNumbers || ''}`;

  // Determine row height based on description lines
  const rowH = 12; // increased height for two lines

  // Alternate row background
  if (rowIndex % 2 === 1) {
    doc.setFillColor(248, 248, 248);
    doc.rect(tableX, y - 1, tableW, rowH + 1, 'F');
  }

  // === Description (2 lines stacked) ===
  doc.setTextColor(...darkText);
  doc.setFontSize(8);
  doc.text(descMain, colX[0] + 3, y + 5);
  doc.text(descSub, colX[0] + 3, y + 10); // second line under it

  // === Other columns (center-aligned to first line) ===
  doc.text(it.origin, colX[1] + 3, y + 7);
  doc.text(it.price.toFixed(2) + ' €', colX[2] + colW[2] / 2, y + 7, { align: 'center' });
  doc.text(String(it.qty), colX[3] + colW[3] / 2, y + 7, { align: 'center' });
  doc.text(it.amount.toFixed(2) + ' €', colX[4] + colW[4] - 3, y + 7, { align: 'right' });

  // Move to next row
  y += rowH + 2;
  rowIndex++;
  totalQty += it.qty;
  totalAmount += it.amount;

  // Add new page if close to bottom
  if (y > 250) {
    doc.addPage();
    y = margin + 10;
  }
}


    // Totals block
    y += 6;
    const totalsX = tableX + tableW - 80;
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', totalsX, y);
    doc.text(String(totalQty), totalsX + 30, y, { align: 'center' });
    doc.text(totalAmount.toFixed(2) + ' €', totalsX + 70, y, { align: 'right' });

    // Transport fee (placeholder or from technicalDetails)
  const transportFee = parseFloat(String(currentData.technicalDetails?.transportFee ?? '0')) || 0;
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.text('Transport Fee', totalsX, y);
    doc.text(transportFee.toFixed(2) + ' €', totalsX + 70, y, { align: 'right' });

    // Final total invoice
    const invoiceTotal = totalAmount + transportFee;
    y += 9;
    doc.setFillColor(161, 240, 161);
    doc.rect(totalsX - 2, y - 6, 84, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(255, 255, 0);
    doc.text('TOTAL INVOICE', totalsX, y);
    doc.text(invoiceTotal.toFixed(2) + ' €', totalsX + 70, y, { align: 'right' });

    
// === Footer Section (sticks to bottom of A4 page) ===

// Define page height (A4 = 297mm)
const pageHeight = 297;
const footerHeight = 25; // total height for footer area
const bottomMargin = 10; // small space from bottom of page
const footerY = pageHeight - footerHeight - bottomMargin;

// Calculate previous sections dynamically above footer
const bankY = footerY - 25; // 25mm above footer
const paymentY = bankY - 25; // 25mm above bank section

doc.setFontSize(8);
doc.setFont('helvetica', 'normal');

// --- Payment note section ---
doc.text('NOTE:', margin, paymentY);
doc.text('Payment Term: Bank Transfer', margin, paymentY + 4);
doc.text('Payment Period: 50% Against documents - 50% after 1 week', margin, paymentY + 8);
doc.text('Product Global GAP certified: 4063651496413', margin, paymentY + 12);
doc.text('Incoterm: DAP', margin, paymentY + 16);

// --- Bank details section ---
doc.text('Bank Name: BMCE', margin, bankY);
doc.text('Account Number: 011 330 000012100007968 70', margin, bankY + 4);
doc.text('IBAN: MA64 0113 3300 0012 1000 7968 70', margin, bankY + 8);
doc.text('SWIFT: BMCEMAMC', margin, bankY + 12);

// --- Company info footer (yellow background) ---
doc.setFillColor(161, 240, 161); // yellow background
doc.rect(margin, footerY, pageWidth - 2 * margin, footerHeight, 'F'); // full-width footer rectangle

doc.setTextColor(0, 0, 0);
doc.setFontSize(8);
doc.setFont('helvetica', 'bold');
doc.text('« FRUITS FOR YOU SARL AU »', pageWidth / 2, footerY + 6, { align: 'center' });

doc.setFont('helvetica', 'normal');
doc.text(
  'LOT N° 14 Rez De Chaussée Zone Industrielle 14A Bir Rami Est Troisième Tranche - KENITRA - MAROC',
  pageWidth / 2,
  footerY + 10,
  { align: 'center' }
);
doc.text(
  'RC: 66947 PATENTE: 20116193 IF: 53212280 ICE: 003160557000032',
  pageWidth / 2,
  footerY + 14,
  { align: 'center' }
);
doc.text(
  'Téléphone: +212 608-107057 - Email: contact@fruitsforyou.ma - Site web: www.fruitsforyou.ma',
  pageWidth / 2,
  footerY + 18,
  { align: 'center' }
);



    const fileName = `Facture_${currentLot.lotNumber}_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(fileName);
  };

  const getCurrentLot = () => lots.find(lot => lot.id === currentLotId);
  const currentLot = getCurrentLot();
  const currentData = currentLot?.formData;

  // Real calculation function
  const calculateRealSummary = (rows: any[]) => {
    const calibreSummary = {};
    const palletTypes = { type220: 0, type264: 0, type90: 0, type210: 0 };
    let totalNet = 0;
    let totalBrut = 0;
    let totalPallets = 0;
    let totalBoxes = 0;

    rows.forEach(row => {
      if (row.calibre && row.caissesPerPalette) {
        const caisses = parseInt(row.caissesPerPalette) || 0;
        
        // Calibre summary
        if (!calibreSummary[row.calibre]) {
          calibreSummary[row.calibre] = { palettes: 0, caisses: 0 };
        }
        calibreSummary[row.calibre].palettes += 1;
        calibreSummary[row.calibre].caisses += caisses;

        // Pallet types count
        if (caisses === 220) palletTypes.type220++;
        else if (caisses === 264) palletTypes.type264++;
        else if (caisses === 90) palletTypes.type90++;
        else if (caisses === 210) palletTypes.type210++;

        // Weight calculations
        totalNet += caisses * WEIGHT_PER_BOX.net;
        totalBrut += caisses * WEIGHT_PER_BOX.brut;
        totalPallets++;
        totalBoxes += caisses;
      }
    });

    return {
      calibreSummary,
      palletTypes,
      poidsNetTotal: Math.round(totalNet).toString(),
      poidsBrutTotal: Math.round(totalBrut).toString(),
      totalPallets,
      totalBoxes,
      // legacy alias used in PDF code
      totalCaisses: totalBoxes
    };
  };

  // Update calculations when rows change
  useEffect(() => {
    if (currentData?.palletRows) {
      const calculations = calculateRealSummary(currentData.palletRows);
      setLots(prevLots => prevLots.map(lot => {
        if (lot.id === currentLotId) {
          return {
            ...lot,
            formData: {
              ...lot.formData,
              calibreSummary: calculations.calibreSummary,
              palletTypes: calculations.palletTypes,
              technicalDetails: {
                ...lot.formData.technicalDetails,
                poidsNetTotal: calculations.poidsNetTotal,
                poidsBrutTotal: calculations.poidsBrutTotal
              }
            },
            updatedAt: new Date().toISOString()
          };
        }
        return lot;
      }));
    }
  }, [currentData?.palletRows, currentLotId]);

  const updateField = (section: keyof FormData, field: string, value: any) => {
    setLots((prevLots) =>
      prevLots.map((lot) => {
        if (lot.id === currentLotId) {
          return {
            ...lot,
            formData: {
              ...lot.formData,
              [section]: {
                ...lot.formData[section],
                [field]: value,
              },
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return lot;
      })
    );
  };

  const updateRow = (rowIndex: number, field: string, value: any) => {
    setLots(prevLots => prevLots.map(lot => {
      if (lot.id === currentLotId) {
        const newRows = [...lot.formData.palletRows];
        newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };
        
        // Recalculate
        const calculations = calculateRealSummary(newRows);
        
        return {
          ...lot,
          formData: {
            ...lot.formData,
            palletRows: newRows,
            calibreSummary: calculations.calibreSummary,
            palletTypes: calculations.palletTypes,
            technicalDetails: {
              ...lot.formData.technicalDetails,
              poidsNetTotal: calculations.poidsNetTotal,
              poidsBrutTotal: calculations.poidsBrutTotal
            }
          },
          updatedAt: new Date().toISOString()
        };
      }
      return lot;
    }));
  };

  const addRow = () => {
    setLots(prevLots => prevLots.map(lot => {
      if (lot.id === currentLotId) {
        const newRows = [...lot.formData.palletRows, {
          numero: lot.formData.palletRows.length + 1,
          produit: 'AVOCAT HASS BIO',
          calibre: '16',
          paletteNr: (lot.formData.palletRows.length + 1).toString(),
          caissesPerPalette: '264'
        }];
        
        const calculations = calculateRealSummary(newRows);
        
        return {
          ...lot,
          formData: {
            ...lot.formData,
            palletRows: newRows,
            calibreSummary: calculations.calibreSummary,
            palletTypes: calculations.palletTypes,
            technicalDetails: {
              ...lot.formData.technicalDetails,
              poidsNetTotal: calculations.poidsNetTotal,
              poidsBrutTotal: calculations.poidsBrutTotal
            }
          }
        };
      }
      return lot;
    }));
  };

  const deleteRow = (rowIndex: number) => {
    setLots(prevLots => prevLots.map(lot => {
      if (lot.id === currentLotId) {
        const newRows = lot.formData.palletRows.filter((_, idx) => idx !== rowIndex);
        newRows.forEach((row, idx) => row.numero = idx + 1);
        
        const calculations = calculateRealSummary(newRows);
        
        return {
          ...lot,
          formData: {
            ...lot.formData,
            palletRows: newRows,
            calibreSummary: calculations.calibreSummary,
            palletTypes: calculations.palletTypes,
            technicalDetails: {
              ...lot.formData.technicalDetails,
              poidsNetTotal: calculations.poidsNetTotal,
              poidsBrutTotal: calculations.poidsBrutTotal
            }
          }
        };
      }
      return lot;
    }));
  };

  const createNewLot = () => {
    const newLot = {
      id: `lot-${Date.now()}`,
      lotNumber: `PL-2025-${String(lots.length + 1).padStart(3, '0')}`,
      status: 'brouillon',
      formData: {
        origin: { companyName: 'FRUITS FOR YOU', address: 'Lot N°14 Rez De Chaussée Zone Industrielle', city: 'Kénitra – Maroc' },
        destination: { companyName: 'AZ FRANCE', address: '18 Rue du Puits Dixme, 94320 Thiais', city: 'France' },
        transport: { truckNumber: '', chauffeurNumber: '', transporteur: 'CAP MED', scelle: '' },
        technicalDetails: {
          dateProduction: new Date().toISOString().split('T')[0],
          dateDeparture: new Date().toISOString().split('T')[0],
          lotNumbers: '', ggn: '4063651496413', orderNumber: '',
          poidsNetTotal: '0', poidsBrutTotal: '0'
        },
        palletRows: Array.from({ length: 10 }, (_, i) => ({
          numero: i + 1, produit: 'AVOCAT HASS BIO', calibre: '16',
          paletteNr: (i + 1).toString(), caissesPerPalette: '264'
        })),
        calibreSummary: {}, palletTypes: { type220: 0, type264: 0, type90: 0, type210: 0 }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLots([...lots, newLot]);
    setCurrentLotId(newLot.id);
    showSuccess('Nouveau lot créé avec succès!');
  };

  const duplicateLot = (lotId: string) => {
    const lotToDuplicate = lots.find(lot => lot.id === lotId);
    if (!lotToDuplicate) return;
    const newLot = {
      ...lotToDuplicate,
      id: `lot-${Date.now()}`,
      lotNumber: `${lotToDuplicate.lotNumber} (Copie)`,
      status: 'brouillon',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLots([...lots, newLot]);
    setCurrentLotId(newLot.id);
    showSuccess('Lot dupliqué avec succès!');
  };

  const deleteLot = (lotId: string) => {
    if (lots.length <= 1) {
      alert('Vous ne pouvez pas supprimer le dernier lot');
      return;
    }
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lot ?')) {
      const newLots = lots.filter(lot => lot.id !== lotId);
      setLots(newLots);
      if (currentLotId === lotId) {
        setCurrentLotId(newLots[0]?.id || '');
      }
      showSuccess('Lot supprimé avec succès!');
    }
  };

  const archiveLot = () => {
    setLots(prevLots => prevLots.map(lot => {
      if (lot.id === currentLotId) {
        return { ...lot, status: 'termine' };
      }
      return lot;
    }));
    showSuccess('Lot archivé avec succès!');
  };

  const resetForm = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser ce lot?")) {
      setLots(prevLots => prevLots.map(lot => {
        if (lot.id === currentLotId) {
          return {
            ...lot,
            formData: {
              ...lot.formData,
              palletRows: Array.from({ length: 10 }, (_, i) => ({
                numero: i + 1, produit: 'AVOCAT HASS BIO', calibre: '16',
                paletteNr: (i + 1).toString(), caissesPerPalette: '264'
              }))
            }
          };
        }
        return lot;
      }));
      showSuccess('Lot réinitialisé!');
    }
  };

  // Generate PDF
  const generatePDF = useCallback(async () => {
    if (!currentData) return;

    setIsGeneratingPDF(true);
    try {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const doc = new jsPDF('p', 'mm', 'a4');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 12;
        let yPos = margin;

        type RGBColor = [number, number, number];

        const colors: { [key: string]: RGBColor } = {
            headerGreen: [139, 195, 74],
            darkGreen: [100, 159, 56],
            sectionGreen: [200, 230, 201],
            text: [33, 33, 33],
            textSecondary: [117, 117, 117],
            border: [0, 0, 0],
            white: [255, 255, 255],
            rowStripe: [245, 248, 244],
            gridGray: [224, 224, 224]
        };

        // Header
        const headerBoxWidth = 46;
        const headerBoxX = pageWidth - margin - headerBoxWidth;

        // Enhanced company header with background shading and better alignment
        const headerHeight = 30;
        doc.setFillColor(245, 245, 245); // Light gray background
        doc.roundedRect(margin - 1, yPos - 1, pageWidth - 2 * margin + 2, headerHeight, 2, 2, 'F');

        // Company name and details
        doc.setTextColor(...colors.text);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('FRUITS FOR YOU', margin + 2, yPos + 8);

        // Subtitle with location
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.darkGreen);
        doc.text('Plateforme Industrielle Bouskoura - Maroc', margin + 2, yPos + 14);

        // Contact details in two columns
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...colors.textSecondary);
        doc.text('Téléphone: 05 22 38 48 53', margin + 2, yPos + 20);
        doc.text('Mobile: 06 61 71 43 85', margin + 70, yPos + 20);
        doc.text('Fax: +212 (0)5 22 96 58 66', margin + 2, yPos + 25);
        doc.text('Email: contact@fruitsforyou.ma', margin + 70, yPos + 25);

    // Green background for the header box
    doc.setFillColor(139, 195, 74);
    doc.roundedRect(headerBoxX, yPos - 2, headerBoxWidth, 30, 3, 3, 'F');

    // Try to load and draw the company logo inside the header box.
    // If loading fails (CORS or missing file), fall back to the rotated text.
    try {
      // Load the logo image and rotate it to appear as a vertical band in the header box.
      const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
      });

      const img = await loadImage(`${window.location.origin}/assets/logo.png`);

      // create an offscreen canvas and rotate the image -90deg so it fits vertically
      const padding = 4;
      const targetW = headerBoxWidth - padding * 2; // width of band area
      const targetH = 30 - padding * 2; // height inside header

      // To rotate, create canvas with swapped dims
      const canvas = document.createElement('canvas');
      canvas.width = targetH; // swapped
      canvas.height = targetW;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Fill background transparent then rotate and draw scaled image
      // Compute scale to fit image into target area when rotated
      const scale = Math.min(targetW / img.width, targetH / img.height, 1);
      const drawW = img.width * scale;
      const drawH = img.height * scale;

      // rotate canvas -90deg and draw
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      const rotatedData = canvas.toDataURL('image/png');

      const logoX = headerBoxX + padding;
      const logoY = yPos - 2 + padding;
      // When drawing rotated image we swapped dims: width should be targetW, height targetH
      doc.addImage(rotatedData, 'PNG', logoX, logoY, targetW, targetH);
    } catch (err) {
      // Fallback: rotated text label
      doc.setTextColor(...colors.white);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PACKING LIST', headerBoxX + headerBoxWidth / 2, yPos + 16, { align: 'center', angle: 90 });
    }
        
        yPos = 46;

  // Precompute calculations used by several sections
  const calculations = calculateRealSummary(currentData.palletRows);

  // Info Sections
        const drawInfoBox = (title: string, lines: string[], x: number, width: number) => {
            doc.setFontSize(7);
            const lineHeight = 4;
            const padding = 2;
            let totalTextHeight = 0;
            lines.forEach(line => {
                totalTextHeight += doc.splitTextToSize(line, width - padding * 2).length * lineHeight;
            });

            const boxHeight = 10 + totalTextHeight + padding * 2;
            
            doc.setDrawColor(...colors.gridGray);
            doc.setLineWidth(0.3);
            doc.setFillColor(...colors.white);
            doc.roundedRect(x, yPos, width, boxHeight, 2, 2, 'FD');

            doc.setFillColor(...colors.darkGreen);
            // FIX: The original code was attempting to use a version of roundedRect with 8 arguments to specify
            // which corners to round. This is not supported by the current jspdf version and was causing
            // an error. The code has been simplified to draw a header with all corners rounded.
            doc.roundedRect(x, yPos, width, 8, 2, 2, 'F');
            
            doc.setTextColor(...colors.white);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(title, x + width / 2, yPos + 5.5, { align: 'center' });
            
            doc.setTextColor(...colors.text);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            let lineY = yPos + 12;
            lines.forEach(line => {
                const splitLines = doc.splitTextToSize(line, width - padding * 2);
                doc.text(splitLines, x + padding, lineY);
                lineY += (splitLines.length * lineHeight);
            });

            return boxHeight;
        };

        const sectionWidth = 35;
        const gap = 3;
        const h1 = drawInfoBox('ORIGINE', [currentData.origin.companyName, currentData.origin.address, currentData.origin.city], margin, sectionWidth);
        const h2 = drawInfoBox('DESTINATION', [currentData.destination.companyName, currentData.destination.address, currentData.destination.city], margin + sectionWidth + gap, sectionWidth);
        const h3 = drawInfoBox('TRANSPORT', [`Camion: ${currentData.transport.truckNumber}`, `Chauffeur: ${currentData.transport.chauffeurNumber}`, `Transp: ${currentData.transport.transporteur}`, `Scelle: ${currentData.transport.scelle}`], margin + (sectionWidth + gap) * 2, sectionWidth);
        
        const techBoxWidth = 70;
        const h4 = drawInfoBox('Détails Techniques', [`Date Prod: ${currentData.technicalDetails.dateProduction}`, `Date Départ: ${currentData.technicalDetails.dateDeparture}`, `N° Lot: ${currentData.technicalDetails.lotNumbers}`, `GGN: ${currentData.technicalDetails.ggn}`, `Commande: ${currentData.technicalDetails.orderNumber}`, `Poids Net: ${currentData.technicalDetails.poidsNetTotal} KG`, `Poids Brut: ${currentData.technicalDetails.poidsBrutTotal} KG`], pageWidth - margin - techBoxWidth, techBoxWidth);
        
        const maxBoxHeight = Math.max(h1, h2, h3, h4);
        yPos += maxBoxHeight + 10;

        // Pallet Details Table
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...colors.darkGreen);
        doc.text('DÉTAILS DES PALETTES', margin, yPos);
        yPos += 6;

  // calculations already computed above
  const head = [['N°', 'Produit', 'Calibre', 'Qté Pal', 'Caisses/Pal', 'Total Caisse']];
        const body = currentData.palletRows.map(row => {
            const qty = parseInt(row.paletteNr || '0') || 0;
            const caisses = parseInt(row.caissesPerPalette || '0') || 0;
            return [row.numero, row.produit, row.calibre, row.paletteNr, row.caissesPerPalette, (qty * caisses).toString()];
        });
  const foot = [['', 'TOTAL', '', calculations.totalPallets.toString(), '', calculations.totalCaisses.toString()]];

        autoTable(doc, {
            startY: yPos,
            // Table content
            head,
            body,
            foot,
            theme: 'plain',
            // Enhanced table styling
            headStyles: {
                fillColor: colors.darkGreen,
                textColor: colors.white,
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 9,
                cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
            },
            footStyles: {
                fillColor: colors.sectionGreen,
                textColor: colors.text,
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 9,
                cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
            },
            styles: {
                fontSize: 8,
                cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
                lineWidth: 0.1,
                lineColor: colors.gridGray,
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 12, fontStyle: 'bold' },
                1: { halign: 'left', cellWidth: 72 },
                2: { halign: 'center', cellWidth: 22 },
                3: { halign: 'center', cellWidth: 28 },
                4: { halign: 'center', cellWidth: 28 },
                5: { halign: 'center', cellWidth: 24, fontStyle: 'bold' },
            },
            alternateRowStyles: {
                fillColor: [248, 250, 247],
            },
            // Table border and cell styling
            tableLineWidth: 0.3,
            tableLineColor: [200, 200, 200],
            margin: { top: 4, bottom: 4 },
            didDrawCell: function(data: any) {
                // Add subtle inner shadow to header cells
                if (data.row.index === 0 && data.section === 'head') {
                    const x = data.cell.x;
                    const y = data.cell.y;
                    const w = data.cell.width;
                    const h = data.cell.height;
                    doc.setFillColor(0, 0, 0, 0.1);
                    doc.rect(x, y + h - 1, w, 1, 'F');
                }
            },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
        
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = margin;
        }

    // Summary Section (enhanced UI)
    const summaryBoxWidth = (pageWidth - 2 * margin) / 2 - gap / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...colors.darkGreen);
    // Title
    doc.text('RÉSUMÉ', margin, yPos);
    yPos += 6;

    const summaryY = yPos;
    const leftX = margin;
    const rightX = margin + summaryBoxWidth + gap;

    // Left column: Autres calibres + Calibre C boxed
    const leftBoxWidth = summaryBoxWidth;
    // compute height needed for left content
    const calibreEntries = Object.entries((calculations as any).calibreSummary || {});
    const autres = calibreEntries.filter(([cal, data]) => (cal as string).toUpperCase() !== 'C' && (data as any).palettes > 0);
    const leftLines = Math.max(3, autres.length);
    const leftBoxHeight = 10 + leftLines * 6 + 30; // extra space for C section

    doc.setDrawColor(...colors.gridGray);
    doc.setLineWidth(0.3);
    doc.setFillColor(...colors.white);
    doc.roundedRect(leftX, summaryY, leftBoxWidth, leftBoxHeight, 3, 3, 'FD');

    // AUTRES CALIBRES header
    let cursorY = summaryY + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...colors.text);
    doc.text('AUTRES CALIBRES', leftX + 6, cursorY);
    cursorY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    // Draw each calibre as a small line with pill for counts
    autres.forEach(([cal, data], idx) => {
      const d = data as any;
      const text = `Calibre ${cal}`;
      doc.text(text, leftX + 8, cursorY + 3);
      // pill for palettes and caisses on the right inside the box
      const pillW = 56;
      const pillH = 7;
      const pillX = leftX + leftBoxWidth - pillW - 8;
      const pillY = cursorY - 3;
      // pill background: white with green border for contrast
      doc.setFillColor(...colors.white);
      doc.setDrawColor(...colors.darkGreen);
      doc.setLineWidth(0.4);
      doc.roundedRect(pillX, pillY, pillW, pillH, 2, 2, 'FD');
      doc.setFontSize(7);
      doc.setTextColor(...colors.darkGreen);
      doc.setFont('helvetica', 'bold');
      doc.text(`${d.palettes} pl`, pillX + 6, pillY + pillH - 1);
      doc.setFont('helvetica', 'normal');
      doc.text(`${d.caisses} cs`, pillX + pillW - 10, pillY + pillH - 1, { align: 'right' });
      // subtle separator line below each calibre except last
      if (idx < autres.length - 1) {
        doc.setDrawColor(...colors.gridGray);
        doc.setLineWidth(0.2);
        doc.line(leftX + 6, cursorY + 6, leftX + leftBoxWidth - 6, cursorY + 6);
      }
      cursorY += 12;
    });

    // Small spacing
    cursorY += 6;

    // Calibre C box (Clementines)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...colors.text);
    doc.text('CALIBRE C (CLEMENTINES)', leftX + 6, cursorY);
    cursorY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const cData = (calculations as any).calibreSummary?.['C'] || { palettes: 0, caisses: 0 };
    doc.text(`Palettes: ${cData.palettes}`, leftX + 8, cursorY);
    doc.text(`Caisses: ${cData.caisses}`, leftX + 8, cursorY + 6);

    // Right column: Totals box
    const rightBoxWidth = summaryBoxWidth;
    const rightBoxHeight = leftBoxHeight;
    const rightBoxTop = summaryY;
    doc.setFillColor(...colors.sectionGreen);
    doc.setDrawColor(...colors.darkGreen);
    doc.setLineWidth(0.4);
    doc.roundedRect(rightX, rightBoxTop, rightBoxWidth, rightBoxHeight, 4, 4, 'F');

  // Totals content (white text on green)
  let rx = rightX + 12;
  let ry = rightBoxTop + 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.white);
  doc.text('TOTAL CLEMENTINES', rx, ry);
  ry += 10;
  // Big numeric palettes / caisses
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${(calculations as any).totalPallets}`, rx, ry);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Palettes', rx + 22, ry - 2);
  ry += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${(calculations as any).totalCaisses}`, rx, ry);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Caisses', rx + 22, ry - 2);
  ry += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('POIDS TOTAL', rx, ry);
  ry += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Net: ${currentData.technicalDetails.poidsNetTotal} KG`, rx, ry);
  ry += 6;
  doc.text(`Brut: ${currentData.technicalDetails.poidsBrutTotal} KG`, rx, ry);

    // move yPos below summary boxes
    yPos = summaryY + Math.max(leftBoxHeight, rightBoxHeight) + 10;

        // Enhanced Footer with gradient line and better spacing
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Gradient footer line
            const footerY = pageHeight - 15;
            doc.setFillColor(...colors.darkGreen);
            doc.rect(margin, footerY, pageWidth - 2 * margin, 0.5, 'F');
            
            // Footer text with better spacing and alignment
            doc.setFontSize(7.5);
            doc.setTextColor(...colors.textSecondary);
            doc.setFont('helvetica', 'normal');
            
            // Three-column footer layout
            const footerTextY = footerY + 6;
            doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, margin, footerTextY);
            
            if (pageCount > 1) {
                doc.text(`Page ${i} sur ${pageCount}`, pageWidth / 2, footerTextY, { align: 'center' });
            }
            
            // Copyright with small logo/icon
            doc.setFont('helvetica', 'bold');
            doc.text('FRUITS FOR YOU', pageWidth - margin - 25, footerTextY);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.text('© 2025', pageWidth - margin, footerTextY, { align: 'right' });
        }

        doc.save(`PackingList_${currentData.technicalDetails.lotNumbers || 'NOLOT'}_${new Date().toISOString().split('T')[0]}.pdf`);

  setShowSuccessMessage(true);
  setTimeout(() => setShowSuccessMessage(false), 3000);

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Erreur lors de la génération du PDF');
    } finally {
        setIsGeneratingPDF(false);
    }
}, [currentData]);

  // Generate Excel/CSV
  const generateExcel = () => {
    if (!currentData || !currentLot) return;
    
    setIsGeneratingExcel(true);
    try {
      let csv = 'PACKING LIST - FRUITS FOR YOU\n';
      csv += `Lot: ${currentLot.lotNumber}\n`;
      csv += `Date: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
      
      csv += 'ORIGINE\n';
      csv += `${currentData.origin.companyName}\n`;
      csv += `${currentData.origin.address}\n`;
      csv += `${currentData.origin.city}\n\n`;
      
      csv += 'DESTINATION\n';
      csv += `${currentData.destination.companyName}\n`;
      csv += `${currentData.destination.address}\n`;
      csv += `${currentData.destination.city}\n\n`;
      
      csv += 'TRANSPORT\n';
      csv += `Truck N°,${currentData.transport.truckNumber}\n`;
      csv += `Chauffeur N°,${currentData.transport.chauffeurNumber}\n`;
      csv += `Transporteur,${currentData.transport.transporteur}\n`;
      csv += `Scellé,${currentData.transport.scelle}\n\n`;
      
      csv += 'DETAILS TECHNIQUES\n';
      csv += `Date Production,${currentData.technicalDetails.dateProduction}\n`;
      csv += `Date Departure,${currentData.technicalDetails.dateDeparture}\n`;
      csv += `Lot Numbers,${currentData.technicalDetails.lotNumbers}\n`;
      csv += `GGN,${currentData.technicalDetails.ggn}\n`;
      csv += `Order N°,${currentData.technicalDetails.orderNumber}\n`;
      csv += `Poids Net Total,${currentData.technicalDetails.poidsNetTotal} KG\n`;
      csv += `Poids Brut Total,${currentData.technicalDetails.poidsBrutTotal} KG\n\n`;
      
      csv += 'PALETTES\n';
      csv += 'N°,Produit,Calibre,Palette Nr,Caisses/Palette\n';
      currentData.palletRows.forEach(row => {
        csv += `${row.numero},${row.produit},${row.calibre},${row.paletteNr},${row.caissesPerPalette}\n`;
      });
      
      csv += '\nCALIBRE SUMMARY\n';
      csv += 'Calibre,Palettes,Caisses\n';
      const calculations = calculateRealSummary(currentData.palletRows);
      Object.entries(calculations.calibreSummary).forEach(([cal, data]) => {
        const typedData = data as { palettes: number; caisses: number };
        if (typedData.palettes > 0) {
          csv += `${cal},${typedData.palettes},${typedData.caisses}\n`;
        }
      });
      
      csv += '\nPALLET TYPES\n';
      csv += `Type 90,${calculations.palletTypes.type90}\n`;
      csv += `Type 210,${calculations.palletTypes.type210}\n`;
      csv += `Type 220,${calculations.palletTypes.type220}\n`;
      csv += `Type 264,${calculations.palletTypes.type264}\n`;
      csv += `Total,${calculations.totalPallets}\n`;
      
      // Create download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `PackingList_${currentLot.lotNumber}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess('Fichier Excel généré avec succès!');
      
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Erreur lors de la génération du fichier Excel');
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  // Fixing implicit 'any' types
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const getStatusConfig = (status: 'en_cours' | 'brouillon' | 'termine') => {
    const configs = {
      brouillon: { label: 'Brouillon', bg: 'bg-gray-100', text: 'text-gray-700', ring: 'ring-gray-300' },
      en_cours: { label: 'En cours', bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-300' },
      termine: { label: 'Terminé', bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-300' },
    };
    return configs[status];
  };

  // Excel-style keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentData && rowIndex < currentData.palletRows.length - 1) {
        setSelectedCell({ row: rowIndex + 1, field });
      }
    } else if (e.key === 'Escape') {
      setSelectedCell(null);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const fields = ['produit', 'calibre', 'paletteNr', 'caissesPerPalette'];
      const currentFieldIndex = fields.indexOf(field);
      const nextField = fields[currentFieldIndex + 1];
      if (nextField) {
        setSelectedCell({ row: rowIndex, field: nextField });
      } else if (currentData && rowIndex < currentData.palletRows.length - 1) {
        setSelectedCell({ row: rowIndex + 1, field: fields[0] });
      }
    }
  };

  const calculations = currentData ? calculateRealSummary(currentData.palletRows) : null;

  if (lots.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-md shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-emerald-600 rounded-md flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-3">Aucune liste d'emballage</h2>
            <p className="text-gray-600 mb-8 text-lg">Créez votre première liste pour commencer à gérer vos expéditions d'avocats</p>
            <button
              onClick={createNewLot}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 font-medium transition-colors"
            >
              <Plus size={20} />
              Créer la première liste
            </button>
          </div>
        </div>
      </div>
    );
  }

  const saveData = () => {
    setIsSaving(true);
    // Simulate saving data to localStorage
    localStorage.setItem('packing_lists', JSON.stringify(lots));
    setTimeout(() => {
      setIsSaving(false);
      showSuccess('Données sauvegardées avec succès!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-md flex items-center justify-center shadow-sm">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Packing List Manager</h1>
                <p className="text-sm text-gray-500">Plateforme industrielle d'exportation d'avocats • {lots.length} lot(s)</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 font-medium transition-colors"
              >
                <History size={18} />
                <span className="hidden sm:inline">Historique</span>
              </button>
              <button
                onClick={createNewLot}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 font-medium transition-colors"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Nouvelle Liste</span>
              </button>
            </div>
          </div>

          {/* Lot Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {lots.map((lot) => {
              const statusConfig = getStatusConfig(lot.status as 'en_cours' | 'brouillon' | 'termine');
              const isActive = currentLotId === lot.id;
              
              return (
                <div 
                  key={lot.id} 
                  className={`flex items-center rounded-md overflow-hidden min-w-fit transition-all ${
                    isActive ? 'ring-2 ring-emerald-500 shadow-sm' : 'shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => setCurrentLotId(lot.id)}
                    className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Truck size={16} />
                    <div className="text-left">
                      <div className="font-medium text-sm whitespace-nowrap">{lot.lotNumber}</div>
                      <div className="text-xs opacity-75">{lot.formData.technicalDetails.orderNumber || 'Sans commande'}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-md font-medium ${
                      isActive ? 'bg-white/20 text-white' : `${statusConfig.bg} ${statusConfig.text}`
                    }`}>
                      {statusConfig.label}
                    </span>
                  </button>

                  <div className="flex bg-gray-50 border-l border-gray-200">
                    <button
                      onClick={() => duplicateLot(lot.id)}
                      className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Dupliquer"
                      aria-label="Dupliquer le lot"
                    >
                      <Copy size={16} />
                    </button>
                    {lots.length > 1 && (
                      <button
                        onClick={() => deleteLot(lot.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors border-l border-gray-200"
                        title="Supprimer"
                        aria-label="Supprimer le lot"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white border border-emerald-200 rounded-md shadow-lg p-4 flex items-center gap-3 animate-slide-in">
          <div className="w-8 h-8 bg-emerald-100 rounded-md flex items-center justify-center">
            <Check className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Succès!</p>
            <p className="text-sm text-gray-600">{successMessage}</p>
          </div>
        </div>
      )}

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowHistory(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <History size={20} />
                  Historique ({lots.length})
                </h2>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded-md" aria-label="Fermer">
                  <X size={20} />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setHistoryFilter('all')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    historyFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Tous ({lots.length})
                </button>
                <button
                  onClick={() => setHistoryFilter('termine')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    historyFilter === 'termine' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Archivés ({lots.filter(l => l.status === 'termine').length})
                </button>
              </div>
            </div>
            <div className="p-6 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              {lots
                .filter(lot => historyFilter === 'all' || lot.status === historyFilter)
                .map(lot => {
                  const statusConfig = getStatusConfig(lot.status as 'en_cours' | 'brouillon' | 'termine');
                  return (
                    <div key={lot.id} className="p-4 border border-gray-200 rounded-md hover:border-emerald-300 cursor-pointer transition-colors" onClick={() => {
                      setCurrentLotId(lot.id);
                      setShowHistory(false);
                    }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-900">{lot.lotNumber}</div>
                        <span className={`px-2 py-1 text-xs rounded-md font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Commande: {lot.formData.technicalDetails.orderNumber || 'N/A'}</div>
                        <div>Palettes: {calculateRealSummary(lot.formData.palletRows).totalPallets}</div>
                        <div>Modifié: {new Date(lot.updatedAt).toLocaleDateString('fr-FR')}</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Action Bar */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setShowGenerateModal(true)}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <FilePlus size={18} />
                  Générer PDF
                </>
              )}
            </button>
            
            <button 
              onClick={generateExcel}
              disabled={isGeneratingExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingExcel ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <FileSpreadsheet size={18} />
                  Excel
                </>
              )}
            </button>

            <button
              onClick={async () => {
                try {
                  setIsGeneratingPDF(true);
                  await generateInvoice();
                } catch (e) {
                  console.error('Invoice generation error', e);
                } finally {
                  setIsGeneratingPDF(false);
                }
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-medium transition-colors"
            >
              <FilePlus size={18} />
              Générer Facture
            </button>
            <button
              onClick={() => setShowPriceConfig(!showPriceConfig)}
              className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 font-medium transition-colors"
            >
              <Calculator size={18} />
              Configurer Prix
            </button>
            
            <button 
              onClick={saveData}
              disabled={isSaving}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Sauvegarder
                </>
              )}
            </button>

            <button 
              onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 font-medium transition-colors"
            >
              <RefreshCw size={18} />
              Réinitialiser
            </button>
            
            <button 
              onClick={archiveLot}
              className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 font-medium transition-colors"
            >
              <Archive size={18} />
              Archiver
            </button>

            <button
              onClick={() => setShowCalculations(!showCalculations)}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 font-medium transition-colors"
            >
              <Calculator size={18} />
              {showCalculations ? 'Masquer' : 'Afficher'} calculs
            </button>
          </div>
        </div>

        {/* Generate PDF confirmation modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setShowGenerateModal(false)}>
            <div className="bg-white rounded-md shadow-lg w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-2">Générer PDF</h3>
              <p className="text-sm text-gray-600 mb-4">Vérifiez les totaux ci-dessous avant de générer le PDF.</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-gray-50 rounded border">
                  <div className="text-xs text-gray-500">Palettes totales</div>
                  <div className="text-xl font-bold">{calculations?.totalPallets ?? 0}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <div className="text-xs text-gray-500">Caisses totales</div>
                  <div className="text-xl font-bold">{calculations?.totalBoxes ?? 0}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setShowGenerateModal(false)} className="px-4 py-2 border rounded-md">Annuler</button>
                <button
                  onClick={async () => {
                    setShowGenerateModal(false);
                    try {
                      // call the existing generator (it already sets isGeneratingPDF)
                      await generatePDF();
                    } catch (err) {
                      console.error('PDF generation failed', err);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  {isGeneratingPDF ? 'Génération...' : 'Confirmer et générer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Cards Grid */}
        {/* Price Config Panel */}
        {showPriceConfig && currentData && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Configurer les prix de la facture</h3>
                <div className="flex gap-2">
                  <button onClick={() => {
                    // reset prices
                    setInvoicePrices({});
                  }} className="px-3 py-1 bg-gray-100 rounded-md">Réinitialiser</button>
                    <button onClick={() => {
                      // Apply AVOCAT HASS BIO preset: calibres 12..32 step 2 with price 33.5
                      const presetCalibres = ['12','14','16','18','20','22','24','26','28','30','32'];
                      const newPrices: Record<string, number> = { ...(invoicePrices || {}) };
                      const newQuantities: Record<string, number> = { ...(invoiceQuantities || {}) };
                      // User-supplied quantities (from the request)
                      const supplied: Record<string, number> = {
                        '12': 0,
                        '14': 0,
                        '16': 748,
                        '18': 704,
                        '20': 748,
                        '22': 704,
                        '24': 748,
                        '26': 0,
                        '28': 0,
                        '30': 0,
                        '32': 0
                      };
                      presetCalibres.forEach(c => {
                        const key = `AVOCAT HASS BIO||${c}`;
                        // set price to 33.5 for all calibres
                        newPrices[key] = 33.5;
                        // set quantity to supplied value or 0 (ensures an entry exists for all calibres)
                        newQuantities[key] = typeof supplied[c] === 'number' ? supplied[c] : (newQuantities[key] || 0);
                      });
                      setInvoicePrices(newPrices);
                      setInvoiceQuantities(newQuantities);
                      // compute total applied
                      const totalApplied = Object.values(newQuantities).reduce((s, v) => s + (v || 0), 0);
                      const appliedList = presetCalibres.map(c => `${c}:${newQuantities[`AVOCAT HASS BIO||${c}`] || 0}`).join(', ');
                      showSuccess(`Prix 33.5€ appliqués. Total caisses: ${totalApplied} (${appliedList})`);
                    }} className="px-3 py-1 bg-emerald-600 text-white rounded-md">Importer quantités AVOCAT</button>
                  <button onClick={() => setShowPriceConfig(false)} className="px-3 py-1 bg-emerald-600 text-white rounded-md">Fermer</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(() => {
                  const agg: Record<string, { produit: string; calibre: string; qty: number }> = {};
                  (currentData.palletRows || []).forEach((r) => {
                    const produit = r.produit || '';
                    const calibre = r.calibre || '';
                    const caisses = parseInt(r.caissesPerPalette || '0') || 0;
                    const key = `${produit}||${calibre}`;
                    if (!agg[key]) agg[key] = { produit, calibre, qty: 0 };
                    agg[key].qty += caisses;
                  });

                  return Object.keys(agg).map((k) => {
                    const it = agg[k];
                    const currentPrice = invoicePrices[k] ?? 33.5;
                    return (
                      <div key={k} className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <div className="font-medium text-sm">{it.produit} - {it.calibre}</div>
                          <div className="text-xs text-gray-500">Quantité: {it.qty}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={String(currentPrice)}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value) || 0;
                              setInvoicePrices(prev => ({ ...prev, [k]: v }));
                            }}
                            className="w-28 p-1 border rounded-md text-right"
                            step="0.01"
                          />
                          <span className="text-sm">€</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Origin Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-emerald-600 px-4 py-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-white" />
              <h3 className="font-semibold text-white">Origine</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Entreprise</label>
                <input
                  type="text"
                  value={currentData?.origin.companyName}
                  onChange={(e) => updateField('origin', 'companyName', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors"
                  placeholder="Nom de l'entreprise"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Adresse</label>
                <input
                  type="text"
                  value={currentData?.origin.address}
                  onChange={(e) => updateField('origin', 'address', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Ville</label>
                <input
                  type="text"
                  value={currentData?.origin.city}
                  onChange={(e) => updateField('origin', 'city', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Destination Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-700 px-4 py-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-white" />
              <h3 className="font-semibold text-white">Destination</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Entreprise</label>
                <input
                  type="text"
                  value={currentData?.destination.companyName}
                  onChange={(e) => updateField('destination', 'companyName', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Adresse</label>
                <input
                  type="text"
                  value={currentData?.destination.address}
                  onChange={(e) => updateField('destination', 'address', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Ville</label>
                <input
                  type="text"
                  value={currentData?.destination.city}
                  onChange={(e) => updateField('destination', 'city', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Transport Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-amber-500 px-4 py-3 flex items-center gap-2">
              <Truck className="h-5 w-5 text-white" />
              <h3 className="font-semibold text-white">Transport</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Camion N°</label>
                <input
                  type="text"
                  value={currentData?.transport.truckNumber}
                  onChange={(e) => updateField('transport', 'truckNumber', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Chauffeur N°</label>
                <input
                  type="text"
                  value={currentData?.transport.chauffeurNumber}
                  onChange={(e) => updateField('transport', 'chauffeurNumber', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Transporteur</label>
                <input
                  type="text"
                  value={currentData?.transport.transporteur}
                  onChange={(e) => updateField('transport', 'transporteur', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Scellé</label>
                <input
                  type="text"
                  value={currentData?.transport.scelle}
                  onChange={(e) => updateField('transport', 'scelle', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
            <Box className="h-5 w-5 text-white" />
            <h3 className="font-semibold text-white">Détails Techniques</h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Date Production</label>
              <input
                type="date"
                value={currentData?.technicalDetails.dateProduction}
                onChange={(e) => updateField('technicalDetails', 'dateProduction', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Date Départ</label>
              <input
                type="date"
                value={currentData?.technicalDetails.dateDeparture}
                onChange={(e) => updateField('technicalDetails', 'dateDeparture', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">N° Lot</label>
              <input
                type="text"
                value={currentData?.technicalDetails.lotNumbers}
                onChange={(e) => updateField('technicalDetails', 'lotNumbers', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">GGN</label>
              <input
                type="text"
                value={currentData?.technicalDetails.ggn}
                onChange={(e) => updateField('technicalDetails', 'ggn', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Commande N°</label>
              <input
                type="text"
                value={currentData?.technicalDetails.orderNumber}
                onChange={(e) => updateField('technicalDetails', 'orderNumber', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1 flex items-center gap-1">
                <Weight size={14} />
                Poids Net (KG)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={currentData?.technicalDetails.poidsNetTotal}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0).toString();
                  updateField('technicalDetails', 'poidsNetTotal', value);
                }}
                className="w-full px-3 py-2 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold"
                placeholder="Entrer le poids net"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1 flex items-center gap-1">
                <Weight size={14} />
                Poids Brut (KG)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={currentData?.technicalDetails.poidsBrutTotal}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0).toString();
                  updateField('technicalDetails', 'poidsBrutTotal', value);
                }}
                className="w-full px-3 py-2 rounded-md border border-amber-200 bg-amber-50 text-amber-700 font-semibold"
                placeholder="Entrer le poids brut"
              />
            </div>
          </div>
        </div>

        {/* Excel-Style Pallet Table */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="h-5 w-5 text-white" />
              <h3 className="font-semibold text-white">Détails des Palettes</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-white text-sm font-medium bg-white/20 px-3 py-1 rounded-md">
                {calculations?.totalPallets || 0} palettes • {calculations?.totalBoxes || 0} caisses
              </div>
              <button
                onClick={addRow}
                className="bg-white text-emerald-600 px-3 py-1 rounded-md hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-white font-medium text-sm flex items-center gap-1"
              >
                <Plus size={16} />
                Ajouter
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-16">N°</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Produit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Calibre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">quantity N°</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-40">Caisses/Palette</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-32">Total caisses</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentData?.palletRows.map((row, idx) => (
                  <tr 
                    key={idx} 
                    className={`hover:bg-emerald-50 transition-colors ${
                      selectedCell?.row === idx ? 'bg-emerald-50' : ''
                    }`}
                  >
                    <td className="px-4 py-2">
                      <div className="w-8 h-8 bg-emerald-600 rounded-md flex items-center justify-center text-white font-semibold text-sm">
                        {row.numero}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={row.produit}
                        onChange={(e) => updateRow(idx, 'produit', e.target.value)}
                        onFocus={() => setSelectedCell({ row: idx, field: 'produit' })}
                        onKeyDown={(e) => handleKeyDown(e, idx, 'produit')}
                        className="w-full px-2 py-1.5 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors text-sm"
                      >
                        {produits.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={row.calibre}
                        onChange={(e) => updateRow(idx, 'calibre', e.target.value)}
                        onFocus={() => setSelectedCell({ row: idx, field: 'calibre' })}
                        onKeyDown={(e) => handleKeyDown(e, idx, 'calibre')}
                        className="w-full px-2 py-1.5 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors text-sm font-semibold"
                      >
                        {calibres.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        value={row.paletteNr}
                        onChange={(e) => {
                          const value = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0).toString();
                          updateRow(idx, 'paletteNr', value);
                        }}
                        onFocus={() => setSelectedCell({ row: idx, field: 'paletteNr' })}
                        onKeyDown={(e) => handleKeyDown(e, idx, 'paletteNr')}
                        className="w-full px-2 py-1.5 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors text-center font-semibold text-sm"
                        placeholder="Quantité"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        value={row.caissesPerPalette}
                        onChange={(e) => {
                          const value = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0).toString();
                          updateRow(idx, 'caissesPerPalette', value);
                        }}
                        onFocus={() => setSelectedCell({ row: idx, field: 'caissesPerPalette' })}
                        onKeyDown={(e) => handleKeyDown(e, idx, 'caissesPerPalette')}
                        className="w-full px-2 py-1.5 rounded-md border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors text-center font-semibold text-sm"
                        placeholder="Nombre de caisses"
                      />
                    </td>
                    <td className="px-4 py-2 text-center font-semibold">
                      {((parseInt(row.paletteNr || '0') || 0) * (parseInt(row.caissesPerPalette || '0') || 0)).toString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => deleteRow(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Supprimer la ligne"
                        aria-label="Supprimer la ligne"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <span>💡 Astuce: Utilisez Tab/Enter pour naviguer rapidement entre les cellules (style Excel)</span>
            </div>
          </div>
        </div>

        {/* Real Calculations Summary */}
        {showCalculations && calculations && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Calibre Summary */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-emerald-600 px-4 py-3 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-white" />
                <h3 className="font-semibold text-white">Résumé par Calibre</h3>
              </div>
              <div className="p-4 space-y-2">
                {Object.entries(calculations.calibreSummary).map(([cal, data]) => {
                  const typedData = data as { palettes: number; caisses: number; quantity: number; caissesPerPalette: number };
                  if (typedData.palettes > 0) {
                    return (
                      <div key={cal} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-emerald-600 rounded-md flex items-center justify-center text-white font-semibold">
                            {cal}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">Calibre {cal}</div>
                            <div className="text-xs text-gray-500">{typedData.quantity} lots de {typedData.caissesPerPalette} caisses</div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-xl font-semibold text-emerald-600">{typedData.caisses}</div>
                          <div className="text-xs text-gray-500">caisses</div>
                          <div className="text-xs text-gray-500">
                            ({typedData.quantity} × {typedData.caissesPerPalette} = {typedData.caisses})
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Pallet Types */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-amber-500 px-4 py-3 flex items-center gap-2">
                <Package className="h-5 w-5 text-white" />
                <h3 className="font-semibold text-white">Types de Palettes</h3>
              </div>
              <div className="p-4 space-y-2">
                {calculations.palletTypes.type90 > 0 && (
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center text-white font-semibold">
                          90
                        </div>
                        <span className="font-medium text-gray-700">Type 90 caisses</span>
                      </div>
                      <div className="text-2xl font-semibold text-blue-600">{calculations.palletTypes.type90}</div>
                    </div>
                  </div>
                )}
                {calculations.palletTypes.type210 > 0 && (
                  <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-purple-600 rounded-md flex items-center justify-center text-white font-semibold">
                          210
                        </div>
                        <span className="font-medium text-gray-700">Type 210 caisses</span>
                      </div>
                      <div className="text-2xl font-semibold text-purple-600">{calculations.palletTypes.type210}</div>
                    </div>
                  </div>
                )}
                {calculations.palletTypes.type220 > 0 && (
                  <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-amber-600 rounded-md flex items-center justify-center text-white font-semibold">
                          220
                        </div>
                        <span className="font-medium text-gray-700">Type 220 caisses</span>
                      </div>
                      <div className="text-2xl font-semibold text-amber-600">{calculations.palletTypes.type220}</div>
                    </div>
                  </div>
                )}
                {calculations.palletTypes.type264 > 0 && (
                  <div className="p-3 bg-emerald-50 rounded-md border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-600 rounded-md flex items-center justify-center text-white font-semibold">
                          264
                        </div>
                        <span className="font-medium text-gray-700">Type 264 caisses</span>
                      </div>
                      <div className="text-2xl font-semibold text-emerald-600">{calculations.palletTypes.type264}</div>
                    </div>
                  </div>
                )}
                
                <div className="pt-2 mt-2 border-t-2 border-dashed border-gray-300">
                  <div className="flex items-center justify-between p-3 bg-gray-100 rounded-md">
                    <span className="font-semibold text-gray-900">Total Palettes</span>
                    <div className="text-3xl font-bold text-emerald-600">
                      {calculations.totalPallets}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Formule: {calculations.totalBoxes} caisses × {WEIGHT_PER_BOX.net}kg = {calculations.poidsNetTotal}kg net
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Synchronisé avec localStorage</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={16} />
            <span>Dernière modification: {currentLot?.updatedAt ? new Date(currentLot.updatedAt).toLocaleString('fr-FR') : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackingListManager;