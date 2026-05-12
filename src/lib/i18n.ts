export type Lang = 'en' | 'es';

type Strings = Record<string, { en: string; es: string }>;

const STRINGS: Strings = {
  // Nav
  'nav.overview':  { en: 'Overview',      es: 'Resumen' },
  'nav.calendar':  { en: 'Calendar',      es: 'Calendario' },
  'nav.bookings':  { en: 'Bookings',      es: 'Reservas' },
  'nav.services':  { en: 'Services',      es: 'Servicios' },
  'nav.fees':      { en: 'Booking fees',  es: 'Tarifas de reserva' },
  'nav.clients':   { en: 'Clients',       es: 'Clientes' },
  'nav.hours':     { en: 'Working hours', es: 'Horario de trabajo' },
  'nav.settings':  { en: 'Settings',      es: 'Ajustes' },
  'nav.workspace': { en: 'Workspace',     es: 'Espacio de trabajo' },
  'nav.configure': { en: 'Configure',     es: 'Configurar' },

  // Topbar subtitles
  'top.overview.sub': { en: 'Tuesday, May 12, 2026',                      es: 'Martes, 12 de mayo de 2026' },
  'top.calendar.sub': { en: 'Manage your availability and bookings',       es: 'Administra tu disponibilidad y reservas' },
  'top.bookings.sub': { en: 'Every appointment, in one place',             es: 'Todas las citas en un solo lugar' },
  'top.services.sub': { en: 'Define what customers can book — and how you charge', es: 'Define qué pueden reservar y cómo cobras' },
  'top.fees.sub':     { en: 'Decide how much customers pay to hold a slot',       es: 'Decide cuánto pagan los clientes para reservar' },
  'top.clients.sub':  { en: 'Customer history and contact details',               es: 'Historial y contactos de clientes' },
  'top.hours.sub':    { en: 'Set your open days, times, and hourly capacity',    es: 'Define días, horarios y capacidad por hora' },
  'top.settings.sub': { en: 'Business profile, currency, and policies',           es: 'Perfil del negocio, moneda y políticas' },

  // Common actions
  'common.save':         { en: 'Save changes', es: 'Guardar cambios' },
  'common.save_short':   { en: 'Save',         es: 'Guardar' },
  'common.discard':      { en: 'Discard',      es: 'Descartar' },
  'common.reset':        { en: 'Reset',        es: 'Restablecer' },
  'common.cancel':       { en: 'Cancel',       es: 'Cancelar' },
  'common.add':          { en: 'Add',          es: 'Agregar' },
  'common.export':       { en: 'Export',       es: 'Exportar' },
  'common.search':       { en: 'Search',       es: 'Buscar' },
  'common.delete':       { en: 'Delete',       es: 'Eliminar' },

  // Common states / labels
  'common.active':    { en: 'Active',     es: 'Activo' },
  'common.now':       { en: 'Now',        es: 'Ahora' },
  'common.now_upper': { en: 'NOW',        es: 'AHORA' },
  'common.total':     { en: 'Total',      es: 'Total' },
  'common.free':      { en: 'Free',       es: 'Gratis' },
  'common.paid':      { en: 'Paid',       es: 'Pagado' },
  'common.due':       { en: 'due',        es: 'por pagar' },
  'common.confirmed': { en: 'confirmed',  es: 'confirmada' },
  'common.pending':   { en: 'pending',    es: 'pendiente' },
  'common.today':     { en: 'Today',      es: 'Hoy' },
  'common.minutes':   { en: 'min',        es: 'min' },
  'common.bookings':  { en: 'bookings',   es: 'reservas' },
  'common.payment':   { en: 'Payment',    es: 'Pago' },
  'common.message':   { en: 'Message',    es: 'Mensaje' },

  // Fee config — hero card
  'fee.hero.title': { en: 'Default booking fee', es: 'Tarifa de reserva predeterminada' },
  'fee.hero.sub':   { en: 'Apply this to every new service. You can override per service below.', es: 'Se aplica a cada nuevo servicio. Puedes anular por servicio abajo.' },

  // Fee modes
  'fee.mode.none.label':     { en: 'No booking fee',         es: 'Sin tarifa de reserva' },
  'fee.mode.none.sub':       { en: 'Free to book — collect everything at the appointment.',         es: 'Reserva gratuita — cobra todo en la cita.' },
  'fee.mode.applied.label':  { en: 'Fee applied to total',   es: 'Tarifa aplicada al total' },
  'fee.mode.applied.sub':    { en: 'Treat the booking fee as a deposit. It comes off the final bill.', es: 'Trata la tarifa como un depósito. Se descuenta del total final.' },
  'fee.mode.separate.label': { en: 'Fee charged separately', es: 'Tarifa cobrada por separado' },
  'fee.mode.separate.sub':   { en: 'Non-refundable hold, charged on top of the service price.',    es: 'Cargo no reembolsable, adicional al precio del servicio.' },

  // Fee amount card
  'fee.amount.title':  { en: 'Fee amount',                       es: 'Monto de la tarifa' },
  'fee.amount.sub':    { en: 'What customers pay to hold the slot.', es: 'Lo que los clientes pagan para reservar.' },
  'fee.charge_type':   { en: 'Charge type',                      es: 'Tipo de cargo' },
  'fee.flat':          { en: 'Flat amount',                      es: 'Monto fijo' },
  'fee.percent':       { en: 'Percentage of service',            es: 'Porcentaje del servicio' },
  'fee.amount.label':  { en: 'Amount',                           es: 'Monto' },
  'fee.percent.label': { en: 'Percent',                          es: 'Porcentaje' },
  'fee.hint.none':     { en: 'No fee — bookings are free.',      es: 'Sin tarifa — las reservas son gratis.' },
  'fee.hint.applied':  { en: 'Counts toward the appointment total.', es: 'Se descuenta del total de la cita.' },
  'fee.hint.separate': { en: 'Charged on top of the service price.', es: 'Se cobra adicional al precio del servicio.' },

  // Fee options (toggles)
  'fee.opt.refundable.label': { en: 'Refundable on cancellation',      es: 'Reembolsable al cancelar' },
  'fee.opt.refundable.hint':  { en: 'Refund the booking fee if the customer cancels at least 24 hours ahead.', es: 'Reembolsa la tarifa si el cliente cancela al menos 24 horas antes.' },
  'fee.opt.newonly.label':    { en: 'Require fee for new clients only', es: 'Cobrar solo a clientes nuevos' },
  'fee.opt.newonly.hint':     { en: 'Returning clients can book without paying upfront.',               es: 'Los clientes recurrentes pueden reservar sin pagar por adelantado.' },
  'fee.opt.itemize.label':    { en: 'Show fee on the booking confirmation', es: 'Mostrar la tarifa en la confirmación' },
  'fee.opt.itemize.hint':     { en: 'Itemize the fee in customer-facing emails and receipts.',          es: 'Detalla la tarifa en correos y recibos al cliente.' },

  // Fee preview
  'fee.preview.title':        { en: 'Customer view',      es: 'Vista del cliente' },
  'fee.preview.sub':          { en: 'How this looks at checkout.', es: 'Cómo se ve al pagar.' },
  'fee.preview.live':         { en: 'Live preview',       es: 'Vista previa en vivo' },
  'fee.preview.summary':      { en: 'Booking summary',    es: 'Resumen de la reserva' },
  'fee.preview.service':      { en: 'Service',            es: 'Servicio' },
  'fee.preview.booking_fee':  { en: 'Booking fee',        es: 'Tarifa de reserva' },
  'fee.preview.applied_badge':{ en: 'Applied to total',   es: 'Aplicada al total' },
  'fee.preview.schedule':     { en: 'Payment schedule',   es: 'Calendario de pago' },
  'fee.preview.due_now':      { en: 'Due at booking',     es: 'A pagar al reservar' },
  'fee.preview.due_later':    { en: 'Due at appointment', es: 'A pagar en la cita' },
  'fee.preview.confirm':      { en: 'Confirm booking',    es: 'Confirmar reserva' },
  'fee.preview.pay_and_book': { en: 'Pay {amt} & book',   es: 'Pagar {amt} y reservar' },
  'fee.preview.applied_note': { en: '{fee} applied to your final bill of {price}.', es: '{fee} aplicada al total de {price}.' },
  'fee.preview.sample_service':{ en: 'Standard Session — 60 min', es: 'Sesión Estándar — 60 min' },
  'fee.preview.sample_date':  { en: 'Tue, May 12 · 10:00 AM',    es: 'Mar, 12 may · 10:00' },
  'fee.preview.date_prefix':  { en: 'MAY 12',                    es: '12 MAY' },

  // Per-service overrides table
  'fee.overrides.title': { en: 'Per-service overrides',                       es: 'Anulaciones por servicio' },
  'fee.overrides.sub':   { en: 'Customize the booking fee for individual services.', es: 'Personaliza la tarifa para servicios específicos.' },
  'fee.overrides.add':   { en: 'Add override',                                es: 'Agregar anulación' },
  'fee.col.service': { en: 'Service',   es: 'Servicio' },
  'fee.col.mode':    { en: 'Mode',      es: 'Modo' },
  'fee.col.fee':     { en: 'Fee',       es: 'Tarifa' },
  'fee.col.price':   { en: 'Price',     es: 'Precio' },
  'fee.col.last7':   { en: 'Last 7d',   es: 'Últimos 7 días' },
  'fee.badge.none':     { en: 'No fee',        es: 'Sin tarifa' },
  'fee.badge.applied':  { en: 'Applied to total', es: 'Al total' },
  'fee.badge.separate': { en: 'Separate hold',    es: 'Por separado' },

  // Services screen
  'svc.all':    { en: 'All services', es: 'Todos los servicios' },
  'svc.active': { en: 'Active',       es: 'Activos' },
  'svc.drafts': { en: 'Drafts',       es: 'Borradores' },
  'svc.new':    { en: 'New service',  es: 'Nuevo servicio' },
  'svc.delete': { en: 'Delete service', es: 'Eliminar servicio' },
  'svc.fee':    { en: 'Booking fee',  es: 'Tarifa de reserva' },
  'svc.search': { en: 'Search services', es: 'Buscar servicios' },
  'svc.preview.title':  { en: 'What customer pays', es: 'Lo que paga el cliente' },
  'svc.service_price':  { en: 'Service price',       es: 'Precio del servicio' },
  'svc.at_appt':        { en: 'At appointment',      es: 'En la cita' },
  'svc.fee_badge.applied': { en: 'Applied:',          es: 'Aplicada:' },
  'svc.fee_badge.hold':    { en: 'Hold:',              es: 'Retención:' },
  'svc.fee_desc.applied':  { en: 'Customer pays {now} now, {later} at the appointment.',        es: 'El cliente paga {now} ahora y {later} en la cita.' },
  'svc.fee_desc.separate': { en: 'Customer pays {now} upfront, then {total} for the service.', es: 'El cliente paga {now} por adelantado y luego {total} por el servicio.' },

  // Working hours
  'hours.title':         { en: 'Working hours',    es: 'Horario de atención' },
  'hours.sub':           { en: "Slots outside these hours aren't bookable by customers.", es: 'Los horarios fuera de este rango no son reservables.' },
  'hours.open':          { en: 'Open',             es: 'Abierto' },
  'hours.closed':        { en: 'Closed',           es: 'Cerrado' },
  'hours.add_break':     { en: 'Add break',        es: 'Agregar descanso' },
  'hours.break':         { en: 'Break',            es: 'Descanso' },
  'hours.copy':          { en: 'Copy to all weekdays', es: 'Copiar a todos los días hábiles' },
  'hours.timezone':      { en: 'Timezone',         es: 'Zona horaria' },
  'hours.advance.title': { en: 'Booking window',   es: 'Ventana de reserva' },
  'hours.advance.min':   { en: 'Minimum notice',   es: 'Aviso mínimo' },
  'hours.advance.max':   { en: 'Furthest out',     es: 'Máximo en el futuro' },
  'hours.slot':          { en: 'Slot increment',   es: 'Intervalo de turnos' },
  'hours.buffer':        { en: 'Buffer between appointments', es: 'Tiempo entre citas' },
  'hours.no_min':        { en: 'No minimum',       es: 'Sin mínimo' },
  'hours.no_buffer':     { en: 'No buffer',        es: 'Sin tiempo intermedio' },
  'hours.days_out':      { en: '{n} days',          es: '{n} días' },
  'hours.hours_ahead':   { en: '{n} hours ahead',   es: '{n} horas de anticipación' },

  // Days of week
  'day.mon': { en: 'Monday',    es: 'Lunes' },
  'day.tue': { en: 'Tuesday',   es: 'Martes' },
  'day.wed': { en: 'Wednesday', es: 'Miércoles' },
  'day.thu': { en: 'Thursday',  es: 'Jueves' },
  'day.fri': { en: 'Friday',    es: 'Viernes' },
  'day.sat': { en: 'Saturday',  es: 'Sábado' },
  'day.sun': { en: 'Sunday',    es: 'Domingo' },
  'day.mon.short': { en: 'Mon', es: 'Lun' },
  'day.tue.short': { en: 'Tue', es: 'Mar' },
  'day.wed.short': { en: 'Wed', es: 'Mié' },
  'day.thu.short': { en: 'Thu', es: 'Jue' },
  'day.fri.short': { en: 'Fri', es: 'Vie' },
  'day.sat.short': { en: 'Sat', es: 'Sáb' },
  'day.sun.short': { en: 'Sun', es: 'Dom' },

  // Settings
  'settings.profile.title':   { en: 'Business profile',           es: 'Perfil del negocio' },
  'settings.profile.sub':     { en: 'What customers see when booking.', es: 'Lo que los clientes ven al reservar.' },
  'settings.business_name':   { en: 'Business name',              es: 'Nombre del negocio' },
  'settings.booking_url':     { en: 'Booking page URL',           es: 'URL de la página de reservas' },
  'settings.currency.title':  { en: 'Currency & taxes',           es: 'Moneda e impuestos' },
  'settings.currency.sub':    { en: 'Used across all services and invoices.', es: 'Se aplica a todos los servicios y facturas.' },
  'settings.currency':        { en: 'Currency',                   es: 'Moneda' },
  'settings.currency_symbol': { en: 'Currency symbol',            es: 'Símbolo de moneda' },
  'settings.cancel.title':    { en: 'Cancellation policy',        es: 'Política de cancelación' },
  'settings.cancel.sub':      { en: 'Shown at checkout and on confirmation emails.', es: 'Se muestra al pagar y en correos de confirmación.' },
  'settings.cancel.default':  {
    en: 'Reschedule or cancel at least 24 hours before your appointment for a full refund of the booking fee. Late cancellations forfeit the fee.',
    es: 'Reprograma o cancela al menos 24 horas antes de tu cita para reembolso completo de la tarifa. Cancelaciones tardías pierden la tarifa.',
  },
  'settings.lang.title': { en: 'Language', es: 'Idioma' },
  'settings.lang.sub':   { en: 'Interface language for the admin dashboard.', es: 'Idioma de la interfaz del panel de administración.' },

  // Overview
  'ov.kpi.today':   { en: "Today's appointments", es: 'Citas de hoy' },
  'ov.kpi.revenue': { en: 'Revenue booked',       es: 'Ingresos reservados' },
  'ov.kpi.fees':    { en: 'Fees collected',        es: 'Tarifas cobradas' },
  'ov.kpi.noshow':  { en: 'No-show rate',          es: 'Tasa de ausencias' },
  'ov.today.title': { en: "Today's schedule",      es: 'Agenda de hoy' },
  'ov.today.sub':   { en: 'Tuesday, May 12 · 6 appointments', es: 'Martes, 12 de mayo · 6 citas' },
  'ov.open_cal':    { en: 'Open calendar',          es: 'Abrir calendario' },
  'ov.fee_collect': { en: 'Fee collection',         es: 'Cobro de tarifas' },
  'ov.this_week':   { en: 'This week',              es: 'Esta semana' },
  'ov.collected':   { en: 'collected upfront across 38 bookings', es: 'cobradas por adelantado en 38 reservas' },
  'ov.refunded':    { en: 'Refunded',               es: 'Reembolsado' },
  'ov.retained':    { en: 'No-show retained',       es: 'Retenido por ausencia' },
  'ov.legend.applied':  { en: 'Applied to total',  es: 'Aplicadas al total' },
  'ov.legend.separate': { en: 'Separate hold',      es: 'Por separado' },
  'ov.legend.free':     { en: 'Free bookings',      es: 'Reservas gratis' },
  'ov.of_booked':   { en: 'of booked',              es: 'de lo reservado' },
  'ov.vs_last_tue': { en: '+2 vs. last Tue',         es: '+2 vs. último mar.' },
  'ov.mom':         { en: '+18% MoM',               es: '+18% MoM' },
  'ov.noshow_delta':{ en: '-0.6pt',                  es: '-0.6pt' },

  // Calendar
  'cal.day':       { en: 'Day',          es: 'Día' },
  'cal.week':      { en: 'Week',         es: 'Semana' },
  'cal.month':     { en: 'Month',        es: 'Mes' },
  'cal.filter':    { en: 'Filter',       es: 'Filtrar' },
  'cal.new':       { en: 'New booking',  es: 'Nueva reserva' },
  'cal.detail':    { en: 'Booking detail', es: 'Detalle de reserva' },
  'cal.message':   { en: 'Message client', es: 'Enviar mensaje' },
  'cal.reschedule':{ en: 'Reschedule',   es: 'Reprogramar' },
  'cal.unavailable':{ en: 'Outside working hours', es: 'Fuera del horario' },
  'cal.payment':   { en: 'Payment',      es: 'Pago' },
  'cal.fee_applied':  { en: 'Booking fee (applied to total)', es: 'Tarifa de reserva (aplicada al total)' },
  'cal.fee_hold':     { en: 'Booking fee (separate hold)',    es: 'Tarifa de reserva (cargo por separado)' },
  'cal.balance_appt': { en: 'Balance at appointment',         es: 'Saldo en la cita' },
  'cal.week_range':   { en: 'May 11 — 17, 2026',             es: '11 — 17 may 2026' },

  // Bookings list
  'bk.all':       { en: 'All',       es: 'Todas' },
  'bk.upcoming':  { en: 'Upcoming',  es: 'Próximas' },
  'bk.past':      { en: 'Past',      es: 'Pasadas' },
  'bk.cancelled': { en: 'Cancelled', es: 'Canceladas' },
  'bk.search':    { en: 'Search by client or service', es: 'Buscar por cliente o servicio' },
  'bk.new':       { en: 'New booking', es: 'Nueva reserva' },
  'bk.col.when':    { en: 'When',        es: 'Cuándo' },
  'bk.col.client':  { en: 'Client',      es: 'Cliente' },
  'bk.col.service': { en: 'Service',     es: 'Servicio' },
  'bk.col.status':  { en: 'Status',      es: 'Estado' },
  'bk.col.fee':     { en: 'Booking fee', es: 'Tarifa' },
  'bk.col.balance': { en: 'Balance',     es: 'Saldo' },
  'bk.mode.applied': { en: '· applied',  es: '· aplicado' },
  'bk.mode.hold':    { en: '· hold',     es: '· retención' },
  'bk.date_sample':  { en: 'Tue, May 12', es: 'Mar, 12 may' },

  // Clients
  'cl.search':       { en: 'Search clients', es: 'Buscar clientes' },
  'cl.add':          { en: 'Add client',     es: 'Agregar cliente' },
  'cl.col.client':   { en: 'Client',         es: 'Cliente' },
  'cl.col.visits':   { en: 'Visits',         es: 'Visitas' },
  'cl.col.spend':    { en: 'Lifetime spend', es: 'Gasto total' },
  'cl.col.last':     { en: 'Last visit',     es: 'Última visita' },
  'cl.last_visit':   { en: 'May 8',          es: '8 may' },
};

export function makeT(lang: Lang) {
  return function t(key: string, vars?: Record<string, string>): string {
    const entry = STRINGS[key];
    if (!entry) return key;
    let s = entry[lang] ?? entry.en ?? key;
    if (vars) {
      for (const k in vars) s = s.split(`{${k}}`).join(vars[k]);
    }
    return s;
  };
}

export type TFunction = ReturnType<typeof makeT>;
