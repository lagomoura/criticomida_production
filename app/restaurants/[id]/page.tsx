"use client";
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useCallback } from 'react';

const dessertMock: Record<string, {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  diary: string;
  plates: {
    name: string;
    date: string;
    image: string;
    pros: string[];
    cons: string[];
    note: string;
  }[];
  gallery?: string[];
}> = {
  'dulce-tentacion': {
    name: 'Dulce Tentación',
    location: 'Palermo, CABA',
    rating: 4.8,
    reviewCount: 18,
    description: 'Pastelería artesanal con los mejores postres y tortas.',
    pros: ['Gran variedad de postres', 'Ambiente acogedor', 'Opciones veganas'],
    cons: ['Precios algo altos', 'A veces hay espera'],
    diary: 'Visitamos Dulce Tentación en una tarde lluviosa. El aroma a chocolate y café nos recibió al entrar. Probamos varias tortas y la atención fue excelente. ¡Un lugar para volver!',
    plates: [
      {
        name: 'Torta de Chocolate',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        pros: ['Súper húmeda', 'Chocolate intenso'],
        cons: ['Porción pequeña'],
        note: 'Una de las mejores tortas de chocolate que probamos. Ideal para fans del chocolate.'
      },
      {
        name: 'Cheesecake de frutos rojos',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        pros: ['Frutos frescos', 'Base crocante'],
        cons: ['Un poco dulce de más'],
        note: 'Muy buena textura y sabor, aunque un poco empalagosa.'
      },
      {
        name: 'Lemon Pie',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        pros: ['Sabor cítrico', 'Merengue perfecto'],
        cons: [],
        note: 'El equilibrio justo entre ácido y dulce.'
      }
    ],
    gallery: [
      '/img/food-fallback.jpg',
      '/img/food-fallback.jpg',
      '/img/food-fallback.jpg'
    ]
  },
  'la-pasteleria': {
    name: 'La Pastelería',
    location: 'Recoleta, CABA',
    rating: 4.7,
    reviewCount: 12,
    description: 'Tortas y tartas caseras.',
    pros: ['Tartas frescas', 'Ambiente familiar', 'Café de calidad'],
    cons: ['Pocas opciones sin TACC'],
    diary: 'Fuimos a La Pastelería un domingo por la tarde. El lugar estaba lleno pero el servicio fue rápido. Probamos la tarta de manzana y la chocotorta, ambas deliciosas.',
    plates: [
      {
        name: 'Tarta de Manzana',
        date: '2024-06-09',
        image: '/img/food-fallback.jpg',
        pros: ['Manzanas frescas', 'Masa crocante'],
        cons: ['Un poco seca en los bordes'],
        note: 'La tarta tiene un sabor clásico y reconfortante.'
      },
      {
        name: 'Chocotorta',
        date: '2024-06-09',
        image: '/img/food-fallback.jpg',
        pros: ['Muy cremosa', 'Sabor intenso a chocolate'],
        cons: [],
        note: 'Perfecta para los amantes del chocolate.'
      }
    ]
  },
  'chocolovers': {
    name: 'ChocoLovers',
    location: 'Belgrano, CABA',
    rating: 4.9,
    reviewCount: 22,
    description: 'Especialidad en postres de chocolate.',
    pros: ['Chocolate de calidad', 'Opciones sin azúcar', 'Ambiente moderno'],
    cons: ['Difícil estacionar'],
    diary: 'ChocoLovers es el paraíso para los fanáticos del chocolate. Probamos el volcán y la mousse, ambos espectaculares. El local es pequeño pero muy cálido.',
    plates: [
      {
        name: 'Volcán de Chocolate',
        date: '2024-06-08',
        image: '/img/food-fallback.jpg',
        pros: ['Relleno líquido', 'Servido caliente'],
        cons: ['Porción pequeña'],
        note: 'El volcán es un must, ¡explosión de chocolate!'
      },
      {
        name: 'Mousse de Chocolate',
        date: '2024-06-08',
        image: '/img/food-fallback.jpg',
        pros: ['Textura aireada', 'No empalaga'],
        cons: [],
        note: 'Ideal para terminar la comida.'
      }
    ]
  },
  'tarta-co': {
    name: 'Tarta & Co.',
    location: 'Caballito, CABA',
    rating: 4.6,
    reviewCount: 10,
    description: 'Tartas dulces y saladas.',
    pros: ['Variedad de tartas', 'Precios accesibles'],
    cons: ['Pocas mesas'],
    diary: 'Un lugar sencillo pero con tartas muy ricas. Probamos la de ricota y la de frutilla. Ideal para una merienda rápida.',
    plates: [
      {
        name: 'Tarta de Ricota',
        date: '2024-06-07',
        image: '/img/food-fallback.jpg',
        pros: ['Ricota suave', 'Masa fina'],
        cons: [],
        note: 'Muy buena relación precio-calidad.'
      },
      {
        name: 'Tarta de Frutilla',
        date: '2024-06-07',
        image: '/img/food-fallback.jpg',
        pros: ['Frutillas frescas'],
        cons: ['Poca crema'],
        note: 'Fresca y liviana.'
      }
    ]
  },
  'dulzura-real': {
    name: 'Dulzura Real',
    location: 'Almagro, CABA',
    rating: 4.5,
    reviewCount: 15,
    description: 'Variedad de dulces y pastelería.',
    pros: ['Opciones sin TACC', 'Porciones generosas'],
    cons: ['Demora en la atención'],
    diary: 'Dulzura Real tiene una gran variedad de dulces. Probamos el brownie y la carrot cake. El local es amplio y luminoso.',
    plates: [
      {
        name: 'Brownie',
        date: '2024-06-06',
        image: '/img/food-fallback.jpg',
        pros: ['Muy húmedo', 'Nueces frescas'],
        cons: [],
        note: 'Ideal para acompañar con café.'
      },
      {
        name: 'Carrot Cake',
        date: '2024-06-06',
        image: '/img/food-fallback.jpg',
        pros: ['Sabor especiado', 'Frosting suave'],
        cons: ['Un poco denso'],
        note: 'Muy buena opción para los que buscan algo distinto.'
      }
    ]
  },
  'postre-express': {
    name: 'Postre Express',
    location: 'San Telmo, CABA',
    rating: 4.3,
    reviewCount: 8,
    description: 'Postres rápidos y deliciosos.',
    pros: ['Servicio rápido', 'Precios bajos'],
    cons: ['Pocas opciones saludables'],
    diary: 'Ideal para una parada rápida. Probamos el flan y la chocotorta. Todo salió en menos de 10 minutos.',
    plates: [
      {
        name: 'Flan Casero',
        date: '2024-06-05',
        image: '/img/food-fallback.jpg',
        pros: ['Textura suave', 'Mucho dulce de leche'],
        cons: [],
        note: 'Clásico y bien hecho.'
      },
      {
        name: 'Chocotorta',
        date: '2024-06-05',
        image: '/img/food-fallback.jpg',
        pros: ['Porción grande'],
        cons: ['Un poco empalagosa'],
        note: 'Ideal para compartir.'
      }
    ]
  },
  'la-dulceria': {
    name: 'La Dulcería',
    location: 'Flores, CABA',
    rating: 4.4,
    reviewCount: 11,
    description: 'Dulces tradicionales argentinos.',
    pros: ['Recetas clásicas', 'Ambiente familiar'],
    cons: ['No aceptan tarjetas'],
    diary: 'Un viaje a la infancia con sabores tradicionales. Probamos el pastelito y la torta rogel.',
    plates: [
      {
        name: 'Pastelito',
        date: '2024-06-04',
        image: '/img/food-fallback.jpg',
        pros: ['Masa crocante', 'Dulce de membrillo'],
        cons: [],
        note: 'Perfecto para acompañar el mate.'
      },
      {
        name: 'Torta Rogel',
        date: '2024-06-04',
        image: '/img/food-fallback.jpg',
        pros: ['Mucho dulce de leche', 'Merengue casero'],
        cons: ['Porción chica'],
        note: 'Un clásico bien logrado.'
      }
    ]
  },
  'tentaciones': {
    name: 'Tentaciones',
    location: 'Villa Crespo, CABA',
    rating: 4.2,
    reviewCount: 9,
    description: 'Opciones sin gluten y veganas.',
    pros: ['Sin TACC', 'Opciones veganas', 'Ambiente relajado'],
    cons: ['Pocas mesas'],
    diary: 'Un lugar ideal para quienes buscan opciones saludables. Probamos la cookie vegana y el budín de limón.',
    plates: [
      {
        name: 'Cookie Vegana',
        date: '2024-06-03',
        image: '/img/food-fallback.jpg',
        pros: ['Sin azúcar', 'Textura crocante'],
        cons: [],
        note: 'Muy rica y saludable.'
      },
      {
        name: 'Budín de Limón',
        date: '2024-06-03',
        image: '/img/food-fallback.jpg',
        pros: ['Sabor fresco'],
        cons: ['Un poco seco'],
        note: 'Ideal para acompañar con té.'
      }
    ]
  },
  'sugar-rush': {
    name: 'Sugar Rush',
    location: 'Chacarita, CABA',
    rating: 4.7,
    reviewCount: 14,
    description: 'Pastelería moderna y creativa.',
    pros: ['Presentación original', 'Sabores innovadores'],
    cons: ['Precios elevados'],
    diary: 'Sugar Rush sorprende con sus combinaciones. Probamos el cupcake de matcha y la torta de maracuyá.',
    plates: [
      {
        name: 'Cupcake de Matcha',
        date: '2024-06-02',
        image: '/img/food-fallback.jpg',
        pros: ['Sabor intenso', 'Decoración creativa'],
        cons: [],
        note: 'Diferente y delicioso.'
      },
      {
        name: 'Torta de Maracuyá',
        date: '2024-06-02',
        image: '/img/food-fallback.jpg',
        pros: ['Sabor fresco', 'Textura suave'],
        cons: ['Un poco ácida'],
        note: 'Ideal para los que buscan algo distinto.'
      }
    ]
  },
  'dulce-final': {
    name: 'Dulce Final',
    location: 'Retiro, CABA',
    rating: 4.6,
    reviewCount: 13,
    description: 'El mejor final para tu comida.',
    pros: ['Postres variados', 'Buena atención'],
    cons: ['Local pequeño'],
    diary: 'Un cierre perfecto para cualquier comida. Probamos la mousse de limón y el tiramisú.',
    plates: [
      {
        name: 'Mousse de Limón',
        date: '2024-06-01',
        image: '/img/food-fallback.jpg',
        pros: ['Muy liviana', 'Sabor refrescante'],
        cons: [],
        note: 'Ideal para el verano.'
      },
      {
        name: 'Tiramisú',
        date: '2024-06-01',
        image: '/img/food-fallback.jpg',
        pros: ['Café intenso', 'Textura cremosa'],
        cons: ['Un poco dulce'],
        note: 'Muy bien logrado.'
      }
    ]
  }
};

// Burger restaurants mock data
const burgerMock: Record<string, {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  diary: string;
  plates: {
    name: string;
    date: string;
    image: string;
    note: string;
    pros: string[];
    cons: string[];
  }[];
}> = {
  'burger-bros': {
    name: 'Burger Bros',
    location: 'Palermo, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Hamburguesas artesanales y papas rústicas.',
    pros: ['Pan casero', 'Carne jugosa', 'Papas rústicas'],
    cons: ['A veces mucha gente', 'Precios altos'],
    diary: 'Visitamos Burger Bros un viernes por la noche. El local estaba lleno, pero la atención fue rápida. Las hamburguesas son grandes y el pan es realmente casero.',
    plates: [
      {
        name: 'Cheese Bacon Burger',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        note: 'Muy sabrosa, el bacon crocante y el queso derretido. La carne al punto justo.',
        pros: ['Bacon crocante', 'Queso abundante'],
        cons: ['Un poco grasosa']
      },
      {
        name: 'Papas Rústicas',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        note: 'Papas cortadas a mano, bien doradas y crujientes.',
        pros: ['Porción generosa', 'Bien condimentadas'],
        cons: ['Un poco aceitosas']
      }
    ]
  },
  'burger-house': {
    name: 'Burger House',
    location: 'Recoleta, CABA',
    rating: 4.6,
    reviewCount: 8,
    description: 'Hamburguesas clásicas.',
    pros: ['Ambiente familiar', 'Salsas caseras'],
    cons: ['Pocas opciones vegetarianas'],
    diary: 'Ideal para ir en familia. Probamos la clásica y la veggie. Las salsas son un diferencial.',
    plates: [
      {
        name: 'Hamburguesa Clásica',
        date: '2024-06-08',
        image: '/img/food-fallback.jpg',
        note: 'Simple, bien hecha, pan suave y carne sabrosa.',
        pros: ['Sabor clásico', 'Pan fresco'],
        cons: ['Le faltaba un poco de sal']
      },
      {
        name: 'Veggie Burger',
        date: '2024-06-08',
        image: '/img/food-fallback.jpg',
        note: 'Buena opción vegetariana, aunque un poco seca.',
        pros: ['Opción saludable'],
        cons: ['Un poco seca']
      }
    ]
  },
  'burger-express': {
    name: 'Burger Express',
    location: 'Belgrano, CABA',
    rating: 4.5,
    reviewCount: 6,
    description: 'Hamburguesas rápidas.',
    pros: ['Servicio rápido', 'Buena relación precio/calidad'],
    cons: ['Local pequeño'],
    diary: 'Perfecto para una comida rápida. El local es chico pero la atención es ágil.',
    plates: [
      {
        name: 'Express Burger',
        date: '2024-06-05',
        image: '/img/food-fallback.jpg',
        note: 'Ideal para llevar, carne bien cocida y pan firme.',
        pros: ['Rápido', 'Económico'],
        cons: ['Poco espacio para sentarse']
      },
      {
        name: 'Combo Express',
        date: '2024-06-05',
        image: '/img/food-fallback.jpg',
        note: 'Incluye bebida y papas, buena opción para el mediodía.',
        pros: ['Completo', 'Buen precio'],
        cons: ['Papas algo frías']
      }
    ]
  },
  'burger-grill': {
    name: 'Burger Grill',
    location: 'San Telmo, CABA',
    rating: 4.4,
    reviewCount: 5,
    description: 'Grill de hamburguesas.',
    pros: ['Carne a la parrilla', 'Salsas originales'],
    cons: ['Demora en la atención'],
    diary: 'Las hamburguesas a la parrilla tienen un sabor ahumado único. Las salsas son caseras y originales.',
    plates: [
      {
        name: 'Grill Burger',
        date: '2024-06-03',
        image: '/img/food-fallback.jpg',
        note: 'Carne jugosa, pan tostado y salsa especial.',
        pros: ['Sabor ahumado', 'Salsa especial'],
        cons: ['Demora en servir']
      },
      {
        name: 'Papas Grill',
        date: '2024-06-03',
        image: '/img/food-fallback.jpg',
        note: 'Papas con especias, bien crocantes.',
        pros: ['Bien condimentadas'],
        cons: ['Porción pequeña']
      }
    ]
  },
  'burger-veggie': {
    name: 'Burger Veggie',
    location: 'Caballito, CABA',
    rating: 4.3,
    reviewCount: 4,
    description: 'Opciones vegetarianas.',
    pros: ['Variedad veggie', 'Ingredientes frescos'],
    cons: ['No hay opciones carnívoras'],
    diary: 'Un paraíso para vegetarianos. Probamos la burger de garbanzos y la de lentejas.',
    plates: [
      {
        name: 'Burger de Garbanzos',
        date: '2024-06-01',
        image: '/img/food-fallback.jpg',
        note: 'Textura suave, sabor especiado.',
        pros: ['Saludable', 'Bien condimentada'],
        cons: ['Un poco seca']
      },
      {
        name: 'Burger de Lentejas',
        date: '2024-06-01',
        image: '/img/food-fallback.jpg',
        note: 'Buena opción, acompañada de ensalada fresca.',
        pros: ['Acompañamiento fresco'],
        cons: ['Le faltaba sabor']
      }
    ]
  },
  'burger-central': {
    name: 'Burger Central',
    location: 'Almagro, CABA',
    rating: 4.2,
    reviewCount: 3,
    description: 'Hamburguesas céntricas.',
    pros: ['Ubicación conveniente', 'Menú variado'],
    cons: ['Ambiente ruidoso'],
    diary: 'Ideal para una comida rápida en el centro. El menú es variado y hay opciones para todos.',
    plates: [
      {
        name: 'Central Burger',
        date: '2024-05-29',
        image: '/img/food-fallback.jpg',
        note: 'Buena relación precio/calidad.',
        pros: ['Económica'],
        cons: ['Ambiente ruidoso']
      },
      {
        name: 'Combo Central',
        date: '2024-05-29',
        image: '/img/food-fallback.jpg',
        note: 'Incluye bebida y papas, opción completa.',
        pros: ['Completo'],
        cons: ['Papas poco crocantes']
      }
    ]
  },
  'burger-fiesta': {
    name: 'Burger Fiesta',
    location: 'Flores, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Fiesta de hamburguesas.',
    pros: ['Ambiente divertido', 'Promos 2x1'],
    cons: ['Música alta'],
    diary: 'Ideal para ir con amigos. Las promos 2x1 son geniales y el ambiente es muy animado.',
    plates: [
      {
        name: 'Fiesta Burger',
        date: '2024-05-27',
        image: '/img/food-fallback.jpg',
        note: 'Hamburguesa doble, mucho queso y salsa especial.',
        pros: ['Doble carne', 'Salsa especial'],
        cons: ['Muy grande']
      },
      {
        name: 'Papas Fiesta',
        date: '2024-05-27',
        image: '/img/food-fallback.jpg',
        note: 'Papas con cheddar y verdeo.',
        pros: ['Cheddar abundante'],
        cons: ['Muy calóricas']
      }
    ]
  },
  'burger-friends': {
    name: 'Burger & Friends',
    location: 'Villa Crespo, CABA',
    rating: 4.6,
    reviewCount: 7,
    description: 'Ideal para grupos.',
    pros: ['Mesas grandes', 'Atención rápida'],
    cons: ['Poca variedad de bebidas'],
    diary: 'Fuimos en grupo y nos atendieron muy bien. Las hamburguesas salieron rápido.',
    plates: [
      {
        name: 'Friends Burger',
        date: '2024-05-25',
        image: '/img/food-fallback.jpg',
        note: 'Hamburguesa con cebolla caramelizada y panceta.',
        pros: ['Cebolla caramelizada', 'Panceta crocante'],
        cons: ['Un poco salada']
      },
      {
        name: 'Combo Amigos',
        date: '2024-05-25',
        image: '/img/food-fallback.jpg',
        note: 'Combo para compartir, incluye papas y bebida.',
        pros: ['Ideal para compartir'],
        cons: ['Porción justa']
      }
    ]
  },
  'burger-final': {
    name: 'Burger Final',
    location: 'Chacarita, CABA',
    rating: 4.5,
    reviewCount: 8,
    description: 'El mejor final hamburguesero.',
    pros: ['Cierre perfecto', 'Postres ricos'],
    cons: ['Pocas mesas'],
    diary: 'Perfecto para cerrar la noche. Probamos la burger final y un postre casero.',
    plates: [
      {
        name: 'Final Burger',
        date: '2024-05-23',
        image: '/img/food-fallback.jpg',
        note: 'Hamburguesa con huevo y jamón, muy completa.',
        pros: ['Huevo a la plancha', 'Jamón cocido'],
        cons: ['Muy contundente']
      },
      {
        name: 'Brownie Final',
        date: '2024-05-23',
        image: '/img/food-fallback.jpg',
        note: 'Brownie casero, ideal para el postre.',
        pros: ['Postre casero'],
        cons: ['Muy dulce']
      }
    ]
  },
  'burger-king': {
    name: 'Burger King',
    location: 'Retiro, CABA',
    rating: 4.4,
    reviewCount: 6,
    description: 'Hamburguesas de reyes.',
    pros: ['Rápido', 'Conocido'],
    cons: ['Comida rápida estándar'],
    diary: 'Una opción conocida y rápida. Ideal para salir del paso.',
    plates: [
      {
        name: 'Whopper',
        date: '2024-05-20',
        image: '/img/food-fallback.jpg',
        note: 'La clásica de la cadena, igual que siempre.',
        pros: ['Sabor conocido'],
        cons: ['Nada especial']
      },
      {
        name: 'Papas King',
        date: '2024-05-20',
        image: '/img/food-fallback.jpg',
        note: 'Papas clásicas de fast food.',
        pros: ['Rápidas'],
        cons: ['No son caseras']
      }
    ]
  }
};

// Desayunos restaurants mock data
const desayunoMock: Record<string, {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  diary: string;
  plates: {
    name: string;
    date: string;
    image: string;
    note: string;
    pros: string[];
    cons: string[];
  }[];
}> = {
  'cafe-amanecer': {
    name: 'Café Amanecer',
    location: 'San Telmo, CABA',
    rating: 4.4,
    reviewCount: 7,
    description: 'Desayunos completos y café de especialidad.',
    pros: ['Café de especialidad', 'Desayuno abundante'],
    cons: ['Pocas mesas'],
    diary: 'Probamos el desayuno completo y el café. El ambiente es tranquilo y la atención muy buena.',
    plates: [
      {
        name: 'Desayuno Completo',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        note: 'Incluye medialunas, jugo y café.',
        pros: ['Porción generosa'],
        cons: []
      },
      {
        name: 'Café de especialidad',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        note: 'Aromático y bien preparado.',
        pros: ['Buen aroma'],
        cons: []
      }
    ]
  },
  'desayuno-feliz': {
    name: 'Desayuno Feliz',
    location: 'Palermo, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Desayunos saludables y energéticos.',
    pros: ['Opciones saludables', 'Ambiente alegre'],
    cons: ['Precios altos'],
    diary: 'El lugar es colorido y la carta muy variada. Probamos el bowl de frutas y el café con leche.',
    plates: [
      {
        name: 'Bowl de Frutas',
        date: '2024-06-09',
        image: '/img/food-fallback.jpg',
        note: 'Frutas frescas y yogur.',
        pros: ['Muy fresco'],
        cons: []
      },
      {
        name: 'Café con leche',
        date: '2024-06-09',
        image: '/img/food-fallback.jpg',
        note: 'Leche espumosa, café suave.',
        pros: ['Bien preparado'],
        cons: []
      }
    ]
  },
  'morning-cafe': {
    name: 'Morning Café',
    location: 'Recoleta, CABA',
    rating: 4.6,
    reviewCount: 8,
    description: 'Café de especialidad y medialunas.',
    pros: ['Medialunas frescas', 'Café intenso'],
    cons: ['Poco espacio'],
    diary: 'Probamos las medialunas y el café. El local es pequeño pero acogedor.',
    plates: [
      {
        name: 'Medialunas',
        date: '2024-06-08',
        image: '/img/food-fallback.jpg',
        note: 'Recién horneadas, muy tiernas.',
        pros: ['Muy frescas'],
        cons: []
      },
      {
        name: 'Café',
        date: '2024-06-08',
        image: '/img/food-fallback.jpg',
        note: 'Intenso y aromático.',
        pros: ['Buen sabor'],
        cons: []
      }
    ]
  },
  'desayuno-express': {
    name: 'Desayuno Express',
    location: 'Belgrano, CABA',
    rating: 4.3,
    reviewCount: 5,
    description: 'Rápido y delicioso.',
    pros: ['Servicio rápido', 'Opciones para llevar'],
    cons: ['Pocas opciones saludables'],
    diary: 'Ideal para un desayuno rápido. Probamos el sándwich de jamón y queso y el jugo de naranja.',
    plates: [
      {
        name: 'Sándwich de Jamón y Queso',
        date: '2024-06-07',
        image: '/img/food-fallback.jpg',
        note: 'Pan fresco, buen relleno.',
        pros: ['Ideal para llevar'],
        cons: []
      },
      {
        name: 'Jugo de Naranja',
        date: '2024-06-07',
        image: '/img/food-fallback.jpg',
        note: 'Natural, exprimido en el momento.',
        pros: ['Muy fresco'],
        cons: []
      }
    ]
  },
  'cafe-del-sol': {
    name: 'Café del Sol',
    location: 'Caballito, CABA',
    rating: 4.5,
    reviewCount: 9,
    description: 'Ambiente cálido y menú variado.',
    pros: ['Ambiente cálido', 'Menú variado'],
    cons: ['Demora en la atención'],
    diary: 'El ambiente es muy agradable. Probamos la tostada con mermelada y el café.',
    plates: [
      {
        name: 'Tostada con mermelada',
        date: '2024-06-06',
        image: '/img/food-fallback.jpg',
        note: 'Pan artesanal, mermelada casera.',
        pros: ['Muy rico'],
        cons: []
      },
      {
        name: 'Café',
        date: '2024-06-06',
        image: '/img/food-fallback.jpg',
        note: 'Aromático y suave.',
        pros: ['Buen aroma'],
        cons: []
      }
    ]
  },
  'desayuno-real': {
    name: 'Desayuno Real',
    location: 'Almagro, CABA',
    rating: 4.4,
    reviewCount: 7,
    description: 'Desayunos abundantes y frescos.',
    pros: ['Porciones grandes', 'Ingredientes frescos'],
    cons: ['Pocas opciones veganas'],
    diary: 'Probamos el desayuno real y el jugo de pomelo. Todo muy fresco.',
    plates: [
      {
        name: 'Desayuno Real',
        date: '2024-06-05',
        image: '/img/food-fallback.jpg',
        note: 'Incluye huevos, pan y jugo.',
        pros: ['Muy completo'],
        cons: []
      },
      {
        name: 'Jugo de Pomelo',
        date: '2024-06-05',
        image: '/img/food-fallback.jpg',
        note: 'Natural, un poco ácido.',
        pros: ['Refrescante'],
        cons: ['Un poco ácido']
      }
    ]
  },
  'cafe-pan': {
    name: 'Café & Pan',
    location: 'Flores, CABA',
    rating: 4.6,
    reviewCount: 10,
    description: 'Panadería artesanal y café.',
    pros: ['Pan artesanal', 'Café intenso'],
    cons: ['Pocas mesas'],
    diary: 'Probamos el pan de campo y el café. Todo muy fresco.',
    plates: [
      {
        name: 'Pan de Campo',
        date: '2024-06-04',
        image: '/img/food-fallback.jpg',
        note: 'Corteza crocante, miga suave.',
        pros: ['Muy fresco'],
        cons: []
      },
      {
        name: 'Café',
        date: '2024-06-04',
        image: '/img/food-fallback.jpg',
        note: 'Intenso y aromático.',
        pros: ['Buen sabor'],
        cons: []
      }
    ]
  },
  'desayuno-final': {
    name: 'Desayuno Final',
    location: 'Villa Crespo, CABA',
    rating: 4.2,
    reviewCount: 6,
    description: 'El mejor desayuno para empezar el día.',
    pros: ['Ideal para empezar el día', 'Opciones variadas'],
    cons: ['Cierra temprano'],
    diary: 'Probamos la tostada francesa y el jugo de naranja. Muy buen desayuno.',
    plates: [
      {
        name: 'Tostada Francesa',
        date: '2024-06-03',
        image: '/img/food-fallback.jpg',
        note: 'Dulce, bien dorada.',
        pros: ['Muy rica'],
        cons: []
      },
      {
        name: 'Jugo de Naranja',
        date: '2024-06-03',
        image: '/img/food-fallback.jpg',
        note: 'Natural, exprimido en el momento.',
        pros: ['Muy fresco'],
        cons: []
      }
    ]
  },
  'cafe-central': {
    name: 'Café Central',
    location: 'Chacarita, CABA',
    rating: 4.7,
    reviewCount: 12,
    description: 'Café clásico y ambiente retro.',
    pros: ['Ambiente retro', 'Café clásico'],
    cons: ['Puede estar lleno'],
    diary: 'El ambiente es muy retro y el café excelente. Probamos el café y la medialuna.',
    plates: [
      {
        name: 'Café',
        date: '2024-06-02',
        image: '/img/food-fallback.jpg',
        note: 'Clásico, bien preparado.',
        pros: ['Buen sabor'],
        cons: []
      },
      {
        name: 'Medialuna',
        date: '2024-06-02',
        image: '/img/food-fallback.jpg',
        note: 'Tierna y dulce.',
        pros: ['Muy fresca'],
        cons: []
      }
    ]
  },
  'desayuno-co': {
    name: 'Desayuno & Co.',
    location: 'Retiro, CABA',
    rating: 4.5,
    reviewCount: 8,
    description: 'Desayunos internacionales.',
    pros: ['Opciones internacionales', 'Ambiente moderno'],
    cons: ['Precios altos'],
    diary: 'Probamos el desayuno americano y el jugo de manzana. Muy buena experiencia.',
    plates: [
      {
        name: 'Desayuno Americano',
        date: '2024-06-01',
        image: '/img/food-fallback.jpg',
        note: 'Huevos, bacon y tostadas.',
        pros: ['Muy completo'],
        cons: []
      },
      {
        name: 'Jugo de Manzana',
        date: '2024-06-01',
        image: '/img/food-fallback.jpg',
        note: 'Natural, sin azúcar.',
        pros: ['Muy fresco'],
        cons: []
      }
    ]
  },
  'la-pasteleria': {
    name: 'La Pastelería',
    location: 'Recoleta, CABA',
    rating: 4.7,
    reviewCount: 12,
    description: 'Tortas y tartas caseras.',
    pros: ['Tartas frescas', 'Ambiente familiar', 'Café de calidad'],
    cons: ['Pocas opciones sin TACC'],
    diary: 'Fuimos a La Pastelería un domingo por la tarde. El lugar estaba lleno pero el servicio fue rápido. Probamos la tarta de manzana y la chocotorta, ambas deliciosas.',
    plates: [
      {
        name: 'Tarta de Manzana',
        date: '2024-06-09',
        image: '/img/food-fallback.jpg',
        note: 'La tarta tiene un sabor clásico y reconfortante.',
        pros: ['Manzanas frescas', 'Masa crocante'],
        cons: ['Un poco seca en los bordes']
      },
      {
        name: 'Chocotorta',
        date: '2024-06-09',
        image: '/img/food-fallback.jpg',
        note: 'Perfecta para los amantes del chocolate.',
        pros: ['Muy cremosa', 'Sabor intenso a chocolate'],
        cons: []
      }
    ]
  }
};

// Japan-food restaurants mock data
const japanMock: Record<string, {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  diary: string;
  plates: {
    name: string;
    date: string;
    image: string;
    note: string;
    pros: string[];
    cons: string[];
  }[];
}> = {
  'sushi-house': {
    name: 'Sushi House',
    location: 'Belgrano, CABA',
    rating: 4.9,
    reviewCount: 15,
    description: 'Sushi fresco y ramen tradicional japonés.',
    pros: ['Sushi fresco', 'Ramen auténtico'],
    cons: ['Precios altos'],
    diary: 'Probamos el sushi y el ramen. Todo muy fresco y bien presentado.',
    plates: [
      { name: 'Sushi Variado', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Piezas frescas, arroz en su punto.', pros: ['Muy fresco'], cons: [] },
      { name: 'Ramen', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Caldo sabroso, fideos al dente.', pros: ['Caldo intenso'], cons: [] }
    ]
  },
  'tokyo-bites': {
    name: 'Tokyo Bites',
    location: 'Palermo, CABA',
    rating: 4.8,
    reviewCount: 12,
    description: 'Comida callejera japonesa.',
    pros: ['Street food auténtica', 'Ambiente moderno'],
    cons: ['Poco espacio'],
    diary: 'Probamos el takoyaki y el yakitori. Muy buena experiencia.',
    plates: [
      { name: 'Takoyaki', date: '2024-06-09', image: '/img/food-fallback.jpg', note: 'Bolas de pulpo, bien hechas.', pros: ['Sabor original'], cons: [] },
      { name: 'Yakitori', date: '2024-06-09', image: '/img/food-fallback.jpg', note: 'Brochetas de pollo, jugosas.', pros: ['Bien cocidas'], cons: [] }
    ]
  },
  'ramen-bar': {
    name: 'Ramen Bar',
    location: 'Recoleta, CABA',
    rating: 4.7,
    reviewCount: 9,
    description: 'Ramen y gyozas.',
    pros: ['Ramen casero', 'Gyozas frescas'],
    cons: ['Pocas mesas'],
    diary: 'Probamos el ramen de cerdo y las gyozas. El caldo es muy sabroso y las gyozas bien rellenas.',
    plates: [
      { name: 'Ramen de Cerdo', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Caldo intenso, fideos al dente.', pros: ['Caldo sabroso'], cons: [] },
      { name: 'Gyozas', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Relleno jugoso, masa fina.', pros: ['Bien rellenas'], cons: [] }
    ]
  },
  'sakura-sushi': {
    name: 'Sakura Sushi',
    location: 'San Telmo, CABA',
    rating: 4.6,
    reviewCount: 8,
    description: 'Sushi rolls y sake.',
    pros: ['Sushi variado', 'Sake importado'],
    cons: ['Precios altos'],
    diary: 'Probamos los rolls de salmón y el sake frío. Muy buena calidad y atención.',
    plates: [
      { name: 'Rolls de Salmón', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Salmón fresco, arroz bien preparado.', pros: ['Salmón fresco'], cons: [] },
      { name: 'Sake', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Sake frío, suave.', pros: ['Muy suave'], cons: [] }
    ]
  },
  'nippon-grill': {
    name: 'Nippon Grill',
    location: 'Caballito, CABA',
    rating: 4.5,
    reviewCount: 7,
    description: 'Parrilla japonesa y tempura.',
    pros: ['Parrilla japonesa', 'Tempura crocante'],
    cons: ['Demora en la atención'],
    diary: 'Probamos la carne a la parrilla y el tempura de langostinos. Sabores auténticos y porciones generosas.',
    plates: [
      { name: 'Carne a la Parrilla', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne jugosa, bien cocida.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Tempura de Langostinos', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Rebozado crocante, langostinos frescos.', pros: ['Muy crocante'], cons: [] }
    ]
  },
  'osaka-express': {
    name: 'Osaka Express',
    location: 'Almagro, CABA',
    rating: 4.4,
    reviewCount: 6,
    description: 'Comida rápida japonesa.',
    pros: ['Rápido', 'Económico'],
    cons: ['Pocas opciones tradicionales'],
    diary: 'Probamos el donburi y el yakisoba. Todo salió rápido y estaba bien preparado.',
    plates: [
      { name: 'Donburi', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Arroz con pollo y verduras.', pros: ['Rápido'], cons: [] },
      { name: 'Yakisoba', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Fideos salteados, bien condimentados.', pros: ['Bien condimentado'], cons: [] }
    ]
  },
  'kyoto-cafe': {
    name: 'Kyoto Café',
    location: 'Flores, CABA',
    rating: 4.3,
    reviewCount: 5,
    description: 'Café japonés y postres.',
    pros: ['Café japonés', 'Postres originales'],
    cons: ['Pocas mesas'],
    diary: 'Probamos el matcha latte y el mochi. El ambiente es tranquilo y los postres muy ricos.',
    plates: [
      { name: 'Matcha Latte', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Sabor intenso, bien preparado.', pros: ['Muy rico'], cons: [] },
      { name: 'Mochi', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Dulce japonés, textura suave.', pros: ['Muy suave'], cons: [] }
    ]
  },
  'samurai-sushi': {
    name: 'Samurai Sushi',
    location: 'Villa Crespo, CABA',
    rating: 4.2,
    reviewCount: 4,
    description: 'Sushi y platos calientes.',
    pros: ['Sushi variado', 'Platos calientes'],
    cons: ['Pocas opciones vegetarianas'],
    diary: 'Probamos el sushi caliente y el yakimeshi. Muy buena atención y sabor.',
    plates: [
      { name: 'Sushi Caliente', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Sushi tempurizado, relleno de salmón.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Yakimeshi', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Arroz salteado con verduras.', pros: ['Bien preparado'], cons: [] }
    ]
  },
  'zen-ramen': {
    name: 'Zen Ramen',
    location: 'Chacarita, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Ramen vegetariano.',
    pros: ['Ramen vegetariano', 'Caldo intenso'],
    cons: ['Pocas opciones con carne'],
    diary: 'Probamos el ramen vegetariano y el tofu grillado. El caldo es muy sabroso y el tofu bien preparado.',
    plates: [
      { name: 'Ramen Vegetariano', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Caldo de verduras, fideos al dente.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Tofu Grillado', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Tofu dorado, bien condimentado.', pros: ['Bien preparado'], cons: [] }
    ]
  },
  'tokyo-final': {
    name: 'Tokyo Final',
    location: 'Retiro, CABA',
    rating: 4.6,
    reviewCount: 9,
    description: 'El mejor final japonés.',
    pros: ['Postres japoneses', 'Ambiente tranquilo'],
    cons: ['Pocas mesas'],
    diary: 'Probamos el dorayaki y el té verde. Muy buen cierre para una comida japonesa.',
    plates: [
      { name: 'Dorayaki', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Panqueque japonés relleno de anko.', pros: ['Muy rico'], cons: [] },
      { name: 'Té Verde', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Té suave, bien preparado.', pros: ['Muy suave'], cons: [] }
    ]
  }
};

// Arabic-food restaurants mock data
const arabicMock: Record<string, {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  diary: string;
  plates: {
    name: string;
    date: string;
    image: string;
    note: string;
    pros: string[];
    cons: string[];
  }[];
}> = {
  'sabores-de-oriente': {
    name: 'Sabores de Oriente',
    location: 'Almagro, CABA',
    rating: 4.5,
    reviewCount: 7,
    description: 'Comida árabe auténtica: shawarma, falafel y más.',
    pros: ['Shawarma auténtico', 'Falafel casero'],
    cons: ['Demora en la atención'],
    diary: 'Probamos el shawarma y el falafel. Muy sabrosos y bien servidos.',
    plates: [
      { name: 'Shawarma', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne bien condimentada.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Falafel', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Crujiente por fuera, suave por dentro.', pros: ['Bien hecho'], cons: [] }
    ]
  },
  'el-oasis': {
    name: 'El Oasis',
    location: 'Palermo, CABA',
    rating: 4.6,
    reviewCount: 8,
    description: 'Ambiente árabe y tés.',
    pros: ['Té árabe', 'Ambiente auténtico'],
    cons: ['Puede estar lleno'],
    diary: 'Probamos el té árabe y el baklava. Muy buena experiencia.',
    plates: [
      { name: 'Té Árabe', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Té especiado, bien servido.', pros: ['Muy aromático'], cons: [] },
      { name: 'Baklava', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Dulce de nuez y miel.', pros: ['Muy dulce'], cons: [] }
    ]
  },
  'damasco-grill': {
    name: 'Damasco Grill',
    location: 'Belgrano, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Carnes y especias.',
    pros: ['Carnes especiadas', 'Ambiente familiar'],
    cons: ['Demora en la atención'],
    diary: 'Probamos el kebab y el tabule. Muy buena atención.',
    plates: [
      { name: 'Kebab', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne especiada, bien cocida.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Tabule', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Ensalada fresca de trigo.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'falafel-house': {
    name: 'Falafel House',
    location: 'Recoleta, CABA',
    rating: 4.8,
    reviewCount: 12,
    description: 'Falafel y hummus.',
    pros: ['Falafel casero', 'Hummus cremoso'],
    cons: ['Pocas mesas'],
    diary: 'Probamos el falafel y el hummus. Muy buena experiencia.',
    plates: [
      { name: 'Falafel', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Croquetas de garbanzo, bien fritas.', pros: ['Muy crocante'], cons: [] },
      { name: 'Hummus', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Cremoso y bien condimentado.', pros: ['Muy cremoso'], cons: [] }
    ]
  },
  'shawarma-express': {
    name: 'Shawarma Express',
    location: 'San Telmo, CABA',
    rating: 4.4,
    reviewCount: 5,
    description: 'Shawarma rápido.',
    pros: ['Servicio rápido', 'Shawarma sabroso'],
    cons: ['Pocas opciones vegetarianas'],
    diary: 'Probamos el shawarma y el tabule. Todo salió rápido y estaba muy rico.',
    plates: [
      { name: 'Shawarma', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne bien condimentada.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Tabule', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Ensalada fresca de trigo.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'cafe-arabe': {
    name: 'Café Árabe',
    location: 'Caballito, CABA',
    rating: 4.3,
    reviewCount: 4,
    description: 'Café y dulces árabes.',
    pros: ['Café intenso', 'Dulces típicos'],
    cons: ['Pocas opciones saladas'],
    diary: 'Probamos el café árabe y el mamul. Muy buena experiencia.',
    plates: [
      { name: 'Café Árabe', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Café fuerte, especiado.', pros: ['Muy intenso'], cons: [] },
      { name: 'Mamul', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Dulce de dátiles y nuez.', pros: ['Muy dulce'], cons: [] }
    ]
  },
  'el-desierto': {
    name: 'El Desierto',
    location: 'Almagro, CABA',
    rating: 4.2,
    reviewCount: 3,
    description: 'Comida del desierto.',
    pros: ['Platos originales', 'Ambiente temático'],
    cons: ['Pocas opciones tradicionales'],
    diary: 'Probamos el cordero al horno y el couscous. Muy buena atención.',
    plates: [
      { name: 'Cordero al Horno', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Cordero tierno, bien condimentado.', pros: ['Muy tierno'], cons: [] },
      { name: 'Couscous', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Sémola con verduras.', pros: ['Muy suave'], cons: [] }
    ]
  },
  'sahara-grill': {
    name: 'Sahara Grill',
    location: 'Flores, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Grill árabe.',
    pros: ['Carnes a la parrilla', 'Ambiente animado'],
    cons: ['Puede estar lleno'],
    diary: 'Probamos la carne a la parrilla y el tabule. Muy buena atención.',
    plates: [
      { name: 'Carne a la Parrilla', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Corte jugoso, bien cocido.', pros: ['Muy jugoso'], cons: [] },
      { name: 'Tabule', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Ensalada fresca de trigo.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'beduino': {
    name: 'Beduino',
    location: 'Chacarita, CABA',
    rating: 4.6,
    reviewCount: 7,
    description: 'Comida beduina.',
    pros: ['Platos originales', 'Opciones vegetarianas'],
    cons: ['Pocas opciones dulces'],
    diary: 'Probamos el mansaf y la ensalada árabe. Muy buena experiencia.',
    plates: [
      { name: 'Mansaf', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Cordero con yogur y arroz.', pros: ['Muy original'], cons: [] },
      { name: 'Ensalada Árabe', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Tomate, pepino y perejil.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'oriente-final': {
    name: 'Oriente Final',
    location: 'Retiro, CABA',
    rating: 4.5,
    reviewCount: 8,
    description: 'El mejor final árabe.',
    pros: ['Cierre perfecto', 'Postres ricos'],
    cons: ['Puede estar lleno'],
    diary: 'Probamos el final árabe y el baklava. Muy buen cierre para una comida.',
    plates: [
      { name: 'Final Árabe', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Corte especial de la casa.', pros: ['Muy especial'], cons: [] },
      { name: 'Baklava', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Dulce de nuez y miel.', pros: ['Muy dulce'], cons: [] }
    ]
  }
};

// Israelfood restaurants mock data
const israelMock: Record<string, {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  diary: string;
  plates: {
    name: string;
    date: string;
    image: string;
    note: string;
    pros: string[];
    cons: string[];
  }[];
}> = {
  'tel-aviv-bistro': {
    name: 'Tel Aviv Bistró',
    location: 'Colegiales, CABA',
    rating: 4.3,
    reviewCount: 5,
    description: 'Sabores israelíes modernos y tradicionales.',
    pros: ['Platos típicos', 'Opciones vegetarianas'],
    cons: ['Pocas mesas'],
    diary: 'Probamos el shakshuka y el hummus. Muy buena experiencia.',
    plates: [
      { name: 'Shakshuka', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Salsa de tomate especiada.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Hummus', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Cremoso y bien condimentado.', pros: ['Muy cremoso'], cons: [] }
    ]
  },
  'jerusalen-cafe': {
    name: 'Jerusalén Café',
    location: 'Palermo, CABA',
    rating: 4.6,
    reviewCount: 8,
    description: 'Café y platos israelíes.',
    pros: ['Café intenso', 'Platos típicos'],
    cons: ['Puede estar lleno'],
    diary: 'Probamos el café y el sabich. Muy buena atención.',
    plates: [
      { name: 'Café Israelí', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Café fuerte, especiado.', pros: ['Muy intenso'], cons: [] },
      { name: 'Sabich', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Berenjena, huevo y ensalada.', pros: ['Muy sabroso'], cons: [] }
    ]
  },
  'sabra-grill': {
    name: 'Sabra Grill',
    location: 'Belgrano, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Grill israelí.',
    pros: ['Carnes a la parrilla', 'Opciones vegetarianas'],
    cons: ['Demora en la atención'],
    diary: 'Probamos el kebab y la ensalada israelí. Muy buena experiencia.',
    plates: [
      { name: 'Kebab', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne especiada, bien cocida.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Ensalada Israelí', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Tomate, pepino y cebolla.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'kibutz-house': {
    name: 'Kibutz House',
    location: 'Recoleta, CABA',
    rating: 4.8,
    reviewCount: 12,
    description: 'Comida de kibutz.',
    pros: ['Platos típicos', 'Ambiente familiar'],
    cons: ['Pocas opciones gourmet'],
    diary: 'Probamos el falafel y el couscous. Muy buena opción para familias.',
    plates: [
      { name: 'Falafel', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Croquetas de garbanzo, bien fritas.', pros: ['Muy crocante'], cons: [] },
      { name: 'Couscous', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Sémola con verduras.', pros: ['Muy suave'], cons: [] }
    ]
  },
  'falafel-israel': {
    name: 'Falafel Israel',
    location: 'San Telmo, CABA',
    rating: 4.4,
    reviewCount: 6,
    description: 'Falafel y hummus.',
    pros: ['Falafel casero', 'Hummus cremoso'],
    cons: ['Pocas mesas'],
    diary: 'Probamos el falafel y el hummus. Muy buena experiencia.',
    plates: [
      { name: 'Falafel', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Croquetas de garbanzo, bien fritas.', pros: ['Muy crocante'], cons: [] },
      { name: 'Hummus', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Cremoso y bien condimentado.', pros: ['Muy cremoso'], cons: [] }
    ]
  },
  'cafe-sabich': {
    name: 'Café Sabich',
    location: 'Caballito, CABA',
    rating: 4.3,
    reviewCount: 5,
    description: 'Café y sabich.',
    pros: ['Café intenso', 'Sabich típico'],
    cons: ['Pocas opciones dulces'],
    diary: 'Probamos el café y el sabich. Muy buena atención.',
    plates: [
      { name: 'Café Israelí', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Café fuerte, especiado.', pros: ['Muy intenso'], cons: [] },
      { name: 'Sabich', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Berenjena, huevo y ensalada.', pros: ['Muy sabroso'], cons: [] }
    ]
  },
  'shakshuka-bar': {
    name: 'Shakshuka Bar',
    location: 'Almagro, CABA',
    rating: 4.2,
    reviewCount: 4,
    description: 'Shakshuka y más.',
    pros: ['Shakshuka casera', 'Opciones vegetarianas'],
    cons: ['Pocas opciones carnívoras'],
    diary: 'Probamos la shakshuka y la ensalada israelí. Muy buena opción veggie.',
    plates: [
      { name: 'Shakshuka', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Salsa de tomate especiada.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Ensalada Israelí', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Tomate, pepino y cebolla.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'kosher-express': {
    name: 'Kosher Express',
    location: 'Flores, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Comida kosher rápida.',
    pros: ['Kosher rápido', 'Opciones variadas'],
    cons: ['Pocas opciones gourmet'],
    diary: 'Probamos el shawarma y el hummus. Muy buena opción rápida.',
    plates: [
      { name: 'Shawarma', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne bien condimentada.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Hummus', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Cremoso y bien condimentado.', pros: ['Muy cremoso'], cons: [] }
    ]
  },
  'sabores-de-israel': {
    name: 'Sabores de Israel',
    location: 'Chacarita, CABA',
    rating: 4.6,
    reviewCount: 7,
    description: 'Platos típicos israelíes.',
    pros: ['Platos típicos', 'Opciones vegetarianas'],
    cons: ['Pocas opciones dulces'],
    diary: 'Probamos el malawach y la ensalada israelí. Muy buena experiencia.',
    plates: [
      { name: 'Malawach', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Pan hojaldrado típico.', pros: ['Muy original'], cons: [] },
      { name: 'Ensalada Israelí', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Tomate, pepino y cebolla.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'israel-final': {
    name: 'Israel Final',
    location: 'Retiro, CABA',
    rating: 4.5,
    reviewCount: 8,
    description: 'El mejor final israelí.',
    pros: ['Cierre perfecto', 'Postres ricos'],
    cons: ['Puede estar lleno'],
    diary: 'Probamos el final israelí y el rugelach. Muy buen cierre para una comida.',
    plates: [
      { name: 'Final Israelí', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Corte especial de la casa.', pros: ['Muy especial'], cons: [] },
      { name: 'Rugelach', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Dulce típico, muy sabroso.', pros: ['Muy dulce'], cons: [] }
    ]
  }
};

// Thaifood restaurants mock data
const thaiMock: Record<string, {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  diary: string;
  plates: {
    name: string;
    date: string;
    image: string;
    note: string;
    pros: string[];
    cons: string[];
  }[];
}> = {
  'bangkok-express': {
    name: 'Bangkok Express',
    location: 'Palermo, CABA',
    rating: 4.6,
    reviewCount: 9,
    description: 'Pad thai, currys y street food tailandés.',
    pros: ['Pad thai auténtico', 'Curry sabroso'],
    cons: ['Picante fuerte'],
    diary: 'Probamos el pad thai y el curry verde. Muy buena experiencia.',
    plates: [
      { name: 'Pad Thai', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Fideos bien salteados.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Curry Verde', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Picante y aromático.', pros: ['Buen aroma'], cons: ['Muy picante'] }
    ]
  },
  'thai-house': {
    name: 'Thai House',
    location: 'Recoleta, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Comida tailandesa tradicional.',
    pros: ['Comida tradicional', 'Ambiente acogedor'],
    cons: ['Puede estar lleno'],
    diary: 'Probamos el curry rojo y el pad thai. Muy buena atención.',
    plates: [
      { name: 'Curry Rojo', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Picante y sabroso.', pros: ['Muy sabroso'], cons: ['Muy picante'] },
      { name: 'Pad Thai', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Fideos de arroz, bien salteados.', pros: ['Muy sabroso'], cons: [] }
    ]
  },
  'siam-grill': {
    name: 'Siam Grill',
    location: 'Belgrano, CABA',
    rating: 4.8,
    reviewCount: 12,
    description: 'Grill tailandés.',
    pros: ['Carnes a la parrilla', 'Opciones vegetarianas'],
    cons: ['Demora en la atención'],
    diary: 'Probamos la carne a la parrilla y el curry amarillo. Muy buena experiencia.',
    plates: [
      { name: 'Carne a la Parrilla', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Corte jugoso, bien cocido.', pros: ['Muy jugoso'], cons: [] },
      { name: 'Curry Amarillo', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Picante y aromático.', pros: ['Buen aroma'], cons: ['Muy picante'] }
    ]
  },
  'pad-thai-bar': {
    name: 'Pad Thai Bar',
    location: 'San Telmo, CABA',
    rating: 4.5,
    reviewCount: 6,
    description: 'Especialidad en pad thai.',
    pros: ['Pad thai auténtico', 'Opciones vegetarianas'],
    cons: ['Pocas opciones tradicionales'],
    diary: 'Probamos el pad thai y el curry verde. Muy buena opción veggie.',
    plates: [
      { name: 'Pad Thai', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Fideos de arroz, bien salteados.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Curry Verde', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Picante y aromático.', pros: ['Buen aroma'], cons: ['Muy picante'] }
    ]
  },
  'curry-express': {
    name: 'Curry Express',
    location: 'Caballito, CABA',
    rating: 4.4,
    reviewCount: 5,
    description: 'Currys rápidos.',
    pros: ['Servicio rápido', 'Curry casero'],
    cons: ['Pocas opciones'],
    diary: 'Probamos el curry rojo y el arroz jazmín. Todo salió rápido y estaba muy rico.',
    plates: [
      { name: 'Curry Rojo', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Picante y sabroso.', pros: ['Muy sabroso'], cons: ['Muy picante'] },
      { name: 'Arroz Jazmín', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Aromático y bien cocido.', pros: ['Muy aromático'], cons: [] }
    ]
  },
  'bangkok-cafe': {
    name: 'Bangkok Café',
    location: 'Almagro, CABA',
    rating: 4.3,
    reviewCount: 4,
    description: 'Café tailandés.',
    pros: ['Café intenso', 'Opciones dulces'],
    cons: ['Pocas opciones saladas'],
    diary: 'Probamos el café tailandés y el pastel de coco. Muy buena experiencia.',
    plates: [
      { name: 'Café Tailandés', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Café fuerte, bien preparado.', pros: ['Muy intenso'], cons: [] },
      { name: 'Pastel de Coco', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Dulce típico, muy sabroso.', pros: ['Muy dulce'], cons: [] }
    ]
  },
  'thai-veggie': {
    name: 'Thai Veggie',
    location: 'Flores, CABA',
    rating: 4.2,
    reviewCount: 3,
    description: 'Opciones vegetarianas.',
    pros: ['Opciones vegetarianas', 'Sabores originales'],
    cons: ['Pocas opciones tradicionales'],
    diary: 'Probamos el curry veggie y la ensalada tailandesa. Muy buena opción veggie.',
    plates: [
      { name: 'Curry Veggie', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Curry de verduras, bien especiado.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Ensalada Tailandesa', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Verduras frescas y sésamo.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'sabor-thai': {
    name: 'Sabor Thai',
    location: 'Villa Crespo, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Sabores tailandeses.',
    pros: ['Platos típicos', 'Opciones vegetarianas'],
    cons: ['Pocas opciones dulces'],
    diary: 'Probamos el pad thai y el curry amarillo. Muy buena experiencia.',
    plates: [
      { name: 'Pad Thai', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Fideos de arroz, bien salteados.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Curry Amarillo', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Picante y aromático.', pros: ['Buen aroma'], cons: ['Muy picante'] }
    ]
  },
  'thai-fiesta': {
    name: 'Thai Fiesta',
    location: 'Chacarita, CABA',
    rating: 4.6,
    reviewCount: 7,
    description: 'Fiesta tailandesa.',
    pros: ['Ambiente festivo', 'Platos variados'],
    cons: ['Música alta'],
    diary: 'Fuimos en grupo y probamos varios platos tailandeses. Muy divertido.',
    plates: [
      { name: 'Pad Thai', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Fideos de arroz, bien salteados.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Curry Verde', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Picante y aromático.', pros: ['Buen aroma'], cons: ['Muy picante'] }
    ]
  },
  'thai-final': {
    name: 'Thai Final',
    location: 'Retiro, CABA',
    rating: 4.5,
    reviewCount: 8,
    description: 'El mejor final tailandés.',
    pros: ['Cierre perfecto', 'Postres ricos'],
    cons: ['Puede estar lleno'],
    diary: 'Probamos el final tailandés y el pastel de mango. Muy buen cierre para una comida.',
    plates: [
      { name: 'Final Tailandés', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Corte especial de la casa.', pros: ['Muy especial'], cons: [] },
      { name: 'Pastel de Mango', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Dulce típico, muy sabroso.', pros: ['Muy dulce'], cons: [] }
    ]
  }
};

// Koreanfood restaurants mock data
const koreanMock: Record<string, {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  diary: string;
  plates: {
    name: string;
    date: string;
    image: string;
    note: string;
    pros: string[];
    cons: string[];
  }[];
}> = {
  'kimchi-house': {
    name: 'Kimchi House',
    location: 'Flores, CABA',
    rating: 4.4,
    reviewCount: 6,
    description: 'Barbacoa coreana y platos picantes.',
    pros: ['Kimchi casero', 'Barbacoa auténtica'],
    cons: ['Picante fuerte'],
    diary: 'Probamos el kimchi y la barbacoa. Muy buena experiencia.',
    plates: [
      { name: 'Kimchi', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Picante y bien fermentado.', pros: ['Muy sabroso'], cons: ['Muy picante'] },
      { name: 'Barbacoa', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne jugosa y bien marinada.', pros: ['Bien marinada'], cons: [] }
    ]
  },
  'seul-grill': {
    name: 'Seúl Grill',
    location: 'Palermo, CABA',
    rating: 4.6,
    reviewCount: 8,
    description: 'Grill coreano.',
    pros: ['Carnes a la parrilla', 'Ambiente animado'],
    cons: ['Puede estar lleno'],
    diary: 'Probamos la carne a la parrilla y el bibimbap. Muy buena atención.',
    plates: [
      { name: 'Carne a la Parrilla', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Corte jugoso, bien cocido.', pros: ['Muy jugoso'], cons: [] },
      { name: 'Bibimbap', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Arroz, verduras y huevo.', pros: ['Muy completo'], cons: [] }
    ]
  },
  'bibimbap-bar': {
    name: 'Bibimbap Bar',
    location: 'Belgrano, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Bibimbap y más.',
    pros: ['Bibimbap auténtico', 'Opciones vegetarianas'],
    cons: ['Demora en la atención'],
    diary: 'Probamos el bibimbap y el kimchi. Muy buena experiencia.',
    plates: [
      { name: 'Bibimbap', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Arroz, verduras y carne.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Kimchi', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Picante y bien fermentado.', pros: ['Muy sabroso'], cons: ['Muy picante'] }
    ]
  },
  'k-pop-cafe': {
    name: 'K-Pop Café',
    location: 'Recoleta, CABA',
    rating: 4.8,
    reviewCount: 12,
    description: 'Café y música coreana.',
    pros: ['Café intenso', 'Ambiente musical'],
    cons: ['Puede ser ruidoso'],
    diary: 'Probamos el café y el pastel coreano. Muy buena experiencia.',
    plates: [
      { name: 'Café Coreano', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Café fuerte, bien preparado.', pros: ['Muy intenso'], cons: [] },
      { name: 'Pastel Coreano', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Dulce típico, muy sabroso.', pros: ['Muy dulce'], cons: [] }
    ]
  },
  'kimchi-express': {
    name: 'Kimchi Express',
    location: 'San Telmo, CABA',
    rating: 4.4,
    reviewCount: 5,
    description: 'Kimchi rápido.',
    pros: ['Servicio rápido', 'Kimchi casero'],
    cons: ['Pocas opciones'],
    diary: 'Probamos el kimchi y el bulgogi. Todo salió rápido y estaba muy rico.',
    plates: [
      { name: 'Kimchi', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Picante y bien fermentado.', pros: ['Muy sabroso'], cons: ['Muy picante'] },
      { name: 'Bulgogi', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne marinada, bien cocida.', pros: ['Muy sabroso'], cons: [] }
    ]
  },
  'corea-del-sur': {
    name: 'Corea del Sur',
    location: 'Caballito, CABA',
    rating: 4.3,
    reviewCount: 4,
    description: 'Platos típicos coreanos.',
    pros: ['Platos tradicionales', 'Opciones variadas'],
    cons: ['Ambiente ruidoso'],
    diary: 'Probamos el japchae y el kimchi. Muy buena atención.',
    plates: [
      { name: 'Japchae', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Fideos de batata, verduras.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Kimchi', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Picante y bien fermentado.', pros: ['Muy sabroso'], cons: ['Muy picante'] }
    ]
  },
  'seul-veggie': {
    name: 'Seúl Veggie',
    location: 'Almagro, CABA',
    rating: 4.2,
    reviewCount: 3,
    description: 'Opciones vegetarianas.',
    pros: ['Opciones vegetarianas', 'Sabores originales'],
    cons: ['Pocas opciones tradicionales'],
    diary: 'Probamos el bibimbap veggie y la ensalada coreana. Muy buena opción veggie.',
    plates: [
      { name: 'Bibimbap Veggie', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Arroz, verduras y tofu.', pros: ['Muy saludable'], cons: [] },
      { name: 'Ensalada Coreana', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Verduras frescas y sésamo.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'korean-bbq': {
    name: 'Korean BBQ',
    location: 'Villa Crespo, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Barbacoa coreana.',
    pros: ['Barbacoa auténtica', 'Carnes jugosas'],
    cons: ['Puede estar lleno'],
    diary: 'Probamos la barbacoa y el kimchi. Muy buena experiencia.',
    plates: [
      { name: 'Barbacoa', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne jugosa, bien marinada.', pros: ['Muy jugosa'], cons: [] },
      { name: 'Kimchi', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Picante y bien fermentado.', pros: ['Muy sabroso'], cons: ['Muy picante'] }
    ]
  },
  'kimchi-fiesta': {
    name: 'Kimchi Fiesta',
    location: 'Chacarita, CABA',
    rating: 4.6,
    reviewCount: 7,
    description: 'Fiesta coreana.',
    pros: ['Ambiente festivo', 'Platos variados'],
    cons: ['Música alta'],
    diary: 'Fuimos en grupo y probamos varios platos coreanos. Muy divertido.',
    plates: [
      { name: 'Japchae', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Fideos de batata, verduras.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Kimchi', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Picante y bien fermentado.', pros: ['Muy sabroso'], cons: ['Muy picante'] }
    ]
  },
  'corea-final': {
    name: 'Corea Final',
    location: 'Retiro, CABA',
    rating: 4.5,
    reviewCount: 8,
    description: 'El mejor final coreano.',
    pros: ['Cierre perfecto', 'Postres ricos'],
    cons: ['Puede estar lleno'],
    diary: 'Probamos el final coreano y el pastel de arroz. Muy buen cierre para una comida.',
    plates: [
      { name: 'Final Coreano', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Corte especial de la casa.', pros: ['Muy especial'], cons: [] },
      { name: 'Pastel de Arroz', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Dulce típico, muy sabroso.', pros: ['Muy dulce'], cons: [] }
    ]
  }
};

// Chinafood restaurants mock data
const chinaMock: Record<string, {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  diary: string;
  plates: {
    name: string;
    date: string;
    image: string;
    note: string;
    pros: string[];
    cons: string[];
  }[];
}> = {
  'gran-dragon': {
    name: 'Gran Dragón',
    location: 'Belgrano, CABA',
    rating: 4.5,
    reviewCount: 9,
    description: 'Clásico restaurante chino con auténticos dim sum y pato laqueado.',
    pros: ['Dim sum casero', 'Pato laqueado'],
    cons: ['Demora en la atención'],
    diary: 'Probamos el dim sum y el pato laqueado. Muy buena experiencia.',
    plates: [
      { name: 'Dim Sum', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Relleno jugoso.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Pato Laqueado', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Piel crocante, carne tierna.', pros: ['Bien hecho'], cons: [] }
    ]
  },
  'palacio-oriental': {
    name: 'Palacio Oriental',
    location: 'Microcentro, CABA',
    rating: 4.2,
    reviewCount: 5,
    description: 'Especialidad en fideos caseros y platos tradicionales.',
    pros: ['Fideos caseros', 'Platos abundantes'],
    cons: ['Ambiente ruidoso'],
    diary: 'Probamos los fideos caseros y el pollo agridulce. Platos generosos y sabrosos.',
    plates: [
      { name: 'Fideos Caseros', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Fideos gruesos, bien cocidos.', pros: ['Muy abundante'], cons: [] },
      { name: 'Pollo Agridulce', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Salsa equilibrada, pollo tierno.', pros: ['Salsa rica'], cons: [] }
    ]
  },
  'casa-de-te-de-jade': {
    name: 'Casa de Té de Jade',
    location: 'Barrio Chino, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Experiencia de té y pastelería china en un ambiente moderno.',
    pros: ['Variedad de tés', 'Pastelería fresca'],
    cons: ['Precios altos'],
    diary: 'Probamos el té verde y los pastelitos de loto. El ambiente es moderno y relajante.',
    plates: [
      { name: 'Té Verde', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Aromático y suave.', pros: ['Muy aromático'], cons: [] },
      { name: 'Pastelito de Loto', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Dulce tradicional, relleno suave.', pros: ['Muy fresco'], cons: [] }
    ]
  },
  'sabor-de-pekin': {
    name: 'Sabor de Pekín',
    location: 'Recoleta, CABA',
    rating: 4.3,
    reviewCount: 6,
    description: 'Sabores auténticos de Pekín con menú degustación.',
    pros: ['Menú degustación', 'Sabores auténticos'],
    cons: ['Porciones pequeñas'],
    diary: 'Probamos el menú degustación y el pato pekinés. Sabores auténticos y bien presentados.',
    plates: [
      { name: 'Menú Degustación', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Incluye varios platos típicos.', pros: ['Muy variado'], cons: [] },
      { name: 'Pato Pekinés', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Piel crocante, carne jugosa.', pros: ['Muy sabroso'], cons: [] }
    ]
  },
  'dragon-dorado': {
    name: 'Dragón Dorado',
    location: 'Caballito, CABA',
    rating: 4.1,
    reviewCount: 4,
    description: 'Comida china tradicional y ambiente familiar.',
    pros: ['Ambiente familiar', 'Comida tradicional'],
    cons: ['Pocas opciones vegetarianas'],
    diary: 'Fuimos en familia y probamos el arroz frito y el cerdo agridulce. Muy buena atención.',
    plates: [
      { name: 'Arroz Frito', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Arroz suelto, bien condimentado.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Cerdo Agridulce', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Salsa equilibrada, carne tierna.', pros: ['Muy rico'], cons: [] }
    ]
  },
  'mandarin-express': {
    name: 'Mandarín Express',
    location: 'Almagro, CABA',
    rating: 4.0,
    reviewCount: 3,
    description: 'Rápido, sabroso y económico.',
    pros: ['Servicio rápido', 'Precios bajos'],
    cons: ['Pocas mesas'],
    diary: 'Ideal para una comida rápida. Probamos el chow mein y el pollo al curry.',
    plates: [
      { name: 'Chow Mein', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Fideos salteados, bien condimentados.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Pollo al Curry', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Curry suave, pollo tierno.', pros: ['Muy rico'], cons: [] }
    ]
  },
  'panda-feliz': {
    name: 'Panda Feliz',
    location: 'Villa Urquiza, CABA',
    rating: 4.4,
    reviewCount: 7,
    description: 'Ideal para familias y grupos grandes.',
    pros: ['Ideal para grupos', 'Porciones grandes'],
    cons: ['Ambiente ruidoso'],
    diary: 'Fuimos en grupo y probamos el pollo con almendras y el arroz primavera. Porciones abundantes.',
    plates: [
      { name: 'Pollo con Almendras', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Pollo tierno, almendras crocantes.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Arroz Primavera', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Arroz con verduras frescas.', pros: ['Muy fresco'], cons: [] }
    ]
  },
  'jardin-de-bambu': {
    name: 'Jardín de Bambú',
    location: 'Chacarita, CABA',
    rating: 4.6,
    reviewCount: 9,
    description: 'Decoración temática y platos vegetarianos.',
    pros: ['Decoración temática', 'Opciones vegetarianas'],
    cons: ['Pocas opciones con carne'],
    diary: 'Probamos el tofu salteado y los fideos de arroz. Ambiente muy agradable.',
    plates: [
      { name: 'Tofu Salteado', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Tofu suave, bien condimentado.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Fideos de Arroz', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Fideos suaves, verduras frescas.', pros: ['Muy fresco'], cons: [] }
    ]
  },
  'sabores-de-shanghai': {
    name: 'Sabores de Shanghai',
    location: 'Belgrano, CABA',
    rating: 4.3,
    reviewCount: 6,
    description: 'Especialidad en platos de Shanghai.',
    pros: ['Platos típicos', 'Sabores originales'],
    cons: ['Porciones chicas'],
    diary: 'Probamos el xiaolongbao y el arroz frito. Sabores originales y bien preparados.',
    plates: [
      { name: 'Xiaolongbao', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Dumplings rellenos de caldo.', pros: ['Muy original'], cons: [] },
      { name: 'Arroz Frito', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Arroz suelto, bien condimentado.', pros: ['Muy sabroso'], cons: [] }
    ]
  },
  'fenix-rojo': {
    name: 'Fénix Rojo',
    location: 'San Telmo, CABA',
    rating: 4.2,
    reviewCount: 5,
    description: 'Nuevo en la ciudad, menú degustación.',
    pros: ['Menú degustación', 'Ambiente moderno'],
    cons: ['Pocas mesas'],
    diary: 'Probamos el menú degustación y el cerdo agridulce. Platos bien presentados y sabrosos.',
    plates: [
      { name: 'Menú Degustación', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Incluye varios platos típicos.', pros: ['Muy variado'], cons: [] },
      { name: 'Cerdo Agridulce', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Salsa equilibrada, carne tierna.', pros: ['Muy rico'], cons: [] }
    ]
  }
};

// Parrillas restaurants mock data
const parrillaMock: Record<string, {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  diary: string;
  plates: {
    name: string;
    date: string;
    image: string;
    note: string;
    pros: string[];
    cons: string[];
  }[];
}> = {
  'don-asado': {
    name: 'Don Asado',
    location: 'San Nicolás, CABA',
    rating: 4.8,
    reviewCount: 12,
    description: 'Parrilla argentina con cortes premium y ambiente familiar.',
    pros: ['Cortes premium', 'Ambiente familiar'],
    cons: ['Precios altos'],
    diary: 'Probamos el asado y la provoleta. Muy buena experiencia.',
    plates: [
      { name: 'Asado', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne jugosa, bien cocida.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Provoleta', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Queso derretido, crocante.', pros: ['Bien hecha'], cons: [] }
    ]
  },
  'la-parrilla': {
    name: 'La Parrilla',
    location: 'Palermo, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Parrilla tradicional argentina.',
    pros: ['Ambiente tradicional', 'Cortes clásicos'],
    cons: ['Puede estar lleno'],
    diary: 'Fuimos a La Parrilla y probamos el bife de chorizo y la ensalada criolla. Muy buena atención.',
    plates: [
      { name: 'Bife de Chorizo', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Corte grueso, jugoso.', pros: ['Muy jugoso'], cons: [] },
      { name: 'Ensalada Criolla', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Tomate, cebolla y morrón.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'asado-express': {
    name: 'Asado Express',
    location: 'Belgrano, CABA',
    rating: 4.6,
    reviewCount: 7,
    description: 'Asado rápido y sabroso.',
    pros: ['Servicio rápido', 'Buena relación precio/calidad'],
    cons: ['Pocas mesas'],
    diary: 'Ideal para una comida rápida. Probamos el vacío y las papas fritas.',
    plates: [
      { name: 'Vacío', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Tierno y bien cocido.', pros: ['Muy tierno'], cons: [] },
      { name: 'Papas Fritas', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Crocantes y doradas.', pros: ['Muy crocantes'], cons: [] }
    ]
  },
  'parrilla-del-sol': {
    name: 'Parrilla del Sol',
    location: 'Recoleta, CABA',
    rating: 4.5,
    reviewCount: 5,
    description: 'Ambiente soleado y cortes premium.',
    pros: ['Ambiente soleado', 'Cortes premium'],
    cons: ['Precios elevados'],
    diary: 'Probamos el ojo de bife y la ensalada mixta. Muy buena experiencia.',
    plates: [
      { name: 'Ojo de Bife', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Corte premium, bien jugoso.', pros: ['Muy jugoso'], cons: [] },
      { name: 'Ensalada Mixta', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Lechuga, tomate y cebolla.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'el-quincho': {
    name: 'El Quincho',
    location: 'San Telmo, CABA',
    rating: 4.4,
    reviewCount: 6,
    description: 'Quincho familiar y carnes.',
    pros: ['Ambiente familiar', 'Carnes variadas'],
    cons: ['Puede ser ruidoso'],
    diary: 'Fuimos en familia y probamos la tira de asado y el chorizo. Muy buena atención.',
    plates: [
      { name: 'Tira de Asado', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Corte clásico, bien cocido.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Chorizo', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Bien condimentado.', pros: ['Muy rico'], cons: [] }
    ]
  },
  'parrilla-real': {
    name: 'Parrilla Real',
    location: 'Caballito, CABA',
    rating: 4.3,
    reviewCount: 5,
    description: 'Parrilla abundante y variada.',
    pros: ['Porciones abundantes', 'Variedad de cortes'],
    cons: ['Demora en la atención'],
    diary: 'Probamos el matambre a la pizza y la morcilla. Todo muy abundante.',
    plates: [
      { name: 'Matambre a la Pizza', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Matambre tierno, con salsa y queso.', pros: ['Muy tierno'], cons: [] },
      { name: 'Morcilla', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Clásica, bien cocida.', pros: ['Muy sabrosa'], cons: [] }
    ]
  },
  'asado-co': {
    name: 'Asado & Co.',
    location: 'Almagro, CABA',
    rating: 4.2,
    reviewCount: 4,
    description: 'Asado para compartir.',
    pros: ['Ideal para grupos', 'Porciones grandes'],
    cons: ['Pocas opciones vegetarianas'],
    diary: 'Fuimos en grupo y probamos la parrillada completa y la ensalada rusa. Muy buena opción para compartir.',
    plates: [
      { name: 'Parrillada Completa', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Incluye varios cortes y achuras.', pros: ['Muy completa'], cons: [] },
      { name: 'Ensalada Rusa', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Papa, zanahoria y arvejas.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'parrilla-central': {
    name: 'Parrilla Central',
    location: 'Flores, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Parrilla céntrica y moderna.',
    pros: ['Ambiente moderno', 'Ubicación céntrica'],
    cons: ['Puede estar lleno'],
    diary: 'Probamos el lomo y la ensalada caprese. Muy buena atención y ambiente.',
    plates: [
      { name: 'Lomo', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Corte tierno, bien cocido.', pros: ['Muy tierno'], cons: [] },
      { name: 'Ensalada Caprese', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Tomate, mozzarella y albahaca.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'el-fogon': {
    name: 'El Fogón',
    location: 'Chacarita, CABA',
    rating: 4.6,
    reviewCount: 7,
    description: 'Fogón tradicional.',
    pros: ['Sabor ahumado', 'Cortes clásicos'],
    cons: ['Pocas mesas'],
    diary: 'Probamos el costillar y la papa al plomo. Sabor ahumado y tradicional.',
    plates: [
      { name: 'Costillar', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne ahumada, bien cocida.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Papa al Plomo', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Papa asada, muy tierna.', pros: ['Muy tierna'], cons: [] }
    ]
  },
  'parrilla-final': {
    name: 'Parrilla Final',
    location: 'Retiro, CABA',
    rating: 4.5,
    reviewCount: 8,
    description: 'El mejor final parrillero.',
    pros: ['Cierre perfecto', 'Postres ricos'],
    cons: ['Puede estar lleno'],
    diary: 'Probamos el final parrillero y el flan casero. Muy buen cierre para una comida.',
    plates: [
      { name: 'Final Parrillero', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Corte especial de la casa.', pros: ['Muy especial'], cons: [] },
      { name: 'Flan Casero', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Clásico, con dulce de leche.', pros: ['Muy rico'], cons: [] }
    ]
  }
};

// Brazilfood restaurants mock data
const brazilMock: Record<string, {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  diary: string;
  plates: {
    name: string;
    date: string;
    image: string;
    note: string;
    pros: string[];
    cons: string[];
  }[];
}> = {
  'sabor-brasil': {
    name: 'Sabor Brasil',
    location: 'Centro, CABA',
    rating: 4.5,
    reviewCount: 7,
    description: 'Feijoada, caipirinhas y auténtica comida brasileña.',
    pros: ['Feijoada auténtica', 'Caipirinhas frescas'],
    cons: ['Demora en la atención'],
    diary: 'Probamos la feijoada y la caipirinha. Muy buena experiencia.',
    plates: [
      { name: 'Feijoada', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Sabor intenso, bien servida.', pros: ['Muy sabrosa'], cons: [] },
      { name: 'Caipirinha', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Refrescante, bien preparada.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'rio-grill': {
    name: 'Rio Grill',
    location: 'Palermo, CABA',
    rating: 4.6,
    reviewCount: 9,
    description: 'Grill brasileño.',
    pros: ['Carnes a la parrilla', 'Ambiente animado'],
    cons: ['Puede estar lleno'],
    diary: 'Fuimos a Rio Grill y probamos la picanha y el arroz carreteiro. Muy buena atención.',
    plates: [
      { name: 'Picanha', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Corte típico, jugoso.', pros: ['Muy jugoso'], cons: [] },
      { name: 'Arroz Carreteiro', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Arroz con carne y verduras.', pros: ['Muy sabroso'], cons: [] }
    ]
  },
  'bahia-cafe': {
    name: 'Bahía Café',
    location: 'Belgrano, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Café y postres brasileños.',
    pros: ['Postres caseros', 'Café intenso'],
    cons: ['Pocas mesas'],
    diary: 'Probamos el brigadeiro y el café brasileño. Todo muy rico.',
    plates: [
      { name: 'Brigadeiro', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Dulce de chocolate típico.', pros: ['Muy dulce'], cons: [] },
      { name: 'Café Brasileño', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Intenso y aromático.', pros: ['Muy intenso'], cons: [] }
    ]
  },
  'samba-house': {
    name: 'Samba House',
    location: 'Recoleta, CABA',
    rating: 4.8,
    reviewCount: 12,
    description: 'Samba y comida típica.',
    pros: ['Música en vivo', 'Comida típica'],
    cons: ['Ruidoso'],
    diary: 'Fuimos a Samba House y disfrutamos de la música y la feijoada. Muy buen ambiente.',
    plates: [
      { name: 'Feijoada', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Clásica, bien servida.', pros: ['Muy sabrosa'], cons: [] },
      { name: 'Coxinha', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Croqueta de pollo típica.', pros: ['Muy crocante'], cons: [] }
    ]
  },
  'feijoada-express': {
    name: 'Feijoada Express',
    location: 'San Telmo, CABA',
    rating: 4.4,
    reviewCount: 5,
    description: 'Feijoada rápida.',
    pros: ['Servicio rápido', 'Buena relación precio/calidad'],
    cons: ['Pocas opciones'],
    diary: 'Probamos la feijoada y el pastel de queijo. Todo salió rápido y estaba muy rico.',
    plates: [
      { name: 'Feijoada', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Rápida pero sabrosa.', pros: ['Muy sabrosa'], cons: [] },
      { name: 'Pastel de Queijo', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Empanada de queso típica.', pros: ['Muy rico'], cons: [] }
    ]
  },
  'brasil-veggie': {
    name: 'Brasil Veggie',
    location: 'Caballito, CABA',
    rating: 4.3,
    reviewCount: 4,
    description: 'Opciones vegetarianas.',
    pros: ['Opciones vegetarianas', 'Sabores originales'],
    cons: ['Pocas opciones tradicionales'],
    diary: 'Probamos la moqueca de banana y la ensalada tropical. Muy buena opción veggie.',
    plates: [
      { name: 'Moqueca de Banana', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Guiso de banana típico.', pros: ['Muy original'], cons: [] },
      { name: 'Ensalada Tropical', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Frutas frescas y verdes.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'churrasco-bar': {
    name: 'Churrasco Bar',
    location: 'Almagro, CABA',
    rating: 4.2,
    reviewCount: 3,
    description: 'Churrasco y caipirinhas.',
    pros: ['Churrasco a la leña', 'Caipirinhas'],
    cons: ['Puede ser ruidoso'],
    diary: 'Probamos el churrasco y la caipirinha. Muy buena experiencia.',
    plates: [
      { name: 'Churrasco', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne a la leña, bien cocida.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Caipirinha', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Refrescante y bien preparada.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'sabor-carioca': {
    name: 'Sabor Carioca',
    location: 'Flores, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Sabores cariocas.',
    pros: ['Platos típicos', 'Ambiente alegre'],
    cons: ['Pocas mesas'],
    diary: 'Probamos la feijoada y el pudim de leite. Todo muy sabroso.',
    plates: [
      { name: 'Feijoada', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Clásica, bien servida.', pros: ['Muy sabrosa'], cons: [] },
      { name: 'Pudim de Leite', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Flan de leche típico.', pros: ['Muy dulce'], cons: [] }
    ]
  },
  'brasil-fiesta': {
    name: 'Brasil Fiesta',
    location: 'Chacarita, CABA',
    rating: 4.6,
    reviewCount: 7,
    description: 'Fiesta brasileña.',
    pros: ['Ambiente festivo', 'Música en vivo'],
    cons: ['Ruidoso'],
    diary: 'Fuimos en grupo y disfrutamos de la música y la comida típica. Probamos la farofa y la caipirinha.',
    plates: [
      { name: 'Farofa', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Harina de mandioca tostada.', pros: ['Muy original'], cons: [] },
      { name: 'Caipirinha', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Refrescante y bien preparada.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'brasil-final': {
    name: 'Brasil Final',
    location: 'Retiro, CABA',
    rating: 4.5,
    reviewCount: 8,
    description: 'El mejor final brasileño.',
    pros: ['Cierre perfecto', 'Postres ricos'],
    cons: ['Puede estar lleno'],
    diary: 'Probamos el final brasileño y el brigadeiro. Muy buen cierre para una comida.',
    plates: [
      { name: 'Final Brasileño', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Corte especial de la casa.', pros: ['Muy especial'], cons: [] },
      { name: 'Brigadeiro', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Dulce de chocolate típico.', pros: ['Muy dulce'], cons: [] }
    ]
  }
};

// Helados restaurants mock data
const heladoMock: Record<string, {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  diary: string;
  plates: {
    name: string;
    date: string;
    image: string;
    note: string;
    pros: string[];
    cons: string[];
  }[];
}> = {
  'heladeria-italia': {
    name: 'Heladería Italia',
    location: 'Caballito, CABA',
    rating: 4.9,
    reviewCount: 12,
    description: 'Helados artesanales con sabores únicos.',
    pros: ['Helado artesanal', 'Sabores originales'],
    cons: ['Colas largas'],
    diary: 'Probamos el helado de pistacho y el de dulce de leche. Muy buena experiencia.',
    plates: [
      { name: 'Helado de Pistacho', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Sabor intenso, cremoso.', pros: ['Muy cremoso'], cons: [] },
      { name: 'Helado de Dulce de Leche', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Clásico, bien logrado.', pros: ['Muy rico'], cons: [] }
    ]
  },
  'helado-feliz': {
    name: 'Helado Feliz',
    location: 'Palermo, CABA',
    rating: 4.8,
    reviewCount: 10,
    description: 'Helados felices.',
    pros: ['Ambiente alegre', 'Helados cremosos'],
    cons: ['Pocas mesas'],
    diary: 'Fuimos a Helado Feliz y probamos el helado de frutilla y el de chocolate. El local es pequeño pero muy colorido.',
    plates: [
      { name: 'Helado de Frutilla', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Frutilla natural, muy refrescante.', pros: ['Muy fresco'], cons: [] },
      { name: 'Helado de Chocolate', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Chocolate intenso, cremoso.', pros: ['Sabor intenso'], cons: [] }
    ]
  },
  'helado-express': {
    name: 'Helado Express',
    location: 'Belgrano, CABA',
    rating: 4.7,
    reviewCount: 8,
    description: 'Helados rápidos.',
    pros: ['Servicio rápido', 'Precios accesibles'],
    cons: ['Pocas opciones gourmet'],
    diary: 'Ideal para una parada rápida. Probamos el helado de vainilla y el de limón.',
    plates: [
      { name: 'Helado de Vainilla', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Clásico, suave y cremoso.', pros: ['Muy suave'], cons: [] },
      { name: 'Helado de Limón', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Refrescante, ideal para el verano.', pros: ['Muy refrescante'], cons: [] }
    ]
  },
  'helado-house': {
    name: 'Helado House',
    location: 'San Telmo, CABA',
    rating: 4.6,
    reviewCount: 7,
    description: 'Casa de helados.',
    pros: ['Variedad de sabores', 'Ambiente familiar'],
    cons: ['Puede estar lleno'],
    diary: 'Visitamos Helado House y probamos el helado de crema americana y el de dulce de leche granizado.',
    plates: [
      { name: 'Helado de Crema Americana', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Muy cremoso, sabor clásico.', pros: ['Muy cremoso'], cons: [] },
      { name: 'Helado de Dulce de Leche Granizado', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Dulce de leche con trozos de chocolate.', pros: ['Trozos de chocolate'], cons: [] }
    ]
  },
  'helado-veggie': {
    name: 'Helado Veggie',
    location: 'Caballito, CABA',
    rating: 4.5,
    reviewCount: 6,
    description: 'Opciones veganas.',
    pros: ['Opciones veganas', 'Sabores originales'],
    cons: ['Pocas opciones tradicionales'],
    diary: 'Probamos el helado de coco vegano y el de frutos rojos. Muy buena opción para veganos.',
    plates: [
      { name: 'Helado de Coco Vegano', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Cremoso, sabor a coco natural.', pros: ['Muy cremoso'], cons: [] },
      { name: 'Helado de Frutos Rojos', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Frutos rojos frescos, sin lácteos.', pros: ['Sin lácteos'], cons: [] }
    ]
  },
  'helado-central': {
    name: 'Helado Central',
    location: 'Almagro, CABA',
    rating: 4.4,
    reviewCount: 5,
    description: 'Helados céntricos.',
    pros: ['Ubicación céntrica', 'Atención rápida'],
    cons: ['Ambiente ruidoso'],
    diary: 'Fuimos a Helado Central y probamos el helado de menta granizada y el de crema del cielo.',
    plates: [
      { name: 'Helado de Menta Granizada', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Menta fresca, trozos de chocolate.', pros: ['Muy refrescante'], cons: [] },
      { name: 'Helado de Crema del Cielo', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Color llamativo, sabor suave.', pros: ['Muy suave'], cons: [] }
    ]
  },
  'helado-fiesta': {
    name: 'Helado Fiesta',
    location: 'Flores, CABA',
    rating: 4.3,
    reviewCount: 4,
    description: 'Fiesta de helados.',
    pros: ['Ambiente festivo', 'Promos 2x1'],
    cons: ['Música alta'],
    diary: 'Fuimos en grupo y aprovechamos la promo 2x1. Probamos el helado de banana split y el de chocolate blanco.',
    plates: [
      { name: 'Helado de Banana Split', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Banana, chocolate y crema.', pros: ['Muy divertido'], cons: [] },
      { name: 'Helado de Chocolate Blanco', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Cremoso, sabor suave.', pros: ['Muy cremoso'], cons: [] }
    ]
  },
  'helado-friends': {
    name: 'Helado & Friends',
    location: 'Villa Crespo, CABA',
    rating: 4.2,
    reviewCount: 3,
    description: 'Ideal para grupos.',
    pros: ['Mesas grandes', 'Atención rápida'],
    cons: ['Poca variedad de sabores'],
    diary: 'Fuimos en grupo y probamos varios sabores. El local es ideal para compartir.',
    plates: [
      { name: 'Helado de Sambayón', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Sabor clásico, bien logrado.', pros: ['Muy clásico'], cons: [] },
      { name: 'Helado de Tiramisú', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Sabor a café y cacao.', pros: ['Muy original'], cons: [] }
    ]
  },
  'helado-final': {
    name: 'Helado Final',
    location: 'Chacarita, CABA',
    rating: 4.1,
    reviewCount: 4,
    description: 'El mejor final heladero.',
    pros: ['Cierre perfecto', 'Postres ricos'],
    cons: ['Pocas mesas'],
    diary: 'Probamos el helado final y el postre especial. Muy buen cierre para una salida.',
    plates: [
      { name: 'Helado Final', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Sabor especial de la casa.', pros: ['Muy especial'], cons: [] },
      { name: 'Postre Especial', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Helado con salsa de frutos rojos.', pros: ['Muy rico'], cons: [] }
    ]
  },
  'helado-rey': {
    name: 'Helado Rey',
    location: 'Retiro, CABA',
    rating: 4.0,
    reviewCount: 3,
    description: 'Helados de reyes.',
    pros: ['Helados premium', 'Atención cordial'],
    cons: ['Precios altos'],
    diary: 'Probamos el helado de crema rusa y el de chocolate amargo. Muy buena calidad.',
    plates: [
      { name: 'Helado de Crema Rusa', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Cremoso, sabor delicado.', pros: ['Muy cremoso'], cons: [] },
      { name: 'Helado de Chocolate Amargo', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Chocolate intenso, poco dulce.', pros: ['Sabor intenso'], cons: [] }
    ]
  }
};

// Peru-food restaurants mock data
const peruMock: Record<string, {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  diary: string;
  plates: {
    name: string;
    date: string;
    image: string;
    note: string;
    pros: string[];
    cons: string[];
  }[];
}> = {
  'ceviche-lima': {
    name: 'Ceviche Lima',
    location: 'Retiro, CABA',
    rating: 4.9,
    reviewCount: 15,
    description: 'Ceviches frescos y deliciosos.',
    pros: ['Ceviches frescos', 'Ambiente acogedor'],
    cons: ['Puede estar lleno'],
    diary: 'Probamos el ceviche mixto y el ceviche de pescado. Muy buena experiencia.',
    plates: [
      { name: 'Ceviche Mixto', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Pescado, camarones y calamar.', pros: ['Muy fresco'], cons: [] },
      { name: 'Ceviche de Pescado', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Pescado fresco, limón y ají.', pros: ['Muy sabroso'], cons: [] }
    ]
  },
  'peru-central': {
    name: 'Perú Central',
    location: 'Palermo, CABA',
    rating: 4.8,
    reviewCount: 12,
    description: 'Comida peruana auténtica.',
    pros: ['Platos típicos', 'Ambiente animado'],
    cons: ['Puede ser ruidoso'],
    diary: 'Probamos el lomo saltado y el arroz con pollo. Muy buena atención.',
    plates: [
      { name: 'Lomo Saltado', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne de res, verduras y fideos.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Arroz con Pollo', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Pollo, arroz y verduras.', pros: ['Muy completo'], cons: [] }
    ]
  },
  'peru-express': {
    name: 'Perú Express',
    location: 'Belgrano, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Comida peruana rápida y deliciosa.',
    pros: ['Servicio rápido', 'Buena relación precio/calidad'],
    cons: ['Pocas mesas'],
    diary: 'Ideal para una comida rápida. Probamos el pollo a la brasa y el arroz chaufa.',
    plates: [
      { name: 'Pollo a la Brasa', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Pollo jugoso y bien cocido.', pros: ['Muy jugoso'], cons: [] },
      { name: 'Arroz Chaufa', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Arroz frito con verduras y carne.', pros: ['Muy sabroso'], cons: [] }
    ]
  },
  'peru-house': {
    name: 'Perú House',
    location: 'San Telmo, CABA',
    rating: 4.6,
    reviewCount: 8,
    description: 'Casa de comida peruana.',
    pros: ['Variedad de platos', 'Ambiente familiar'],
    cons: ['Puede estar lleno'],
    diary: 'Visitamos Perú House y probamos el ceviche de pescado y el lomo saltado. Muy buena opción.',
    plates: [
      { name: 'Ceviche de Pescado', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Pescado fresco, limón y ají.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Lomo Saltado', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne de res, verduras y fideos.', pros: ['Muy sabroso'], cons: [] }
    ]
  },
  'peru-veggie': {
    name: 'Perú Veggie',
    location: 'Caballito, CABA',
    rating: 4.5,
    reviewCount: 6,
    description: 'Opciones vegetarianas y veganas.',
    pros: ['Opciones vegetarianas', 'Sabores originales'],
    cons: ['Pocas opciones tradicionales'],
    diary: 'Probamos el arroz con verduras y el ají de gallina vegano. Muy buena opción veggie.',
    plates: [
      { name: 'Arroz con Verduras', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Arroz con una variedad de verduras.', pros: ['Muy completo'], cons: [] },
      { name: 'Ají de Gallina Vegano', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Salsa de ají amarillo y papa.', pros: ['Muy sabroso'], cons: [] }
    ]
  },
  'peru-central-soho': {
    name: 'Perú Central',
    location: 'Almagro, CABA',
    rating: 4.4,
    reviewCount: 5,
    description: 'Comida peruana céntrica.',
    pros: ['Ubicación céntrica', 'Atención rápida'],
    cons: ['Ambiente ruidoso'],
    diary: 'Fuimos a Perú Central y probamos el ceviche de camarones y el arroz con pollo.',
    plates: [
      { name: 'Ceviche de Camarones', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Camarones frescos, limón y ají.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Arroz con Pollo', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Pollo, arroz y verduras.', pros: ['Muy completo'], cons: [] }
    ]
  },
  'peru-fiesta': {
    name: 'Perú Fiesta',
    location: 'Flores, CABA',
    rating: 4.3,
    reviewCount: 4,
    description: 'Fiesta peruana.',
    pros: ['Ambiente festivo', 'Música en vivo'],
    cons: ['Ruidoso'],
    diary: 'Fuimos en grupo y disfrutamos de la música y la comida peruana. Probamos el lomo saltado y el arroz chaufa.',
    plates: [
      { name: 'Lomo Saltado', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne de res, verduras y fideos.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Arroz Chaufa', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Arroz frito con verduras y carne.', pros: ['Muy sabroso'], cons: [] }
    ]
  },
  'peru-friends': {
    name: 'Perú & Friends',
    location: 'Villa Crespo, CABA',
    rating: 4.2,
    reviewCount: 3,
    description: 'Ideal para grupos.',
    pros: ['Mesas grandes', 'Atención rápida'],
    cons: ['Poca variedad de sabores'],
    diary: 'Fuimos en grupo y probamos varios platos. El local es ideal para compartir.',
    plates: [
      { name: 'Ceviche Mixto', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Pescado, camarones y calamar.', pros: ['Muy fresco'], cons: [] },
      { name: 'Lomo Saltado', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne de res, verduras y fideos.', pros: ['Muy sabroso'], cons: [] }
    ]
  },
  'peru-final': {
    name: 'Perú Final',
    location: 'Chacarita, CABA',
    rating: 4.1,
    reviewCount: 4,
    description: 'El mejor final peruano.',
    pros: ['Cierre perfecto', 'Postres ricos'],
    cons: ['Pocas mesas'],
    diary: 'Probamos el postre de mazamorra y el arroz con leche. Muy buen cierre para una comida.',
    plates: [
      { name: 'Postre de Mazamorra', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Postre de maíz dulce y leche.', pros: ['Muy dulce'], cons: [] },
      { name: 'Arroz con Leche', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Arroz cremoso con leche y canela.', pros: ['Muy rico'], cons: [] }
    ]
  },
  'peru-rey': {
    name: 'Perú Rey',
    location: 'Retiro, CABA',
    rating: 4.0,
    reviewCount: 3,
    description: 'Comida peruana de reyes.',
    pros: ['Platos premium', 'Atención cordial'],
    cons: ['Precios altos'],
    diary: 'Probamos el ceviche de pescado y el arroz con pollo. Muy buena calidad.',
    plates: [
      { name: 'Ceviche de Pescado', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Pescado fresco, limón y ají.', pros: ['Muy sabroso'], cons: [] },
      { name: 'Arroz con Pollo', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Pollo, arroz y verduras.', pros: ['Muy completo'], cons: [] }
    ]
  }
};

// Mexico-food restaurants mock data
const mexicoMock: Record<string, {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  diary: string;
  plates: {
    name: string;
    date: string;
    image: string;
    note: string;
    pros: string[];
    cons: string[];
  }[];
}> = {
  'la-lupita': {
    name: 'La Lupita',
    location: 'Villa Crespo, CABA',
    rating: 4.7,
    reviewCount: 11,
    description: 'Tacos, burritos y margaritas en un ambiente colorido.',
    pros: ['Tacos auténticos', 'Margaritas frescas'],
    cons: ['Puede estar lleno'],
    diary: 'Probamos los tacos al pastor y las margaritas. El ambiente es muy colorido y animado.',
    plates: [
      { name: 'Tacos al Pastor', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne jugosa, piña fresca.', pros: ['Muy sabrosos'], cons: [] },
      { name: 'Margarita', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Refrescante, bien preparada.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'el-mariachi': {
    name: 'El Mariachi',
    location: 'Palermo, CABA',
    rating: 4.6,
    reviewCount: 9,
    description: 'Comida mexicana tradicional y música en vivo.',
    pros: ['Música en vivo', 'Comida tradicional'],
    cons: ['Ruidoso'],
    diary: 'Fuimos a cenar y disfrutamos de la música en vivo. Probamos el guacamole y los nachos.',
    plates: [
      { name: 'Guacamole', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Aguacate fresco, bien condimentado.', pros: ['Muy fresco'], cons: [] },
      { name: 'Nachos', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Crujientes, con mucho queso.', pros: ['Bien servidos'], cons: [] }
    ]
  },
  'azteca-grill': {
    name: 'Azteca Grill',
    location: 'Belgrano, CABA',
    rating: 4.8,
    reviewCount: 13,
    description: 'Carnes y salsas picantes.',
    pros: ['Carnes jugosas', 'Salsas picantes'],
    cons: ['Picante fuerte'],
    diary: 'Probamos el burrito de carne y la salsa roja. Muy sabroso pero picante.',
    plates: [
      { name: 'Burrito de Carne', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Carne tierna, salsa picante.', pros: ['Muy sabroso'], cons: ['Muy picante'] },
      { name: 'Salsa Roja', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Picante, pero deliciosa.', pros: ['Buen sabor'], cons: ['Muy picante'] }
    ]
  },
  'taco-loco': {
    name: 'Taco Loco',
    location: 'Recoleta, CABA',
    rating: 4.5,
    reviewCount: 7,
    description: 'Tacos y nachos para compartir.',
    pros: ['Tacos variados', 'Nachos crujientes'],
    cons: ['Porciones chicas'],
    diary: 'Ideal para compartir con amigos. Probamos los tacos de pollo y los nachos con queso.',
    plates: [
      { name: 'Tacos de Pollo', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Pollo tierno, tortillas suaves.', pros: ['Bien servidos'], cons: [] },
      { name: 'Nachos con Queso', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Queso derretido, nachos crujientes.', pros: ['Muy ricos'], cons: [] }
    ]
  },
  'cantina-frida': {
    name: 'Cantina Frida',
    location: 'San Telmo, CABA',
    rating: 4.4,
    reviewCount: 8,
    description: 'Ambiente artístico y margaritas.',
    pros: ['Decoración artística', 'Margaritas'],
    cons: ['Pocas mesas'],
    diary: 'El ambiente es muy original. Probamos la margarita y los tacos vegetarianos.',
    plates: [
      { name: 'Margarita', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Bien preparada, refrescante.', pros: ['Muy fresca'], cons: [] },
      { name: 'Tacos Vegetarianos', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Relleno sabroso, tortillas suaves.', pros: ['Opción veggie'], cons: [] }
    ]
  },
  'chili-house': {
    name: 'Chili House',
    location: 'Caballito, CABA',
    rating: 4.3,
    reviewCount: 6,
    description: 'Chili con carne y cervezas artesanales.',
    pros: ['Chili casero', 'Buena cerveza'],
    cons: ['Picante fuerte'],
    diary: 'Probamos el chili con carne y la cerveza artesanal. Muy picante pero sabroso.',
    plates: [
      { name: 'Chili con Carne', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Muy picante, carne tierna.', pros: ['Buen sabor'], cons: ['Muy picante'] },
      { name: 'Cerveza Artesanal', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Rubia, bien fría.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'guacamole-bar': {
    name: 'Guacamole Bar',
    location: 'Almagro, CABA',
    rating: 4.2,
    reviewCount: 5,
    description: 'Guacamole fresco y tacos.',
    pros: ['Guacamole fresco', 'Tacos variados'],
    cons: ['Pocas opciones de postre'],
    diary: 'Probamos el guacamole y los tacos de pescado. Todo muy fresco.',
    plates: [
      { name: 'Guacamole', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Aguacate fresco, bien condimentado.', pros: ['Muy fresco'], cons: [] },
      { name: 'Tacos de Pescado', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Pescado fresco, tortillas suaves.', pros: ['Muy sabrosos'], cons: [] }
    ]
  },
  'sabor-azteca': {
    name: 'Sabor Azteca',
    location: 'Flores, CABA',
    rating: 4.7,
    reviewCount: 10,
    description: 'Especialidad en enchiladas.',
    pros: ['Enchiladas caseras', 'Salsas variadas'],
    cons: ['Picante fuerte'],
    diary: 'Probamos las enchiladas verdes y la salsa de mole. Muy sabrosas.',
    plates: [
      { name: 'Enchiladas Verdes', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Salsa verde, relleno de pollo.', pros: ['Muy sabrosas'], cons: ['Muy picante'] },
      { name: 'Salsa de Mole', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Sabor intenso, especiado.', pros: ['Muy original'], cons: [] }
    ]
  },
  'fiesta-mex': {
    name: 'Fiesta Mex',
    location: 'Chacarita, CABA',
    rating: 4.6,
    reviewCount: 9,
    description: 'Fiesta temática y menú degustación.',
    pros: ['Menú degustación', 'Ambiente festivo'],
    cons: ['Ruidoso'],
    diary: 'Fuimos en grupo y probamos el menú degustación. Muy divertido.',
    plates: [
      { name: 'Menú Degustación', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Incluye varios platos típicos.', pros: ['Ideal para grupos'], cons: [] },
      { name: 'Margarita', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Bien preparada, refrescante.', pros: ['Muy fresca'], cons: [] }
    ]
  },
  'puebla-picante': {
    name: 'Puebla Picante',
    location: 'Retiro, CABA',
    rating: 4.5,
    reviewCount: 7,
    description: 'Platos picantes y postres.',
    pros: ['Platos picantes', 'Postres ricos'],
    cons: ['Muy picante'],
    diary: 'Probamos el chile relleno y el pastel de tres leches. Muy sabroso.',
    plates: [
      { name: 'Chile Relleno', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Muy picante, relleno de queso.', pros: ['Buen sabor'], cons: ['Muy picante'] },
      { name: 'Pastel de Tres Leches', date: '2024-06-10', image: '/img/food-fallback.jpg', note: 'Dulce, bien húmedo.', pros: ['Muy rico'], cons: [] }
    ]
  }
};

// Brunch restaurants mock data
const brunchMock: Record<string, {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  diary: string;
  plates: {
    name: string;
    date: string;
    image: string;
    note: string;
    pros: string[];
    cons: string[];
  }[];
}> = {
  'brunch-co': {
    name: 'Brunch & Co.',
    location: 'Recoleta, CABA',
    rating: 4.6,
    reviewCount: 10,
    description: 'El mejor brunch de la ciudad con opciones veganas.',
    pros: ['Opciones veganas', 'Ambiente moderno'],
    cons: ['Puede estar lleno'],
    diary: 'Fuimos a Brunch & Co. un domingo soleado. Probamos el avocado toast y los pancakes. El ambiente es moderno y la atención muy buena.',
    plates: [
      {
        name: 'Avocado Toast',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        note: 'Pan artesanal, palta fresca y semillas.',
        pros: ['Muy fresco', 'Bien presentado'],
        cons: []
      },
      {
        name: 'Pancakes Veganos',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        note: 'Esponjosos y dulces, acompañados de frutas.',
        pros: ['Opción saludable'],
        cons: []
      }
    ]
  },
  'sunny-brunch': {
    name: 'Sunny Brunch',
    location: 'Palermo, CABA',
    rating: 4.8,
    reviewCount: 12,
    description: 'Ambiente luminoso y menú variado.',
    pros: ['Ambiente luminoso', 'Menú variado'],
    cons: ['Puede haber espera'],
    diary: 'Visitamos Sunny Brunch en una mañana de sábado. Probamos los huevos benedictinos y el jugo natural. Todo muy rico y fresco.',
    plates: [
      {
        name: 'Huevos Benedictinos',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        note: 'Huevos en su punto, salsa holandesa suave.',
        pros: ['Salsa deliciosa'],
        cons: []
      }
    ]
  },
  'bruncheria': {
    name: 'Brunchería',
    location: 'Belgrano, CABA',
    rating: 4.7,
    reviewCount: 15,
    description: 'Brunchs clásicos y modernos.',
    pros: ['Clásico y moderno', 'Opciones variadas'],
    cons: ['Precios algo altos'],
    diary: 'Probamos el bagel de salmón y la limonada. El local es muy lindo y la atención excelente.',
    plates: [
      {
        name: 'Bagel de Salmón',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        note: 'Salmón ahumado, queso crema y alcaparras.',
        pros: ['Salmón fresco'],
        cons: []
      }
    ]
  },
  'eggs-more': {
    name: 'Eggs & More',
    location: 'Caballito, CABA',
    rating: 4.5,
    reviewCount: 8,
    description: 'Especialidad en huevos y pancakes.',
    pros: ['Especialidad en huevos', 'Pancakes ricos'],
    cons: ['Pocas mesas'],
    diary: 'Desayunamos huevos revueltos y pancakes. Todo salió rápido y estaba muy bien preparado.',
    plates: [
      {
        name: 'Huevos Revueltos',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        note: 'Huevos suaves, bien condimentados.',
        pros: ['Bien cocidos'],
        cons: []
      }
    ]
  },
  'brunch-express': {
    name: 'Brunch Express',
    location: 'San Telmo, CABA',
    rating: 4.3,
    reviewCount: 6,
    description: 'Rápido y delicioso.',
    pros: ['Servicio rápido', 'Opciones para llevar'],
    cons: ['Pocas opciones saludables'],
    diary: 'Ideal para un brunch rápido. Probamos el sándwich de jamón y queso y el café.',
    plates: [
      {
        name: 'Sándwich de Jamón y Queso',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        note: 'Pan fresco, buen relleno.',
        pros: ['Ideal para llevar'],
        cons: []
      }
    ]
  },
  'morning-glory': {
    name: 'Morning Glory',
    location: 'Almagro, CABA',
    rating: 4.4,
    reviewCount: 9,
    description: 'Opciones saludables y jugos naturales.',
    pros: ['Opciones saludables', 'Jugos naturales'],
    cons: ['Precios altos'],
    diary: 'Probamos el bowl de frutas y el jugo detox. Todo muy fresco y bien presentado.',
    plates: [
      {
        name: 'Bowl de Frutas',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        note: 'Frutas frescas, yogur y granola.',
        pros: ['Muy fresco'],
        cons: []
      }
    ]
  },
  'brunch-house': {
    name: 'Brunch House',
    location: 'Flores, CABA',
    rating: 4.6,
    reviewCount: 11,
    description: 'Ambiente familiar y menú kids.',
    pros: ['Ambiente familiar', 'Menú para niños'],
    cons: ['Puede estar lleno'],
    diary: 'Fuimos en familia y probamos el menú kids y el brunch clásico. Muy buena atención.',
    plates: [
      {
        name: 'Brunch Clásico',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        note: 'Huevos, panceta, pan y jugo.',
        pros: ['Porción generosa'],
        cons: []
      }
    ]
  },
  'brunch-time': {
    name: 'Brunch Time',
    location: 'Villa Crespo, CABA',
    rating: 4.2,
    reviewCount: 7,
    description: 'Brunch todo el día.',
    pros: ['Brunch todo el día', 'Opciones variadas'],
    cons: ['Cierra temprano'],
    diary: 'Probamos la tostada francesa y el jugo de naranja. Muy buen brunch.',
    plates: [
      {
        name: 'Tostada Francesa',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        note: 'Dulce, bien dorada.',
        pros: ['Muy rica'],
        cons: []
      }
    ]
  },
  'brunch-friends': {
    name: 'Brunch & Friends',
    location: 'Chacarita, CABA',
    rating: 4.7,
    reviewCount: 13,
    description: 'Ideal para grupos grandes.',
    pros: ['Ideal para grupos', 'Mesas grandes'],
    cons: ['Puede ser ruidoso'],
    diary: 'Fuimos en grupo y probamos el brunch para compartir. Todo salió rápido y estaba muy rico.',
    plates: [
      {
        name: 'Brunch para Compartir',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        note: 'Incluye variedad de platos dulces y salados.',
        pros: ['Ideal para compartir'],
        cons: []
      }
    ]
  },
  'brunch-final': {
    name: 'Brunch Final',
    location: 'Retiro, CABA',
    rating: 4.5,
    reviewCount: 10,
    description: 'El brunch perfecto para cerrar la semana.',
    pros: ['Cierre de semana', 'Opciones variadas'],
    cons: ['Puede estar lleno'],
    diary: 'Probamos el brunch final y el café especial. Muy buen cierre de semana.',
    plates: [
      {
        name: 'Brunch Final',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        note: 'Incluye huevos, pan, frutas y café.',
        pros: ['Muy completo'],
        cons: []
      }
    ]
  },
  'tarta-co': {
    name: 'Tarta & Co.',
    location: 'Caballito, CABA',
    rating: 4.6,
    reviewCount: 10,
    description: 'Tartas dulces y saladas.',
    pros: ['Variedad de tartas', 'Precios accesibles'],
    cons: ['Pocas mesas'],
    diary: 'Un lugar sencillo pero con tartas muy ricas. Probamos la de ricota y la de frutilla. Ideal para una merienda rápida.',
    plates: [
      {
        name: 'Tarta de Ricota',
        date: '2024-06-10',
        image: '/img/food-fallback.jpg',
        note: 'Ricota suave, masa fina.',
        pros: ['Muy buena relación precio-calidad'],
        cons: []
      }
    ]
  }
};

function slugify(name: string) {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Add this type above the component

type Plate = {
  name: string;
  date: string;
  time?: string;
  note: string;
  pros: string[];
  cons: string[];
  image?: string; // old
  images?: string[]; // new
  rating?: number;
  price?: string;
  portion?: string;
  wouldOrderAgain?: boolean;
  tags?: string[];
  visitedWith?: string;
};

export default function RestaurantDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const normalizedId = slugify(id);
  // Try all categories in order
  const data =
    dessertMock[normalizedId] ||
    brunchMock[normalizedId] ||
    burgerMock[normalizedId] ||
    desayunoMock[normalizedId] ||
    mexicoMock[normalizedId] ||
    japanMock[normalizedId] ||
    arabicMock[normalizedId] ||
    israelMock[normalizedId] ||
    thaiMock[normalizedId] ||
    koreanMock[normalizedId] ||
    chinaMock[normalizedId] ||
    parrillaMock[normalizedId] ||
    brazilMock[normalizedId] ||
    heladoMock[normalizedId] ||
    peruMock[normalizedId];
  const isDessert = !!dessertMock[normalizedId];
  const isBurger = !!burgerMock[normalizedId];
  const isDesayuno = !!desayunoMock[normalizedId];
  const isMexico = !!mexicoMock[normalizedId];
  const isJapan = !!japanMock[normalizedId];
  const isArabic = !!arabicMock[normalizedId];
  const isIsrael = !!israelMock[normalizedId];
  const isThai = !!thaiMock[normalizedId];
  const isKorean = !!koreanMock[normalizedId];
  const isChina = !!chinaMock[normalizedId];
  const isParrilla = !!parrillaMock[normalizedId];
  const isBrazil = !!brazilMock[normalizedId];
  const isHelado = !!heladoMock[normalizedId];
  const isPeru = !!peruMock[normalizedId];

  // --- Diary state ---
  const [plates, setPlates] = useState<Plate[]>(
    (data.plates || []).map((plate: Plate) => ({
      name: plate.name,
      date: plate.date,
      time: plate.time,
      note: plate.note,
      pros: plate.pros,
      cons: plate.cons,
      image: plate.image ?? (plate.images && plate.images[0]) ?? '/img/food-fallback.jpg',
      images: plate.images ?? (plate.image ? [plate.image] : ['/img/food-fallback.jpg']),
      rating: plate.rating ?? 5,
      price: plate.price ?? '$$',
      portion: plate.portion ?? 'Medium',
      wouldOrderAgain: typeof plate.wouldOrderAgain === 'boolean' ? plate.wouldOrderAgain : true,
      tags: plate.tags ?? [],
      visitedWith: plate.visitedWith ?? '',
    }))
  );
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    date: '',
    time: '',
    images: [''],
    note: '',
    pros: '',
    cons: '',
    rating: 5,
    price: '$$',
    portion: 'Medium',
    wouldOrderAgain: true,
    tags: '',
    visitedWith: ''
  });
  const [formError, setFormError] = useState('');
  // --- Gallery state ---
  const gallery = data.gallery || [];
  const [galleryIdx, setGalleryIdx] = useState(0);
  // --- Diary view toggle ---
  // const [diaryView, setDiaryView] = useState<'grid' | 'timeline'>('grid');
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // Add this near other state hooks, above the grid view rendering
  const [favorites, setFavorites] = useState<{ [idx: number]: boolean }>({});
  // Add this near other state hooks, above the timeline rendering
  const [gridImgIdx, setGridImgIdx] = useState<{ [idx: number]: number }>({});
  
  // Menu state
  const [menu, setMenu] = useState<{image: string, uploadDate: string} | null>(
    (data as Record<string, unknown>)?.menu ? { 
      image: (data as Record<string, unknown>).menu as string, 
      uploadDate: ((data as Record<string, unknown>).menuUploadDate as string) || new Date().toISOString().split('T')[0] 
    } : null
  );
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuForm, setMenuForm] = useState({
    image: '',
    uploadDate: new Date().toISOString().split('T')[0]
  });

  // Lightbox keyboard navigation
  const handleLightboxKey = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    if (e.key === 'ArrowLeft') setGalleryIdx(idx => (idx - 1 + gallery.length) % gallery.length);
    if (e.key === 'ArrowRight') setGalleryIdx(idx => (idx + 1) % gallery.length);
    if (e.key === 'Escape') setLightboxOpen(false);
  }, [lightboxOpen, gallery.length]);

  useEffect(() => {
    if (lightboxOpen) {
      window.addEventListener('keydown', handleLightboxKey);
      document.body.style.overflow = 'hidden';
    } else {
      window.removeEventListener('keydown', handleLightboxKey);
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleLightboxKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, handleLightboxKey]);

  function handleOpenModal() {
    setForm({ name: '', date: '', time: '', images: [''], note: '', pros: '', cons: '', rating: 5, price: '$$', portion: 'Medium', wouldOrderAgain: true, tags: '', visitedWith: '' });
    setFormError('');
    setShowModal(true);
  }
  function handleCloseModal() {
    setShowModal(false);
  }
  
  // Menu handlers
  function handleOpenMenuModal() {
    setMenuForm({
      image: menu?.image || '',
      uploadDate: menu?.uploadDate || new Date().toISOString().split('T')[0]
    });
    setShowMenuModal(true);
  }
  
  function handleCloseMenuModal() {
    setShowMenuModal(false);
  }
  
  function handleMenuFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setMenuForm({ ...menuForm, [name]: value });
  }
  
  function handleMenuFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!menuForm.image.trim()) {
      alert('Por favor ingresa la URL de la imagen del menú.');
      return;
    }
    setMenu({
      image: menuForm.image.trim(),
      uploadDate: menuForm.uploadDate
    });
    setShowMenuModal(false);
  }
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      // Only for checkboxes (not used currently)
      if ('checked' in e.target) {
        setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
      }
    } else if (type === 'radio' && name === 'wouldOrderAgain') {
      setForm({ ...form, wouldOrderAgain: value === 'true' });
    } else {
      setForm({ ...form, [name]: value });
    }
  }
  function handleImageChange(idx: number, value: string) {
    setForm(form => {
      const newImages = [...form.images];
      newImages[idx] = value;
      return { ...form, images: newImages };
    });
  }
  function handleAddImageField() {
    setForm(form => ({ ...form, images: [...form.images, ''] }));
  }
  function handleRemoveImageField(idx: number) {
    setForm(form => {
      const newImages = form.images.filter((_, i) => i !== idx);
      return { ...form, images: newImages.length ? newImages : [''] };
    });
  }
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name || !form.date) {
      setFormError('El nombre y la fecha son obligatorios.');
      return;
    }
    const images = form.images.map(img => img.trim()).filter(Boolean);
    setPlates([
      ...plates,
      {
        name: form.name,
        date: form.date,
        time: form.time || new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        image: images.length ? images[0] : '/img/food-fallback.jpg',
        images: images.length ? images : ['/img/food-fallback.jpg'],
        note: form.note,
        pros: form.pros.split(',').map(s => s.trim()).filter(Boolean),
        cons: form.cons.split(',').map(s => s.trim()).filter(Boolean),
        rating: Number(form.rating),
        price: form.price,
        portion: form.portion,
        wouldOrderAgain: !!form.wouldOrderAgain,
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        visitedWith: form.visitedWith
      }
    ]);
    setShowModal(false);
  }

  if (!data) {
    return (
      <main className="container py-5">
        <div className="text-center">
          <h2>No encontrado</h2>
          <p>No se encontró información para este restaurante.</p>
          <Link href="/" className="btn btn-primary mt-3">Volver al inicio</Link>
        </div>
      </main>
    );
  }

  // --- Map section ---
  const mapAddress = encodeURIComponent(data.location);
  const osmUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${mapAddress}&zoom=15&size=600x300&markers=${mapAddress},red-pushpin`;

  return (
    <main className="container py-5">
      <div className="d-flex align-items-center mb-4 gap-3">
        <Link
          href={
            isDessert ? "/reviews/dulces" :
            isBurger ? "/reviews/burguers" :
            isDesayuno ? "/reviews/desayunos" :
            isMexico ? "/reviews/mexico-food" :
            isJapan ? "/reviews/japan-food" :
            isArabic ? "/reviews/arabic-food" :
            isIsrael ? "/reviews/israelfood" :
            isThai ? "/reviews/thaifood" :
            isKorean ? "/reviews/koreanfood" :
            isChina ? "/reviews/chinafood" :
            isParrilla ? "/reviews/parrillas" :
            isBrazil ? "/reviews/brazilfood" :
            isHelado ? "/reviews/helados" :
            isPeru ? "/reviews/peru-food" :
            "/"
          }
          className="btn btn-lg btn-primary px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 back-main-btn"
        >
          <span style={{fontSize: '1.4em', lineHeight: 1}}>←</span>
          <span>Volver a&nbsp;
            {
              isDessert ? "postres" :
              isBurger ? "hamburguesas" :
              isDesayuno ? "desayunos" :
              isMexico ? "comida mexicana" :
              isJapan ? "comida japonesa" :
              isArabic ? "comida árabe" :
              isIsrael ? "comida israelí" :
              isThai ? "comida tailandesa" :
              isKorean ? "comida coreana" :
              isChina ? "comida china" :
              isParrilla ? "parrillas" :
              isBrazil ? "comida brasileña" :
              isHelado ? "helados" :
              isPeru ? "comida peruana" :
              "inicio"
            }
          </span>
        </Link>
        <h1 className="display-5 fw-bold mb-1">{data.name}</h1>
      </div>
      <div className="d-flex gap-3 align-items-center mb-2">
        <span className="badge bg-warning text-dark fs-6">{data.location}</span>
        <span className="badge bg-success fs-6">★ {data.rating.toFixed(1)}</span>
        <span className="badge bg-secondary fs-6">{data.reviewCount} reseñas</span>
      </div>
      <p className="lead text-muted mb-2">{data.description}</p>
      {/* Modern summary pros/cons */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title text-success mb-3">Pros</h5>
              <ul className="list-unstyled mb-0">
                {data.pros.map((pro: string, i: number) => (
                  <li key={i} className="mb-2"><span className="me-2">✅</span>{pro}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title text-danger mb-3">Contras</h5>
              <ul className="list-unstyled mb-0">
                {data.cons.length === 0 ? <li><span className="me-2">🎉</span>¡Nada relevante!</li> : data.cons.map((con: string, i: number) => (
                  <li key={i} className="mb-2"><span className="me-2">⚠️</span>{con}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Diary/note space */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-3">Diario de la visita</h4>
              <p className="mb-0" style={{whiteSpace: 'pre-line'}}>{data.diary}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Menu section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="card-title mb-0">Menú del restaurante</h4>
                <button
                  className="btn btn-outline-primary btn-lg fw-bold shadow-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2"
                  type="button"
                  onClick={handleOpenMenuModal}
                  style={{
                    fontSize: '1.1em',
                    borderWidth: '2px'
                  }}
                >
                  <span style={{fontSize: '1.3em'}}>📋</span> {menu ? 'Actualizar menú' : 'Subir menú'}
                </button>
              </div>
              {menu ? (
                <div className="d-flex align-items-start gap-3">
                  <div style={{flexShrink: 0}}>
                    <Image
                      src={menu.image}
                      alt="Menú del restaurante"
                      width={200}
                      height={150}
                      className="rounded shadow-sm"
                      style={{maxHeight: '150px', maxWidth: '200px', objectFit: 'cover', cursor: 'pointer'}}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => { 
                        if (e.currentTarget) e.currentTarget.src = '/img/menu-fallback.jpg'; 
                      }}
                      onClick={() => window.open(menu.image, '_blank')}
                      title="Click para ver en tamaño completo"
                    />
                  </div>
                  <div className="d-flex flex-column justify-content-center">
                    <div className="d-flex align-items-center gap-2 text-muted mb-2">
                      <span style={{fontSize: '1.1em'}}>📅</span>
                      <small>Menú subido el: {new Date(menu.uploadDate).toLocaleDateString('es-AR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}</small>
                    </div>
                    <small className="text-muted">
                      <span style={{fontSize: '1em'}}>👆</span> Click en la imagen para ver en tamaño completo
                    </small>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div style={{fontSize: '3em', marginBottom: '0.5em'}}>📋</div>
                  <h5 className="text-muted">No hay menú disponible</h5>
                  <p className="text-secondary">¡Sube el menú de este restaurante para tenerlo siempre a mano!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Gallery of tasted foods */}
      <div className="row mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="mb-0">Platos probados</h3>
          <button
            className="btn btn-gradient btn-lg fw-bold shadow rounded-pill px-4 py-2 d-flex align-items-center gap-2"
            type="button"
            onClick={handleOpenModal}
            style={{
              background: 'linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)',
              color: '#333',
              border: 'none',
              opacity: 0.85,
              fontSize: '1.1em',
              boxShadow: '0 2px 12px 0 rgba(255,193,7,0.13)'
            }}
          >
            <span style={{fontSize: '1.3em'}}>🍽️</span> Agregar plato
          </button>
        </div>
        {plates.length === 0 ? (
          <div className="col-12 text-center py-5">
            <div style={{fontSize: '3.5em', marginBottom: '0.5em'}}>📖🍽️</div>
            <h5 className="text-muted">Todavía no hay platos registrados en el diario de este restaurante.</h5>
            <p className="text-secondary">¡Animate a ser el primero en sumar una experiencia!</p>
          </div>
        ) : (
          plates.map((plate: Plate, idx: number) => {
            const images = plate.images ?? (plate.image ? [plate.image] : ['/img/food-fallback.jpg']);
            const dateObj = new Date(plate.date);
            const formattedDate = dateObj.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
            const isFav = !!favorites[idx];
            const imgIdx = gridImgIdx[idx] ?? 0;
            // New fields
            const stars = '★'.repeat(plate.rating ?? 5) + '☆'.repeat(5 - (plate.rating ?? 5));
            const priceLabel = plate.price || '$$';
            const portionLabel = plate.portion || 'Medium';
            const wouldOrderAgain = plate.wouldOrderAgain !== false;
            const tags = plate.tags && plate.tags.length > 0 ? plate.tags : [];
            const visitedWith = plate.visitedWith || '';
            const time = plate.time || '';

            // Share handler (copy link)
            function handleShare() {
              navigator.clipboard.writeText(window.location.href + `#plate-${idx}`);
              alert('¡Enlace copiado!');
            }
            return (
              <div
                className="col-12 col-md-6 col-lg-6 mb-4 diary-plate-animate"
                key={idx}
                style={{ '--diary-anim-order': idx } as React.CSSProperties }
                aria-label={`Plato: ${plate.name}, comido el ${formattedDate}`}
                id={`plate-${idx}`}
              >
                <div
                  className="card h-100 shadow-sm diary-plate-card position-relative overflow-hidden wow-plate-card"
                  tabIndex={0}
                  style={{
                    borderRadius: '1.2em',
                    background: 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
                    border: '1px solid rgba(255,255,255,0.9)',
                    transition: 'transform 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.3s ease, background 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: 520,
                    margin: '0 auto',
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'; 
                    e.currentTarget.style.boxShadow = '0 12px 40px 0 rgba(0,0,0,0.15)'; 
                    e.currentTarget.style.background = 'rgba(255,255,255,1)'; 
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'; 
                    e.currentTarget.style.boxShadow = '0 4px 20px 0 rgba(0,0,0,0.08)'; 
                    e.currentTarget.style.background = 'rgba(255,255,255,0.98)'; 
                  }}
                >
                  {/* Image section with overlays and slider */}
                  <div className="position-relative" style={{width: '100%', aspectRatio: '4/3', minHeight: 0, overflow: 'hidden', borderRadius: '1.2em 1.2em 0 0', background: 'linear-gradient(135deg, #fffbe7 0%, #fff8e1 100%)'}}>
                    <Image
                      src={images[imgIdx]}
                      alt={plate.name}
                      width={400}
                      height={300}
                      className="img-fluid diary-plate-img plate-image-hover"
                      style={{objectFit: 'cover', transition: 'filter 0.3s ease, transform 0.3s ease', filter: 'brightness(0.96) contrast(1.05)', width: '100%', height: '100%'}}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => { if (e.currentTarget) e.currentTarget.src = '/img/food-fallback.jpg'; }}
                    />
                    {/* Overlay badges: rating, price, favorite */}
                    <span className="position-absolute top-0 start-0 m-3 px-3 py-2" style={{background: 'rgba(255,255,255,0.95)', color: '#ff8f00', borderRadius: '1.2em', fontWeight: 700, fontSize: '1em', boxShadow: '0 4px 12px rgba(255,143,0,0.25)', backdropFilter: 'blur(8px)'}} title="Calificación">{stars}</span>
                    <span className="position-absolute top-0 end-0 m-3 px-3 py-2" style={{background: 'rgba(255,255,255,0.95)', color: '#2e7d32', borderRadius: '1.2em', fontWeight: 700, fontSize: '1em', boxShadow: '0 4px 12px rgba(46,125,50,0.25)', backdropFilter: 'blur(8px)'}} title="Precio"><span role="img" aria-label="money">💲</span> {priceLabel}</span>
                    <button
                      className="btn btn-light btn-sm position-absolute bottom-0 end-0 m-2 wow-fav-btn"
                      style={{borderRadius: '50%', boxShadow: '0 2px 8px #ffe08255', background: isFav ? '#ffb347' : '#fff', color: isFav ? '#fff' : '#ffb347', transition: 'background 0.2s, color 0.2s'}}
                      onClick={e => { e.stopPropagation(); setFavorites(favs => ({ ...favs, [idx]: !favs[idx] })); }}
                      aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      type="button"
                    >
                      <span style={{fontSize: '1.3em', transition: 'transform 0.2s', transform: isFav ? 'scale(1.2)' : 'scale(1)'}}>{isFav ? '❤️' : '🤍'}</span>
                    </button>
                    {/* Image slider controls */}
                    {images.length > 1 && (
                      <>
                        <button
                          className="btn btn-light btn-sm position-absolute top-50 start-0 translate-middle-y ms-2 wow-slider-btn"
                          style={{zIndex: 2, borderRadius: '50%', boxShadow: '0 2px 8px #ffe08255'}}
                          onClick={e => { e.stopPropagation(); setGridImgIdx(idxObj => ({ ...idxObj, [idx]: (imgIdx - 1 + images.length) % images.length })); }}
                          aria-label="Imagen anterior"
                        >‹</button>
                        <button
                          className="btn btn-light btn-sm position-absolute top-50 end-0 translate-middle-y me-2 wow-slider-btn"
                          style={{zIndex: 2, borderRadius: '50%', boxShadow: '0 2px 8px #ffe08255'}}
                          onClick={e => { e.stopPropagation(); setGridImgIdx(idxObj => ({ ...idxObj, [idx]: (imgIdx + 1) % images.length })); }}
                          aria-label="Siguiente imagen"
                        >›</button>
                        <div className="position-absolute bottom-0 start-50 translate-middle-x text-white pb-2" style={{fontSize: '1em', textShadow: '0 2px 8px #000', background: 'rgba(0,0,0,0.25)', borderRadius: '0.7em', padding: '2px 12px'}}>
                          {imgIdx + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>
                  {/* Card body: enhanced layout */}
                  <div className="card-body d-flex flex-column justify-content-between" style={{padding: '1.8em 2.2em 1.5em 2.2em', flex: 1}}>
                    {/* Main info row: improved layout */}
                    <div className="row mb-3 g-3">
                      {/* Left: Plate name, tags, note/desc */}
                      <div className="col-12 col-md-8 d-flex flex-column justify-content-start">
                        <h5 className="mb-2 fw-bold" style={{fontSize: '1.35em', color: '#d84315', wordBreak: 'break-word', lineHeight: 1.3}}>{plate.name}</h5>
                        <div className="mb-2 d-flex flex-wrap gap-2">
                          {tags.map((tag, i) => (
                            <span key={i} className="badge text-dark" style={{fontSize: '0.9em', fontWeight: 600, background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', border: '1px solid #ffcc02', borderRadius: '0.8em', padding: '0.4em 0.8em'}}><span role="img" aria-label="tag">🏷️</span> {tag}</span>
                          ))}
                        </div>
                        <div style={{fontSize: '1.05em', color: '#424242', minHeight: 40, maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', whiteSpace: 'normal', lineHeight: 1.4}}>
                          <span role="img" aria-label="note" style={{marginRight: '0.5em'}}>📝</span> 
                          <span style={{fontWeight: 500}}>{plate.note || <span style={{color: '#9e9e9e', fontStyle: 'italic'}}>Sin notas adicionales</span>}</span>
                        </div>
                      </div>
                      {/* Right: Portion, would order again, share */}
                      <div className="col-12 col-md-4 d-flex flex-column align-items-md-end align-items-start gap-3 mt-2 mt-md-0">
                        <span className="badge text-white" style={{fontSize: '0.95em', background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', borderRadius: '0.8em', padding: '0.5em 1em', boxShadow: '0 2px 8px rgba(25,118,210,0.3)'}} title="Tamaño de porción"><span role="img" aria-label="portion">🍽️</span> {portionLabel}</span>
                        <span className="badge" style={{fontSize: '0.95em', background: wouldOrderAgain ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' : 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)', color: wouldOrderAgain ? '#1b5e20' : '#b71c1c', borderRadius: '0.8em', padding: '0.5em 1em', border: wouldOrderAgain ? '1px solid #4caf50' : '1px solid #f44336', fontWeight: 600}} title="¿Lo pedirías de nuevo?">
                          {wouldOrderAgain ? <><span role="img" aria-label="repeat">🔁</span> De nuevo</> : <><span role="img" aria-label="no-repeat">🚫</span> No</>}
                        </span>
                        <button className="btn btn-outline-primary btn-sm fw-bold shadow-sm" style={{borderRadius: '0.8em', letterSpacing: 0.5, background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', borderColor: '#2196f3', color: '#1565c0', padding: '0.5em 1.2em', fontWeight: 600}} title="Compartir" onClick={handleShare} type="button"><span role="img" aria-label="share">🔗</span> Compartir</button>
                      </div>
                    </div>
                    {/* Pros/Cons row with background */}
                    <div className="row mb-2 g-2" style={{background: 'rgba(255,236,179,0.3)', borderRadius: 12, padding: '0.5em 0.5em 0.5em 0.5em', border: '1px solid rgba(255,193,7,0.3)'}}>
                      <div className="col-12 col-md-6 d-flex flex-wrap align-items-center gap-2">
                        <span className="text-success fw-bold d-flex align-items-center" style={{fontSize: '1.1em', color: '#2e7d32'}}><span role="img" aria-label="pro">👍</span></span>
                        {plate.pros.length === 0 ? <span className="badge bg-light text-secondary">—</span> : plate.pros.map((pro: string, i: number) => <span key={i} className="badge px-2 py-1" style={{fontWeight: 600, fontSize: '0.95em', background: '#e8f5e9', color: '#1b5e20', border: '1px solid #c8e6c9'}}><span role="img" aria-label="plus" style={{color: '#2e7d32'}}>➕</span> {pro}</span>)}
                      </div>
                      <div className="col-12 col-md-6 d-flex flex-wrap align-items-center gap-2">
                        <span className="text-danger fw-bold d-flex align-items-center" style={{fontSize: '1.1em', color: '#c62828'}}><span role="img" aria-label="con">👎</span></span>
                        {plate.cons.length === 0 ? <span className="badge bg-light text-secondary">—</span> : plate.cons.map((con: string, i: number) => <span key={i} className="badge px-2 py-1" style={{fontWeight: 600, fontSize: '0.95em', background: '#ffebee', color: '#b71c1c', border: '1px solid #ffcdd2'}}><span role="img" aria-label="minus" style={{color: '#c62828'}}>➖</span> {con}</span>)}
                      </div>
                    </div>
                    {/* Footer: improved layout without redundant location */}
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2 pb-1 card-footer-row" style={{fontSize: '0.98em', color: '#666', borderTop: '1px solid rgba(255,193,7,0.3)', transition: 'background 0.2s'}}>
                      <div className="d-flex align-items-center flex-wrap gap-3">
                        {time && <span className="d-flex align-items-center gap-1" title="Hora de la comida"><span role="img" aria-label="clock">⏰</span> <span className="fw-medium">{time}</span></span>}
                        {visitedWith && <span className="d-flex align-items-center gap-1" title="Compañía"><span role="img" aria-label="group">👥</span> <span className="fw-medium">{visitedWith}</span></span>}
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-light text-muted border" style={{fontSize: '0.85em', fontWeight: 500}} title="Fecha de la visita">
                          <span role="img" aria-label="calendar">📅</span> {formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Modal for adding a new plate */}
      {showModal && (
        <div className="modal fade show" style={{display: 'block', background: 'rgba(0,0,0,0.35)', zIndex: 1050}} tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{maxHeight: '90vh'}}>
            <div className="modal-content rounded-4 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">Agregar plato al diario</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleFormSubmit} className="d-flex flex-column h-100">
                <div className="modal-body pt-2" style={{overflowY: 'auto', maxHeight: 'calc(90vh - 120px)'}}>
                  {formError && <div className="alert alert-danger py-2">{formError}</div>}
                  <div className="mb-3">
                    <label className="form-label">Nombre del plato *</label>
                    <input type="text" className="form-control" name="name" value={form.name} onChange={handleFormChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Fecha *</label>
                    <input type="date" className="form-control" name="date" value={form.date} onChange={handleFormChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Hora</label>
                    <input type="time" className="form-control" name="time" value={form.time} onChange={handleFormChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Imágenes del plato</label>
                    {form.images.map((img, idx) => (
                      <div key={idx} className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="URL de la imagen"
                          value={img}
                          onChange={e => handleImageChange(idx, e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleRemoveImageField(idx)}
                          disabled={form.images.length === 1}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-outline-primary btn-sm mt-1" onClick={handleAddImageField}>+ Agregar otra imagen</button>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notas</label>
                    <textarea className="form-control" name="note" value={form.note} onChange={handleFormChange} rows={2} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Pros (separados por coma)</label>
                    <input type="text" className="form-control" name="pros" value={form.pros} onChange={handleFormChange} placeholder="Ej: Rico, Abundante" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contras (separados por coma)</label>
                    <input type="text" className="form-control" name="cons" value={form.cons} onChange={handleFormChange} placeholder="Ej: Caro, Frío" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Calificación</label>
                    <select className="form-select" name="rating" value={form.rating} onChange={handleFormChange}>
                      <option value={5}>★★★★★ (5)</option>
                      <option value={4}>★★★★☆ (4)</option>
                      <option value={3}>★★★☆☆ (3)</option>
                      <option value={2}>★★☆☆☆ (2)</option>
                      <option value={1}>★☆☆☆☆ (1)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Precio</label>
                    <select className="form-select" name="price" value={form.price} onChange={handleFormChange}>
                      <option value="$">$ (Barato)</option>
                      <option value="$$">$$ (Medio)</option>
                      <option value="$$$">$$$ (Caro)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tamaño de porción</label>
                    <select className="form-select" name="portion" value={form.portion} onChange={handleFormChange}>
                      <option value="Small">Pequeña</option>
                      <option value="Medium">Mediana</option>
                      <option value="Large">Grande</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">¿Lo pedirías de nuevo?</label>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" name="wouldOrderAgain" id="wouldOrderAgainYes" value="true" checked={form.wouldOrderAgain === true} onChange={handleFormChange} />
                      <label className="form-check-label" htmlFor="wouldOrderAgainYes">Sí</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" name="wouldOrderAgain" id="wouldOrderAgainNo" value="false" checked={form.wouldOrderAgain === false} onChange={handleFormChange} />
                      <label className="form-check-label" htmlFor="wouldOrderAgainNo">No</label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Etiquetas (separadas por coma)</label>
                    <input type="text" className="form-control" name="tags" value={form.tags} onChange={handleFormChange} placeholder="Ej: Vegano, Picante, Sin TACC" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">¿Con quién fuiste?</label>
                    <input type="text" className="form-control" name="visitedWith" value={form.visitedWith} onChange={handleFormChange} placeholder="Ej: Familia, Amigos, Solo" />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Agregar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Menu Modal */}
      {showMenuModal && (
        <div className="modal fade show" style={{display: 'block', background: 'rgba(0,0,0,0.35)', zIndex: 1050}} tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">
                  <span style={{fontSize: '1.3em', marginRight: '0.5em'}}>📋</span>
                  {menu ? 'Actualizar menú' : 'Subir menú del restaurante'}
                </h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={handleCloseMenuModal}></button>
              </div>
              <form onSubmit={handleMenuFormSubmit}>
                <div className="modal-body pt-2">
                  <div className="mb-3">
                    <label className="form-label">URL de la imagen del menú *</label>
                    <input 
                      type="url" 
                      className="form-control" 
                      name="image" 
                      value={menuForm.image} 
                      onChange={handleMenuFormChange} 
                      placeholder="https://ejemplo.com/menu.jpg"
                      required 
                    />
                    <div className="form-text">Pega aquí la URL de la imagen del menú</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Fecha de subida</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      name="uploadDate" 
                      value={menuForm.uploadDate} 
                      onChange={handleMenuFormChange} 
                    />
                    <div className="form-text">Fecha en que obtuviste este menú</div>
                  </div>
                  {menuForm.image && (
                    <div className="mb-3">
                      <label className="form-label">Vista previa:</label>
                      <div className="border rounded p-2">
                        <Image
                          src={menuForm.image}
                          alt="Vista previa del menú"
                          width={400}
                          height={300}
                          className="img-fluid rounded"
                          style={{maxHeight: '200px', objectFit: 'contain'}}
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => { 
                            if (e.currentTarget) e.currentTarget.src = '/img/menu-fallback.jpg'; 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseMenuModal}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">
                    <span style={{fontSize: '1.1em', marginRight: '0.5em'}}>💾</span>
                    {menu ? 'Actualizar' : 'Guardar menú'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Map section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h5 className="card-title mb-2">Ubicación</h5>
              <div className="mb-2 text-muted">{data.location}</div>
              <div style={{width: '100%', maxWidth: 600, margin: '0 auto'}}>
                <Image
                  src={osmUrl}
                  alt={`Mapa de ${data.location}`}
                  className="img-fluid rounded shadow-sm"
                  width={600}
                  height={300}
                  style={{width: '100%', height: 'auto', minHeight: 180, objectFit: 'cover'}}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Gallery section */}
      {gallery.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h5 className="card-title mb-2">Galería de fotos</h5>
                <div className="d-flex align-items-center justify-content-center gap-3">
                  <button className="btn btn-light btn-sm" onClick={() => setGalleryIdx((galleryIdx - 1 + gallery.length) % gallery.length)} aria-label="Anterior foto">‹</button>
                  <Image
                    src={gallery[galleryIdx]}
                    alt={`Foto ${galleryIdx + 1} de ${gallery.length}`}
                    className="img-fluid rounded shadow gallery-thumb"
                    style={{maxHeight: 260, maxWidth: 400, objectFit: 'cover', cursor: 'pointer'}}
                    width={400}
                    height={300}
                    onClick={() => setLightboxOpen(true)}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setLightboxOpen(true); }}
                  />
                  <button className="btn btn-light btn-sm" onClick={() => setGalleryIdx((galleryIdx + 1) % gallery.length)} aria-label="Siguiente foto">›</button>
                </div>
                <div className="text-center mt-2" style={{fontSize: '0.95em'}}>
                  {galleryIdx + 1} / {gallery.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Lightbox modal */}
      {lightboxOpen && (
        <div className="lightbox-modal position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{background: 'rgba(0,0,0,0.92)', zIndex: 2000}} role="dialog" aria-modal="true">
          <button className="btn btn-light position-absolute top-0 end-0 m-3" style={{zIndex: 2001}} onClick={() => setLightboxOpen(false)} aria-label="Cerrar">✕</button>
          <button className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-2" style={{zIndex: 2001}} onClick={() => setGalleryIdx((galleryIdx - 1 + gallery.length) % gallery.length)} aria-label="Anterior foto">‹</button>
          <Image
            src={gallery[galleryIdx]}
            alt={`Foto ${galleryIdx + 1} de ${gallery.length}`}
            className="img-fluid rounded shadow-lg"
            style={{maxHeight: '80vh', maxWidth: '90vw', objectFit: 'contain', background: '#222'}}
            width={800}
            height={600}
          />
          <button className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-2" style={{zIndex: 2001}} onClick={() => setGalleryIdx((galleryIdx + 1) % gallery.length)} aria-label="Siguiente foto">›</button>
          <div className="position-absolute bottom-0 start-50 translate-middle-x text-white pb-4" style={{fontSize: '1.1em', textShadow: '0 2px 8px #000'}}>
            {galleryIdx + 1} / {gallery.length}
          </div>
        </div>
      )}
      <style jsx>{`
        .card-footer-row:hover {
          background: #fffbe7;
        }
      `}</style>
    </main>
  );
}