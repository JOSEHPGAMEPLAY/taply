import {
  MessageCircle,
  Phone,
  Globe,
  MapPin,
  Mail,
  Clock,
  Utensils,
  ShoppingCart,
  Calendar,
  Star,
  Heart,
  Play,
  Camera,
  Music,
  BookOpen,
  Gift,
  Award,
  Shield,
  HelpCircle,
  Settings,
  Link,
  QrCode,
  Wifi,
  Zap,
  ChevronRight,
  Send,
  MessageSquare,
  Headphones,
  Radio,
  Tv,
  Gamepad2,
  Palette,
  PenTool,
  Mic,
  Video,
  Image,
  FileText,
  Download,
  Share2,
  Bookmark,
  Eye,
  Printer,
  AtSign,
  Share,
  Users,
  TrendingUp,
} from 'lucide-react';
import type { ComponentType } from 'react';

export interface IconOption {
  key: string;
  label: string;
  category: string;
  component: ComponentType<{ className?: string }>;
}

export const iconMap: IconOption[] = [
  // Redes sociales
  { key: 'whatsapp', label: 'WhatsApp', category: 'Redes sociales', component: MessageCircle },
  { key: 'facebook', label: 'Facebook', category: 'Redes sociales', component: AtSign },
  { key: 'instagram', label: 'Instagram', category: 'Redes sociales', component: Camera },
  { key: 'tiktok', label: 'TikTok', category: 'Redes sociales', component: Music },
  { key: 'twitter', label: 'Twitter / X', category: 'Redes sociales', component: Share },
  { key: 'youtube', label: 'YouTube', category: 'Redes sociales', component: Play },
  { key: 'linkedin', label: 'LinkedIn', category: 'Redes sociales', component: Users },
  { key: 'telegram', label: 'Telegram', category: 'Redes sociales', component: Send },
  { key: 'messenger', label: 'Messenger', category: 'Redes sociales', component: MessageSquare },
  { key: 'social', label: 'Red social', category: 'Redes sociales', component: TrendingUp },

  // Contacto
  { key: 'phone', label: 'Teléfono', category: 'Contacto', component: Phone },
  { key: 'email', label: 'Email', category: 'Contacto', component: Mail },
  { key: 'location', label: 'Ubicación', category: 'Contacto', component: MapPin },
  { key: 'website', label: 'Sitio web', category: 'Contacto', component: Globe },
  { key: 'link', label: 'Enlace', category: 'Contacto', component: Link },

  // Negocio
  { key: 'hours', label: 'Horarios', category: 'Negocio', component: Clock },
  { key: 'menu', label: 'Menú', category: 'Negocio', component: Utensils },
  { key: 'order', label: 'Pedidos', category: 'Negocio', component: ShoppingCart },
  { key: 'reservation', label: 'Reservaciones', category: 'Negocio', component: Calendar },
  { key: 'reviews', label: 'Reseñas', category: 'Negocio', component: Star },
  { key: 'favorites', label: 'Favoritos', category: 'Negocio', component: Heart },
  { key: 'qr', label: 'Código QR', category: 'Negocio', component: QrCode },

  // Multimedia
  { key: 'video', label: 'Video', category: 'Multimedia', component: Video },
  { key: 'audio', label: 'Audio', category: 'Multimedia', component: Mic },
  { key: 'photo', label: 'Fotos', category: 'Multimedia', component: Image },
  { key: 'camera', label: 'Cámara', category: 'Multimedia', component: Camera },
  { key: 'play', label: 'Reproducir', category: 'Multimedia', component: Play },
  { key: 'radio', label: 'Radio', category: 'Multimedia', component: Radio },
  { key: 'tv', label: 'TV en vivo', category: 'Multimedia', component: Tv },

  // Utilidades
  { key: 'document', label: 'Documento', category: 'Utilidades', component: FileText },
  { key: 'download', label: 'Descargar', category: 'Utilidades', component: Download },
  { key: 'share', label: 'Compartir', category: 'Utilidades', component: Share2 },
  { key: 'bookmark', label: 'Guardar', category: 'Utilidades', component: Bookmark },
  { key: 'view', label: 'Ver', category: 'Utilidades', component: Eye },
  { key: 'print', label: 'Imprimir', category: 'Utilidades', component: Printer },
  { key: 'wifi', label: 'Wi-Fi', category: 'Utilidades', component: Wifi },
  { key: 'support', label: 'Soporte', category: 'Utilidades', component: Headphones },
  { key: 'help', label: 'Ayuda', category: 'Utilidades', component: HelpCircle },
  { key: 'settings', label: 'Configuración', category: 'Utilidades', component: Settings },
  { key: 'gift', label: 'Ofertas', category: 'Utilidades', component: Gift },
  { key: 'award', label: 'Premios', category: 'Utilidades', component: Award },
  { key: 'security', label: 'Seguridad', category: 'Utilidades', component: Shield },
  { key: 'next', label: 'Siguiente', category: 'Utilidades', component: ChevronRight },
  { key: 'zap', label: 'Rápido', category: 'Utilidades', component: Zap },
  { key: 'game', label: 'Juegos', category: 'Utilidades', component: Gamepad2 },
  { key: 'art', label: 'Arte', category: 'Utilidades', component: Palette },
  { key: 'edit', label: 'Editar', category: 'Utilidades', component: PenTool },
  { key: 'read', label: 'Leer más', category: 'Utilidades', component: BookOpen },
];

export const iconCategories = [...new Set(iconMap.map((i) => i.category))];

export function getIconByKey(key: string): IconOption | undefined {
  return iconMap.find((i) => i.key === key.toLowerCase());
}

export function getIconComponent(key: string): ComponentType<{ className?: string }> | undefined {
  return getIconByKey(key)?.component;
}
