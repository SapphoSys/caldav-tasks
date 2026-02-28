import type { LucideIcon } from 'lucide-react';
import Book from 'lucide-react/icons/book';
import Bookmark from 'lucide-react/icons/bookmark';
import Briefcase from 'lucide-react/icons/briefcase';
import Building2 from 'lucide-react/icons/building-2';
import Calendar from 'lucide-react/icons/calendar';
import Camera from 'lucide-react/icons/camera';
import Car from 'lucide-react/icons/car';
import CheckSquare from 'lucide-react/icons/check-square';
import Clock from 'lucide-react/icons/clock';
import Coffee from 'lucide-react/icons/coffee';
import Dumbbell from 'lucide-react/icons/dumbbell';
import Gift from 'lucide-react/icons/gift';
import GraduationCap from 'lucide-react/icons/graduation-cap';
import Heart from 'lucide-react/icons/heart';
import Home from 'lucide-react/icons/home';
import ListTodo from 'lucide-react/icons/list-todo';
import Music from 'lucide-react/icons/music';
import Plane from 'lucide-react/icons/plane';
import ShoppingCart from 'lucide-react/icons/shopping-cart';
import Star from 'lucide-react/icons/star';
import Tag from 'lucide-react/icons/tag';
import Target from 'lucide-react/icons/target';
import Users from 'lucide-react/icons/users';
import Wallet from 'lucide-react/icons/wallet';
import Zap from 'lucide-react/icons/zap';

/**
 * Available icons for calendars and tags
 */
export const CALENDAR_ICONS: { name: string; icon: LucideIcon }[] = [
  { name: 'calendar', icon: Calendar },
  { name: 'check-square', icon: CheckSquare },
  { name: 'list-todo', icon: ListTodo },
  { name: 'briefcase', icon: Briefcase },
  { name: 'home', icon: Home },
  { name: 'heart', icon: Heart },
  { name: 'star', icon: Star },
  { name: 'tag', icon: Tag },
  { name: 'bookmark', icon: Bookmark },
  { name: 'target', icon: Target },
  { name: 'zap', icon: Zap },
  { name: 'coffee', icon: Coffee },
  { name: 'book', icon: Book },
  { name: 'graduation-cap', icon: GraduationCap },
  { name: 'dumbbell', icon: Dumbbell },
  { name: 'shopping-cart', icon: ShoppingCart },
  { name: 'car', icon: Car },
  { name: 'plane', icon: Plane },
  { name: 'music', icon: Music },
  { name: 'camera', icon: Camera },
  { name: 'gift', icon: Gift },
  { name: 'users', icon: Users },
  { name: 'building', icon: Building2 },
  { name: 'wallet', icon: Wallet },
  { name: 'clock', icon: Clock },
];

/**
 * Get icon component by name, fallback to Calendar icon
 * @param name - Icon name
 * @returns Icon component
 */
export function getIconByName(name: string): LucideIcon {
  const found = CALENDAR_ICONS.find((i) => i.name === name);
  return found?.icon ?? Calendar;
}
