import MultiAccidentDrivers from '../components/reports/MultiAccidentDrivers';
import DriversByLocation from '../components/reports/DriversByLocation';
import DriversByDate from '../components/reports/DriversByDate';
import MaxVictimsAccident from '../components/reports/MaxVictimsAccident';
import PedestrianDrivers from '../components/reports/PedestrianDrivers';
import CausesByFrequency from '../components/reports/CausesByFrequency';

export default function ReportsPage() {
  return (
    <div className="page">
      <h1>Отчёты</h1>
      <div className="reports-grid">
        <MultiAccidentDrivers />
        <DriversByLocation />
        <DriversByDate />
        <MaxVictimsAccident />
        <PedestrianDrivers />
        <CausesByFrequency />
      </div>
    </div>
  );
}
