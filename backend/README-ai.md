# AI (OpenAI) Configuration

This backend includes a simple AI proxy endpoint `/api/ai/query` which uses OpenAI's Chat Completions API (via server-side key).

Important: don't commit secrets into the repo. Use environment variables or secret stores.

## How to set the API key (local development)

- Windows PowerShell (temporary for this session):

```powershell
$env:OPENAI_API_KEY = "sk-..."
```

- Linux / macOS (temporary for this shell session):

```bash
export OPENAI_API_KEY="sk-..."
```

- For permanent local dev (Windows): set the environment variable via system settings, or add it to your PowerShell profile.
- For Docker or production deployments, set the environment variable in your deployment environment or secret management store.

## application.properties

`backend/src/main/resources/application.properties` contains properties read by Spring Boot. The `openai.api.key` reads the value from the environment variable `OPENAI_API_KEY` by default:

```properties
openai.api.key=${OPENAI_API_KEY:}
openai.api.model=gpt-3.5-turbo
openai.api.base-url=https://api.openai.com/v1
```

If you need to override the model or base URL, add the properties above to `application.properties` or set them using environment variables.

## Rotating keys & security

If an API key was accidentally committed to the repository, rotate your key immediately on the OpenAI dashboard and delete it from the repository history if necessary. This project has previously contained a key in `src/main/resources/config.properties` — ensure to remove any secrets and rotate.

If a secret was previously present in the compiled artefacts (`target/`), clean the build directory and rebuild to ensure no compiled code contains the secret:

```bash
./mvnw clean
./mvnw -DskipTests package
```

## Test with curl

Once the environment variable is set and the backend is running (default `http://localhost:8080`), you can post a test request:

```bash
curl -X POST http://localhost:8080/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello AI, say a short greeting"}'
```

Expected response:

```json
{
  "reply": "Hello! ..."
}
```

If the backend throws an error about missing API key, configure `OPENAI_API_KEY` and restart the server.

## Production recommendations

- Use a secret manager (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault) or environment variables provided by the platform (Kubernetes secrets) to store your API key.
- Implement rate-limiting on `/api/ai/query` (to prevent abuse and runaway billing).
- Add authentication/authorization if you want only certain users or admins to call the endpoint.
- Monitor usage and rotate keys periodically.
