# OVNIS API — Autenticación y peticiones HTTP con Postman

Guía de desarrollo para iniciar sesión en la API de OVNIS, obtener un JWT (JSON Web Token) y utilizarlo en peticiones HTTP protegidas. Incluye un ejemplo de actualización de características (RF-034).

## 1. Requisitos previos

- Tener instalado [Postman](https://www.postman.com/downloads/) (se recomienda la aplicación de escritorio para trabajar con `localhost`).
- Tener el [backend de OVNIS](https://github.com/nicolasG27/ovnis-api) disponible localmente.
- Tener configurada la base de datos y las variables de entorno requeridas por el backend.
- Contar con una cuenta registrada en OVNIS. Para probar rutas administrativas, utilizar una cuenta con rol `ADMIN` proporcionada por el equipo.

Ejecuta Spring Boot desde tu IDE o, desde la raíz de `ovnis-api` en Windows, mediante:

```powershell
.\mvnw.cmd spring-boot:run
```

En macOS o Linux, puedes utilizar `./mvnw spring-boot:run`.

En esta guía se utiliza `http://localhost:8080`, el puerto habitual de Spring Boot. Si tu consola indica otro puerto, modifica las URLs correspondientes. No es necesario ejecutar el frontend para probar la API.

## 2. Iniciar sesión en OVNIS desde Postman

No se trata de iniciar sesión en tu cuenta de Postman, sino de autenticarte ante el backend de OVNIS.

### Paso 1. Crear una petición HTTP

1. Abre Postman y selecciona tu workspace.
2. Presiona **New → HTTP Request** (o abre una nueva pestaña de petición).
3. Selecciona el método **POST** en el menú que aparece a la izquierda de la URL.
4. Introduce la siguiente dirección:

```http
http://localhost:8080/api/auth/login
```

### Paso 2. Configurar la autorización y el cuerpo

1. Abre la pestaña **Authorization** y selecciona **No Auth**. El login es público; todavía no tienes un token.
2. Abre **Body** y selecciona **raw**.
3. En el selector de formato, elige **JSON**.
4. Escribe tus credenciales de OVNIS:

```json
{
  "username": "TU_USUARIO",
  "password": "TU_CONTRASEÑA"
}
```

Sustituye los valores de ejemplo por tus credenciales reales. La API espera `username` y `password`, no `email`. Para operaciones administrativas, inicia sesión con una cuenta `ADMIN`.

Al seleccionar JSON, Postman configura normalmente el encabezado `Content-Type: application/json`. Puedes comprobarlo en **Headers**.

### Paso 3. Enviar la petición

Presiona **Send**. Si las credenciales son correctas, el servidor responderá con `200 OK` y un JSON similar a este:

```json
{
  "accessToken": "eyJ...TOKEN_DE_EJEMPLO...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

| Campo | Significado |
| --- | --- |
| `accessToken` | JWT emitido por OVNIS que identifica al usuario autenticado. |
| `tokenType` | Tipo de autorización que se utilizará: `Bearer`. |
| `expiresIn` | Duración del token en segundos. En la configuración compartida de OVNIS es de 3600 segundos (1 hora). |

El token mostrado es ficticio y no sirve para autenticar una petición. La duración puede variar si se cambia la configuración del backend.

### Paso 4. Copiar el token

Copia únicamente el valor completo de `accessToken` de la respuesta real. No incluyas las comillas del JSON, el nombre del campo ni el prefijo `Bearer`.

> **Importante:** un JWT de acceso funciona como una credencial. No compartas tokens reales, contraseñas ni secretos de firma en GitHub, Jira, capturas de pantalla o colecciones exportadas.

## 3. Usar el Bearer Token en una petición protegida

Para este ejemplo utilizaremos el RF-034: editar una característica existente. Realiza las pruebas en una base de datos de desarrollo y con registros de prueba.

### Paso 1. Consultar las características disponibles

Crea una nueva petición con método **GET**:

```http
GET http://localhost:8080/api/caracteristicas
```

En **Authorization** selecciona **No Auth** y presiona **Send**. Este endpoint es público y devuelve las características activas.

Respuesta de ejemplo (`200 OK`):

```json
[
  {
    "id": 1,
    "nombre": "Disco"
  }
]
```

Anota el ID de una característica existente. Si obtienes `[]`, no hay características activas; puedes pedir al administrador que cree un registro de prueba o utilizar el ejemplo POST de la sección 5.

### Paso 2. Configurar la petición PUT

1. Crea una nueva petición HTTP.
2. Selecciona **PUT**.
3. Escribe la URL de la característica a modificar (sustituye `1` por un ID real):

```http
http://localhost:8080/api/admin/caracteristicas/1
```

### Paso 3. Agregar el token

1. Abre **Authorization**.
2. En **Auth Type**, selecciona **Bearer Token** (no JWT Bearer).
3. Pega el valor completo de `accessToken` en el campo **Token**.

Postman agrega automáticamente este encabezado a la petición:

```http
Authorization: Bearer TU_ACCESS_TOKEN
```

No escribas `Bearer` dentro del campo Token, porque Postman ya lo añade. Tampoco agregues otro encabezado `Authorization` manualmente si estás utilizando esta opción.

Como alternativa, puedes utilizar **No Auth** y agregar tú mismo el encabezado `Authorization` en **Headers**, con el valor `Bearer TU_ACCESS_TOKEN`. Utiliza solo uno de los dos métodos.

### Paso 4. Configurar el cuerpo de la petición

En **Body → raw → JSON**, introduce el nuevo nombre:

```json
{
  "nombre": "Disco luminoso"
}
```

El identificador se envía en la URL y el nombre en el cuerpo. El atributo debe llamarse `nombre`, no `name`, porque así lo define el DTO de OVNIS.

### Paso 5. Enviar y verificar la respuesta

Presiona **Send**. Si el token pertenece a un administrador, el ID existe y los datos son válidos, se espera `200 OK` y una respuesta como esta:

```json
{
  "id": 1,
  "nombre": "Disco luminoso"
}
```

Vuelve a ejecutar `GET /api/caracteristicas` y verifica que el nombre actualizado aparece con el mismo ID. Esto confirma que el cambio se guardó y no se limitó a modificar la interfaz.

## 4. Guardar el token automáticamente (opcional)

Para evitar copiar y pegar el token cada vez que realizas una petición, puedes usar variables de entorno de Postman.

### Paso 1. Crear el entorno

1. Abre **Environments** y crea un entorno llamado `OVNIS Local`.
2. Agrega estas variables:

| Variable | Valor local |
| --- | --- |
| `baseUrl` | `http://localhost:8080` |
| `accessToken` | Dejar vacío inicialmente |

3. Marca `accessToken` como sensible si tu versión de Postman ofrece esa opción. Mantén su valor privado/local y no lo compartas ni lo exportes.
4. Guarda el entorno y selecciónalo como entorno activo en la parte superior de Postman.

### Paso 2. Configurar el login

En la petición POST de inicio de sesión, sustituye la URL por:

```text
{{baseUrl}}/api/auth/login
```

Abre **Scripts → Post-response** (en versiones antiguas puede llamarse **Tests**) y agrega:

```javascript
// Evita conservar un token anterior si falla el login.
pm.environment.unset("accessToken");

if (pm.response.code === 200) {
    const data = pm.response.json();

    if (typeof data.accessToken === "string" && data.accessToken) {
        pm.environment.set("accessToken", data.accessToken);
    }
}
```

Este script se ejecuta al recibir la respuesta. Si el login fue exitoso, guarda el token en la variable `accessToken` del entorno activo. No imprime el token en la consola.

Presiona **Send** nuevamente y verifica que la variable tenga un valor local en el entorno.

### Paso 3. Reutilizar el token

En la petición PUT, cambia la URL a:

```text
{{baseUrl}}/api/admin/caracteristicas/1
```

En **Authorization → Bearer Token**, escribe:

```text
{{accessToken}}
```

Postman sustituirá esa referencia por el valor guardado. Puedes utilizarla en todas las peticiones protegidas que requieran esa misma cuenta.

Cuando el token expire, vuelve a enviar el POST de login. El script reemplazará el token anterior. Si cambias de cuenta (por ejemplo, de ADMIN a USER), también se reemplazará por el token de la nueva cuenta.

## 5. Otros ejemplos de peticiones HTTP

Todos los endpoints de la tabla existen en la versión de `ovnis-api` utilizada para elaborar esta guía.

| Método | Endpoint | Autorización | Resultado esperado |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | No Auth | `200 OK` y token |
| GET | `/api/caracteristicas` | No Auth | `200 OK` y lista de características activas |
| POST | `/api/admin/caracteristicas` | Bearer Token de ADMIN | `201 Created` |
| PUT | `/api/admin/caracteristicas/{id}` | Bearer Token de ADMIN | `200 OK` |
| DELETE | `/api/admin/caracteristicas/{id}` | Bearer Token de ADMIN | `204 No Content` |

Para crear una característica, utiliza POST con este cuerpo JSON:

```json
{
  "nombre": "Esfera de prueba"
}
```

Para eliminar una característica, utiliza DELETE con su ID en la URL, sin cuerpo. En OVNIS, esta operación la desactiva en lugar de borrarla físicamente. El GET público deja de mostrarla. Prueba esta operación solo sobre registros destinados a pruebas.

## 6. Autenticación y autorización: ¿cuál es la diferencia?

- **Autenticación:** verifica quién eres. OVNIS comprueba las credenciales en el login y genera el JWT.
- **Autorización:** verifica qué acciones puedes realizar. Spring Security lee el rol incluido en el token y protege `/api/admin/**` para que solo acceda `ADMIN`.

Un token válido de un usuario `USER` no concede permisos de administrador. No necesitas generar ni firmar un JWT por tu cuenta en Postman; OVNIS lo emite al iniciar sesión.

## 7. Solución de errores frecuentes

| Error | Posible causa y solución |
| --- | --- |
| No se pudo conectar / `ECONNREFUSED` | Verifica que Spring Boot esté ejecutándose y que el puerto sea correcto. |
| `400 Bad Request` | Revisa que el cuerpo sea JSON válido y que los campos obligatorios no estén vacíos. |
| `401 Unauthorized` | Verifica que el token esté presente, sea válido y no haya expirado. Si ocurre al iniciar sesión, revisa también las credenciales. |
| `403 Forbidden` | Comprueba que el usuario tenga permisos para la ruta solicitada. Para `/api/admin/**`, utiliza una cuenta ADMIN. |
| `404 Not Found` | Verifica la ruta y que el ID solicitado exista. |
| `415 Unsupported Media Type` | Selecciona Body → raw → JSON y revisa el encabezado `Content-Type`. |
| `500 Internal Server Error` | Revisa los logs del backend y la base de datos; por ejemplo, una restricción de nombre único podría impedir una modificación. |

Los códigos concretos de error pueden depender de la configuración y del manejo de excepciones del backend. Si un token expira, no intentes modificarlo: vuelve a iniciar sesión.

## 8. Checklist de pruebas para RF-034

- [ ] Iniciar sesión como ADMIN y obtener `accessToken`.
- [ ] Consultar características mediante GET sin token.
- [ ] Editar una característica mediante PUT con el token de ADMIN y recibir `200 OK`.
- [ ] Consultar nuevamente y verificar que el nuevo nombre se conserva con el mismo ID.
- [ ] Iniciar sesión con un usuario USER e intentar realizar el PUT: la petición debe rechazarse por falta de permisos (normalmente `403`).
- [ ] Repetir el PUT con No Auth y sin encabezado Authorization: la petición debe rechazarse (normalmente `401`).
- [ ] Ocultar cualquier token o credencial antes de compartir evidencias.

## 9. Referencias

La estructura de las peticiones se basa en estos archivos del backend de OVNIS, ubicados en `src/main/java/com/ovnis_api/`:

- `controller/AuthController.java`
- `dto/LoginRequest.java` y `dto/TokenResponse.java`
- `service/AuthService.java` y `service/TokenService.java`
- `security/JwtService.java` y `config/SecurityConfig.java`
- `controller/CaracteristicaController.java` y `service/CaracteristicaService.java`

La expiración se obtiene de `src/main/resources/application.yaml`.

Documentación oficial de Postman:

- [Tipos de autorización (Bearer Token)](https://learning.postman.com/docs/use/send-requests/authorization/authorization-types/)
- [Configuración de autorización de peticiones](https://learning.postman.com/docs/use/send-requests/authorization/specifying-authorization-details/)
- [Variables de entorno](https://learning.postman.com/docs/use/send-requests/variables/environment-variables)

> Esta guía documenta el código del backend compartido. Las respuestas son ejemplos ilustrativos; deben verificarse contra la instancia local de cada desarrollador.
