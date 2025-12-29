export default function Progress({ progress }) {
  return (
    <div className="progress" style={{ display: 'block' }}>
      <div
        className="progress-bar"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}