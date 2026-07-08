import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Landmark, Users, Building, Calculator, MonitorSmartphone, 
  ChevronLeft, ChevronRight, BookOpen, Wallet, ShieldCheck, 
  CreditCard, ChevronDown, ArrowUpRight, X, Phone, Mail, MapPin, CheckCircle2
} from 'lucide-react';

// --- DATOS FICTICIOS ---
const mockSlides = [
  {
    titulo: "Créditos a tu medida",
    descripcion: "Financiamos tus proyectos con tasas preferenciales y pre-aprobación digital en menos de 24 horas.",
    botonText: "Cotizar préstamo",
    action: "cotizar"
  },
  {
    titulo: "Bienvenido a DigiBank",
    descripcion: "Una plataforma financiera adaptada exactamente a tus necesidades con soporte en línea permanente.",
    botonText: "Conoce más de nosotros",
    action: "quienes_somos"
  },
  {
    titulo: "Tu futuro seguro",
    descripcion: "Abre tu cuenta de ahorros con las mejores tasas de interés del mercado guatemalteco.",
    botonText: "Abre tu cuenta hoy",
    action: "ahorro"
  }
];

// --- CONTENIDO DEL MODAL DE INFORMACIÓN ---
const infoInstitucional = {
  quienes_somos: {
    titulo: "Quiénes Somos",
    contenido: "En DigiBank somos una institución financiera sólida y vanguardista, integrada al sistema bancario de la región. Nuestro propósito fundamental es impulsar el desarrollo económico de nuestros clientes a través de soluciones financieras ágiles, seguras y 100% digitales. Contamos con un equipo de profesionales comprometidos con la excelencia y la innovación constante."
  },
  historia: {
    titulo: "Nuestra Historia",
    contenido: "Nacimos con la visión de transformar la banca tradicional. Lo que comenzó como un proyecto de digitalización financiera, hoy se consolida como uno de los sistemas bancarios más modernos y prometedores. A lo largo de nuestro trayecto, hemos priorizado la accesibilidad, eliminando las barreras burocráticas y acercando los servicios financieros directamente a la palma de la mano de cada usuario."
  },
  mision_vision: {
    titulo: "Misión y Visión",
    contenido: "Misión: Proveer servicios financieros inclusivos, seguros and eficientes mediante tecnología de punta, mejorando la calidad de vida de nuestros usuarios.\n\nVisión: Ser reconocidos como el banco digital líder en la región, destacando por nuestra transparencia, innovación y el éxito financiero de nuestros clientes."
  },
  valores: {
    titulo: "Nuestros Valores",
    contenido: "• Integridad: Actuamos con total transparencia en cada transacción.\n• Innovación: Buscamos constantemente nuevas formas de mejorar.\n• Excelencia: Damos lo mejor en nuestro servicio al cliente.\n• Seguridad: Protegemos el patrimonio y los datos de nuestros usuarios por encima de todo."
  },
  ahorro_quetzales: {
    titulo: "Cuenta de Ahorro en Quetzales",
    contenido: "Haz crecer tu dinero de forma segura y accesible. Con nuestra Cuenta de Ahorro en Quetzales, obtienes tasas de interés competitivas calculadas diariamente, disponibilidad inmediata de tus fondos 24/7 a través de DigiBank en Línea, y cero cobros por manejo de cuenta."
  },
  ahorro_dolares: {
    titulo: "Cuenta de Ahorro en Dólares",
    contenido: "Protege tu patrimonio de la fluctuación cambiaria. Nuestra Cuenta de Ahorro en Dólares te permite realizar transferencias internacionales, recibir remesas directamente en tu cuenta y mantener tus fondos seguros con el respaldo de una moneda fuerte internacional."
  },
  plazo_fijo: {
    titulo: "Inversión a Plazo Fijo",
    contenido: "Maximiza tus rendimientos con nuestra cuenta a Plazo Fijo. Elige el plazo que mejor se adapte a tus metas financieras (desde 3 hasta 36 meses) y disfruta de tasas de interés preferenciales y garantizadas desde el primer día de tu inversión."
  },
  mi_futuro: {
    titulo: "Mi Futuro Cuenta (Ahorro Infantil)",
    contenido: "Fomenta el hábito del ahorro desde temprana edad. Una cuenta diseñada exclusivamente para los más pequeños del hogar, con incentivos por metas alcanzadas, sin montos mínimos de apertura y herramientas interactivas."
  },
  credito_empresarial: {
    titulo: "Crédito Empresarial",
    contenido: "Impulsa el crecimiento y la expansión de tu negocio. Diseñado para medianas y grandes empresas que requieren capital de trabajo, adquisición de activos o reestructuración de pasivos.\n\n• Tasa de interés referencial: 10% anual.\n• Plazos de hasta 60 meses."
  },
  microcredito: {
    titulo: "Microcredito Empresarial",
    contenido: "Apoyo financiero ágil para pequeños emprendedores y comerciantes. Obtén el capital necesario para surtir tu inventario o mejorar tu local sin trámites engorrosos.\n\n• Tasa de interés referencial: 12% anual.\n• Garantía fiduciaria o prendaria."
  },
  calculadora: {
    titulo: "Calculadora de Crédito",
    contenido: "Nuestra herramienta digital integrada en DigiBank en Línea te permite simular tus escenarios financieros. Ingresa el monto deseado y el plazo para conocer tu cuota mensual estimada, intereses y capital amortizado antes de aplicar a tu préstamo."
  },
  credito_hipotecario: {
    titulo: "Crédito Hipotecario",
    contenido: "Haz realidad el sueño de tu casa propia. Adquiere, construye o remodela tu vivienda con el respaldo de DigiBank. Te acompañamos en cada paso del proceso.\n\n• Tasa de interés preferencial: 7.5% anual.\n• Plazos extendidos de hasta 25 años."
  },
  credito_automatico: {
    titulo: "Crédito Automático",
    contenido: "Liquidez inmediata pre-aprobada basada en tu excelente historial crediticio y ahorros con nosotros. Desembolso directo a tu cuenta sin papeleos adicionales.\n\n• Tasa de interés referencial: 15% anual.\n• Desembolso en menos de 5 minutos."
  },
  credito_fiduciario: {
    titulo: "Crédito Fiduciario",
    contenido: "Préstamo personal flexible con el respaldo de uno o más fiadores. Ideal para consolidación de deudas, gastos médicos, educación o viajes.\n\n• Tasa de interés referencial: 14% anual.\n• Plazos de 12 a 48 meses."
  },
  crediagil: {
    titulo: "Crediágil",
    contenido: "Solución de crédito rápido para emergencias e imprevistos de bajo monto. Requisitos mínimos y resolución en el mismo día para que nunca te detengas.\n\n• Tasa de interés referencial: 18% anual.\n• Montos desde Q1,000 hasta Q10,000."
  },
  tarjeta_visa: {
    titulo: "Tarjeta de Crédito Visa",
    contenido: "Realiza tus compras con seguridad a nivel mundial. Disfruta de nuestro programa de puntos, extrafinanciamientos y beneficios exclusivos en comercios afiliados.\n\n• Tasa de interés referencial: 24% anual.\n• Cero membresía el primer año."
  }
};

function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Estados para los menús desplegables
  const [menuNosotrosOpen, setMenuNosotrosOpen] = useState(false);
  const [menuAhorrosOpen, setMenuAhorrosOpen] = useState(false);
  const [menuPrestamosOpen, setMenuPrestamosOpen] = useState(false);
  
  // Estados de Modales
  const [modalInfo, setModalInfo] = useState(null); 
  const [modalContactanos, setModalContactanos] = useState(false);
  const [modalBeneficios, setModalBeneficios] = useState(false);
  const [modalCotizador, setModalCotizador] = useState(false);
  const [modalResponsabilidad, setModalResponsabilidad] = useState(false);

  // Estados del Cotizador
  const [montoCotizar, setMontoCotizar] = useState('10000');
  const [plazoCotizar, setPlazoCotizar] = useState('12');
  const [correoCotizar, setCorreoCotizar] = useState('');
  const [cuotaCalculada, setCuotaCalculada] = useState(null);
  const [cotizacionEnviada, setCotizacionEnviada] = useState(false);

  const nextSlide = () => setCurrentSlide((prev) => (prev === mockSlides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? mockSlides.length - 1 : prev - 1));

  const toggleMenuNosotros = () => {
    setMenuNosotrosOpen(!menuNosotrosOpen);
    setMenuAhorrosOpen(false);
    setMenuPrestamosOpen(false);
  };

  const toggleMenuAhorros = () => {
    setMenuAhorrosOpen(!menuAhorrosOpen);
    setMenuNosotrosOpen(false);
    setMenuPrestamosOpen(false);
  };

  const toggleMenuPrestamos = () => {
    setMenuPrestamosOpen(!menuPrestamosOpen);
    setMenuNosotrosOpen(false);
    setMenuAhorrosOpen(false);
  };

  const handleMenuClick = (key) => {
    setModalInfo(infoInstitucional[key]);
    setMenuNosotrosOpen(false); 
    setMenuAhorrosOpen(false);
    setMenuPrestamosOpen(false);
  };

  const handleHeroAction = (action) => {
    if (action === "cotizar") {
      setModalCotizador(true);
    } else if (action === "quienes_somos") {
      handleMenuClick("quienes_somos");
    } else if (action === "ahorro") {
      handleMenuClick("ahorro_quetzales");
    }
  };

  const calcularCuota = (e) => {
    e.preventDefault();
    const monto = parseFloat(montoCotizar);
    const meses = parseInt(plazoCotizar);
    if (isNaN(monto) || isNaN(meses) || monto <= 0 || meses <= 0) return;
    
    // Tasa ficticia de interés simple del 1.10 anual prorrateado
    const tasaMensual = 0.10 / 12;
    const cuota = (monto * (1 + (tasaMensual * meses))) / meses;
    setCuotaCalculada(cuota.toFixed(2));
  };

  const enviarCotizacion = (e) => {
    e.preventDefault();
    if (!correoCotizar || !cuotaCalculada) return;
    setCotizacionEnviada(true);
    setTimeout(() => {
      setModalCotizador(false);
      setCotizacionEnviada(false);
      setCorreoCotizar('');
      setCuotaCalculada(null);
      alert('¡Gracias! La cotización detallada ha sido enviada a su dirección de correo electrónico.');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-0 relative">
      
      {/* --- MODAL DE INFORMACIÓN INSTITUCIONAL --- */}
      {modalInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-[#003B7A] px-8 py-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white tracking-wide">{modalInfo.titulo}</h3>
              <button onClick={() => setModalInfo(null)} className="text-blue-200 hover:text-white transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="p-8">
              <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
                {modalInfo.contenido}
              </p>
              <div className="mt-10 flex justify-end">
                <button onClick={() => setModalInfo(null)} className="px-8 py-2.5 bg-[#00A4E0] hover:bg-cyan-600 text-white font-bold rounded-full transition-colors shadow-md">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONTACTANOS --- */}
      {modalContactanos && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="bg-[#003B7A] px-8 py-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white tracking-wide">Puntos de Contacto</h3>
              <button onClick={() => setModalContactanos(false)} className="text-blue-200 hover:text-white transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-[#00A4E0] mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800">Línea de Atención PBX</h4>
                  <p className="text-slate-600 text-sm mt-1">+502 1702-DIGI (1702-3444)</p>
                  <p className="text-slate-400 text-xs mt-0.5">Lunes a Viernes: 8:00 AM - 6:00 PM | Sábados: 9:00 AM - 1:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-[#00A4E0] mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800">Soporte Digital</h4>
                  <p className="text-slate-600 text-sm mt-1">soporte@digibank.com</p>
                  <p className="text-slate-400 text-xs mt-0.5">Respuesta garantizada en menos de 2 horas hábiles</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-[#00A4E0] mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800">Oficinas Centrales</h4>
                  <p className="text-slate-600 text-sm mt-1">Diagonal 6, 10-01 Zona 10, Ciudad de Guatemala</p>
                  <p className="text-slate-400 text-xs mt-0.5">Edificio Las Margaritas, Torre II, Nivel 15</p>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={() => setModalContactanos(false)} className="px-8 py-2.5 bg-[#00A4E0] hover:bg-cyan-600 text-white font-bold rounded-full transition-colors shadow-md">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE BENEFICIOS --- */}
      {modalBeneficios && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-[#003B7A] px-8 py-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white tracking-wide">Beneficios de ser Asociado</h3>
              <button onClick={() => setModalBeneficios(false)} className="text-blue-200 hover:text-white transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="p-8 space-y-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-slate-600 text-base leading-relaxed"><strong className="text-slate-800">Ahorro Eficiente:</strong> Accede a tasas de interés de hasta el 8% anual garantizadas para incrementar tus fondos de manera constante.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-slate-600 text-base leading-relaxed"><strong className="text-slate-800">Financiamiento Inmediato:</strong> Solicitudes de crédito en línea simplificadas con pre-aprobación automática para clientes leales.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-slate-600 text-base leading-relaxed"><strong className="text-slate-800">Transferencias Gratuitas:</strong> Realiza transacciones locales a terceros y transferencias ACH a otros bancos sin comisiones de red.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-slate-600 text-base leading-relaxed"><strong className="text-slate-800">Tarjeta de Débito Internacional:</strong> Tarjeta física y digital gratuita con tecnología Contactless y cobertura internacional.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-slate-600 text-base leading-relaxed"><strong className="text-slate-800">Soporte PBX y en Línea:</strong> Canal prioritario de asistencia telefónica y soporte por chat en vivo directamente en la plataforma.</p>
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={() => setModalBeneficios(false)} className="px-8 py-2.5 bg-[#00A4E0] hover:bg-cyan-600 text-white font-bold rounded-full transition-colors shadow-md">
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DEL COTIZADOR DE PRESTAMOS --- */}
      {modalCotizador && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-[#003B7A] px-8 py-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white tracking-wide">Cotizador de Préstamos</h3>
              <button onClick={() => { setModalCotizador(false); setCuotaCalculada(null); }} className="text-blue-200 hover:text-white transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              {!cuotaCalculada ? (
                <form onSubmit={calcularCuota} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 text-sm font-semibold block">Monto a Financiar (Mínimo Q5,000)</label>
                    <input 
                      type="number" 
                      value={montoCotizar}
                      onChange={(e) => setMontoCotizar(e.target.value)}
                      placeholder="Monto en Quetzales"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00A4E0]"
                      min="5000"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-slate-600 text-sm font-semibold block">Plazo del Crédito (Meses)</label>
                    <select 
                      value={plazoCotizar} 
                      onChange={(e) => setPlazoCotizar(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00A4E0] font-semibold"
                    >
                      <option value="12">12 Meses (1 Año)</option>
                      <option value="24">24 Meses (2 Años)</option>
                      <option value="36">36 Meses (3 Años)</option>
                      <option value="48">48 Meses (4 Años)</option>
                      <option value="60">60 Meses (5 Años)</option>
                    </select>
                  </div>
                  
                  <button type="submit" className="w-full py-3 bg-[#00A4E0] hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors shadow-md mt-4">
                    Calcular Cuota Mensual
                  </button>
                </form>
              ) : (
                <form onSubmit={enviarCotizacion} className="space-y-6">
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cuota Mensual Estimada</span>
                    <h4 className="text-3xl font-extrabold text-[#003B7A] mt-1">Q {parseFloat(cuotaCalculada).toLocaleString('es-GT', { minimumFractionDigits: 2 })}</h4>
                    <p className="text-xs text-slate-400 mt-2">Tasas de interés referencial calculada con el 10% anual.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 text-sm font-semibold block">Ingrese su Correo Electrónico</label>
                    <input 
                      type="email" 
                      value={correoCotizar}
                      onChange={(e) => setCorreoCotizar(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00A4E0]"
                      required
                    />
                    <p className="text-xs text-slate-400">Le enviaremos la tabla de amortización completa y requisitos a esta dirección.</p>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setCuotaCalculada(null)}
                      className="w-1/2 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Atrás
                    </button>
                    <button 
                      type="submit" 
                      disabled={cotizacionEnviada}
                      className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors shadow-md disabled:opacity-75"
                    >
                      {cotizacionEnviada ? 'Enviando...' : 'Enviar Información'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE RESPONSABILIDAD SOCIAL --- */}
      {modalResponsabilidad && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-[#003B7A] px-8 py-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white tracking-wide">Responsabilidad Social Corporativa</h3>
              <button onClick={() => setModalResponsabilidad(false)} className="text-blue-200 hover:text-white transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-slate-600 text-base leading-relaxed">
                En DigiBank creemos en un crecimiento compartido. Nuestro modelo de negocio incorpora prácticas sostenibles que promueven la inclusión social, la educación financiera y el cuidado del medio ambiente:
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-[#003B7A]">1. Educación Financiera para Todos</h4>
                  <p className="text-slate-600 text-sm mt-0.5">Talleres, webinars y recursos digitales interactivos dirigidos a jóvenes y pequeños empresarios para una toma de decisiones responsable.</p>
                </div>
                <div>
                  <h4 className="font-bold text-[#003B7A]">2. Tecnología Inclusiva y Accesible</h4>
                  <p className="text-slate-600 text-sm mt-0.5">Garantizamos que nuestras plataformas digitales estén adaptadas para personas de la tercera edad o con discapacidades visuales leves.</p>
                </div>
                <div>
                  <h4 className="font-bold text-[#003B7A]">3. Operación Cero Papel (Ecobanca)</h4>
                  <p className="text-slate-600 text-sm mt-0.5">Al digitalizar el 100% de los contratos, firmas y operaciones, DigiBank reduce la tala de árboles y la huella de carbono operacional.</p>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={() => setModalResponsabilidad(false)} className="px-8 py-2.5 bg-[#00A4E0] hover:bg-cyan-600 text-white font-bold rounded-full transition-colors shadow-md">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. NAVBAR SUPERIOR */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center relative">
          
          <div className="flex items-center gap-3">
            <Landmark className="text-[#003B7A] w-10 h-10" />
            <span className="text-2xl font-extrabold tracking-tight text-[#003B7A]">DigiBank</span>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
            <span className="text-[#00A4E0] font-bold cursor-pointer transition-colors">Inicio</span>
            
            {/* MENÚ DESPLEGABLE "NOSOTROS" */}
            <div className="relative py-4">
              <button 
                onClick={toggleMenuNosotros}
                className={`flex items-center gap-1 cursor-pointer transition-colors focus:outline-none ${menuNosotrosOpen ? 'text-[#00A4E0]' : 'hover:text-[#003B7A]'}`}
              >
                Nosotros <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${menuNosotrosOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {menuNosotrosOpen && (
                <div className="absolute top-14 left-0 w-56 bg-white border border-slate-100 shadow-xl rounded-lg py-3 z-50">
                  <button onClick={() => handleMenuClick('quienes_somos')} className="w-full px-5 py-3 hover:bg-slate-50 hover:text-[#00A4E0] flex justify-between items-center text-slate-600 font-medium transition-colors">
                    Quiénes Somos <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </button>
                  <button onClick={() => handleMenuClick('historia')} className="w-full px-5 py-3 hover:bg-slate-50 hover:text-[#00A4E0] flex justify-between items-center text-slate-600 font-medium transition-colors">
                    Nuestra Historia <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </button>
                  <button onClick={() => handleMenuClick('mision_vision')} className="w-full px-5 py-3 hover:bg-slate-50 hover:text-[#00A4E0] flex justify-between items-center text-slate-600 font-medium transition-colors">
                    Misión y Visión <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </button>
                  <button onClick={() => handleMenuClick('valores')} className="w-full px-5 py-3 hover:bg-slate-50 hover:text-[#00A4E0] flex justify-between items-center text-slate-600 font-medium transition-colors">
                    Valores <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </button>
                </div>
              )}
            </div>

            {/* MENÚ DESPLEGABLE "AHORROS" */}
            <div className="relative py-4">
              <button 
                onClick={toggleMenuAhorros}
                className={`flex items-center gap-1 cursor-pointer transition-colors focus:outline-none ${menuAhorrosOpen ? 'text-[#00A4E0]' : 'hover:text-[#003B7A]'}`}
              >
                Ahorros <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${menuAhorrosOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {menuAhorrosOpen && (
                <div className="absolute top-14 left-0 w-64 bg-white border border-slate-100 shadow-xl rounded-lg py-3 z-50">
                  <button onClick={() => handleMenuClick('ahorro_quetzales')} className="w-full px-5 py-3 hover:bg-slate-50 hover:text-[#00A4E0] flex justify-between items-center text-slate-600 font-medium transition-colors">
                    Ahorro en Quetzales <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </button>
                  <button onClick={() => handleMenuClick('ahorro_dolares')} className="w-full px-5 py-3 hover:bg-slate-50 hover:text-[#00A4E0] flex justify-between items-center text-slate-600 font-medium transition-colors">
                    Ahorro en Dólares <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </button>
                  <button onClick={() => handleMenuClick('plazo_fijo')} className="w-full px-5 py-3 hover:bg-slate-50 hover:text-[#00A4E0] flex justify-between items-center text-slate-600 font-medium transition-colors">
                    Plazo Fijo <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </button>
                  <button onClick={() => handleMenuClick('mi_futuro')} className="w-full px-5 py-3 hover:bg-slate-50 hover:text-[#00A4E0] flex justify-between items-center text-slate-600 font-medium transition-colors">
                    Mi Futuro Cuenta <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </button>
                </div>
              )}
            </div>

            {/* MENÚ DESPLEGABLE "PRÉSTAMOS" */}
            <div className="relative py-4">
              <button 
                onClick={toggleMenuPrestamos}
                className={`flex items-center gap-1 cursor-pointer transition-colors focus:outline-none ${menuPrestamosOpen ? 'text-[#00A4E0]' : 'hover:text-[#003B7A]'}`}
              >
                Préstamos <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${menuPrestamosOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {menuPrestamosOpen && (
                <div className="absolute top-14 left-0 w-72 bg-white border border-slate-100 shadow-xl rounded-lg py-3 z-50">
                  <button onClick={() => handleMenuClick('credito_empresarial')} className="w-full px-5 py-3 hover:bg-slate-50 hover:text-[#00A4E0] flex justify-between items-center text-slate-600 font-medium transition-colors">
                    Crédito Empresarial <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </button>
                  <button onClick={() => handleMenuClick('microcredito')} className="w-full px-5 py-3 hover:bg-slate-50 hover:text-[#00A4E0] flex justify-between items-center text-slate-600 font-medium transition-colors">
                    Microcrédito Empresarial <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </button>
                  <button onClick={() => handleMenuClick('calculadora')} className="w-full px-5 py-3 hover:bg-slate-50 hover:text-[#00A4E0] flex justify-between items-center text-slate-600 font-medium transition-colors">
                    Calculadora de Crédito <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </button>
                  <button onClick={() => handleMenuClick('credito_hipotecario')} className="w-full px-5 py-3 hover:bg-slate-50 hover:text-[#00A4E0] flex justify-between items-center text-slate-600 font-medium transition-colors">
                    Crédito Hipotecario <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </button>
                  <button onClick={() => handleMenuClick('credito_automatico')} className="w-full px-5 py-3 hover:bg-slate-50 hover:text-[#00A4E0] flex justify-between items-center text-slate-600 font-medium transition-colors">
                    Crédito Automático <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </button>
                  <button onClick={() => handleMenuClick('credito_fiduciario')} className="w-full px-5 py-3 hover:bg-slate-50 hover:text-[#00A4E0] flex justify-between items-center text-slate-600 font-medium transition-colors">
                    Crédito Fiduciario <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </button>
                  <button onClick={() => handleMenuClick('crediagil')} className="w-full px-5 py-3 hover:bg-slate-50 hover:text-[#00A4E0] flex justify-between items-center text-slate-600 font-medium transition-colors">
                    Crediágil <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </button>
                  <button onClick={() => handleMenuClick('tarjeta_visa')} className="w-full px-5 py-3 hover:bg-slate-50 hover:text-[#00A4E0] flex justify-between items-center text-slate-600 font-medium transition-colors">
                    Tarjeta de Crédito Visa <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setModalBeneficios(true)} className="hover:text-[#003B7A] cursor-pointer transition-colors bg-transparent border-none outline-none font-medium">
              Beneficios
            </button>
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <Link to="/login" className="hidden sm:flex items-center px-5 py-2.5 border border-slate-300 rounded-full text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
              Mi DigiBank en línea
            </Link>
            <button onClick={() => setModalContactanos(true)} className="px-6 py-2.5 rounded-full bg-[#00A4E0] text-white hover:bg-cyan-600 font-semibold transition-colors shadow-md">
              Contáctanos
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-[#003B7A] rounded-[3rem] px-10 py-20 md:py-28 relative shadow-xl overflow-hidden flex flex-col justify-center">
          
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none rounded-r-[3rem]" />

          <button onClick={prevSlide} className="absolute left-4 lg:left-8 z-20 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-all hidden md:flex">
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button onClick={nextSlide} className="absolute right-4 lg:right-8 z-20 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-all hidden md:flex">
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="relative z-10 text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              {mockSlides[currentSlide].titulo}
            </h1>
            <p className="text-blue-100 text-lg md:text-xl leading-relaxed">
              {mockSlides[currentSlide].descripcion}
            </p>
            <div className="pt-6">
              <button 
                onClick={() => handleHeroAction(mockSlides[currentSlide].action)}
                className="inline-block px-8 py-3 bg-[#00A4E0] hover:bg-cyan-600 text-white font-bold rounded-full transition-colors shadow-lg"
              >
                {mockSlides[currentSlide].botonText}
              </button>
            </div>
            
            <div className="flex justify-center gap-3 pt-10 items-center">
              {mockSlides.map((_, index) => (
                <button 
                  key={index} 
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white w-8' : 'bg-white/30 w-2 hover:bg-white/50'}`}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. TARJETAS DE ACCIÓN */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 py-16">
        
        <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 flex flex-col transform transition-transform hover:-translate-y-2 bg-white">
          <div className="bg-[#003B7A] h-40 flex items-center justify-center relative">
             <Calculator className="w-16 h-16 text-white" strokeWidth={1.5} />
          </div>
          <div className="p-10 flex flex-col items-center text-center flex-grow">
            <h3 className="text-lg font-extrabold text-[#003B7A] mb-4 uppercase tracking-wide">COTIZADOR DE PRÉSTAMOS</h3>
            <p className="text-slate-500 mb-8 text-sm">Calcula tu cuota mensual estimada en segundos.</p>
            <button onClick={() => setModalCotizador(true)} className="mt-auto px-8 py-3 bg-[#00A4E0] hover:bg-cyan-600 text-white rounded-full font-bold transition-colors w-full">
              ¡Cotizar ahora!
            </button>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 flex flex-col transform transition-transform hover:-translate-y-2 bg-white">
          <div className="bg-[#003B7A] h-40 flex items-center justify-center relative">
             <BookOpen className="w-16 h-16 text-white" strokeWidth={1.5} />
          </div>
          <div className="p-10 flex flex-col items-center text-center flex-grow">
            <h3 className="text-lg font-extrabold text-[#003B7A] mb-4 uppercase tracking-wide">RESPONSABILIDAD SOCIAL</h3>
            <p className="text-slate-500 mb-8 text-sm">Conoce nuestro impacto y compromiso con el desarrollo sostenible.</p>
            <button onClick={() => setModalResponsabilidad(true)} className="mt-auto px-8 py-3 bg-[#00A4E0] hover:bg-cyan-600 text-white rounded-full font-bold transition-colors w-full">
              Ver más
            </button>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 flex flex-col transform transition-transform hover:-translate-y-2 bg-white">
          <div className="bg-[#003B7A] h-40 flex items-center justify-center relative">
             <MonitorSmartphone className="w-16 h-16 text-white" strokeWidth={1.5} />
          </div>
          <div className="p-10 flex flex-col items-center text-center flex-grow">
            <h3 className="text-lg font-extrabold text-[#003B7A] mb-4 uppercase tracking-wide">DIGIBANK EN LÍNEA</h3>
            <p className="text-slate-500 mb-8 text-sm">Tu banco en tus manos, 24/7 de forma rápida y segura.</p>
            <Link to="/login" className="mt-auto px-8 py-3 bg-[#00A4E0] hover:bg-cyan-600 text-white rounded-full font-bold transition-colors w-full">
              Ir a Plataforma
            </Link>
          </div>
        </div>
        
      </div>

      {/* 4. PILARES CORPORATIVOS */}
      <div className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#003B7A] mb-4">DigiBank: Tu Banco 100% Digital</h2>
          <p className="text-center text-slate-500 max-w-2xl mx-auto mb-16">Evolucionamos la forma en la que interactúas con tu dinero, integrando la máxima seguridad con la comodidad del mundo digital.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#003B7A] mb-6">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-[#003B7A] mb-3">Seguridad Avanzada</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Cifrado de datos de nivel militar y autenticación en Sandbox para garantizar que tu capital y tus datos estén siempre protegidos.</p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#003B7A] mb-6">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-[#003B7A] mb-3">Inclusión Sin Papeles</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Abre tu cuenta de ahorros, cotiza créditos y haz tus transacciones sin necesidad de hacer filas en agencias físicas.</p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#003B7A] mb-6">
                <Wallet className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-[#003B7A] mb-3">Finanzas Inteligentes</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Te brindamos herramientas de planificación financiera integradas para optimizar tus presupuestos e inversiones a plazo fijo.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. TARJETAS DE INFORMACIÓN */}
      <div className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white rounded-3xl p-14 text-center flex flex-col items-center justify-center border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
            <h2 className="text-3xl font-bold text-[#003B7A] mb-6">Sobre Nosotros</h2>
            <p className="text-slate-600 mb-10 max-w-md text-lg leading-relaxed">
              Somos una institución financiera sólida integrada al sistema bancario que promueve la mejora en la calidad de vida en los guatemaltecos.
            </p>
            <button onClick={() => handleMenuClick('quienes_somos')} className="px-10 py-3 bg-[#00A4E0] hover:bg-cyan-600 text-white font-bold rounded-full transition-colors shadow-md focus:outline-none">
              Conocer más
            </button>
          </div>

          <div className="bg-[#003B7A] rounded-3xl p-14 text-center flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
            <h2 className="text-3xl font-bold text-white mb-6 relative z-10">Estados Financieros</h2>
            <p className="text-blue-100 mb-10 max-w-md text-lg leading-relaxed relative z-10">
              Te invitamos a conocer acerca de la información financiera trimestral de DigiBank, con total transparencia y cumplimiento normativo.
            </p>
            <Link to="/login" className="px-10 py-3 bg-white text-[#003B7A] hover:bg-slate-100 font-bold rounded-full transition-colors shadow-md relative z-10">
              Ver estados financieros
            </Link>
          </div>
        </div>
      </div>

      {/* 6. FOOTER */}
      <footer className="bg-[#002855] text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="flex flex-col items-start gap-6">
            <div className="flex items-center gap-3">
              <Landmark className="text-[#00A4E0] w-12 h-12" />
              <span className="text-3xl font-extrabold tracking-tight text-white">DigiBank</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Tu aliado financiero en Guatemala. Innovación y seguridad en cada transacción.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold mb-6 text-[#00A4E0] uppercase tracking-wider text-sm">DIGIBANK</h4>
            <Link to="/login" className="block hover:text-white text-blue-200 transition-colors">Banca en Línea</Link>
            <button onClick={() => setModalCotizador(true)} className="block hover:text-white text-blue-200 transition-colors text-left focus:outline-none">Cotizador de Préstamos</button>
            <button onClick={() => handleMenuClick('quienes_somos')} className="block hover:text-white text-blue-200 transition-colors text-left focus:outline-none">Quiénes Somos</button>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold mb-6 text-[#00A4E0] uppercase tracking-wider text-sm">Ahorros</h4>
            <button onClick={() => handleMenuClick('ahorro_quetzales')} className="block hover:text-white text-blue-200 transition-colors text-left focus:outline-none">Cuenta de Ahorro en Quetzales</button>
            <button onClick={() => handleMenuClick('plazo_fijo')} className="block hover:text-white text-blue-200 transition-colors text-left focus:outline-none">Plazo Fijo</button>
            <button onClick={() => handleMenuClick('ahorro_dolares')} className="block hover:text-white text-blue-200 transition-colors text-left focus:outline-none">Ahorro en Dólares</button>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold mb-6 text-[#00A4E0] uppercase tracking-wider text-sm">Préstamos</h4>
            <button onClick={() => handleMenuClick('credito_hipotecario')} className="block hover:text-white text-blue-200 transition-colors text-left focus:outline-none">Crédito Hipotecario</button>
            <button onClick={() => handleMenuClick('credito_empresarial')} className="block hover:text-white text-blue-200 transition-colors text-left focus:outline-none">Crédito Empresarial</button>
            <button onClick={() => handleMenuClick('tarjeta_visa')} className="block hover:text-white text-blue-200 transition-colors text-left focus:outline-none">Tarjeta de Crédito Visa</button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 text-center text-blue-300 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 DigiBank MVP. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Términos de uso</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacidad</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Landing;