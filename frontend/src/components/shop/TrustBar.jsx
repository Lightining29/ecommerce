import { Truck, RefreshCcw, ShieldCheck, Headphones, Gift } from 'lucide-react';
import './TrustBar.css';

const items = [
  { icon: Truck, label: 'Free Shipping Over $50' },
  { icon: RefreshCcw, label: '30-Day Easy Returns' },
  { icon: ShieldCheck, label: '100% Authentic Products' },
  { icon: Headphones, label: '24/7 Customer Support' },
  { icon: Gift, label: 'Free Gift on Orders $80+' },
  // duplicates for seamless loop
  { icon: Truck, label: 'Free Shipping Over $50' },
  { icon: RefreshCcw, label: '30-Day Easy Returns' },
  { icon: ShieldCheck, label: '100% Authentic Products' },
  { icon: Headphones, label: '24/7 Customer Support' },
  { icon: Gift, label: 'Free Gift on Orders $80+' },
];

export default function TrustBar() {
  return (
    <div className="trust-bar">
      <div className="trust-track">
        {items.map(({ icon: Icon, label }, i) => (
          <div key={i} className="trust-item">
            <Icon size={16} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
