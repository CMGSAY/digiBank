/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#F8FAFC',     // Fondo principal súper claro
          card: '#FFFFFF',      // Fondo blanco puro para tarjetas
          border: '#E2E8F0',    // Bordes sutiles
          primary: '#003B7A',   // Azul institucional oscuro (Estilo bancario)
          secondary: '#0EA5E9', // Azul claro/cyan para acentos y botones secundarios
          success: '#10B981',   // Verde para confirmaciones
          text: '#1E293B',      // Texto principal oscuro
          muted: '#64748B'      // Texto secundario grisáceo
        }
      }
    },
  },
  plugins: [],
}