// components/public/LucideIcon.tsx
import {
  Globe, Mail, Star, Monitor, Camera, Headphones,
  Home, MapPin, Users, List, LayoutDashboard, Smartphone,
  ShieldCheck, User, FolderOpen, Wrench, MessageSquare,
  Zap, CheckCircle, ArrowRight, ChevronDown, Phone,
  Clock, Layers, FileText, Send, ExternalLink,
  type LucideIcon as LucideIconType,
} from 'lucide-react';

const iconMap: Record<string, LucideIconType> = {
  Globe, Mail, Star, Monitor, Camera, Headphones,
  Home, MapPin, Users, List, LayoutDashboard, Smartphone,
  ShieldCheck, User, FolderOpen, Wrench, MessageSquare,
  Zap, CheckCircle, ArrowRight, ChevronDown, Phone,
  Clock, Layers, FileText, Send, ExternalLink,
};

interface LucideIconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export default function LucideIcon({ name, size = 24, className = '', strokeWidth = 2 }: LucideIconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    // Fallback: render Zap icon (daflash brand lightning)
    return <Zap size={size} className={className} strokeWidth={strokeWidth} />;
  }
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
}
