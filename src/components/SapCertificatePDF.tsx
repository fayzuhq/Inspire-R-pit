import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf', fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Inter', fontSize: 11, color: '#162C27', lineHeight: 1.5 },
  header: { marginBottom: 30 },
  brand: { fontSize: 20, fontWeight: 'bold', color: '#1E3A34' },
  address: { fontSize: 10, color: '#609384' },
  title: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginVertical: 30, textTransform: 'uppercase' },
  content: { marginBottom: 30, textAlign: 'justify' },
  bold: { fontWeight: 'bold' },
  table: { width: '100%', marginBottom: 30, border: '1pt solid #C5DBD3' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#C5DBD3' },
  tableHeader: { fontWeight: 'bold', backgroundColor: '#EAF3EF', padding: 5 },
  tableCell: { padding: 5 },
  col1: { width: '70%', borderRightWidth: 1, borderRightColor: '#C5DBD3' },
  col2: { width: '30%', textAlign: 'right' },
  signature: { marginTop: 50, textAlign: 'right' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#666', textAlign: 'center', borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 }
});

type ProviderSettings = {
  provider_name: string;
  organization_name?: string;
  address: string;
  postal_code: string;
  city: string;
  sap_number: string;
  siret: string;
};

type ClientInfo = {
  full_name: string;
  billing_address: string;
  billing_postal_code: string;
  billing_city: string;
};

type SapCertificateData = {
  year: number;
  totalAmount: number;
  cesuAmount: number;
  provider: ProviderSettings;
  client: ClientInfo;
  issueDate: string;
};

export const SapCertificatePDF = ({ data }: { data: SapCertificateData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.brand}>{data.provider.provider_name}</Text>
        {data.provider.organization_name && <Text style={styles.address}>{data.provider.organization_name}</Text>}
        <Text style={styles.address}>{data.provider.address}</Text>
        <Text style={styles.address}>{data.provider.postal_code} {data.provider.city}</Text>
        <Text style={styles.address}>N° Agrément / Déclaration SAP : {data.provider.sap_number}</Text>
        <Text style={styles.address}>SIRET : {data.provider.siret}</Text>
      </View>

      <View style={{ alignItems: 'flex-end', marginBottom: 20 }}>
        <Text style={{ fontWeight: 'bold' }}>Client :</Text>
        <Text>{data.client.full_name}</Text>
        <Text>{data.client.billing_address}</Text>
        <Text>{data.client.billing_postal_code} {data.client.billing_city}</Text>
      </View>

      <Text style={styles.title}>ATTESTATION FISCALE ANNÉE {data.year}</Text>

      <View style={styles.content}>
        <Text>Je soussigné(e), représentant légal de <Text style={styles.bold}>{data.provider.provider_name}</Text>, certifie que :</Text>
        <Text style={{ marginVertical: 10 }}>
          <Text style={styles.bold}>{data.client.full_name}</Text>, demeurant au {data.client.billing_address}, {data.client.billing_postal_code} {data.client.billing_city},
        </Text>
        <Text>
          a acquitté la somme totale de <Text style={styles.bold}>{data.totalAmount.toFixed(2)} euros</Text> au titre des prestations de services à la personne (répit, accompagnement) effectuées à domicile au cours de l&apos;année {data.year}.
        </Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={styles.col1}><Text style={styles.tableCell}>Nature des prestations acquittées</Text></View>
          <View style={styles.col2}><Text style={styles.tableCell}>Montant TTC</Text></View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.col1}><Text style={styles.tableCell}>Accompagnement Médico-Social / Répit à domicile</Text></View>
          <View style={styles.col2}><Text style={styles.tableCell}>{data.totalAmount.toFixed(2)} €</Text></View>
        </View>
        {data.cesuAmount > 0 && (
          <View style={styles.tableRow}>
            <View style={styles.col1}><Text style={[styles.tableCell, { fontStyle: 'italic', fontSize: 9 }]}>Dont montant réglé par CESU préfinancés (à déduire par le contribuable)</Text></View>
            <View style={styles.col2}><Text style={styles.tableCell}>{data.cesuAmount.toFixed(2)} €</Text></View>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text>
          Cette attestation est établie conformément aux dispositions de l&apos;article 199 sexdecies du Code Général des Impôts, afin de permettre au client de bénéficier de l&apos;avantage fiscal (crédit d&apos;impôt) lié aux emplois familiaux.
        </Text>
        {data.cesuAmount > 0 && (
          <Text style={{ marginTop: 10, fontSize: 9, fontStyle: 'italic', color: '#E07A5F' }}>
            Rappel : Le montant réglé par CESU préfinancés doit être déduit du montant total à déclarer aux impôts, car ces titres ont déjà été cofinancés par un employeur ou un organisme financeur.
          </Text>
        )}
      </View>

      <View style={styles.signature}>
        <Text>Fait à {data.provider.city}, le {format(new Date(data.issueDate), 'dd/MM/yyyy')}</Text>
        <Text style={{ marginTop: 20, fontStyle: 'italic' }}>Signature / Cachet de l&apos;entreprise</Text>
      </View>

      <View style={styles.footer}>
        <Text>Document à conserver par le client pour présentation aux services fiscaux en cas de contrôle.</Text>
      </View>
    </Page>
  </Document>
);
