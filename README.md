Errores:
- Creo que al borrar usuario desde vista no usuario (Alumno y Profesor) va a lista de usuarios.
- 

Nuevo:
- Subir json de usuarios y asignaturas (/insertJson) Poner enlace en la cabecera de de admin -> Alvaro
- Software sube archivos (modificar vistas lista de una asignatura, editar y añadir software) -> Rodrigo
- Alumnos comunican sugerencias, quejas y errores. Y deciben correo los admin (/formularioSugerencias) Poner enlace en la cabecera de alumno 
- Ante cambio en asiganturas reciben correo los alumnos (no tiene vistas) -> Felipe
- Mejorar la interface (responsive)


Lista de Usuarios - Clave - Rol:

a@a.com - aaa - admin

c@c.com - ccc - alumno

b@b.com - bbb - profesor

p@p.com - ppp - profesor



Para que funcione hay que añadir la IP desde la que te conectas en el atlas de Mongo https://cloud.mongodb.com/
Sino seguir en local (keys.js) URI: 'mongodb://localhost:27017/login-node'
Añadir Alumno
- Añadir Estudio
- Añadir Asignatura
- Añadir y Eliminar Asignaturas a alumno y profesor.
- Consultar Todos los Usuarios (admin)
- Consultar Todos los Alumnos (admin)
- Consultar Todos los Profesores (admin)
- Consultar Todos los Usuarios (admin)
- Consultar Todos los Estudios (admin)
- Consultar Todas las Asignaturas (admin)
- Consultar Todos los Software (admin)

General:
-No se elimina id de profesor y de alumnos de las asignaturas, cuando estos se borran de la bbdd.





