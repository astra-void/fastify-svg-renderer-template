# fastify-svg-renderer-template

Fastify + Preact 기반 SVG 렌더러 템플릿입니다. 기본 엔트리는 AWS Lambda를 기준으로 되어 있고, 필요하면 `src/index.ts`를 범용(Node 서버) 진입점으로 바꿔 사용할 수 있습니다.

This is a Fastify + Preact SVG rendering template. The default entry is AWS Lambda-oriented, but you can switch `src/index.ts` to a generic Node server entry when needed.

## 제공 엔드포인트 / Available Endpoints

- `GET /healthz`  
  헬스체크 응답(`200 ok`)을 반환합니다.
- `GET /v1/manifest.json`  
  등록된 SVG endpoint 메타데이터(`kind`, `cache`, `examples`)를 반환합니다.
- `GET /v1/svg/example.svg?title=Hello&value=123&w=420&h=160`  
  SVG XML 응답을 반환합니다.

## Quick Start

1. 의존성 설치 / Install dependencies

```bash
pnpm install
```

2. 로컬 개발 서버 실행 / Run local dev server

```bash
pnpm dev
```

3. 프로덕션 번들 빌드 후 실행 / Build and run production bundle

```bash
pnpm build && pnpm start
```

## Runtime Entry Contract / 런타임 엔트리 계약

현재 기본 진입점(`src/index.ts`)은 Lambda 핸들러와 로컬 개발 실행을 함께 가집니다.

- Lambda mode: `export const handler = awsLambdaFastify(app)`
- Generic mode: `app.listen({ port, host })`

## Default Entry (`src/index.ts` for Lambda)

기본 구현은 아래 흐름입니다.

1. `buildApp()`으로 Fastify 앱 생성
2. `awsLambdaFastify(app)`로 `handler` export
3. 로컬 실행 분기에서 `app.listen({ port, host: "0.0.0.0" })` 실행

즉, 템플릿 기본 전략은 Lambda-first이며 로컬 개발 편의 분기를 포함합니다.

## Switch to Generic `index.ts`

Lambda가 아닌 범용 서버(예: VM, container, bare Node process)로 고정하려면 `src/index.ts`를 아래처럼 교체하면 됩니다.

```ts
import { buildApp } from "./app";

const app = buildApp();
const port = 3000;
const host = "0.0.0.0";

app.listen({ port, host }).catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
```

필요하면 `port`/`host` 값은 런타임 환경에 맞게 직접 조정하세요.
Adjust `port`/`host` values as needed for your runtime environment.

### Optional cleanup (Lambda 미사용 시)

- `@fastify/aws-lambda` 의존성 제거(선택):  
  Remove Lambda adapter only if you will not deploy to Lambda.

```bash
pnpm remove @fastify/aws-lambda
```

- 필요 없으면 `zip`/`function.zip` 기반 Lambda 패키징 흐름도 정리할 수 있습니다.

## Validation Checklist / 검증 체크리스트

### 1) 기본(현행) 확인 / Baseline check

`pnpm dev` 실행 후:

- `GET /healthz` -> `200 ok`
- `GET /v1/manifest.json` -> endpoint 메타데이터 JSON
- `GET /v1/svg/example.svg?title=Hello&value=123&w=420&h=160` -> SVG XML

예시:

```bash
curl http://localhost:3000/healthz
curl http://localhost:3000/v1/manifest.json
curl "http://localhost:3000/v1/svg/example.svg?title=Hello&value=123&w=420&h=160"
```

### 2) Generic 전환 검증 / Generic switch verification

1. 문서대로 `src/index.ts` 교체
2. `pnpm dev` 정상 기동 확인
3. `pnpm build && pnpm start` 후 동일 3개 엔드포인트 응답 확인

### 3) 롤백 검증 / Rollback verification

1. 아래 Lambda 버전 `src/index.ts`로 복원
2. (필요 시) Lambda 어댑터 재설치
3. 기존 동작(핸들러 export + 로컬 실행) 일치 확인

Lambda 버전 예시:

```ts
import awsLambdaFastify from "@fastify/aws-lambda";
import { buildApp } from "./app";

const app = buildApp();
export const handler = awsLambdaFastify(app);
```

필요 시 재설치:

```bash
pnpm add @fastify/aws-lambda
```
