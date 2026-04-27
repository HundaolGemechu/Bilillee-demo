import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  action?: React.ReactNode;
  onClick?: () => void;
}

export function Card({ title, children, footer, className = '', style, action, onClick }: CardProps) {
  return (
    <div className={`card ${className}`} style={style} onClick={onClick}>
      {(title || action) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
