import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { renderToBuffer } from "@react-pdf/renderer";
import dayjs from "@/lib/date";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 32,
    fontSize: 12,
    color: "#1f2937",
    fontFamily: "Helvetica"
  },
  heading: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 600
  },
  section: {
    marginBottom: 16
  },
  label: {
    fontSize: 10,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 2
  },
  value: {
    fontSize: 12,
    marginBottom: 6
  }
});

export async function renderProfilePdf(profile: {
  vorname: string;
  nachname: string;
  adresse: string;
  telefon: string;
  geburtstag: Date | null;
  bankIban: string | null;
  steuerId: string | null;
  notizen: string | null;
  user: { username: string };
}) {
  const doc = (
    <Document title={`Profil ${profile.user.username}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>Mitarbeiterprofil</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>
            {profile.vorname} {profile.nachname} ({profile.user.username})
          </Text>
          <Text style={styles.label}>Adresse</Text>
          <Text style={styles.value}>{profile.adresse}</Text>
          <Text style={styles.label}>Telefon</Text>
          <Text style={styles.value}>{profile.telefon}</Text>
          {profile.geburtstag && (
            <>
              <Text style={styles.label}>Geburtstag</Text>
              <Text style={styles.value}>{dayjs(profile.geburtstag).format("DD.MM.YYYY")}</Text>
            </>
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Bankverbindung</Text>
          <Text style={styles.value}>{profile.bankIban ?? "-"}</Text>
          <Text style={styles.label}>Steuer-ID</Text>
          <Text style={styles.value}>{profile.steuerId ?? "-"}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Notizen</Text>
          <Text style={styles.value}>{profile.notizen ?? "Keine Notizen"}</Text>
        </View>
        <Text style={{ fontSize: 10, color: "#9ca3af" }}>
          Generiert am {dayjs().format("DD.MM.YYYY HH:mm")} Uhr
        </Text>
      </Page>
    </Document>
  );

  return await renderToBuffer(doc);
}
