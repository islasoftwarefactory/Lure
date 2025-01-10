export function CountdownTimer() {
  return (
    <div className="flex gap-4 text-xl font-bold bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6">
      <div className="flex flex-col items-center">
        <span>??</span>
        <span className="text-sm">Days</span>
      </div>
      <div className="flex flex-col items-center">
        <span>??</span>
        <span className="text-sm">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <span>??</span>
        <span className="text-sm">Minutes</span>
      </div>
      <div className="flex flex-col items-center">
        <span>??</span>
        <span className="text-sm">Seconds</span>
      </div>
    </div>
  );
} 