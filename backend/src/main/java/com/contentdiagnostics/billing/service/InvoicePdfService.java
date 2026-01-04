package com.contentdiagnostics.billing.service;

import com.contentdiagnostics.billing.entity.Invoice;
import com.contentdiagnostics.billing.exception.InvoicePdfGenerationException;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Service for generating invoice PDFs.
 */
@Slf4j
@Service
public class InvoicePdfService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("MMMM dd, yyyy")
            .withZone(ZoneId.of("UTC"));

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 24, Font.BOLD, new Color(33, 37, 41));
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(33, 37, 41));
    private static final Font NORMAL_FONT = new Font(Font.HELVETICA, 11, Font.NORMAL, new Color(73, 80, 87));
    private static final Font LABEL_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(108, 117, 125));
    private static final Font TOTAL_FONT = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(33, 37, 41));

    /**
     * Generate a PDF for an invoice.
     */
    public byte[] generateInvoicePdf(Invoice invoice, String customerName, String customerEmail) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Company header
            addCompanyHeader(document);

            // Invoice details
            addInvoiceDetails(document, invoice);

            // Customer info
            addCustomerInfo(document, customerName, customerEmail);

            // Line items table
            addLineItems(document, invoice);

            // Total
            addTotal(document, invoice);

            // Footer
            addFooter(document);

            document.close();

            log.info("Generated PDF for invoice {}", invoice.getInvoiceNumber());
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF for invoice {}: {}", invoice.getInvoiceNumber(), e.getMessage(), e);
            throw new InvoicePdfGenerationException(
                    invoice.getInvoiceNumber(),
                    "Failed to generate PDF for invoice " + invoice.getInvoiceNumber(),
                    e
            );
        }
    }

    private void addCompanyHeader(Document document) throws DocumentException {
        Paragraph company = new Paragraph("Content Diagnostics", TITLE_FONT);
        company.setAlignment(Element.ALIGN_LEFT);
        document.add(company);

        Paragraph tagline = new Paragraph("Video Feedback Platform", LABEL_FONT);
        tagline.setSpacingAfter(20);
        document.add(tagline);
    }

    private void addInvoiceDetails(Document document, Invoice invoice) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(20);

        // Invoice number
        PdfPCell labelCell = new PdfPCell(new Phrase("INVOICE", HEADER_FONT));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.addCell(labelCell);

        PdfPCell dateLabel = new PdfPCell(new Phrase("Date", LABEL_FONT));
        dateLabel.setBorder(Rectangle.NO_BORDER);
        dateLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(dateLabel);

        PdfPCell numberCell = new PdfPCell(new Phrase(invoice.getInvoiceNumber(), NORMAL_FONT));
        numberCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(numberCell);

        String dateStr = invoice.getCreatedAt() != null
                ? DATE_FORMAT.format(invoice.getCreatedAt())
                : "N/A";
        PdfPCell dateCell = new PdfPCell(new Phrase(dateStr, NORMAL_FONT));
        dateCell.setBorder(Rectangle.NO_BORDER);
        dateCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(dateCell);

        // Status
        PdfPCell statusLabel = new PdfPCell(new Phrase("Status", LABEL_FONT));
        statusLabel.setBorder(Rectangle.NO_BORDER);
        table.addCell(statusLabel);

        PdfPCell empty = new PdfPCell(new Phrase(""));
        empty.setBorder(Rectangle.NO_BORDER);
        table.addCell(empty);

        Font statusFont = new Font(Font.HELVETICA, 11, Font.BOLD,
                invoice.getStatus() == Invoice.InvoiceStatus.PAID ? new Color(40, 167, 69) : new Color(220, 53, 69));
        PdfPCell statusCell = new PdfPCell(new Phrase(invoice.getStatus().name(), statusFont));
        statusCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(statusCell);

        table.addCell(empty);

        document.add(table);
    }

    private void addCustomerInfo(Document document, String customerName, String customerEmail) throws DocumentException {
        Paragraph billTo = new Paragraph("Bill To:", LABEL_FONT);
        document.add(billTo);

        Paragraph name = new Paragraph(customerName != null ? customerName : "Customer", HEADER_FONT);
        document.add(name);

        Paragraph email = new Paragraph(customerEmail != null ? customerEmail : "", NORMAL_FONT);
        email.setSpacingAfter(30);
        document.add(email);
    }

    private void addLineItems(Document document, Invoice invoice) throws DocumentException {
        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{60, 20, 20});
        table.setSpacingAfter(20);

        // Header row
        Color headerBg = new Color(248, 249, 250);

        PdfPCell descHeader = new PdfPCell(new Phrase("Description", HEADER_FONT));
        descHeader.setBackgroundColor(headerBg);
        descHeader.setPadding(10);
        descHeader.setBorderColor(new Color(222, 226, 230));
        table.addCell(descHeader);

        PdfPCell qtyHeader = new PdfPCell(new Phrase("Qty", HEADER_FONT));
        qtyHeader.setBackgroundColor(headerBg);
        qtyHeader.setPadding(10);
        qtyHeader.setHorizontalAlignment(Element.ALIGN_CENTER);
        qtyHeader.setBorderColor(new Color(222, 226, 230));
        table.addCell(qtyHeader);

        PdfPCell amtHeader = new PdfPCell(new Phrase("Amount", HEADER_FONT));
        amtHeader.setBackgroundColor(headerBg);
        amtHeader.setPadding(10);
        amtHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);
        amtHeader.setBorderColor(new Color(222, 226, 230));
        table.addCell(amtHeader);

        // Line item row
        PdfPCell descCell = new PdfPCell(new Phrase("Content Diagnostics Services", NORMAL_FONT));
        descCell.setPadding(10);
        descCell.setBorderColor(new Color(222, 226, 230));
        table.addCell(descCell);

        PdfPCell qtyCell = new PdfPCell(new Phrase("1", NORMAL_FONT));
        qtyCell.setPadding(10);
        qtyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        qtyCell.setBorderColor(new Color(222, 226, 230));
        table.addCell(qtyCell);

        String amountStr = String.format("$%.2f %s", invoice.getAmount(), invoice.getCurrency());
        PdfPCell amtCell = new PdfPCell(new Phrase(amountStr, NORMAL_FONT));
        amtCell.setPadding(10);
        amtCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        amtCell.setBorderColor(new Color(222, 226, 230));
        table.addCell(amtCell);

        document.add(table);
    }

    private void addTotal(Document document, Invoice invoice) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(40);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.setSpacingAfter(40);

        PdfPCell totalLabel = new PdfPCell(new Phrase("Total:", TOTAL_FONT));
        totalLabel.setBorder(Rectangle.NO_BORDER);
        totalLabel.setPaddingTop(10);
        table.addCell(totalLabel);

        String totalStr = String.format("$%.2f %s", invoice.getAmount(), invoice.getCurrency());
        PdfPCell totalValue = new PdfPCell(new Phrase(totalStr, TOTAL_FONT));
        totalValue.setBorder(Rectangle.NO_BORDER);
        totalValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalValue.setPaddingTop(10);
        table.addCell(totalValue);

        document.add(table);
    }

    private void addFooter(Document document) throws DocumentException {
        Paragraph footer = new Paragraph("Thank you for your business!", NORMAL_FONT);
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(30);
        document.add(footer);

        Paragraph contact = new Paragraph("Questions? Contact support@contentdiagnostics.com", LABEL_FONT);
        contact.setAlignment(Element.ALIGN_CENTER);
        document.add(contact);
    }
}
