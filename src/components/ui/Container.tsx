import React, { ReactNode } from 'react'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'header' | 'footer' | 'main'
}

/**
 * Global Consistent Home Page Container (Rule 1 & 2)
 * - Max Width: 1280px (centered)
 * - Mobile: px-4 (16px)
 * - Tablet: sm:px-6 (24px)
 * - Desktop: lg:px-8 (32px)
 */
export default function Container({
  children,
  className = '',
  as: Component = 'div',
  ...props
}: ContainerProps) {
  return (
    <Component
      className={`w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
