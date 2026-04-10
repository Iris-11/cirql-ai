import React from 'react';
import { Text, TextProps, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// TYPOGRAPHY
interface TypographyProps extends TextProps {
  className?: string;
  variant?: 'display' | 'headline' | 'body' | 'label';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Typography = ({ 
  className, 
  variant = 'body', 
  size = 'md', 
  ...props 
}: TypographyProps) => {
  const baseClasses = {
    display: 'font-serif text-noto-bold', // Noto Serif
    headline: 'font-serif text-noto-med',
    body: 'font-sans text-manrope-reg', // Manrope
    label: 'font-sans text-manrope-med uppercase tracking-wider',
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  };

  return (
    <Text 
      className={cn(baseClasses[variant], sizeClasses[size], 'text-on-background', className)} 
      {...props} 
    />
  );
};

// BUTTON
interface ButtonProps extends TouchableOpacityProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  label: string;
}

export const Button = ({ 
  className, 
  variant = 'primary', 
  label, 
  ...props 
}: ButtonProps) => {
  const baseClasses = "rounded-full py-4 px-8 items-center justify-center flex-row";
  const variantClasses = {
    primary: "bg-primary shadow-premium",
    secondary: "bg-cream bg-opacity-80",
    outline: "border border-primary bg-transparent",
  };
  
  const textClasses = {
    primary: "text-white font-sans text-manrope-bold",
    secondary: "text-primary font-sans text-manrope-med",
    outline: "text-primary font-sans text-manrope-med",
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      className={cn(baseClasses, variantClasses[variant], className)} 
      {...props}
    >
      <Text className={cn(textClasses[variant])}>{label}</Text>
    </TouchableOpacity>
  );
};
