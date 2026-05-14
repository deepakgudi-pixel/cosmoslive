'use client';

export function LoadingState({ label = 'LOADING...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-void">
      <div className="text-center">
        <div
          className="w-10 h-10 rounded-full border-2 border-transparent border-t-cyan border-r-cyan/30 animate-spin mx-auto mb-4"
        />
        <div className="data-label">{label}</div>
      </div>
    </div>
  );
}
