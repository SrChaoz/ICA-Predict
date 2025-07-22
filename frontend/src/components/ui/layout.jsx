import React from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const Layout = ({ children, className }) => {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5", className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  )
}

const PageContainer = ({ children, className }) => {
  return (
    <div className={cn("container mx-auto px-4 py-6", className)}>
      {children}
    </div>
  )
}

const PageHeader = ({ title, description, children, className }) => {
  return (
    <div className={cn("mb-6", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-lg">{description}</p>
        )}
        {children}
      </motion.div>
    </div>
  )
}

export { Layout, PageContainer, PageHeader }
