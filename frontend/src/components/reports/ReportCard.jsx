export default function ReportCard({ number, title, children }) {
  return (
    <section className="report-card">
      <header className="report-card__header">
        <span className="report-card__num">№{number}</span>
        <h3>{title}</h3>
      </header>
      <div className="report-card__body">{children}</div>
    </section>
  );
}
