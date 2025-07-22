
// Función para calcular el índice individual (I) de cada parámetro
const calcularIndice = {
    ph: (valor) => Math.pow(10, (4.22 - (0.293 * valor))),
    turbidez: (valor) => 108 * Math.pow(valor, -0.178),
    conductividad: (valor) => 540 * Math.pow(valor, -0.379),
    tds: (valor) => valor < 520 ? 100 : 109.1 - 0.0175 * valor,
    dureza: (valor) => Math.pow(10, (1.974 - (0.00174 * valor))),
    color: (valor) => valor < 2.018 ? 100 : 123 * Math.pow(valor, -0.295),
}

// Ponderaciones de cada parámetro
const ponderaciones = {
    ph: 0.1,
    turbidez: 0.2,
    conductividad: 0.1,
    tds: 0.2,
    dureza: 0.2,
    color: 0.2
}

// Función para calcular el ICA global
export const calcularICA = (resultados) => {
    let ica = 0

    Object.entries(resultados).forEach(([parametro, valor]) => {
        if (calcularIndice[parametro]) {
            const indice = calcularIndice[parametro](valor)
            ica += indice * ponderaciones[parametro]
        }
    })

    return Math.round(ica)  // Se redondea para mostrar un valor más claro
}

// Función para determinar el color del ICA
export const obtenerColorICA = (ica) => {
    if (ica >= 85) return { color: "bg-green-500", texto: "No contaminado" }
    if (ica >= 70) return { color: "bg-blue-500", texto: "Aceptable" }
    if (ica >= 50) return { color: "bg-yellow-500", texto: "Poco contaminado" }
    if (ica >= 30) return { color: "bg-orange-500", texto: "Contaminado" }
    return { color: "bg-red-500", texto: "Altamente contaminado" }
}
