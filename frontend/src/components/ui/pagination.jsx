import * as React from "react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className 
}) => {
  const generatePageNumbers = () => {
    const pages = []
    const delta = 2 // Número de páginas a mostrar a cada lado de la página actual
    
    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      pages.push(i)
    }
    
    return pages
  }

  const pageNumbers = generatePageNumbers()

  return (
    <div className={cn("flex items-center justify-center space-x-1", className)}>
      {/* Botón Anterior */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Primera página */}
      {totalPages > 0 && (
        <Button
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(1)}
          className="h-8 w-8 p-0"
        >
          1
        </Button>
      )}

      {/* Separador si hay gap */}
      {currentPage > 4 && (
        <div className="flex items-center">
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Páginas del medio */}
      {pageNumbers.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          className="h-8 w-8 p-0"
        >
          {page}
        </Button>
      ))}

      {/* Separador si hay gap */}
      {currentPage < totalPages - 3 && totalPages > 5 && (
        <div className="flex items-center">
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Última página */}
      {totalPages > 1 && (
        <Button
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="h-8 w-8 p-0"
        >
          {totalPages}
        </Button>
      )}

      {/* Botón Siguiente */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export { Pagination }
