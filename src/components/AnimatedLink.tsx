import React from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';

export function AnimatedLink({ to, onClick, children, ...props }: LinkProps) {
  const { navigateWithLoading } = useLoading();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    if (onClick) onClick(e);
    // Convert 'to' to string just in case it's an object (though typically it's a string)
    const toStr = typeof to === 'string' ? to : to.pathname || '';
    if (toStr) {
      navigateWithLoading(toStr);
    }
  };

  return (
    <RouterLink to={to} onClick={handleClick} {...props}>
      {children}
    </RouterLink>
  );
}
