// Mock data for development without backend

export const MOCK_USER = {
  id: '1',
  email: 'test@ritmofit.com',
  name: 'Juan Pérez',
  age: 28,
  gender: 'MALE',
  profilePicture: 'https://i.pravatar.cc/300?img=12',
};

export const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QHJpdG1vZml0LmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export const MOCK_CLASSES = [
  {
    id: '1',
    name: 'Yoga Matutino',
    professor: 'María González',
    dateTime: '2025-10-20T08:00:00',
    durationMinutes: 60,
    availableSlots: 12,
    discipline: 'Yoga',
    location: 'Sede Centro',
    description: 'Clase de yoga para comenzar el día con energía. Nivel principiante a intermedio.',
  },
  {
    id: '2',
    name: 'Spinning Intenso',
    professor: 'Carlos Ruiz',
    dateTime: '2025-10-20T18:00:00',
    durationMinutes: 45,
    availableSlots: 8,
    discipline: 'Spinning',
    location: 'Sede Norte',
    description: 'Entrenamiento cardiovascular de alta intensidad. Requiere nivel intermedio.',
  },
  {
    id: '3',
    name: 'Pilates Reformer',
    professor: 'Ana Martínez',
    dateTime: '2025-10-21T10:00:00',
    durationMinutes: 50,
    availableSlots: 6,
    discipline: 'Pilates',
    location: 'Sede Centro',
    description: 'Fortalecimiento y flexibilidad con equipamiento especializado.',
  },
  {
    id: '4',
    name: 'CrossFit WOD',
    professor: 'Diego López',
    dateTime: '2025-10-21T19:00:00',
    durationMinutes: 60,
    availableSlots: 15,
    discipline: 'CrossFit',
    location: 'Sede Sur',
    description: 'Workout of the Day - Entrenamiento funcional de alta intensidad.',
  },
  {
    id: '5',
    name: 'Zumba Party',
    professor: 'Laura Fernández',
    dateTime: '2025-10-22T17:00:00',
    durationMinutes: 60,
    availableSlots: 20,
    discipline: 'Zumba',
    location: 'Sede Este',
    description: 'Baile fitness con ritmos latinos. Diversión garantizada!',
  },
  {
    id: '6',
    name: 'Boxing Técnico',
    professor: 'Roberto Silva',
    dateTime: '2025-10-22T20:00:00',
    durationMinutes: 45,
    availableSlots: 10,
    discipline: 'Boxing',
    location: 'Sede Norte',
    description: 'Fundamentos de boxeo y acondicionamiento físico.',
  },
];

export const MOCK_BOOKINGS = [
  {
    bookingId: 'b1',
    className: 'Yoga Matutino',
    classDateTime: '2025-10-20T08:00:00',
    professor: 'María González',
    status: 'CONFIRMED',
    location: 'Sede Centro',
  },
  {
    bookingId: 'b2',
    className: 'Spinning Intenso',
    classDateTime: '2025-10-20T18:00:00',
    professor: 'Carlos Ruiz',
    status: 'CONFIRMED',
    location: 'Sede Norte',
  },
  {
    bookingId: 'b3',
    className: 'Pilates Reformer',
    classDateTime: '2025-10-21T10:00:00',
    professor: 'Ana Martínez',
    status: 'CONFIRMED',
    location: 'Sede Centro',
  },
];

export const MOCK_HISTORY = [
  {
    id: 'h1',
    discipline: 'Yoga',
    teacher: 'María González',
    site: 'Sede Centro',
    location: 'Sala 3',
    startDateTime: '2025-10-15T08:00:00',
    durationMinutes: 60,
  },
  {
    id: 'h2',
    discipline: 'Spinning',
    teacher: 'Carlos Ruiz',
    site: 'Sede Norte',
    location: 'Sala Spinning',
    startDateTime: '2025-10-12T18:00:00',
    durationMinutes: 45,
  },
  {
    id: 'h3',
    discipline: 'CrossFit',
    teacher: 'Diego López',
    site: 'Sede Sur',
    location: 'Box Principal',
    startDateTime: '2025-10-10T19:00:00',
    durationMinutes: 60,
  },
  {
    id: 'h4',
    discipline: 'Zumba',
    teacher: 'Laura Fernández',
    site: 'Sede Este',
    location: 'Sala 1',
    startDateTime: '2025-10-08T17:00:00',
    durationMinutes: 60,
  },
];

export const MOCK_HISTORY_DETAIL = {
  h1: {
    id: 'h1',
    discipline: 'Yoga',
    teacher: 'María González',
    site: 'Sede Centro',
    location: 'Sala 3',
    startDateTime: '2025-10-15T08:00:00',
    durationMinutes: 60,
    attendanceStatus: 'PRESENT',
    userReview: {
      rating: 5,
      comment: 'Excelente clase! La profesora es muy clara en sus instrucciones.',
      createdAt: '2025-10-15T10:00:00',
    },
  },
  h2: {
    id: 'h2',
    discipline: 'Spinning',
    teacher: 'Carlos Ruiz',
    site: 'Sede Norte',
    location: 'Sala Spinning',
    startDateTime: '2025-10-12T18:00:00',
    durationMinutes: 45,
    attendanceStatus: 'PRESENT',
    userReview: {
      rating: 4,
      comment: 'Muy intenso, justo lo que buscaba.',
      createdAt: '2025-10-12T19:30:00',
    },
  },
  h3: {
    id: 'h3',
    discipline: 'CrossFit',
    teacher: 'Diego López',
    site: 'Sede Sur',
    location: 'Box Principal',
    startDateTime: '2025-10-10T19:00:00',
    durationMinutes: 60,
    attendanceStatus: 'PRESENT',
    userReview: null,
  },
  h4: {
    id: 'h4',
    discipline: 'Zumba',
    teacher: 'Laura Fernández',
    site: 'Sede Este',
    location: 'Sala 1',
    startDateTime: '2025-10-08T17:00:00',
    durationMinutes: 60,
    attendanceStatus: 'PRESENT',
    userReview: {
      rating: 5,
      comment: 'Súper divertido! Volveré seguro.',
      createdAt: '2025-10-08T18:30:00',
    },
  },
};

export const MOCK_NEWS = [
  {
    id: 'n1',
    title: 'Nuevas Clases de Yoga Aéreo',
    date: '2025-10-18',
    content: 'A partir del próximo mes incorporamos clases de Yoga Aéreo en todas nuestras sedes. ¡No te lo pierdas!',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
  },
  {
    id: 'n2',
    title: '20% de Descuento en Planes Anuales',
    date: '2025-10-15',
    content: 'Promoción especial: contrata tu plan anual y obtén un 20% de descuento. Válido hasta fin de mes.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  },
  {
    id: 'n3',
    title: 'Nueva Sede en Palermo',
    date: '2025-10-10',
    content: 'Inauguramos nuestra nueva sede en Palermo con equipamiento de última generación. ¡Ven a conocerla!',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  },
  {
    id: 'n4',
    title: 'Desafío RitmoFit 30 Días',
    date: '2025-10-05',
    content: 'Únete a nuestro desafío de 30 días y transforma tu cuerpo. Premios para los más constantes!',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
  },
];

// Credentials for mock login
export const MOCK_CREDENTIALS = {
  email: 'test@ritmofit.com',
  password: '123456',
};

export const MOCK_OTP = '123456';
