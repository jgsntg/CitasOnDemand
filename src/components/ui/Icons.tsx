import React from 'react';

interface IconProps {
  size?: number;
  style?: React.CSSProperties;
  className?: string;
  strokeWidth?: number;
}

interface IconInternalProps extends IconProps {
  paths: string | string[];
}

const Icon = ({ paths, size = 16, ...rest }: IconInternalProps) => (
  <svg className="icon" width={size} height={size} viewBox="0 0 24 24" {...rest}>
    {Array.isArray(paths) ? paths.map((p, i) => <path key={i} d={p} />) : <path d={paths} />}
  </svg>
);

export const Home    = (p: IconProps) => <Icon {...p} paths={['M3 11l9-8 9 8','M5 9.5V20h14V9.5','M10 20v-6h4v6']} />;
export const Calendar= (p: IconProps) => <Icon {...p} paths={['M4 6.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-13z','M4 10h16','M9 3v4','M15 3v4']} />;
export const Layers  = (p: IconProps) => <Icon {...p} paths={['M12 3l9 5-9 5-9-5 9-5z','M3 13l9 5 9-5','M3 17l9 5 9-5']} />;
export const List    = (p: IconProps) => <Icon {...p} paths={['M8 6h13','M8 12h13','M8 18h13','M3 6h.01','M3 12h.01','M3 18h.01']} />;
export const Users   = (p: IconProps) => <Icon {...p} paths={['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z','M22 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75']} />;
export const Wallet  = (p: IconProps) => <Icon {...p} paths={['M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v2H5a2 2 0 0 1-2-2z','M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9','M16 13h2']} />;
export const Settings= (p: IconProps) => <Icon {...p} paths={['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z','M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z']} />;
export const Plus         = (p: IconProps) => <Icon {...p} paths={['M12 5v14','M5 12h14']} />;
export const Search       = (p: IconProps) => <Icon {...p} paths={['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z','M21 21l-4.3-4.3']} />;
export const ChevronRight = (p: IconProps) => <Icon {...p} paths="M9 18l6-6-6-6" />;
export const ChevronLeft  = (p: IconProps) => <Icon {...p} paths="M15 18l-6-6 6-6" />;
export const ChevronDown  = (p: IconProps) => <Icon {...p} paths="M6 9l6 6 6-6" />;
export const Check        = (p: IconProps) => <Icon {...p} paths="M5 12l5 5L20 7" />;
export const Bell         = (p: IconProps) => <Icon {...p} paths={['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9','M10.3 21a2 2 0 0 0 3.4 0']} />;
export const More         = (p: IconProps) => <Icon {...p} paths={['M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z','M19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z','M5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z']} />;
export const Edit         = (p: IconProps) => <Icon {...p} paths={['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7','M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z']} />;
export const Trash        = (p: IconProps) => <Icon {...p} paths={['M3 6h18','M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6','M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2']} />;
export const Copy         = (p: IconProps) => <Icon {...p} paths={['M8 4h12a2 2 0 0 1 2 2v12','M16 8H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2z']} />;
export const Filter       = (p: IconProps) => <Icon {...p} paths="M22 3H2l8 9.5V19l4 2v-8.5L22 3z" />;
export const Download     = (p: IconProps) => <Icon {...p} paths={['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4','M7 10l5 5 5-5','M12 15V3']} />;
export const Sparkle      = (p: IconProps) => <Icon {...p} paths={['M12 3v6','M12 15v6','M3 12h6','M15 12h6','M5.6 5.6l4.2 4.2','M14.2 14.2l4.2 4.2','M5.6 18.4l4.2-4.2','M14.2 9.8l4.2-4.2']} />;
export const Mail         = (p: IconProps) => <Icon {...p} paths={['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z','M22 6l-10 7L2 6']} />;
