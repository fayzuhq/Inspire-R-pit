import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ProviderInfo } from './InvoicePDF';

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#162C27',
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#d6dfdb',
    paddingBottom: 14,
  },
  headerLeft: {
    width: '60%',
    flexDirection: 'column',
  },
  brand: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1E3A34',
  },
  subtitle: {
    fontSize: 8.5,
    color: '#476355',
    fontFamily: 'Helvetica-Bold',
  },
  companyMeta: {
    fontSize: 8,
    color: '#334155',
    lineHeight: 1.3,
  },
  docTitleBlock: {
    width: '38%',
    textAlign: 'right',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  docTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1E3A34',
    marginBottom: 4,
  },
  docMeta: {
    fontSize: 8.5,
    color: '#334155',
  },
  partiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  partyBox: {
    width: '48%',
    padding: 10,
    backgroundColor: '#FAF8F5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  partyTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#1E3A34',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  legalBanner: {
    backgroundColor: '#EAF3EF',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C5DBD3',
    marginBottom: 16,
  },
  legalBannerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: '#1E3A34',
    marginBottom: 2,
  },
  legalBannerText: {
    fontSize: 8,
    color: '#1E3A34',
    lineHeight: 1.3,
  },
  table: {
    width: '100%',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#EAF3EF',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 8,
  },
  colFacture: { width: '25%' },
  colDate: { width: '25%' },
  colPaiement: { width: '25%' },
  colMontant: { width: '25%', textAlign: 'right' },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  summaryBox: {
    width: '55%',
    backgroundColor: '#FAF8F5',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C5DBD3',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    fontSize: 8.5,
  },
  summaryRowHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#1E3A34',
  },
  taxCreditText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1E3A34',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    fontSize: 7.5,
    color: '#64748B',
    lineHeight: 1.3,
  },
});

export interface TaxCertificateInvoice {
  invoice_number: string;
  issue_date: string | null;
  created_at: string;
  payment_method: string | null;
  amount_ttc: number;
}

export interface TaxCertificateProps {
  year: number;
  provider?: ProviderInfo | null;
  client: {
    full_name?: string;
    billing_address?: string;
    billing_postal_code?: string;
    billing_city?: string;
  };
  invoices: TaxCertificateInvoice[];
  totalAmount: number;
}

export const TaxCertificatePDF: React.FC<TaxCertificateProps> = ({
  year,
  provider,
  client,
  invoices,
  totalAmount,
}) => {
  const p = {
    organization_name: (provider?.organization_name || 'Inspire Répit').trim(),
    provider_name: (provider?.provider_name || 'Haddou Sonia').trim(),
    legal_status: (provider?.legal_status || 'Entrepreneur Individuel').trim(),
    siret: (provider?.siret || '73339041300025').trim(),
    sap_number: (provider?.sap_number || 'SAP123456789').trim(),
    address: (provider?.address || '56 rue des ciments').trim(),
    postal_code: (provider?.postal_code || '38180').trim(),
    city: (provider?.city || 'Seyssins').trim(),
    phone: (provider?.phone || '0650837859').trim(),
    email: (provider?.email || 'haddousonia@gmail.com').trim(),
  };

  const taxCredit = totalAmount * 0.5;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête Prestataire & Titre du document */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.brand}>{p.organization_name}</Text>
            </View>
            <View style={{ marginBottom: 5 }}>
              <Text style={styles.subtitle}>{p.provider_name} • {p.legal_status}</Text>
            </View>
            <Text style={styles.companyMeta}>{p.address}</Text>
            <Text style={styles.companyMeta}>{p.postal_code} {p.city}</Text>
            <Text style={styles.companyMeta}>Tél : {p.phone} • Email : {p.email}</Text>
            <Text style={[styles.companyMeta, styles.bold, { marginTop: 2 }]}>SIRET : {p.siret}</Text>
            <Text style={[styles.companyMeta, styles.bold]}>N° déclaration SAP : {p.sap_number}</Text>
          </View>

          <View style={styles.docTitleBlock}>
            <Text style={styles.docTitle}>ATTESTATION FISCALE</Text>
            <Text style={[styles.docMeta, styles.bold]}>Année civile {year}</Text>
            <Text style={styles.docMeta}>Délivrée le {format(new Date(), 'dd/MM/yyyy')}</Text>
          </View>
        </View>

        {/* Coordonnées Organisme & Client */}
        <View style={styles.partiesRow}>
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Organisme déclarant (SAP)</Text>
            <Text style={styles.bold}>{p.provider_name}</Text>
            <Text>{p.organization_name}</Text>
            <Text>{p.address}</Text>
            <Text>{p.postal_code} {p.city}</Text>
          </View>

          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Bénéficiaire des prestations</Text>
            <Text style={styles.bold}>{client.full_name || 'Client'}</Text>
            {client.billing_address ? <Text>{client.billing_address}</Text> : null}
            <Text>{(client.billing_postal_code || '') + ' ' + (client.billing_city || '')}</Text>
          </View>
        </View>

        {/* Cadre légal SAP */}
        <View style={styles.legalBanner}>
          <Text style={styles.legalBannerTitle}>
            Attestation établie en application de l&apos;article L. 7233-2 du Code du travail
          </Text>
          <Text style={styles.legalBannerText}>
            Les sommes acquittées mentionnées ci-dessous correspondent à des prestations de répit et d&apos;accompagnement à domicile ouvrant droit au crédit d&apos;impôt sur le revenu de 50 % prévu à l&apos;article 199 sexdecies du Code Général des Impôts.
          </Text>
        </View>

        {/* Tableau récapitulatif */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colFacture}>N° Facture</Text>
            <Text style={styles.colDate}>Date d&apos;émission</Text>
            <Text style={styles.colPaiement}>Mode de règlement</Text>
            <Text style={styles.colMontant}>Montant acquitté</Text>
          </View>

          {invoices.map((inv, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.colFacture}>{inv.invoice_number}</Text>
              <Text style={styles.colDate}>
                {format(new Date(inv.issue_date || inv.created_at), 'dd/MM/yyyy')}
              </Text>
              <Text style={styles.colPaiement}>
                {inv.payment_method ? inv.payment_method.toUpperCase() : 'VIREMENT'}
              </Text>
              <Text style={[styles.colMontant, styles.bold]}>
                {Number(inv.amount_ttc).toFixed(2)} €
              </Text>
            </View>
          ))}
        </View>

        {/* Totaux & Crédit d'impôt */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text>Total des dépenses acquittées en {year} :</Text>
              <Text style={styles.bold}>{totalAmount.toFixed(2)} €</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Taux du crédit d&apos;impôt légal :</Text>
              <Text style={styles.bold}>50 %</Text>
            </View>
            <View style={styles.summaryRowHighlight}>
              <Text style={styles.taxCreditText}>Montant du crédit d&apos;impôt :</Text>
              <Text style={styles.taxCreditText}>{taxCredit.toFixed(2)} €</Text>
            </View>
          </View>
        </View>

        {/* Pied de page fiscal */}
        <View style={styles.footer}>
          <Text style={styles.bold}>À conserver par le contribuable :</Text>
          <Text>
            Cette attestation doit être conservée par le bénéficiaire en cas de demande des services fiscaux. Le montant total des dépenses acquittées est à reporter dans la case 7DB (ou 7DF selon situation) de votre déclaration annuelle de revenus.
          </Text>
          <Text style={{ marginTop: 3 }}>
            Fait pour valoir ce que de droit à Seyssins, le {format(new Date(), 'dd/MM/yyyy')}.
          </Text>
        </View>
      </Page>
    </Document>
  );
};