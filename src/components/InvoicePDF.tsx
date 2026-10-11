import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: { 
    padding: 36, 
    fontFamily: 'Helvetica', 
    fontSize: 9, 
    color: '#162C27',
    lineHeight: 1.35
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#d6dfdb',
    paddingBottom: 14
  },
  headerLeft: {
    width: '60%',
    flexDirection: 'column'
  },
  brand: { 
    fontSize: 20, 
    fontFamily: 'Helvetica-Bold', 
    color: '#1E3A34'
  },
  subtitle: { 
    fontSize: 9, 
    color: '#476355', 
    fontFamily: 'Helvetica-Bold'
  },
  companyMeta: {
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.3
  },
  titleBlock: { 
    width: '38%',
    textAlign: 'right',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  title: { 
    fontSize: 18, 
    fontFamily: 'Helvetica-Bold', 
    color: '#1E3A34'
  },
  invoiceMeta: {
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.35
  },
  infoSection: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  partyBox: { 
    width: '48%',
    padding: 10,
    backgroundColor: '#FAF8F5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  partyTitle: { 
    fontFamily: 'Helvetica-Bold', 
    marginBottom: 5, 
    fontSize: 9.5,
    color: '#1E3A34',
    textTransform: 'uppercase'
  },
  bold: { 
    fontFamily: 'Helvetica-Bold' 
  },
  sapBanner: {
    backgroundColor: '#EAF3EF',
    padding: 8,
    borderRadius: 5,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C5DBD3'
  },
  sapBannerText: {
    fontSize: 8,
    color: '#1E3A34',
    lineHeight: 1.3
  },
  table: { 
    width: '100%', 
    marginBottom: 16 
  },
  tableHeader: { 
    flexDirection: 'row', 
    fontFamily: 'Helvetica-Bold', 
    backgroundColor: '#EAF3EF',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 8.5
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0', 
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 8.5
  },
  colDesc: { width: '52%' },
  colQty: { width: '16%', textAlign: 'center' },
  colPrice: { width: '16%', textAlign: 'right' },
  colTotal: { width: '16%', textAlign: 'right' },
  totals: { 
    width: '45%', 
    alignSelf: 'flex-end', 
    borderTopWidth: 1.5, 
    borderTopColor: '#1E3A34', 
    paddingTop: 6,
    marginBottom: 18
  },
  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 3,
    fontSize: 9
  },
  totalRowFinal: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#C5DBD3'
  },
  totalFinalLabel: { 
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    color: '#1E3A34'
  },
  totalFinalValue: { 
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    color: '#1E3A34'
  },
  paymentBlock: { 
    padding: 10, 
    backgroundColor: '#FAF8F5', 
    borderWidth: 1, 
    borderColor: '#C5DBD3',
    borderRadius: 6,
    marginBottom: 14
  },
  paymentTitle: { 
    fontFamily: 'Helvetica-Bold', 
    marginBottom: 4, 
    color: '#E07A5F',
    fontSize: 9
  },
  legalInfo: { 
    marginTop: 'auto', 
    fontSize: 7.5, 
    color: '#64748B', 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0', 
    paddingTop: 8,
    lineHeight: 1.3
  }
});

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity?: number;
  unit_price?: number;
  total: number;
}

export interface ProviderInfo {
  organization_name?: string;
  provider_name?: string;
  legal_status?: string;
  siret?: string;
  sap_number?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  phone?: string;
  email?: string;
  iban?: string;
  bic?: string;
}

export type InvoiceData = {
  invoiceNumber: string;
  issuedAt: string;
  clientName: string;
  clientAddress?: string;
  clientPostalCode?: string;
  clientCity?: string;
  bookingDate?: string;
  formula?: string;
  beneficiaryName?: string;
  amountHT: number;
  amountTTC: number;
  items?: InvoiceItem[];
  provider?: ProviderInfo;
};

const formatDateSafe = (dateString?: string) => {
  if (!dateString) return format(new Date(), 'dd/MM/yyyy');
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : format(d, 'dd/MM/yyyy');
  } catch {
    return dateString;
  }
};

export const InvoicePDF = ({ data }: { data: InvoiceData }) => {
  const provider = {
    organization_name: (data.provider?.organization_name || 'Inspire Répit').trim(),
    provider_name: (data.provider?.provider_name || 'Haddou Sonia').trim(),
    legal_status: (data.provider?.legal_status || 'Entrepreneur Individuel').trim(),
    siret: (data.provider?.siret || '73339041300025').trim(),
    sap_number: (data.provider?.sap_number || 'SAP123456789').trim(),
    address: (data.provider?.address || '56 rue des ciments').trim(),
    postal_code: (data.provider?.postal_code || '38180').trim(),
    city: (data.provider?.city || 'Seyssins').trim(),
    phone: (data.provider?.phone || '0650837859').trim(),
    email: (data.provider?.email || 'haddousonia@gmail.com').trim(),
    iban: (data.provider?.iban || 'FR76 3000 4117 7612 0002 8508 485').trim(),
    bic: (data.provider?.bic || 'BNPAFRPP').trim(),
  };

  const hasItems = data.items && data.items.length > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête Prestataire & Facture */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Boîte dédiée au titre pour forcer le saut de ligne */}
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.brand}>{provider.organization_name}</Text>
            </View>

            {/* Boîte dédiée au sous-titre */}
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.subtitle}>
                {provider.provider_name} • {provider.legal_status}
              </Text>
            </View>

            <Text style={styles.companyMeta}>{provider.address}</Text>
            <Text style={styles.companyMeta}>{provider.postal_code} {provider.city}</Text>
            <Text style={styles.companyMeta}>Tél : {provider.phone} • Email : {provider.email}</Text>
            <Text style={[styles.companyMeta, styles.bold, { marginTop: 2 }]}>
              SIRET : {provider.siret}
            </Text>
            {provider.sap_number ? (
              <Text style={[styles.companyMeta, styles.bold]}>
                N° déclaration SAP : {provider.sap_number}
              </Text>
            ) : null}
          </View>

          <View style={styles.titleBlock}>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.title}>FACTURE</Text>
            </View>
            <Text style={[styles.invoiceMeta, styles.bold]}>N° {data.invoiceNumber}</Text>
            <Text style={styles.invoiceMeta}>Date : {formatDateSafe(data.issuedAt)}</Text>
          </View>
        </View>

        {/* Coordonnées Client & Prestataire */}
        <View style={styles.infoSection}>
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Émetteur</Text>
            <Text style={styles.bold}>{provider.provider_name}</Text>
            <Text>{provider.organization_name}</Text>
            <Text>{provider.address}</Text>
            <Text>{provider.postal_code} {provider.city}</Text>
          </View>
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Facturé à :</Text>
            <Text style={styles.bold}>{data.clientName || 'Client'}</Text>
            {data.clientAddress ? <Text>{data.clientAddress}</Text> : null}
            <Text>{data.clientPostalCode || ''} {data.clientCity || ''}</Text>
            {data.beneficiaryName ? (
              <Text style={{ marginTop: 4, fontStyle: 'italic', fontSize: 8 }}>
                Bénéficiaire : {data.beneficiaryName}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Mention éligibilité SAP */}
        <View style={styles.sapBanner}>
          <Text style={[styles.sapBannerText, styles.bold]}>
            Prestations de Services à la Personne (SAP) éligibles au crédit d&apos;impôt de 50 % (Art. 199 sexdecies du CGI).
          </Text>
          <Text style={styles.sapBannerText}>
            Règlement par CESU préfinancé et virement bancaire acceptés.
          </Text>
        </View>

        {/* Détail des prestations et frais */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Désignation</Text>
            <Text style={styles.colQty}>Qté / Km</Text>
            <Text style={styles.colPrice}>Prix unit. HT</Text>
            <Text style={styles.colTotal}>Total HT</Text>
          </View>

          {hasItems ? (
            data.items!.map((it, idx) => (
              <View key={it.id || idx} style={styles.tableRow}>
                <Text style={styles.colDesc}>{it.description}</Text>
                <Text style={styles.colQty}>{it.quantity ?? 1}</Text>
                <Text style={styles.colPrice}>
                  {(Number(it.unit_price) || Number(it.total) || 0).toFixed(2)} €
                </Text>
                <Text style={[styles.colTotal, styles.bold]}>
                  {(Number(it.total) || 0).toFixed(2)} €
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>
                Prestation du {formatDateSafe(data.bookingDate)} {data.formula ? `- ${data.formula}` : ''}
              </Text>
              <Text style={styles.colQty}>1</Text>
              <Text style={styles.colPrice}>{data.amountHT.toFixed(2)} €</Text>
              <Text style={[styles.colTotal, styles.bold]}>{data.amountHT.toFixed(2)} €</Text>
            </View>
          )}
        </View>

        {/* Totaux */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Total HT</Text>
            <Text>{data.amountHT.toFixed(2)} €</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>TVA (0 %)*</Text>
            <Text>0,00 €</Text>
          </View>
          <View style={styles.totalRowFinal}>
            <Text style={styles.totalFinalLabel}>Total TTC Net à payer</Text>
            <Text style={styles.totalFinalValue}>{data.amountTTC.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Règlement et Coordonnées bancaires */}
        <View style={styles.paymentBlock}>
          <Text style={styles.paymentTitle}>Modalités de règlement</Text>
          <Text style={{ fontSize: 8.5 }}>Paiement par CESU accepté.</Text>
          <Text style={{ fontSize: 8.5, marginTop: 2 }}>
            Pour un règlement par virement bancaire : <Text style={styles.bold}>IBAN {provider.iban}</Text>
            {provider.bic ? ` • BIC ${provider.bic}` : ''}
          </Text>
        </View>

        {/* Mentions légales obligatoires */}
        <View style={styles.legalInfo}>
          <Text>*TVA non applicable, art. 293 B du Code Général des Impôts (franchise en base de TVA).</Text>
          <Text style={{ marginTop: 2 }}>
            En cas de retard de paiement, une pénalité fixée à 3 fois le taux d&apos;intérêt légal sera exigible, ainsi qu&apos;une indemnité forfaitaire pour frais de recouvrement de 40 euros.
          </Text>
        </View>
      </Page>
    </Document>
  );
};