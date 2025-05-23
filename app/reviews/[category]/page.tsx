"use client";
import { useState } from 'react';
import { useParams } from 'next/navigation';
import RestaurantCard from '../../components/RestaurantCard';
import Link from 'next/link';

type RestaurantType = {
  name: string;
  image: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  tags: string[];
};

const mockRestaurants: { [key: string]: RestaurantType[] } = {
  'dulces': [
    { name: 'Dulce Tentación', image: '/img/restaurant-fallback.jpg', location: 'Palermo, CABA', rating: 4.8, reviewCount: 18, description: 'Pastelería artesanal con los mejores postres y tortas.', tags: ['Vegano', 'Sin TACC'] },
    { name: 'ChocoLovers', image: '/img/restaurant-fallback.jpg', location: 'Belgrano, CABA', rating: 4.9, reviewCount: 22, description: 'Especialidad en postres de chocolate.', tags: ['Chocolate'] },
    { name: 'Dulzura Real', image: '/img/restaurant-fallback.jpg', location: 'Almagro, CABA', rating: 4.5, reviewCount: 15, description: 'Variedad de dulces y pastelería.', tags: ['Sin TACC'] },
    { name: 'Postre Express', image: '/img/restaurant-fallback.jpg', location: 'San Telmo, CABA', rating: 4.3, reviewCount: 8, description: 'Postres rápidos y deliciosos.', tags: ['Express'] },
    { name: 'La Dulcería', image: '/img/restaurant-fallback.jpg', location: 'Flores, CABA', rating: 4.4, reviewCount: 11, description: 'Dulces tradicionales argentinos.', tags: ['Tradicional'] },
    { name: 'Tentaciones', image: '/img/restaurant-fallback.jpg', location: 'Villa Crespo, CABA', rating: 4.2, reviewCount: 9, description: 'Opciones sin gluten y veganas.', tags: ['Vegano', 'Sin TACC'] },
    { name: 'Sugar Rush', image: '/img/restaurant-fallback.jpg', location: 'Chacarita, CABA', rating: 4.7, reviewCount: 14, description: 'Pastelería moderna y creativa.', tags: ['Moderno'] },
    { name: 'Dulce Final', image: '/img/restaurant-fallback.jpg', location: 'Retiro, CABA', rating: 4.6, reviewCount: 13, description: 'El mejor final para tu comida.', tags: ['Clásico'] },
  ],
  'brunchs': [
    { name: 'Brunch & Co.', image: '/img/restaurant-fallback.jpg', location: 'Recoleta, CABA', rating: 4.6, reviewCount: 10, description: 'El mejor brunch de la ciudad con opciones veganas.', tags: ['Vegan'] },
    { name: 'Sunny Brunch', image: '/img/restaurant-fallback.jpg', location: 'Palermo, CABA', rating: 4.8, reviewCount: 12, description: 'Ambiente luminoso y menú variado.', tags: ['Variado'] },
    { name: 'Brunchería', image: '/img/restaurant-fallback.jpg', location: 'Belgrano, CABA', rating: 4.7, reviewCount: 15, description: 'Brunchs clásicos y modernos.', tags: ['Clásico', 'Moderno'] },
    { name: 'Eggs & More', image: '/img/restaurant-fallback.jpg', location: 'Caballito, CABA', rating: 4.5, reviewCount: 8, description: 'Especialidad en huevos y pancakes.', tags: ['Clásico'] },
    { name: 'Brunch Express', image: '/img/restaurant-fallback.jpg', location: 'San Telmo, CABA', rating: 4.3, reviewCount: 6, description: 'Rápido y delicioso.', tags: ['Express'] },
    { name: 'Morning Glory', image: '/img/restaurant-fallback.jpg', location: 'Almagro, CABA', rating: 4.4, reviewCount: 9, description: 'Opciones saludables y jugos naturales.', tags: ['Saludable'] },
    { name: 'Brunch House', image: '/img/restaurant-fallback.jpg', location: 'Flores, CABA', rating: 4.6, reviewCount: 11, description: 'Ambiente familiar y menú kids.', tags: ['Familiar'] },
    { name: 'Brunch Time', image: '/img/restaurant-fallback.jpg', location: 'Villa Crespo, CABA', rating: 4.2, reviewCount: 7, description: 'Brunch todo el día.', tags: ['Todo el día'] },
    { name: 'Brunch & Friends', image: '/img/restaurant-fallback.jpg', location: 'Chacarita, CABA', rating: 4.7, reviewCount: 13, description: 'Ideal para grupos grandes.', tags: ['Grupo'] },
    { name: 'Brunch Final', image: '/img/restaurant-fallback.jpg', location: 'Retiro, CABA', rating: 4.5, reviewCount: 10, description: 'El brunch perfecto para cerrar la semana.', tags: ['Cierre de semana'] },
    { name: 'Tarta & Co.', image: '/img/restaurant-fallback.jpg', location: 'Caballito, CABA', rating: 4.6, reviewCount: 10, description: 'Tartas dulces y saladas.', tags: ['Tartas'] },
  ],
  'desayunos': [
    { name: 'Café Amanecer', image: '/img/restaurant-fallback.jpg', location: 'San Telmo, CABA', rating: 4.4, reviewCount: 7, description: 'Desayunos completos y café de especialidad.', tags: ['Completo'] },
    { name: 'Desayuno Feliz', image: '/img/restaurant-fallback.jpg', location: 'Palermo, CABA', rating: 4.7, reviewCount: 10, description: 'Desayunos saludables y energéticos.', tags: ['Saludable'] },
    { name: 'Morning Café', image: '/img/restaurant-fallback.jpg', location: 'Recoleta, CABA', rating: 4.6, reviewCount: 8, description: 'Café de especialidad y medialunas.', tags: ['Café'] },
    { name: 'Desayuno Express', image: '/img/restaurant-fallback.jpg', location: 'Belgrano, CABA', rating: 4.3, reviewCount: 5, description: 'Rápido y delicioso.', tags: ['Express'] },
    { name: 'Café del Sol', image: '/img/restaurant-fallback.jpg', location: 'Caballito, CABA', rating: 4.5, reviewCount: 9, description: 'Ambiente cálido y menú variado.', tags: ['Cálido'] },
    { name: 'Desayuno Real', image: '/img/restaurant-fallback.jpg', location: 'Almagro, CABA', rating: 4.4, reviewCount: 7, description: 'Desayunos abundantes y frescos.', tags: ['Abundante'] },
    { name: 'Café & Pan', image: '/img/restaurant-fallback.jpg', location: 'Flores, CABA', rating: 4.6, reviewCount: 10, description: 'Panadería artesanal y café.', tags: ['Panadería'] },
    { name: 'Desayuno Final', image: '/img/restaurant-fallback.jpg', location: 'Villa Crespo, CABA', rating: 4.2, reviewCount: 6, description: 'El mejor desayuno para empezar el día.', tags: ['Inicio de día'] },
    { name: 'Café Central', image: '/img/restaurant-fallback.jpg', location: 'Chacarita, CABA', rating: 4.7, reviewCount: 12, description: 'Café clásico y ambiente retro.', tags: ['Clásico'] },
    { name: 'Desayuno & Co.', image: '/img/restaurant-fallback.jpg', location: 'Retiro, CABA', rating: 4.5, reviewCount: 8, description: 'Desayunos internacionales.', tags: ['Internacional'] },
    { name: 'La Pastelería', image: '/img/restaurant-fallback.jpg', location: 'Recoleta, CABA', rating: 4.7, reviewCount: 12, description: 'Tortas y tartas caseras.', tags: ['Clásico'] },
  ],
  'mexico-food': [
    { name: 'La Lupita', image: '/img/restaurant-fallback.jpg', location: 'Villa Crespo, CABA', rating: 4.7, reviewCount: 11, description: 'Tacos, burritos y margaritas en un ambiente colorido.', tags: ['Tacos', 'Burritos', 'Margaritas'] },
    { name: 'El Mariachi', image: '/img/restaurant-fallback.jpg', location: 'Palermo, CABA', rating: 4.6, reviewCount: 9, description: 'Comida mexicana tradicional y música en vivo.', tags: ['Tradicional', 'Música'] },
    { name: 'Azteca Grill', image: '/img/restaurant-fallback.jpg', location: 'Belgrano, CABA', rating: 4.8, reviewCount: 13, description: 'Carnes y salsas picantes.', tags: ['Carnes', 'Picante'] },
    { name: 'Taco Loco', image: '/img/restaurant-fallback.jpg', location: 'Recoleta, CABA', rating: 4.5, reviewCount: 7, description: 'Tacos y nachos para compartir.', tags: ['Tacos', 'Nachos'] },
    { name: 'Cantina Frida', image: '/img/restaurant-fallback.jpg', location: 'San Telmo, CABA', rating: 4.4, reviewCount: 8, description: 'Ambiente artístico y margaritas.', tags: ['Margaritas', 'Arte'] },
    { name: 'Chili House', image: '/img/restaurant-fallback.jpg', location: 'Caballito, CABA', rating: 4.3, reviewCount: 6, description: 'Chili con carne y cervezas artesanales.', tags: ['Chili', 'Cerveza'] },
    { name: 'Guacamole Bar', image: '/img/restaurant-fallback.jpg', location: 'Almagro, CABA', rating: 4.2, reviewCount: 5, description: 'Guacamole fresco y tacos.', tags: ['Guacamole', 'Tacos'] },
    { name: 'Sabor Azteca', image: '/img/restaurant-fallback.jpg', location: 'Flores, CABA', rating: 4.7, reviewCount: 10, description: 'Especialidad en enchiladas.', tags: ['Enchiladas'] },
    { name: 'Fiesta Mex', image: '/img/restaurant-fallback.jpg', location: 'Chacarita, CABA', rating: 4.6, reviewCount: 9, description: 'Fiesta temática y menú degustación.', tags: ['Fiesta', 'Degustación'] },
    { name: 'Puebla Picante', image: '/img/restaurant-fallback.jpg', location: 'Retiro, CABA', rating: 4.5, reviewCount: 7, description: 'Platos picantes y postres.', tags: ['Picante', 'Postres'] },
  ],
  'japan-food': [
    { name: 'Sushi House', image: '/img/restaurant-fallback.jpg', location: 'Belgrano, CABA', rating: 4.9, reviewCount: 15, description: 'Sushi fresco y ramen tradicional japonés.', tags: ['Sushi', 'Ramen'] },
    { name: 'Tokyo Bites', image: '/img/restaurant-fallback.jpg', location: 'Palermo, CABA', rating: 4.8, reviewCount: 12, description: 'Comida callejera japonesa.', tags: ['Street Food'] },
    { name: 'Ramen Bar', image: '/img/restaurant-fallback.jpg', location: 'Recoleta, CABA', rating: 4.7, reviewCount: 9, description: 'Ramen y gyozas.', tags: ['Ramen', 'Gyoza'] },
    { name: 'Sakura Sushi', image: '/img/restaurant-fallback.jpg', location: 'San Telmo, CABA', rating: 4.6, reviewCount: 8, description: 'Sushi rolls y sake.', tags: ['Sushi', 'Sake'] },
    { name: 'Nippon Grill', image: '/img/restaurant-fallback.jpg', location: 'Caballito, CABA', rating: 4.5, reviewCount: 7, description: 'Parrilla japonesa y tempura.', tags: ['Parrilla', 'Tempura'] },
    { name: 'Osaka Express', image: '/img/restaurant-fallback.jpg', location: 'Almagro, CABA', rating: 4.4, reviewCount: 6, description: 'Comida rápida japonesa.', tags: ['Express'] },
    { name: 'Kyoto Café', image: '/img/restaurant-fallback.jpg', location: 'Flores, CABA', rating: 4.3, reviewCount: 5, description: 'Café japonés y postres.', tags: ['Café', 'Postres'] },
    { name: 'Samurai Sushi', image: '/img/restaurant-fallback.jpg', location: 'Villa Crespo, CABA', rating: 4.2, reviewCount: 4, description: 'Sushi y platos calientes.', tags: ['Sushi', 'Caliente'] },
    { name: 'Zen Ramen', image: '/img/restaurant-fallback.jpg', location: 'Chacarita, CABA', rating: 4.7, reviewCount: 10, description: 'Ramen vegetariano.', tags: ['Ramen', 'Vegetariano'] },
    { name: 'Tokyo Final', image: '/img/restaurant-fallback.jpg', location: 'Retiro, CABA', rating: 4.6, reviewCount: 9, description: 'El mejor final japonés.', tags: ['Clásico'] },
  ],
  'arabic-food': [
    { name: 'Sabores de Oriente', image: '/img/restaurant-fallback.jpg', location: 'Almagro, CABA', rating: 4.5, reviewCount: 7, description: 'Comida árabe auténtica: shawarma, falafel y más.', tags: ['Shawarma', 'Falafel'] },
    { name: 'El Oasis', image: '/img/restaurant-fallback.jpg', location: 'Palermo, CABA', rating: 4.6, reviewCount: 8, description: 'Ambiente árabe y tés.', tags: ['Té', 'Ambiente'] },
    { name: 'Damasco Grill', image: '/img/restaurant-fallback.jpg', location: 'Belgrano, CABA', rating: 4.7, reviewCount: 10, description: 'Carnes y especias.', tags: ['Carnes', 'Especias'] },
    { name: 'Falafel House', image: '/img/restaurant-fallback.jpg', location: 'Recoleta, CABA', rating: 4.8, reviewCount: 12, description: 'Falafel y hummus.', tags: ['Falafel', 'Hummus'] },
    { name: 'Shawarma Express', image: '/img/restaurant-fallback.jpg', location: 'San Telmo, CABA', rating: 4.4, reviewCount: 5, description: 'Shawarma rápido.', tags: ['Shawarma', 'Express'] },
    { name: 'Café Árabe', image: '/img/restaurant-fallback.jpg', location: 'Caballito, CABA', rating: 4.3, reviewCount: 4, description: 'Café y dulces árabes.', tags: ['Café', 'Dulces'] },
    { name: 'El Desierto', image: '/img/restaurant-fallback.jpg', location: 'Almagro, CABA', rating: 4.2, reviewCount: 3, description: 'Comida del desierto.', tags: ['Desierto'] },
    { name: 'Sahara Grill', image: '/img/restaurant-fallback.jpg', location: 'Flores, CABA', rating: 4.7, reviewCount: 10, description: 'Grill árabe.', tags: ['Grill'] },
    { name: 'Beduino', image: '/img/restaurant-fallback.jpg', location: 'Chacarita, CABA', rating: 4.6, reviewCount: 7, description: 'Comida beduina.', tags: ['Beduino'] },
    { name: 'Oriente Final', image: '/img/restaurant-fallback.jpg', location: 'Retiro, CABA', rating: 4.5, reviewCount: 8, description: 'El mejor final árabe.', tags: ['Clásico'] },
  ],
  'israelfood': [
    { name: 'Tel Aviv Bistró', image: '/img/restaurant-fallback.jpg', location: 'Colegiales, CABA', rating: 4.3, reviewCount: 5, description: 'Sabores israelíes modernos y tradicionales.', tags: ['Israelí'] },
    { name: 'Jerusalén Café', image: '/img/restaurant-fallback.jpg', location: 'Palermo, CABA', rating: 4.6, reviewCount: 8, description: 'Café y platos israelíes.', tags: ['Café', 'Platos'] },
    { name: 'Sabra Grill', image: '/img/restaurant-fallback.jpg', location: 'Belgrano, CABA', rating: 4.7, reviewCount: 10, description: 'Grill israelí.', tags: ['Grill'] },
    { name: 'Kibutz House', image: '/img/restaurant-fallback.jpg', location: 'Recoleta, CABA', rating: 4.8, reviewCount: 12, description: 'Comida de kibutz.', tags: ['Kibutz'] },
    { name: 'Falafel Israel', image: '/img/restaurant-fallback.jpg', location: 'San Telmo, CABA', rating: 4.4, reviewCount: 6, description: 'Falafel y hummus.', tags: ['Falafel', 'Hummus'] },
    { name: 'Café Sabich', image: '/img/restaurant-fallback.jpg', location: 'Caballito, CABA', rating: 4.3, reviewCount: 5, description: 'Café y sabich.', tags: ['Café', 'Sabich'] },
    { name: 'Shakshuka Bar', image: '/img/restaurant-fallback.jpg', location: 'Almagro, CABA', rating: 4.2, reviewCount: 4, description: 'Shakshuka y más.', tags: ['Shakshuka'] },
    { name: 'Kosher Express', image: '/img/restaurant-fallback.jpg', location: 'Flores, CABA', rating: 4.7, reviewCount: 10, description: 'Comida kosher rápida.', tags: ['Kosher', 'Express'] },
    { name: 'Sabores de Israel', image: '/img/restaurant-fallback.jpg', location: 'Chacarita, CABA', rating: 4.6, reviewCount: 7, description: 'Platos típicos israelíes.', tags: ['Típico'] },
    { name: 'Israel Final', image: '/img/restaurant-fallback.jpg', location: 'Retiro, CABA', rating: 4.5, reviewCount: 8, description: 'El mejor final israelí.', tags: ['Clásico'] },
  ],
  'thaifood': [
    { name: 'Bangkok Express', image: '/img/restaurant-fallback.jpg', location: 'Palermo, CABA', rating: 4.6, reviewCount: 9, description: 'Pad thai, currys y street food tailandés.', tags: ['Pad Thai', 'Curry', 'Street Food'] },
    { name: 'Thai House', image: '/img/restaurant-fallback.jpg', location: 'Recoleta, CABA', rating: 4.7, reviewCount: 10, description: 'Comida tailandesa tradicional.', tags: ['Tradicional'] },
    { name: 'Siam Grill', image: '/img/restaurant-fallback.jpg', location: 'Belgrano, CABA', rating: 4.8, reviewCount: 12, description: 'Grill tailandés.', tags: ['Grill'] },
    { name: 'Pad Thai Bar', image: '/img/restaurant-fallback.jpg', location: 'San Telmo, CABA', rating: 4.5, reviewCount: 6, description: 'Especialidad en pad thai.', tags: ['Pad Thai'] },
    { name: 'Curry Express', image: '/img/restaurant-fallback.jpg', location: 'Caballito, CABA', rating: 4.4, reviewCount: 5, description: 'Currys rápidos.', tags: ['Curry', 'Express'] },
    { name: 'Bangkok Café', image: '/img/restaurant-fallback.jpg', location: 'Almagro, CABA', rating: 4.3, reviewCount: 4, description: 'Café tailandés.', tags: ['Café'] },
    { name: 'Thai Veggie', image: '/img/restaurant-fallback.jpg', location: 'Flores, CABA', rating: 4.2, reviewCount: 3, description: 'Opciones vegetarianas.', tags: ['Vegetariano'] },
    { name: 'Sabor Thai', image: '/img/restaurant-fallback.jpg', location: 'Villa Crespo, CABA', rating: 4.7, reviewCount: 10, description: 'Sabores tailandeses.', tags: ['Sabores'] },
    { name: 'Thai Fiesta', image: '/img/restaurant-fallback.jpg', location: 'Chacarita, CABA', rating: 4.6, reviewCount: 7, description: 'Fiesta tailandesa.', tags: ['Fiesta'] },
    { name: 'Thai Final', image: '/img/restaurant-fallback.jpg', location: 'Retiro, CABA', rating: 4.5, reviewCount: 8, description: 'El mejor final tailandés.', tags: ['Clásico'] },
  ],
  'koreanfood': [
    { name: 'Kimchi House', image: '/img/restaurant-fallback.jpg', location: 'Flores, CABA', rating: 4.4, reviewCount: 6, description: 'Barbacoa coreana y platos picantes.', tags: ['Barbacoa', 'Picante'] },
    { name: 'Seúl Grill', image: '/img/restaurant-fallback.jpg', location: 'Palermo, CABA', rating: 4.6, reviewCount: 8, description: 'Grill coreano.', tags: ['Grill'] },
    { name: 'Bibimbap Bar', image: '/img/restaurant-fallback.jpg', location: 'Belgrano, CABA', rating: 4.7, reviewCount: 10, description: 'Bibimbap y más.', tags: ['Bibimbap'] },
    { name: 'K-Pop Café', image: '/img/restaurant-fallback.jpg', location: 'Recoleta, CABA', rating: 4.8, reviewCount: 12, description: 'Café y música coreana.', tags: ['Café', 'Música'] },
    { name: 'Kimchi Express', image: '/img/restaurant-fallback.jpg', location: 'San Telmo, CABA', rating: 4.4, reviewCount: 5, description: 'Kimchi rápido.', tags: ['Kimchi', 'Express'] },
    { name: 'Corea del Sur', image: '/img/restaurant-fallback.jpg', location: 'Caballito, CABA', rating: 4.3, reviewCount: 4, description: 'Platos típicos coreanos.', tags: ['Típico'] },
    { name: 'Seúl Veggie', image: '/img/restaurant-fallback.jpg', location: 'Almagro, CABA', rating: 4.2, reviewCount: 3, description: 'Opciones vegetarianas.', tags: ['Vegetariano'] },
    { name: 'Korean BBQ', image: '/img/restaurant-fallback.jpg', location: 'Villa Crespo, CABA', rating: 4.7, reviewCount: 10, description: 'Barbacoa coreana.', tags: ['Barbacoa'] },
    { name: 'Kimchi Fiesta', image: '/img/restaurant-fallback.jpg', location: 'Chacarita, CABA', rating: 4.6, reviewCount: 7, description: 'Fiesta coreana.', tags: ['Fiesta'] },
    { name: 'Corea Final', image: '/img/restaurant-fallback.jpg', location: 'Retiro, CABA', rating: 4.5, reviewCount: 8, description: 'El mejor final coreano.', tags: ['Clásico'] },
  ],
  'chinafood': [
    { name: 'Gran Dragón', image: '/img/restaurant-fallback.jpg', location: 'Belgrano, CABA', rating: 4.5, reviewCount: 9, description: 'Clásico restaurante chino con auténticos dim sum y pato laqueado.', tags: ['Dim Sum', 'Pato Laqueado'] },
    { name: 'Palacio Oriental', image: '/img/restaurant-fallback.jpg', location: 'Microcentro, CABA', rating: 4.2, reviewCount: 5, description: 'Especialidad en fideos caseros y platos tradicionales.', tags: ['Fideos', 'Tradicional'] },
    { name: 'Casa de Té de Jade', image: '/img/restaurant-fallback.jpg', location: 'Barrio Chino, CABA', rating: 4.7, reviewCount: 10, description: 'Experiencia de té y pastelería china en un ambiente moderno.', tags: ['Té', 'Pastelería'] },
    { name: 'Sabor de Pekín', image: '/img/restaurant-fallback.jpg', location: 'Recoleta, CABA', rating: 4.3, reviewCount: 6, description: 'Sabores auténticos de Pekín con menú degustación.', tags: ['Degustación'] },
    { name: 'Dragón Dorado', image: '/img/restaurant-fallback.jpg', location: 'Caballito, CABA', rating: 4.1, reviewCount: 4, description: 'Comida china tradicional y ambiente familiar.', tags: ['Tradicional', 'Familiar'] },
    { name: 'Mandarín Express', image: '/img/restaurant-fallback.jpg', location: 'Almagro, CABA', rating: 4.0, reviewCount: 3, description: 'Rápido, sabroso y económico.', tags: ['Rápido', 'Económico'] },
    { name: 'Panda Feliz', image: '/img/restaurant-fallback.jpg', location: 'Villa Urquiza, CABA', rating: 4.4, reviewCount: 7, description: 'Ideal para familias y grupos grandes.', tags: ['Familiar', 'Grupo'] },
    { name: 'Jardín de Bambú', image: '/img/restaurant-fallback.jpg', location: 'Chacarita, CABA', rating: 4.6, reviewCount: 9, description: 'Decoración temática y platos vegetarianos.', tags: ['Vegetariano'] },
    { name: 'Sabores de Shanghai', image: '/img/restaurant-fallback.jpg', location: 'Belgrano, CABA', rating: 4.3, reviewCount: 6, description: 'Especialidad en platos de Shanghai.', tags: ['Shanghai'] },
    { name: 'Fénix Rojo', image: '/img/restaurant-fallback.jpg', location: 'San Telmo, CABA', rating: 4.2, reviewCount: 5, description: 'Nuevo en la ciudad, menú degustación.', tags: ['Degustación'] },
  ],
  'parrillas': [
    { name: 'Don Asado', image: '/img/restaurant-fallback.jpg', location: 'San Nicolás, CABA', rating: 4.8, reviewCount: 12, description: 'Parrilla argentina con cortes premium y ambiente familiar.', tags: ['Premium', 'Familiar'] },
    { name: 'La Parrilla', image: '/img/restaurant-fallback.jpg', location: 'Palermo, CABA', rating: 4.7, reviewCount: 10, description: 'Parrilla tradicional argentina.', tags: ['Tradicional'] },
    { name: 'Asado Express', image: '/img/restaurant-fallback.jpg', location: 'Belgrano, CABA', rating: 4.6, reviewCount: 7, description: 'Asado rápido y sabroso.', tags: ['Express'] },
    { name: 'Parrilla del Sol', image: '/img/restaurant-fallback.jpg', location: 'Recoleta, CABA', rating: 4.5, reviewCount: 5, description: 'Ambiente soleado y cortes premium.', tags: ['Premium'] },
    { name: 'El Quincho', image: '/img/restaurant-fallback.jpg', location: 'San Telmo, CABA', rating: 4.4, reviewCount: 6, description: 'Quincho familiar y carnes.', tags: ['Familiar'] },
    { name: 'Parrilla Real', image: '/img/restaurant-fallback.jpg', location: 'Caballito, CABA', rating: 4.3, reviewCount: 5, description: 'Parrilla abundante y variada.', tags: ['Abundante'] },
    { name: 'Asado & Co.', image: '/img/restaurant-fallback.jpg', location: 'Almagro, CABA', rating: 4.2, reviewCount: 4, description: 'Asado para compartir.', tags: ['Grupo'] },
    { name: 'Parrilla Central', image: '/img/restaurant-fallback.jpg', location: 'Flores, CABA', rating: 4.7, reviewCount: 10, description: 'Parrilla céntrica y moderna.', tags: ['Moderno'] },
    { name: 'El Fogón', image: '/img/restaurant-fallback.jpg', location: 'Chacarita, CABA', rating: 4.6, reviewCount: 7, description: 'Fogón tradicional.', tags: ['Tradicional'] },
    { name: 'Parrilla Final', image: '/img/restaurant-fallback.jpg', location: 'Retiro, CABA', rating: 4.5, reviewCount: 8, description: 'El mejor final parrillero.', tags: ['Clásico'] },
  ],
  'brazilfood': [
    { name: 'Sabor Brasil', image: '/img/restaurant-fallback.jpg', location: 'Centro, CABA', rating: 4.5, reviewCount: 7, description: 'Feijoada, caipirinhas y auténtica comida brasileña.', tags: ['Feijoada', 'Caipirinha'] },
    { name: 'Rio Grill', image: '/img/restaurant-fallback.jpg', location: 'Palermo, CABA', rating: 4.6, reviewCount: 9, description: 'Grill brasileño.', tags: ['Grill'] },
    { name: 'Bahía Café', image: '/img/restaurant-fallback.jpg', location: 'Belgrano, CABA', rating: 4.7, reviewCount: 10, description: 'Café y postres brasileños.', tags: ['Café', 'Postres'] },
    { name: 'Samba House', image: '/img/restaurant-fallback.jpg', location: 'Recoleta, CABA', rating: 4.8, reviewCount: 12, description: 'Samba y comida típica.', tags: ['Samba', 'Típico'] },
    { name: 'Feijoada Express', image: '/img/restaurant-fallback.jpg', location: 'San Telmo, CABA', rating: 4.4, reviewCount: 5, description: 'Feijoada rápida.', tags: ['Feijoada', 'Express'] },
    { name: 'Brasil Veggie', image: '/img/restaurant-fallback.jpg', location: 'Caballito, CABA', rating: 4.3, reviewCount: 4, description: 'Opciones vegetarianas.', tags: ['Vegetariano'] },
    { name: 'Churrasco Bar', image: '/img/restaurant-fallback.jpg', location: 'Almagro, CABA', rating: 4.2, reviewCount: 3, description: 'Churrasco y caipirinhas.', tags: ['Churrasco', 'Caipirinha'] },
    { name: 'Sabor Carioca', image: '/img/restaurant-fallback.jpg', location: 'Flores, CABA', rating: 4.7, reviewCount: 10, description: 'Sabores cariocas.', tags: ['Carioca'] },
    { name: 'Brasil Fiesta', image: '/img/restaurant-fallback.jpg', location: 'Chacarita, CABA', rating: 4.6, reviewCount: 7, description: 'Fiesta brasileña.', tags: ['Fiesta'] },
    { name: 'Brasil Final', image: '/img/restaurant-fallback.jpg', location: 'Retiro, CABA', rating: 4.5, reviewCount: 8, description: 'El mejor final brasileño.', tags: ['Clásico'] },
  ],
  'burguers': [
    { name: 'Burger Bros', image: '/img/restaurant-fallback.jpg', location: 'Palermo, CABA', rating: 4.7, reviewCount: 10, description: 'Hamburguesas artesanales y papas rústicas.', tags: ['Artesanal', 'Rústica'] },
    { name: 'Burger House', image: '/img/restaurant-fallback.jpg', location: 'Recoleta, CABA', rating: 4.6, reviewCount: 8, description: 'Hamburguesas clásicas.', tags: ['Clásico'] },
    { name: 'Burger Express', image: '/img/restaurant-fallback.jpg', location: 'Belgrano, CABA', rating: 4.5, reviewCount: 6, description: 'Hamburguesas rápidas.', tags: ['Express'] },
    { name: 'Burger Grill', image: '/img/restaurant-fallback.jpg', location: 'San Telmo, CABA', rating: 4.4, reviewCount: 5, description: 'Grill de hamburguesas.', tags: ['Grill'] },
    { name: 'Burger Veggie', image: '/img/restaurant-fallback.jpg', location: 'Caballito, CABA', rating: 4.3, reviewCount: 4, description: 'Opciones vegetarianas.', tags: ['Vegetariano'] },
    { name: 'Burger Central', image: '/img/restaurant-fallback.jpg', location: 'Almagro, CABA', rating: 4.2, reviewCount: 3, description: 'Hamburguesas céntricas.', tags: ['Céntrico'] },
    { name: 'Burger Fiesta', image: '/img/restaurant-fallback.jpg', location: 'Flores, CABA', rating: 4.7, reviewCount: 10, description: 'Fiesta de hamburguesas.', tags: ['Fiesta'] },
    { name: 'Burger & Friends', image: '/img/restaurant-fallback.jpg', location: 'Villa Crespo, CABA', rating: 4.6, reviewCount: 7, description: 'Ideal para grupos.', tags: ['Grupo'] },
    { name: 'Burger Final', image: '/img/restaurant-fallback.jpg', location: 'Chacarita, CABA', rating: 4.5, reviewCount: 8, description: 'El mejor final hamburguesero.', tags: ['Clásico'] },
    { name: 'Burger King', image: '/img/restaurant-fallback.jpg', location: 'Retiro, CABA', rating: 4.4, reviewCount: 6, description: 'Hamburguesas de reyes.', tags: ['Rey'] },
  ],
  'helados': [
    { name: 'Heladería Italia', image: '/img/restaurant-fallback.jpg', location: 'Caballito, CABA', rating: 4.9, reviewCount: 12, description: 'Helados artesanales con sabores únicos.', tags: ['Artesanal'] },
    { name: 'Helado Feliz', image: '/img/restaurant-fallback.jpg', location: 'Palermo, CABA', rating: 4.8, reviewCount: 10, description: 'Helados felices.', tags: ['Feliz'] },
    { name: 'Helado Express', image: '/img/restaurant-fallback.jpg', location: 'Belgrano, CABA', rating: 4.7, reviewCount: 8, description: 'Helados rápidos.', tags: ['Express'] },
    { name: 'Helado House', image: '/img/restaurant-fallback.jpg', location: 'San Telmo, CABA', rating: 4.6, reviewCount: 7, description: 'Casa de helados.', tags: ['Casa'] },
    { name: 'Helado Veggie', image: '/img/restaurant-fallback.jpg', location: 'Caballito, CABA', rating: 4.5, reviewCount: 6, description: 'Opciones veganas.', tags: ['Vegano'] },
    { name: 'Helado Central', image: '/img/restaurant-fallback.jpg', location: 'Almagro, CABA', rating: 4.4, reviewCount: 5, description: 'Helados céntricos.', tags: ['Céntrico'] },
    { name: 'Helado Fiesta', image: '/img/restaurant-fallback.jpg', location: 'Flores, CABA', rating: 4.3, reviewCount: 4, description: 'Fiesta de helados.', tags: ['Fiesta'] },
    { name: 'Helado & Friends', image: '/img/restaurant-fallback.jpg', location: 'Villa Crespo, CABA', rating: 4.2, reviewCount: 3, description: 'Ideal para grupos.', tags: ['Grupo'] },
    { name: 'Helado Final', image: '/img/restaurant-fallback.jpg', location: 'Chacarita, CABA', rating: 4.1, reviewCount: 4, description: 'El mejor final heladero.', tags: ['Clásico'] },
    { name: 'Helado Rey', image: '/img/restaurant-fallback.jpg', location: 'Retiro, CABA', rating: 4.0, reviewCount: 3, description: 'Helados de reyes.', tags: ['Rey'] },
  ],
  'peru-food': [
    { name: 'Ceviche Lima', image: '/img/restaurant-fallback.jpg', location: 'Retiro, CABA', rating: 4.6, reviewCount: 7, description: 'Ceviche, tiraditos y cocina peruana de autor.', tags: ['Ceviche', 'Tiraditos'] },
    { name: 'Perú Grill', image: '/img/restaurant-fallback.jpg', location: 'Palermo, CABA', rating: 4.7, reviewCount: 9, description: 'Grill peruano.', tags: ['Grill'] },
    { name: 'Lima Café', image: '/img/restaurant-fallback.jpg', location: 'Belgrano, CABA', rating: 4.8, reviewCount: 10, description: 'Café y postres peruanos.', tags: ['Café', 'Postres'] },
    { name: 'Ceviche House', image: '/img/restaurant-fallback.jpg', location: 'San Telmo, CABA', rating: 4.5, reviewCount: 5, description: 'Casa de ceviche.', tags: ['Ceviche'] },
    { name: 'Perú Veggie', image: '/img/restaurant-fallback.jpg', location: 'Caballito, CABA', rating: 4.4, reviewCount: 4, description: 'Opciones vegetarianas.', tags: ['Vegetariano'] },
    { name: 'Perú Central', image: '/img/restaurant-fallback.jpg', location: 'Almagro, CABA', rating: 4.3, reviewCount: 3, description: 'Comida peruana céntrica.', tags: ['Céntrico'] },
    { name: 'Perú Fiesta', image: '/img/restaurant-fallback.jpg', location: 'Flores, CABA', rating: 4.2, reviewCount: 3, description: 'Fiesta peruana.', tags: ['Fiesta'] },
    { name: 'Perú & Friends', image: '/img/restaurant-fallback.jpg', location: 'Villa Crespo, CABA', rating: 4.1, reviewCount: 2, description: 'Ideal para grupos.', tags: ['Grupo'] },
    { name: 'Perú Final', image: '/img/restaurant-fallback.jpg', location: 'Chacarita, CABA', rating: 4.0, reviewCount: 3, description: 'El mejor final peruano.', tags: ['Clásico'] },
    { name: 'Perú Rey', image: '/img/restaurant-fallback.jpg', location: 'Retiro, CABA', rating: 3.9, reviewCount: 2, description: 'Comida de reyes.', tags: ['Rey'] },
  ],
};

const categoryNames: Record<string, string> = {
  'dulces': 'Dulces',
  'brunchs': 'Brunchs',
  'desayunos': 'Desayunos',
  'mexico-food': 'Comida Mexicana',
  'japan-food': 'Comida Japonesa',
  'arabic-food': 'Comida Árabe',
  'israelfood': 'Comida Israelí',
  'thaifood': 'Comida Tailandesa',
  'koreanfood': 'Comida Coreana',
  'chinafood': 'Comida China',
  'parrillas': 'Parrillas',
  'brazilfood': 'Comida Brasileña',
  'burguers': 'Hamburguesas',
  'helados': 'Helados',
  'peru-food': 'Comida Peruana',
};

const categoryDescriptions: Record<string, string> = {
  'dulces': 'Postres, tortas y dulzuras que probamos en la ciudad.',
  'brunchs': 'Los mejores lugares para brunchear con amigos.',
  'desayunos': 'Arrancá el día con los desayunos más ricos.',
  'mexico-food': 'Tacos, burritos y sabores picantes de México.',
  'japan-food': 'Sushi, ramen y mucho más de Japón.',
  'arabic-food': 'Sabores y delicias de Medio Oriente.',
  'israelfood': 'Platos únicos y tradicionales de Israel.',
  'thaifood': 'Comida tailandesa exótica y picante.',
  'koreanfood': 'BBQ coreano, kimchi y más.',
  'chinafood': 'Descubrí los mejores restaurantes de comida china que hemos visitado. Dim sum, fideos, pato laqueado y mucho más.',
  'parrillas': 'Las mejores parrillas y carnes asadas.',
  'brazilfood': 'Churrasquerías y sabores de Brasil.',
  'burguers': 'Las hamburguesas más jugosas y sabrosas.',
  'helados': 'Refrescate con los mejores helados.',
  'peru-food': 'Ceviche y delicias peruanas.',
};

// Add a slugify function that removes accents and special characters
function slugify(name: string) {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const allRestaurants = mockRestaurants[category] || [];

  // Gather unique locations and tags for filters
  const allTags = Array.from(new Set(allRestaurants.flatMap(r => r.tags || [])));

  // --- Advanced Filter State ---
  const [search, setSearch] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]); // multi-select
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);
  const [minReviews, setMinReviews] = useState(0);
  const [maxReviews, setMaxReviews] = useState(() => Math.max(...allRestaurants.map(r => r.reviewCount), 0));
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // --- Advanced Filtering Logic ---
  const filteredRestaurants = allRestaurants.filter(r => {
    const matchesName = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(r.location);
    const matchesRating = r.rating >= minRating && r.rating <= maxRating;
    const matchesReviewCount = r.reviewCount >= minReviews && r.reviewCount <= maxReviews;
    const matchesTags = activeTags.length === 0 || (r.tags && activeTags.every(tag => r.tags.includes(tag)));
    return matchesName && matchesLocation && matchesRating && matchesReviewCount && matchesTags;
  });

  // --- Handlers ---
  function handleTagClick(tag: string) {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }
  function handleClearAll() {
    setSearch('');
    setSelectedLocations([]);
    setMinRating(0);
    setMaxRating(5);
    setMinReviews(0);
    setMaxReviews(Math.max(...allRestaurants.map(r => r.reviewCount), 0));
    setActiveTags([]);
  }
  function handleRemoveChip(type: string, value: string | number) {
    if (type === 'tag') setActiveTags(prev => prev.filter(t => t !== value));
    if (type === 'minRating') setMinRating(0);
    if (type === 'maxRating') setMaxRating(5);
    if (type === 'minReviews') setMinReviews(0);
    if (type === 'maxReviews') setMaxReviews(Math.max(...allRestaurants.map(r => r.reviewCount), 0));
  }

  return (
    <section className="category-gallery py-5">
      <div className="container">
        <div className="d-flex align-items-center mb-4 gap-3">
          <Link href="/" className="btn btn-lg btn-primary px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 back-main-btn">
            <span style={{fontSize: '1.4em', lineHeight: 1}}>🏠</span>
            <span>Volver al inicio</span>
          </Link>
          <h1 className="display-4 fw-bold mb-0 category-header-title text-gradient-accent">
            {categoryNames[category] || category}
          </h1>
        </div>
        <p className="lead text-muted mb-4">{categoryDescriptions[category]}</p>
        {/* Filters - Compact, Horizontal, Modern UX */}
        <div
          className="filter-bar mb-4 px-3 py-2 d-flex flex-wrap align-items-center gap-2 gap-md-3 shadow-sm rounded-4 glass-bg"
          style={{ minHeight: 0, background: 'rgba(255,255,255,0.85)', border: '1px solid #e5e7eb', boxShadow: '0 2px 16px 0 rgba(0,0,0,0.04)', backdropFilter: 'blur(8px)' }}
        >
          {/* Search */}
          <input
            type="text"
            className="form-control form-control-sm flex-shrink-0"
            style={{ maxWidth: 180, minWidth: 120 }}
            placeholder="Buscar por nombre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {/* Multi-select Locations */}
          {/* Locations filter bubbles removed */}
          {/* ... existing code ... */}
          {/* Rating Range */}
          <div className="d-flex align-items-center gap-1 flex-shrink-0">
            <label className="fw-bold mb-0" style={{ fontSize: '0.95em' }}>⭐</label>
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={minRating}
              onChange={e => setMinRating(Number(e.target.value))}
              style={{ width: '60px' }}
            />
            <span style={{ fontSize: '0.92em', minWidth: 28 }}>{minRating.toFixed(1)}</span>
            <span>-</span>
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={maxRating}
              onChange={e => setMaxRating(Number(e.target.value))}
              style={{ width: '60px' }}
            />
            <span style={{ fontSize: '0.92em', minWidth: 28 }}>{maxRating.toFixed(1)}</span>
          </div>
          {/* Review Count Range */}
          <div className="d-flex align-items-center gap-1 flex-shrink-0">
            <label className="fw-bold mb-0" style={{ fontSize: '0.95em' }}>#</label>
            <input
              type="number"
              min={0}
              max={maxReviews}
              value={minReviews}
              onChange={e => setMinReviews(Number(e.target.value))}
              style={{ width: '48px' }}
              className="form-control form-control-sm"
            />
            <span>-</span>
            <input
              type="number"
              min={0}
              max={maxReviews}
              value={maxReviews}
              onChange={e => setMaxReviews(Number(e.target.value))}
              style={{ width: '48px' }}
              className="form-control form-control-sm"
            />
          </div>
          {/* Tags */}
          {allTags.map(tag => (
            <button
              key={tag}
              className={`btn btn-ghost btn-sm px-2 py-1${activeTags.includes(tag) ? ' active' : ''}`}
              type="button"
              onClick={() => handleTagClick(tag)}
              style={{ fontSize: '0.92rem', borderRadius: '999px', border: '1px solid #e5e7eb', background: activeTags.includes(tag) ? 'rgba(255,193,7,0.13)' : 'transparent', color: '#333' }}
            >
              {tag}
            </button>
          ))}
          {/* Active Filter Chips */}
          {selectedLocations.map(loc => (
            <span key={loc} className="badge bg-info text-dark filter-chip d-flex align-items-center animate__animated animate__fadeIn" style={{ borderRadius: '999px', fontWeight: 500 }}>
              {loc} <button type="button" className="btn-close btn-close-sm ms-1" aria-label="Quitar" onClick={() => handleRemoveChip('location', loc)} style={{ fontSize: '0.7em' }} />
            </span>
          ))}
          {activeTags.map(tag => (
            <span key={tag} className="badge bg-warning text-dark filter-chip d-flex align-items-center animate__animated animate__fadeIn" style={{ borderRadius: '999px', fontWeight: 500 }}>
              {tag} <button type="button" className="btn-close btn-close-sm ms-1" aria-label="Quitar" onClick={() => handleRemoveChip('tag', tag)} style={{ fontSize: '0.7em' }} />
            </span>
          ))}
          {minRating > 0 && (
            <span className="badge bg-success text-white filter-chip d-flex align-items-center animate__animated animate__fadeIn" style={{ borderRadius: '999px', fontWeight: 500 }}>
              Min ⭐: {minRating} <button type="button" className="btn-close btn-close-sm ms-1" aria-label="Quitar" onClick={() => handleRemoveChip('minRating', minRating)} style={{ fontSize: '0.7em' }} />
            </span>
          )}
          {maxRating < 5 && (
            <span className="badge bg-success text-white filter-chip d-flex align-items-center animate__animated animate__fadeIn" style={{ borderRadius: '999px', fontWeight: 500 }}>
              Max ⭐: {maxRating} <button type="button" className="btn-close btn-close-sm ms-1" aria-label="Quitar" onClick={() => handleRemoveChip('maxRating', maxRating)} style={{ fontSize: '0.7em' }} />
            </span>
          )}
          {minReviews > 0 && (
            <span className="badge bg-primary text-white filter-chip d-flex align-items-center animate__animated animate__fadeIn" style={{ borderRadius: '999px', fontWeight: 500 }}>
              Min #Reseñas: {minReviews} <button type="button" className="btn-close btn-close-sm ms-1" aria-label="Quitar" onClick={() => handleRemoveChip('minReviews', minReviews)} style={{ fontSize: '0.7em' }} />
            </span>
          )}
          {maxReviews < Math.max(...allRestaurants.map(r => r.reviewCount), 0) && (
            <span className="badge bg-primary text-white filter-chip d-flex align-items-center animate__animated animate__fadeIn" style={{ borderRadius: '999px', fontWeight: 500 }}>
              Max #Reseñas: {maxReviews} <button type="button" className="btn-close btn-close-sm ms-1" aria-label="Quitar" onClick={() => handleRemoveChip('maxReviews', maxReviews)} style={{ fontSize: '0.7em' }} />
            </span>
          )}
          {/* Clear All */}
          <button className="btn btn-outline-danger btn-sm ms-auto px-3 py-1" type="button" onClick={handleClearAll} style={{ borderRadius: '999px', fontWeight: 500 }}>
            Limpiar filtros
          </button>
        </div>
        {/* End Filters */}
        <div className="row g-4">
          {filteredRestaurants.length === 0 ? (
            <div className="col-12 text-center py-5">
              <h4 className="text-muted">No hay restaurantes que coincidan con los filtros.</h4>
            </div>
          ) : (
            filteredRestaurants.map((rest, idx) => {
              const slug = slugify(rest.name);
              const cardContent = (
                <RestaurantCard {...rest} />
              );
              return (
                <div className="col-12 col-sm-6 col-lg-4" key={idx}>
                  <Link href={`/restaurants/${slug}`} className="text-decoration-none text-dark">
                    {cardContent}
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
} 