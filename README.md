# 📦 EntregaYa

Sistema web para la gestión y seguimiento de entregas de paquetes.

## 📋 Descripción

EntregaYa es una aplicación web desarrollada como proyecto académico 

El sistema permite registrar paquetes, generar códigos de seguimiento, consultar el estado de los envíos, gestionar incidencias, realizar asignaciones y registrar entregas.

Además, incorpora una automatización con n8n y un modelo de inteligencia artificial para analizar las incidencias registradas y generar información útil para su gestión.

## 🎯 Objetivo

Facilitar la gestión y el seguimiento de paquetes mediante una aplicación web que centralice la información de los envíos y permita conocer su estado durante el proceso de entrega.

## 🚀 Funcionalidades

- Registro de paquetes.
- Generación automática del código de seguimiento.
- Consulta pública del seguimiento mediante código.
- Consulta interna del seguimiento desde el panel administrativo.
- Actualización del estado de los paquetes.
- Registro automático del historial de estados.
- Gestión de incidencias.
- Análisis automático de incidencias mediante inteligencia artificial.
- Generación de prioridad, categoría y recomendación para las incidencias.
- Generación de mensajes para los clientes.
- Asignación de paquetes a responsables.
- Registro de entregas.
- Actualización automática del estado del paquete al registrar una entrega.
- Dashboard con estadísticas de paquetes e incidencias.
- Autenticación de usuarios.

## 🛠️ Tecnologías utilizadas

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend y base de datos

- Supabase
- PostgreSQL
- Supabase Authentication

### Automatización e inteligencia artificial

- n8n
- Google Gemini

### Control de versiones

- Git
- GitHub

### Despliegue

- Vercel

## 🏗️ Arquitectura general

La aplicación utiliza una arquitectura web en la que el frontend desarrollado con Next.js se comunica con Supabase para gestionar la autenticación y los datos almacenados en PostgreSQL.

El flujo general es:

Usuario
   │
   ▼
Next.js + React
   │
   ▼
Supabase
   │
   ├── Autenticación
   │
   └── PostgreSQL
          │
          ▼
       Incidencia
          │
          ▼
        n8n
          │
          ▼
    Google Gemini
          │
          ▼
 Análisis de incidencia
          │
          ▼
       Supabase


       🗄️ Base de datos

La base de datos utiliza PostgreSQL mediante Supabase.

Las principales tablas utilizadas son:

profiles — información de los usuarios.
packages — información de los paquetes.
package_history — historial de cambios de estado.
incidents — incidencias asociadas a los paquetes.
assignments — asignaciones de paquetes.
deliveries — registro de las entregas.

El código de seguimiento de los paquetes se genera automáticamente mediante una función y un trigger de PostgreSQL.

El historial también se registra automáticamente cuando se crea un paquete o se modifica su estado.

🤖 Inteligencia artificial

EntregaYa utiliza inteligencia artificial para apoyar la gestión de incidencias.

Cuando se registra una incidencia:

La incidencia es almacenada en Supabase.
Un trigger de PostgreSQL envía la información a n8n.
n8n recibe los datos de la incidencia.
El agente de IA analiza la información.
Google Gemini genera:
Categoría.
Prioridad.
Recomendación.
Mensaje para el cliente.
n8n procesa la respuesta.
Los resultados se almacenan nuevamente en Supabase.
La información puede visualizarse desde el módulo de incidencias.
🔄 Automatización

La automatización principal utiliza n8n.

Flujo:

Supabase
    │
    ▼
Webhook n8n
    │
    ▼
AI Agent
    │
    ▼
Google Gemini
    │
    ▼
Code
    │
    ▼
Supabase

Esta automatización permite procesar las incidencias sin que el usuario tenga que realizar manualmente el análisis.

🔐 Configuración

Para ejecutar el proyecto localmente es necesario configurar las variables de entorno de Supabase.

Crear un archivo:

.env.local

con:

NEXT_PUBLIC_SUPABASE_URL=TU_URL_DE_SUPABASE
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICABLE

💻 Instalación

Clonar el repositorio:

git clone https://github.com/Dcgamor1/gestion-seguimiento-entregas.git

Entrar en el proyecto:

cd gestion-seguimiento-entregas

Instalar las dependencias:

npm install

Configurar las variables de entorno en .env.local.

Ejecutar el proyecto en modo desarrollo:

npm run dev

La aplicación estará disponible en:

http://localhost:3000
📁 Estructura principal
gestion-seguimiento-entregas/
│
├── app/
│   ├── dashboard/
│   │   ├── asignaciones/
│   │   ├── entregas/
│   │   ├── historial/
│   │   ├── incidencias/
│   │   ├── paquetes/
│   │   ├── registrar/
│   │   └── seguimiento/
│   │
│   ├── login/
│   └── page.tsx
│
├── lib/
│   └── supabase/
│       └── client.ts
│
├── public/
│
├── .gitignore
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
📌 Estados de los paquetes

El sistema contempla el siguiente flujo de estados:

Registrado
     ↓
En preparación
     ↓
Preparado
     ↓
Despachado
     ↓
En tránsito
     ↓
Entregado

También se contempla el estado:

Incidencia

para situaciones que requieren atención durante el proceso.

👤 Acceso al sistema

El sistema cuenta con autenticación mediante Supabase Authentication.

Los usuarios autenticados pueden acceder al panel de administración y utilizar los módulos disponibles según la configuración del sistema.

📚 Proyecto académico

Asignatura: Ingeniería de Software I

Proyecto: Aplicación de gestión y seguimiento de entregas de paquetes

Repositorio: GitHub

Despliegue: Vercel
