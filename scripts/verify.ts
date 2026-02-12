import { seedDefaultAccounts, firebaseLoginUser } from '../services/firebaseAuthService.ts';
import { firebaseSaveReport, firebaseGetAllReports, firebaseUpdateReportStatus, firebaseGetReportById } from '../services/firebaseReportService.ts';
import { identifyReptile } from '../services/geminiService.ts';
import { UserRole, RescueStatus, ReptileData, User } from '../types.ts';

const run = async () => {
  await seedDefaultAccounts();
  const user: User = await firebaseLoginUser('citizen@reptileguard.com', 'password123', UserRole.CITIZEN);
  let data: ReptileData;
  try {
    data = await identifyReptile([]);
  } catch {
    data = {
      name: 'Snake',
      scientificName: 'Serpentes',
      description: 'Generic reptile',
      isVenomous: false,
      dangerLevel: 'Low',
      precautions: ['Keep distance', 'Do not attempt capture'],
      habitat: 'Urban edges'
    };
  }
  const report = await firebaseSaveReport(
    user,
    data,
    {
      sightingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      riskLevel: 'Non-aggressive',
      location: {
        state: user.state,
        district: user.district,
        taluk: user.taluk,
        village: user.village,
        landmark: user.landmark,
        pincode: user.pincode,
        locationType: 'House'
      }
    },
    []
  );
  const all = await firebaseGetAllReports();
  const byId = await firebaseGetReportById(report.id);
  await firebaseUpdateReportStatus(report.id, RescueStatus.RESCUED, 'Verified in automated test', [], user);
  console.log(JSON.stringify({ seeded: true, login: user.email, createdReport: report.id, totalReports: all.length, fetched: !!byId }));
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
