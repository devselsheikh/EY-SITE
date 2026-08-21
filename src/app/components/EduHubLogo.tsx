import eduhubLogo from '@/imports/eduhublogo.png';

export default function EduHubLogo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <img
      src={eduhubLogo}
      alt="EduHub"
      className={`max-w-[180px] object-contain ${className}`}
    />
  );
}
