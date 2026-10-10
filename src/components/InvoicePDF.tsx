import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf', fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Inter', fontSize: 10, color: '#162C27' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  brand: { fontSize: 24, fontWeight: 'bold', color: '#1E3A34' },
  subtitle: { fontSize: 10, color: '#609384' },
  infoSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  clientBox: { width: '45%' },
  clientTitle: { fontWeight: 'bold', marginBottom: 5, fontSize: 12 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  table: { width: '100%', marginBottom: 30 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#C5DBD3', paddingVertical: 8 },
  tableHeader: { fontWeight: 'bold', backgroundColor: '#EAF3EF' },
  col1: { width: '50%', paddingHorizontal: 5 },
  col2: { width: '25%', paddingHorizontal: 5, textAlign: 'center' },
  col3: { width: '25%', paddingHorizontal: 5, textAlign: 'right' },
  totals: { width: '40%', alignSelf: 'flex-end', borderTopWidth: 2, borderTopColor: '#2E564D', paddingTop: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  totalLabel: { fontWeight: 'bold' },
  totalValue: { fontWeight: 'bold' },
  legalInfo: { marginTop: 50, fontSize: 8, color: '#666', borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 },
  cesuBlock: { marginTop: 20, padding: 10, backgroundColor: '#FAF8F5', border: '1pt solid #C5DBD3' },
  cesuTitle: { fontWeight: 'bold', marginBottom: 5, color: '#E07A5F' }
});

type InvoiceData = {
  invoiceNumber: string;
  issuedAt: string;
  clientName: string;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  bookingDate: string;
  formula: string;
  beneficiaryName: string;
  amountHT: number;
  amountTTC: number;
};

export const InvoicePDF = ({ data }: { data: InvoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>Inspire Répit</Text>
          <Text style={styles.subtitle}>Accompagnement Médico-Social</Text>
          <Text>123 Avenue de la République</Text>
          <Text>75011 Paris, France</Text>
          <Text>SIRET: 123 456 789 00012</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={styles.title}>FACTURE</Text>
          <Text>N° {data.invoiceNumber}</Text>
          <Text>Date: {format(new Date(data.issuedAt), 'dd/MM/yyyy')}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.clientBox}></View>
        <View style={styles.clientBox}>
          <Text style={styles.clientTitle}>Facturé à :</Text>
          <Text>{data.clientName}</Text>
          <Text>{data.clientAddress}</Text>
          <Text>{data.clientPostalCode} {data.clientCity}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.col1}>Désignation</Text>
          <Text style={styles.col2}>Bénéficiaire</Text>
          <Text style={styles.col3}>Montant HT</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.col1}>Prestation du {format(new Date(data.bookingDate), 'dd/MM/yyyy')} - {data.formula}</Text>
          <Text style={styles.col2}>{data.beneficiaryName}</Text>
          <Text style={styles.col3}>{data.amountHT.toFixed(2)} €</Text>
        </View>
      </View>

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text>Total HT</Text>
          <Text>{data.amountHT.toFixed(2)} €</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>TVA (0%)*</Text>
          <Text>0.00 €</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total TTC</Text>
          <Text style={styles.totalValue}>{data.amountTTC.toFixed(2)} €</Text>
        </View>
      </View>

      <View style={styles.cesuBlock}>
        <Text style={styles.cesuTitle}>Paiement par CESU accepté</Text>
        <Text>Nos prestations sont éligibles au crédit d'''impôt de 50% dans le cadre des Services à la Personne.</Text>
        <Text>Pour un règlement par virement bancaire : IBAN FR76 1234 5678 9101 1121 3141 516</Text>
      </View>

      <View style={styles.legalInfo}>
        <Text>*TVA non applicable, art. 293 B du CGI ou exonération SAP art. 261-7-1°b du CGI.</Text>
        <Text>En cas de retard de paiement, une pénalité fixée à 3 fois le taux d'''intérêt légal sera exigible, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 euros.</Text>
      </View>
    </Page>
  </Document>
);
