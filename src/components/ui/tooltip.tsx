import * as React from 'react';
import { cn } from '@/lib/utils';

type TooltipProps = React.HTMLAttributes<HTMLSpanElement>;

type TooltipTriggerProps = React.HTMLAttributes<HTMLSpanElement> & {
  asChild?: boolean;
  disabled?: boolean;
};

type TooltipContentProps = React.HTMLAttributes<HTMLSpanElement> & {
  side?: 'top' | 'bottom' | 'left' | 'right';
};

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('relative inline-flex group', className)}
        {...props}
      />
    );
  }
);
Tooltip.displayName = 'Tooltip';

const TooltipTrigger = React.forwardRef<HTMLSpanElement, TooltipTriggerProps>(
  ({ asChild, children, className, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{
        className?: string;
        onClick?: React.MouseEventHandler;
      }>;
      const handleClick: React.MouseEventHandler = (event) => {
        props.onClick?.(event);
        child.props.onClick?.(event);
      };

      return React.cloneElement(children, {
        ref,
        className: cn(className, child.props.className),
        ...props,
        onClick: handleClick,
      });
    }

    return (
      <span ref={ref} className={cn(className)} {...props}>
        {children}
      </span>
    );
  }
);
TooltipTrigger.displayName = 'TooltipTrigger';

const TooltipContent = React.forwardRef<HTMLSpanElement, TooltipContentProps>(
  ({ className, side = 'top', children, ...props }, ref) => {
    const sideClasses = {
      top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
      bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
      left: 'right-full mr-2 top-1/2 -translate-y-1/2',
      right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    };

    return (
      <span
        ref={ref}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 hidden whitespace-nowrap rounded-md',
          'bg-foreground px-2 py-1 text-xs text-background shadow-md',
          'group-hover:block',
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
TooltipContent.displayName = 'TooltipContent';

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
