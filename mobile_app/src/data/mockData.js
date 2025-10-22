export const teacherSessions = [
  {
    id: 'pilates-01',
    title: 'Pilates Flow',
    level: 'Intermediário',
    studio: 'Sala A',
    date: 'Seg, 08 Abril',
    time: '07:30 - 08:20',
    occupancy: 8,
    capacity: 10,
    waitlist: 2,
    color: '#7F5AF0',
    attendees: [
      { id: 'st-01', name: 'Marta Silva', status: 'present' },
      { id: 'st-02', name: 'João Costa', status: 'present' },
      { id: 'st-03', name: 'Inês Melo', status: 'absent' },
      { id: 'st-04', name: 'Rui Ramos', status: 'late' }
    ]
  },
  {
    id: 'pilates-02',
    title: 'Core Restore',
    level: 'Avançado',
    studio: 'Sala Zen',
    date: 'Seg, 08 Abril',
    time: '12:00 - 12:50',
    occupancy: 10,
    capacity: 10,
    waitlist: 4,
    color: '#2CB67D',
    attendees: [
      { id: 'st-05', name: 'Vera Monteiro', status: 'present' },
      { id: 'st-06', name: 'Paulo Tavares', status: 'present' },
      { id: 'st-07', name: 'Sofia Reis', status: 'waitlist' },
      { id: 'st-08', name: 'Tiago Rocha', status: 'waitlist' }
    ]
  },
  {
    id: 'pilates-03',
    title: 'Stretch & Align',
    level: 'Iniciação',
    studio: 'Sala B',
    date: 'Ter, 09 Abril',
    time: '18:00 - 18:50',
    occupancy: 6,
    capacity: 10,
    waitlist: 0,
    color: '#46A6FF',
    attendees: [
      { id: 'st-09', name: 'Beatriz Lemos', status: 'present' },
      { id: 'st-10', name: 'Duarte Sequeira', status: 'present' }
    ]
  }
];

export const teacherMetrics = [
  { id: 'attendance', label: 'Assiduidade', value: '92%', caption: 'Últimos 30 dias', color: '#7F5AF0' },
  { id: 'waitlist', label: 'Lista de Espera', value: '06', caption: 'Alunos por promover', color: '#2CB67D' },
  { id: 'substitutions', label: 'Reposições', value: '04', caption: 'Agendadas esta semana', color: '#F25F4C' }
];

export const clientBookings = [
  {
    id: 'booking-01',
    title: 'Pilates Flow',
    coach: 'Ana Ribeiro',
    date: 'Ter, 09 Abril',
    time: '07:00',
    status: 'confirmed',
    color: '#2CB67D'
  },
  {
    id: 'booking-02',
    title: 'Core Restore',
    coach: 'Carla Martins',
    date: 'Qua, 10 Abril',
    time: '19:00',
    status: 'credit',
    color: '#7F5AF0'
  },
  {
    id: 'booking-03',
    title: 'Stretch & Align',
    coach: 'Marina Teixeira',
    date: 'Sex, 12 Abril',
    time: '18:30',
    status: 'waitlist',
    color: '#46A6FF'
  }
];

export const clientHighlights = [
  { id: 'credits', label: 'Créditos de reposição', value: '2', accent: '#7F5AF0' },
  { id: 'streak', label: 'Semanas seguidas', value: '5', accent: '#2CB67D' },
  { id: 'balance', label: 'Mensalidade', value: 'Paga', accent: '#46A6FF' }
];

export const adminInsights = [
  { id: 'occupancy', label: 'Taxa média de ocupação', value: '84%', accent: '#7F5AF0' },
  { id: 'payments', label: 'Mensalidades pendentes', value: '3', accent: '#F25F4C' },
  { id: 'growth', label: 'Novos alunos', value: '+8', accent: '#2CB67D' }
];

export const adminPlans = [
  {
    id: 'plan-01',
    title: 'Plano Premium',
    price: '65€',
    benefits: ['8 aulas presenciais', '2 créditos de reposição', 'Acesso a aulas online'],
    members: 42
  },
  {
    id: 'plan-02',
    title: 'Plano Flex',
    price: '45€',
    benefits: ['4 aulas presenciais', 'Reagendamento ilimitado', 'Check-in mobile'],
    members: 36
  }
];

export const adminTasks = [
  { id: 'task-01', label: 'Promover alunos da lista de espera', badge: '4 pendentes' },
  { id: 'task-02', label: 'Confirmar pagamentos automáticos', badge: '3 novos' },
  { id: 'task-03', label: 'Rever pedidos de troca de aula', badge: '2 em aberto' }
];
