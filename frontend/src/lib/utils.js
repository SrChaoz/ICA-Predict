import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatValue(valor) {
  if (typeof valor === "number") {
    return valor.toFixed(2)
  }
  return valor
}

export function formatearNombreParametro(parametro) {
  if (parametro === "ph") return "pH"
  if (parametro === "tds") return "TDS"
  if (parametro === "ica") return "ICA"
  return parametro.charAt(0).toUpperCase() + parametro.slice(1)
}

export function getColorICA(valor) {
  if (valor >= 85) return "bg-green-500 text-white"
  if (valor >= 70) return "bg-green-300 text-black"
  if (valor >= 50) return "bg-yellow-300 text-black"
  if (valor >= 30) return "bg-orange-400 text-black"
  return "bg-red-500 text-white"
}
