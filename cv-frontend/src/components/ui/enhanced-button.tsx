'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  withRipple?: boolean;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, withRipple = true, onClick, children, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);
    const Comp = asChild ? Slot : 'button';

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (withRipple) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const newRipple = { x, y, id: Date.now() };
        setRipples((prev) => [...prev, newRipple]);
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
        }, 600);
      }
      
      onClick?.(event);
    };

    const buttonContent = (
      <>
        {children}
        {withRipple && ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
            initial={{ width: 0, height: 0, x: 0, y: 0 }}
            animate={{
              width: 200,
              height: 200,
              x: -100,
              y: -100,
              opacity: [1, 0],
            }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </>
    );

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }), 'relative overflow-hidden')}
          ref={ref}
          onClick={handleClick}
          {...props}
        >
          {buttonContent}
        </Comp>
      );
    }

    const typedMotionProps = props as React.ComponentPropsWithoutRef<typeof motion.button>;

    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }), 'relative overflow-hidden')}
        ref={ref}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        {...typedMotionProps}
      >
        {buttonContent}
      </motion.button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export { EnhancedButton, buttonVariants };
