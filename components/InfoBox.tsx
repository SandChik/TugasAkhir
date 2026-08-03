export default function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-info-bg px-4 py-3 text-[11.5px] text-info-tx">
      {children}
    </div>
  );
}
